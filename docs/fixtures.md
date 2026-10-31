# Test Fixtures

The fixtures extend Playwright Test in four layers: `apiFixture` -> `userFixture` -> `browserFixture` -> `pagesFixture`. Each module exports `test`; `apiTest`, `userTest`, and `browserTest` are local import aliases that identify the preceding layer.

| File | Responsibility |
| --- | --- |
| `fixtures/types.ts` | Interfaces for API fixtures, user options, test-user data, and page-object fixtures. |
| `fixtures/apiFixture.ts` | Provides `userApi`, `productsApi`, and `categoryApi` once per worker; `_apiLifecycle` disposes their shared HTTP context at worker teardown. |
| `fixtures/userFixture.ts` | Provides a new user per test, or uses explicit credentials for an existing user. |
| `fixtures/browserFixture.ts` | Prepares `storageState`, opens the home page, and waits up to 30 seconds for navigation inside `app-header` to become visible. |
| `fixtures/pagesFixture.ts` | Provides page objects using the browser fixture's page and inherits API and user fixtures. |

## Page Object Fixtures

Use `fixtures/pagesFixture.ts` when a test needs page objects. It provides `mainPage`, `productDetailPage`, `cartPage`, `loginPage`, and `accountPage`, and inherits the API, user, and browser fixtures. Each requested page object receives the current test's `page`.

```ts
import { test, expect } from "../../../fixtures/pagesFixture";
import { staticTestMessages } from "../../../data/staticTestMessages";

test("User account is displayed", async ({ page, accountPage }) => {
    await accountPage.open();

    await expect(page).toHaveURL("/account");
    await expect(accountPage.getTitle()).toBeVisible();
    await expect(accountPage.getTitle())
        .toHaveText(staticTestMessages.accountPage.title);
});
```

The inherited browser fixture registers and authenticates a user by default. Request `user` explicitly when the test needs its credentials or profile. The login-flow specs override `storageState` to start signed out, then request `user` for UI sign-in.

Page objects expose the shared `HeaderComponent` through their `header` property, for example `accountPage.header.signOut()`. `loginPage.openForgotPassword()` returns a `ForgotPasswordPage`; it is created through navigation rather than a separate fixture.

## API Tests

All six API smoke and regression specs import `test` and `expect` from `fixtures/apiFixture.ts`. They receive the required client through `async ({ userApi })`, `async ({ productsApi })`, or `async ({ categoryApi })` in tests and hooks. Each worker-scoped fixture creates its client directly with `new UserApi()`, `new ProductsApi()`, or `new CategoryApi()`. Authorization uses the shared `ApiRequestHelper`. Fixtures are lazy, so unused clients are not created.

These specs continue to create their own request payloads and track server data for cleanup in `afterAll`. They do not need a `beforeAll` hook solely to instantiate a client, or their own `ApiRequestHelper.dispose()` call. Product specs retain `beforeAll({ productsApi })` to obtain current category, brand, and image references. User and category specs no longer need client-initialization hooks.

The worker-scoped `_apiLifecycle` fixture uses `auto: true`. Playwright starts automatic worker fixtures before ordinary fixtures and tears them down after those fixtures finish. This lets `_apiLifecycle` call `ApiRequestHelper.dispose()` once at worker teardown, including when server-data cleanup fails, without unused dependency parameters in the client fixtures. It provides no value (`void`). The underscore marks an internal fixture; specs should request API clients rather than `_apiLifecycle`. Automatic setup does not itself create an HTTP context or send requests; the helper creates its context when a request is made.

API specs do not import browser fixtures or request browser objects.

## New User for Each UI Test

Import `test` and `expect` from `fixtures/browserFixture.ts`. Requesting `page` resolves its dependencies: `storageState`, `user`, and the worker's `userApi`.

```ts
import { test, expect } from "../../../fixtures/browserFixture";

test("User account is displayed", async ({ page, user }) => {
    // The configured home page is already open with the user's token.
    await page.goto("/account");

    await expect(page).toHaveURL(/\/account$/);
    // user.credentials contains the login email and password.
    // user.profile contains the generated user's registration response.
});
```

This is a fixture usage example. The implemented login-flow specs in `tests/ui/smoke/` and `tests/ui/regression/` use page objects provided by `fixtures/pagesFixture.ts`. Use `TEST_ENV=dev` for the local Docker UI. Start the Docker stack before local runs; CI starts it automatically. The stage UI URL is a placeholder; prod uses the public site. `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` are required to obtain the admin token used by registration and deletion.

The `user` fixture generates a registration request and returns credentials, the registration response as `profile`, and `cleanup()`. It deletes its created user after the dependent fixtures and test finish, including failures during API login or page navigation.

If a test deliberately removes its fixture-created user, call `await user.cleanup()`. After a successful deletion, subsequent sequential cleanup calls do nothing. Deleting it directly through `userApi.delete()` does not update this bookkeeping and would cause another deletion attempt during teardown.

Playwright owns browser, context, and page creation and teardown. The API context is disposed once at worker teardown rather than after each UI test.

## Existing User

Set `userCredentials` for a file or a `test.describe` group:

```ts
test.use({
    userCredentials: { email, password },
});
```

Here `email` and `password` are values supplied by your environment or secrets setup. This mode does not register or delete a user. `user.profile` is undefined and `user.cleanup()` does nothing because the fixture owns no server data. Login still obtains a fresh user token for each test and does not replace the admin token used by API clients.

## Tests Without Authentication

Override `storageState` with an empty state for the file or group:

```ts
import { test, expect } from "../../../fixtures/browserFixture";

test.use({ storageState: { cookies: [], origins: [] } });

test("Login form is displayed", async ({ page }) => {
    await page.goto("/auth/login");

    await expect(page.getByTestId("login-submit")).toBeVisible();
});
```

Overriding `storageState` removes its dependency on `user`. No account is created and no token is requested unless the test or a hook explicitly requests the `user` fixture. The `page` fixture still opens the home page first. A test using the original `test` from `@playwright/test` gets standard Playwright behavior without this automatic navigation.

Fixtures are initialized when requested; importing a module alone does not create users or launch browsers. Each test receives its own browser context. A shared existing account still shares server-side data across tests, so use fresh users for independent mutations.
