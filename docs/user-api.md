# User API

`UserApi` is implemented and exported in `api/userApi/userApi.ts`. API tests receive the worker-scoped `userApi` client from `fixtures/apiFixture.ts`, which creates it directly with `new UserApi()`. Request and response types live in `api/userApi/types.ts` and use names such as `RegisterUserRequest` and `RegisterUserResponse`.

Routes and types follow the [User API documentation](https://api.practicesoftwaretesting.com/api/documentation#/User).

| Method | HTTP request | Result |
| --- | --- | --- |
| `register(body)` | `POST /users/register` | `RegisterUserResponse` |
| `changePassword(body)` | `POST /users/change-password` | `ChangeUserPasswordResponse` |
| `delete(userId)` | `DELETE /users/{userId}` | `DeleteUserResponse` (`void`, HTTP 204) |
| `search({ q, page? })` | `GET /users/search?q=...&page=...` | `SearchUserResponse` |
| `update(userId, body)` | `PATCH /users/{userId}` | `UpdateUserResponse` |

`SearchUserResponse` is a paginated object. Users are in `response.data`; pagination fields are `current_page`, `last_page`, `per_page`, `total`, `from`, and `to`. The `from` and `to` values can be `null` when the page has no results.

Set `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` to an existing admin account before using the current API suites, including registration. `ApiRequestHelper.getApiToken()` delegates `POST /users/login` to `getUserApiToken()` using `LoginUserRequest` and `LoginUserResponse`, caches the token, and returns it. Every call to `executeApiRequest()` attaches `Authorization: Bearer <token>`, including public API endpoints. Login requests are sent directly through the Playwright context without a Bearer header. `UserApi` has no login method; no authentication flag or token argument is needed. Deletion requires admin credentials. Search criteria are query parameters; the deletion ID is a path parameter.

For browser authentication, `getUserApiToken({ email, password })` obtains an uncached token for the supplied user. It does not replace the admin token used by API clients. `getUserStorageState()` prepares that token under `localStorage["auth-token"]`; see [Browser authentication](./api-request-helper.md#browser-authentication).

`ApiRequestHelper.dispose()` clears the cached token; the next protected request authenticates again. Failed token requests are not cached. The singleton shares one token, including an in-progress token request, per process (Playwright worker); it does not provide separate sessions for concurrent users within a worker. Call `clearAccessToken()` after changing credentials or when the token expires.

```powershell
$env:API_ADMIN_EMAIL = "your-test-user@example.com"
$env:API_ADMIN_PASSWORD = "YourTestPassword@123"
npx playwright test --project=api
```

The current client sends updates with `PATCH /users/{userId}`. Its `UpdateUserRequest` interface extends `RegisterUserRequest`, so callers currently supply the registration fields even for a single-field update. The required fields are `first_name`, `last_name`, `email`, and `password`. Optional fields include `address`, `phone`, and `dob`. Passwords must contain at least eight characters including uppercase, lowercase, a number, and a symbol; `dob` uses `YYYY-MM-DD` and must represent an age between 18 and 75.

```ts
import { test } from "../fixtures/apiFixture";
import { getSearchUserRequest } from "../helpers/requestHelper";

test("Search users", async ({ userApi }) => {
    await userApi.search(getSearchUserRequest("Jane"));
});
```

This example illustrates client usage; the smoke and regression sections below describe full response assertions. The fixture disposes the shared request context at worker teardown.

All methods use `ApiRequestHelper`, including its logging and error handling. Unsuccessful HTTP responses throw; the response types describe successful calls.

## Registration Test Data

`helpers/requestHelper.ts` exports the function `getRegisterUserRequest(): RegisterUserRequest`. It uses `@faker-js/faker` to generate names, an email containing a UUID at `example.com`, a password, an address, a 12-digit phone number, and a date of birth for an adult aged 18–65. The password uses `faker.internet.password({ length: 12, prefix: "Aa1!" })` to include the required character categories. Dates use `YYYY-MM-DD`; countries use two-letter codes.

```ts
import { getRegisterUserRequest } from "../helpers/requestHelper";

const request = getRegisterUserRequest();
const response = await userApi.register(request);
```

## Search Request Data

`getSearchUserRequest(q: string, page: number = 1): SearchUserRequest` returns `{ q, page }`. Smoke registration and update tests pass the registered user's first and last name. The smoke deletion case and regression user cases search by the unique email. Search results are available in `response.data`.

## Registration Smoke Test

The spec lives in [`tests/api/smoke/adminUserApi.spec.ts`](../tests/api/smoke/adminUserApi.spec.ts). It imports `test` and `expect` from `fixtures/apiFixture.ts`, receives the existing `UserApi` through the worker-scoped `userApi` fixture, generates a fresh request, and registers a user. It builds `expectedResponse` from the submitted fields, excludes the password, and checks `id` and `created_at` with `expect.any(String)`. These two checks accept empty strings and do not validate the timestamp format.

The registration expectation includes `enabled: null`, `failed_login_attempts: null`, and `role: "user"`. The test also searches by the registered user's first and last name and compares `data[0]` with `expectedGetUserResponse`, which adds `provider: null` and `totp_enabled: false` and overrides `enabled` to `true` and `failed_login_attempts` to `0`. The current smoke registration and update tests use the first result on the first page; they do not select by ID or follow pagination.

The registration response is compared with `toEqual()` and a custom message:

```ts
expect(response,
    "Register response is incorrect")
    .toEqual(expectedResponse);
```

Unexpected JSON fields cause this comparison to fail. The actual response type is inferred from `UserApi.register`; the expected object also uses type inference because its matchers are not response string values.

Registration and update tests add their created user IDs to `createdUserIds`. In `afterAll`, the suite receives `userApi` from the fixture and deletes these users with `Promise.all`. The shared `_apiLifecycle` fixture calls `ApiRequestHelper.dispose()` once at worker teardown, including when a deletion fails. All three tests require admin credentials, including registration because of its cleanup. See [Test Fixtures](./fixtures.md) for the shared API fixture and separate UI user lifecycle.

See [Commands](./commands.md#api-smoke-tests) for execution and [E2E Test Generation Instructions](../agents/generate-e2e-instruction.md) for the full API test conventions.

## Email Update Smoke Test

`Admin is update user email successfuly with correct data` creates its own user, copies the registration payload, and replaces only the email with a freshly generated value. It checks the update result with `toEqual({ success: true })`, searches by the registered user's first and last name, and compares `searchResponse.data[0].email` with the new email. There is no separate assertion comparing the old and new email values.

For this test, `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` must identify an admin account: the helper remains authenticated as that account after registration, and [the API permits updating another user only for admins](https://github.com/testsmith-io/practice-software-testing/blob/main/sprint5/API/app/Services/UserService.php). The test does not switch credentials or depend on the registration test. It records the created ID for deletion in `afterAll`.

## Deletion Smoke Test

`Admin is delete user successfuly` creates its own user and calls `userApi.delete(registeredUser.id)`. The test awaits the delete call without a separate response-value assertion; the helper throws on non-success HTTP responses and returns `undefined` for HTTP 204. It then searches by the created user's UUID-based email to avoid matching unrelated users with the same name, and checks both `data: []` and `total: 0`. This test requires admin credentials in `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD` and deletes only the user it creates. Its ID is not added to `createdUserIds`, so teardown does not attempt to delete it again.

## User Regression Tests

[adminUserApi.spec.ts](../tests/api/regression/adminUserApi.spec.ts) contains three independent cases:

- Registration sends `email: " "` and `password: " "` and expects status 422. Both fields are present and contain a single space; this is a combined blank-fields scenario, not an invalid-email-format check.
- Updating a newly created user with a 257-character email expects status 422. The test then searches by the original email, selects the user by ID, and verifies that the email is unchanged.
- Searching for a user after creating and deleting it expects an empty `data` array and `total: 0`.

The first two cases use `.rejects.toThrow()` with the target method, URL, and status. The spec imports the same API fixture as the smoke spec. Only the user from the update case is recorded for deletion in `afterAll`. The search case deletes its own user without adding it to the cleanup set. There is no repeated-deletion test.

See [API Regression Tests](./commands.md#api-regression-tests) for the run command. These assertions describe expected behavior; successful discovery alone does not validate the API responses.
