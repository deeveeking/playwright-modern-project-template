# Test Fixtures

The fixtures extend Playwright Test in five layers: `apiFixture` -> `userFixture` -> `browserFixture` -> `pagesFixture` -> `productFixture`. Import the layer needed by the test. Each module exports `test`; names such as `apiTest`, `browserTest`, and `pagesTest` are local aliases for the preceding layer.

| File | Responsibility |
| --- | --- |
| `fixtures/types.ts` | Interfaces for API clients, user/product options, test-user data, page objects, and prepared products. |
| `fixtures/apiFixture.ts` | Provides `userApi`, `productsApi`, `cartsApi`, and `categoryApi` once per worker; `_apiLifecycle` disposes their shared HTTP context at worker teardown. |
| `fixtures/userFixture.ts` | Provides a new user per test, or uses explicit credentials for an existing user. |
| `fixtures/browserFixture.ts` | Prepares `storageState`, opens the home page, and waits up to 30 seconds for navigation inside `app-header` to become visible. |
| `fixtures/pagesFixture.ts` | Provides page objects using the browser fixture's page and inherits API and user fixtures. |
| `fixtures/productFixture.ts` | Provides prepared `products`, the first `product`, and the `productCount` option; cleans the current cart and created products after the test. |

## Page Object Fixtures

Use `fixtures/pagesFixture.ts` when a test needs page objects. It provides `mainPage`, `productDetailPage`, `cartPage`, `loginPage`, and `accountPage`, and inherits the API, user, and browser fixtures. Each requested page object receives the current test's `page`.

```ts
import { test, expect } from "../../../fixtures/pagesFixture";
import { staticTestMessages } from "../../../data/staticTestMessages";

test("User account is displayed", async ({ page, accountPage }) => {
    await accountPage.open();

    await expect(page,
        "The account page should open")
        .toHaveURL("/account");
    await expect(accountPage.getTitle(),
        "The account title should be visible")
        .toBeVisible();
    await expect(accountPage.getTitle(),
        "The account title should match the expected text")
        .toHaveText(staticTestMessages.accountPage.title);
});
```

The inherited browser fixture registers and authenticates a user by default. Request `user` explicitly when the test needs its credentials or profile. The login-flow specs override `storageState` to start signed out, then request `user` for UI sign-in.

Page objects expose the shared `HeaderComponent` through their `header` property, for example `accountPage.header.signOut()`. `loginPage.openForgotPassword()` returns a `ForgotPasswordPage`; it is created through navigation rather than a separate fixture.

## UI Product Data

Import `test` and `expect` from `fixtures/productFixture.ts` for UI cases that need API-created catalog products. This layer inherits the page objects, authenticated browser, user, and worker-scoped API clients.

| Fixture or option | Value and behavior |
| --- | --- |
| `productCount` | Configurable option, default `1`; must be a positive integer. |
| `products` | Test-scoped `CreateProductResponse[]` containing exactly `productCount` created products. |
| `product` | The first item from `products`; requesting it does not create another product. |

`ProductOptions` and `ProductFixtures` are declared in `fixtures/types.ts`. The option uses Playwright's `[1, { option: true }]` syntax. See [Fixture options](https://playwright.dev/docs/test-fixtures#fixtures-options) and [test.use()](https://playwright.dev/docs/api/class-test#test-use).

By default, existing single-product tests request `product`:

```ts
import { expect, test } from "../../../fixtures/productFixture";

test("Product details show the prepared product", async ({
    productDetailPage,
    product,
}) => {
    await productDetailPage.open(product.id);

    expect(await productDetailPage.getProductName(),
        "Product details should display the prepared product name")
        .toEqual(product.name);
    expect(await productDetailPage.getProductPrice(),
        "Product details should display the prepared product price")
        .toEqual(product.price.toFixed(2));
});
```

Set `productCount` inside the group that needs multiple products. Other groups keep the default:

```ts
import { expect, test } from "../../../fixtures/productFixture";
import { CartPage } from "../../../pages/cartPage";

test.describe("Cart with two products", () => {
    test.use({ productCount: 2 });

    test("Both prepared products can be added to the cart", async ({
        page,
        productDetailPage,
        products,
    }) => {
        const [firstProduct, secondProduct] = products;
        const expectedProductCount = 2;

        await productDetailPage.open(firstProduct.id);
        await productDetailPage.addToCart();
        await productDetailPage.open(secondProduct.id);
        await productDetailPage.addToCart();

        const cartPage = await CartPage.visit(page);

        await expect(cartPage.getProducts(),
            "The cart should contain both prepared products")
            .toHaveCount(expectedProductCount);
    });
});
```

The fixture reuses category, brand, and image references from an existing product. Each prepared product has price `24.99`, stock `10`, CO2 rating `C`, and both `is_location_offer` and `is_rental` set to `false`. These defaults keep quantity and total checks predictable. When creating multiple products, a short numeric suffix distinguishes their names.

Only requesting `product` or `products` starts product preparation. Both fixtures share the same array within a test. Product creation is sequential and records each successful response.

The `finally` block performs teardown after the test, including assertion failures and a later product-creation failure: it reads this page's `sessionStorage["cart_id"]`, requests cart deletion through `cartsApi` if present, and then requests deletion of all prepared products with `Promise.all`. Cart items reference products, so cart cleanup comes first. The dependency on `page` keeps the page available while reading the cart ID. The user fixture deletes its user later; `_apiLifecycle` disposes the shared HTTP context at worker teardown.

`ProductDetailPage.addToCart()` waits for the cart-item POST response before returning. This lets tests navigate to `/checkout` after the add request completes. UI price getters return strings, so compare them with `product.price.toFixed(2)` or a similarly formatted expected total.

See [Carts API](./carts-api.md) for the deletion client and [UI coverage](../README.md#ui-coverage) for the implemented scenarios.

## API Tests

All six API smoke and regression specs import `test` and `expect` from `fixtures/apiFixture.ts`. They receive the required client through `async ({ userApi })`, `async ({ productsApi })`, or `async ({ categoryApi })` in tests and hooks. Each worker-scoped fixture creates its client directly with `new UserApi()`, `new ProductsApi()`, or `new CategoryApi()`. Authorization uses the shared `ApiRequestHelper`. Fixtures are lazy, so unused clients are not created.

The API layer also supplies the worker-scoped `cartsApi` client, created with `new CartsApi()`, for UI product-fixture cleanup. See [Carts API](./carts-api.md).

These API specs continue to create their own request payloads and track server data for cleanup in `afterAll`. They do not need a `beforeAll` hook solely to instantiate a client, or their own `ApiRequestHelper.dispose()` call. Product specs retain `beforeAll({ productsApi })` to obtain current category, brand, and image references. User and category specs no longer need client-initialization hooks.

The worker-scoped `_apiLifecycle` fixture uses `auto: true`. Playwright starts automatic worker fixtures before ordinary fixtures and tears them down after those fixtures finish. This lets `_apiLifecycle` call `ApiRequestHelper.dispose()` once at worker teardown, including when server-data cleanup fails, without unused dependency parameters in the client fixtures. It provides no value (`void`). The underscore marks an internal fixture; specs should request API clients rather than `_apiLifecycle`. Automatic setup does not itself create an HTTP context or send requests; the helper creates its context when a request is made.

API specs do not import browser fixtures or request browser objects.

## New User for Each UI Test

Import `test` and `expect` from `fixtures/browserFixture.ts`. Requesting `page` resolves its dependencies: `storageState`, `user`, and the worker's `userApi`.

```ts
import { test, expect } from "../../../fixtures/browserFixture";

test("User account is displayed", async ({ page, user }) => {
    // The configured home page is already open with the user's token.
    await page.goto("/account");

    await expect(page,
        "The authenticated user should reach the account page")
        .toHaveURL(/\/account$/);
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

    await expect(page.getByTestId("login-submit"),
        "The signed-out user should see the login form")
        .toBeVisible();
});
```

Overriding `storageState` removes its dependency on `user`. No account is created and no token is requested unless the test or a hook explicitly requests the `user` fixture. The `page` fixture still opens the home page first. A test using the original `test` from `@playwright/test` gets standard Playwright behavior without this automatic navigation.

Fixtures are initialized when requested; importing a module alone does not create users or launch browsers. Each test receives its own browser context. A shared existing account still shares server-side data across tests, so use fresh users for independent mutations.
