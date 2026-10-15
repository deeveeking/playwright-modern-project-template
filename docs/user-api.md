# User API

`UserApi` is implemented and exported in `api/userApi/userApi.ts` so `ApiFactory` can create it directly. Obtain an instance through the `ApiFactory.userApi` getter. Request and response types live in `api/userApi/types.ts` and use names such as `RegisterUserRequest` and `RegisterUserResponse`.

Routes and types follow the [User API documentation](https://api.practicesoftwaretesting.com/api/documentation#/User).

| Method | HTTP request | Result |
| --- | --- | --- |
| `register(body)` | `POST /users/register` | `RegisterUserResponse` |
| `changePassword(body)` | `POST /users/change-password` | `ChangeUserPasswordResponse` |
| `delete(userId)` | `DELETE /users/{userId}` | `DeleteUserResponse` (`void`, HTTP 204) |
| `search({ q, page? })` | `GET /users/search?q=...&page=...` | `SearchUserResponse` |
| `update(userId, body)` | `PATCH /users/{userId}` | `UpdateUserResponse` |

`SearchUserResponse` is a paginated object. Users are in `response.data`; pagination fields are `current_page`, `last_page`, `per_page`, `total`, `from`, and `to`. The `from` and `to` values can be `null` when the page has no results.

Set `API_EMAIL` and `API_PASSWORD` to an existing account before using any `UserApi` method, including registration. `ApiRequestHelper.getApiToken()` sends `POST /users/login` directly through the Playwright context using `LoginUserRequest` and `LoginUserResponse`, caches the token, and returns it. Every call to `executeApiRequest()` attaches `Authorization: Bearer <token>`, including public API endpoints. Only the internal request that obtains the token is sent without a Bearer header. `UserApi` has no login method; no authentication flag or token argument is needed. Deletion requires admin credentials. Search criteria are query parameters; the deletion ID is a path parameter.

`ApiRequestHelper.dispose()` clears the cached token; the next protected request authenticates again. Failed token requests are not cached. The singleton shares one token, including an in-progress token request, per process (Playwright worker); it does not provide separate sessions for concurrent users within a worker. Call `clearAccessToken()` after changing credentials or when the token expires.

```powershell
$env:API_EMAIL = "your-test-user@example.com"
$env:API_PASSWORD = "YourTestPassword@123"
npx playwright test --project=api
```

The current client sends updates with `PATCH /users/{userId}`. Its `UpdateUserRequest` interface extends `RegisterUserRequest`, so callers currently supply the registration fields even for a single-field update. The required fields are `first_name`, `last_name`, `email`, and `password`. Optional fields include `address`, `phone`, and `dob`. Passwords must contain at least eight characters including uppercase, lowercase, a number, and a symbol; `dob` uses `YYYY-MM-DD` and must represent an age between 18 and 75.

```ts
import { ApiFactory } from "../api/apiFactory";
import { ApiRequestHelper } from "../helpers/apiRequestHelper";

const userApi = ApiFactory.userApi;

try {
    // The helper obtains the token using API_EMAIL and API_PASSWORD.
    const users = await userApi.search({ q: "Jane" });
} finally {
    await ApiRequestHelper.dispose();
}
```

All methods use `ApiRequestHelper`, including its logging and error handling. Unsuccessful HTTP responses throw; the response types describe successful calls.

## Registration Test Data

`helpers/requestHelper.ts` exports the function `getRegisterUserRequest(): RegisterUserRequest`. It uses `@faker-js/faker` to generate names, an email containing a UUID at `example.com`, a password, an address, a 12-digit phone number, and a date of birth for an adult aged 18–65. The password uses `faker.internet.password({ length: 12, prefix: "Aa1!" })` to include the required character categories. Dates use `YYYY-MM-DD`; countries use two-letter codes.

```ts
import { getRegisterUserRequest } from "../helpers/requestHelper";

const request = getRegisterUserRequest();
const response = await userApi.register(request);
```

## Search Request Data

`getSearchUserRequest(q: string, page: number = 1): SearchUserRequest` returns `{ q, page }`. Registration and update tests pass the registered user's first and last name. The deletion test passes the unique email. Search results are available in `response.data`.

## Registration Smoke Test

The spec lives in [`tests/api/smoke/userApi.spec.ts`](../tests/api/smoke/userApi.spec.ts). It initializes `userApi` through `ApiFactory.userApi` in `beforeAll`, generates a fresh request, and registers a user. It builds `expectedResponse` from the submitted fields, excludes the password, and checks `id` and `created_at` with `expect.any(String)`. These two checks accept empty strings and do not validate the timestamp format.

The test also searches by the registered user's first and last name and compares `data[0]` with `expectedGetUserResponse`, which adds `provider: null` and `totp_enabled: false`. The current registration and update tests use the first result on the first page; they do not select by ID or follow pagination.

The registration response is compared with `toEqual()` and a custom message:

```ts
expect(response,
    "Register response is incorrect")
    .toEqual(expectedResponse);
```

Unexpected JSON fields cause this comparison to fail. The actual response type is inferred from `UserApi.register`; the expected object also uses type inference because its matchers are not response string values.

Registration and update tests add their created user IDs to `createdUserIds`. In `afterAll`, the suite deletes these users with `Promise.all`, then calls `ApiRequestHelper.dispose()` to release the context and token. If a deletion rejects, this sequential teardown does not reach `dispose()`. All three tests therefore require admin credentials, including registration because of its cleanup.

See [Commands](./commands.md#api-smoke-tests) for execution and [E2E Test Generation Instructions](../agents/generate-e2e-instruction.md) for the full API test conventions.

## Email Update Smoke Test

`User email is updated successfully with correct data` creates its own user, copies the registration payload, and replaces only the email with a freshly generated value. It checks the update result with `toEqual({ success: true })`, searches by the registered user's first and last name, and compares `searchResponse.data[0].email` with the new email. There is no separate assertion comparing the old and new email values.

For this test, `API_EMAIL` and `API_PASSWORD` must identify an admin account: the helper remains authenticated as that account after registration, and [the API permits updating another user only for admins](https://github.com/testsmith-io/practice-software-testing/blob/main/sprint5/API/app/Services/UserService.php). The test does not switch credentials or depend on the registration test. It records the created ID for deletion in `afterAll`.

## Deletion Smoke Test

`User is deleted successfully` creates its own user and calls `userApi.delete(registeredUser.id)`. The test awaits the delete call without a separate response-value assertion; the helper throws on non-success HTTP responses and returns `undefined` for HTTP 204. It then searches by the created user's UUID-based email to avoid matching unrelated users with the same name, and checks both `data: []` and `total: 0`. This test requires admin credentials in `API_EMAIL` and `API_PASSWORD` and deletes only the user it creates. Its ID is not added to `createdUserIds`, so teardown does not attempt to delete it again.
