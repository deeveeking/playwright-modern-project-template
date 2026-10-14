# User API

`UserApi` is implemented and exported in `api/userApi/userApi.ts` so `ApiFactory` can create it directly. Obtain an instance through the `ApiFactory.userApi` getter. Request and response types live in `api/userApi/types.ts` and use names such as `RegisterUserRequest` and `RegisterUserResponse`.

Routes and types follow the [User API documentation](https://api.practicesoftwaretesting.com/api/documentation#/User).

| Method | HTTP request | Result |
| --- | --- | --- |
| `register(body)` | `POST /users/register` | `RegisterUserResponse` |
| `changePassword(body)` | `POST /users/change-password` | `ChangeUserPasswordResponse` |
| `me()` | `GET /users/me` | `MeUserResponse` |
| `delete({ userId })` | `DELETE /users/{userId}` | `DeleteUserResponse` (`void`, HTTP 204) |
| `logout()` | `GET /users/logout` | `LogoutUserResponse` |
| `search({ q, page? })` | `GET /users/search?q=...&page=...` | `SearchUserResponse` |
| `update(userId, body)` | `PUT /users/{userId}` | `UpdateUserResponse` |

Set `API_EMAIL` and `API_PASSWORD` to an existing account before using any `UserApi` method, including registration. `ApiRequestHelper.getApiToken()` sends `POST /users/login` directly through the Playwright context using `LoginUserRequest` and `LoginUserResponse`, caches the token, and returns it. Every call to `executeApiRequest()` attaches `Authorization: Bearer <token>`, including public API endpoints. Only the internal request that obtains the token is sent without a Bearer header. `UserApi` has no login method; no authentication flag or token argument is needed. Deletion requires admin credentials. The `me` and `logout` requests have no body, so they only need response types. Search criteria are query parameters; the deletion ID is a path parameter.

A successful logout or `ApiRequestHelper.dispose()` clears the cached token; the next protected request authenticates again. Failed token requests are not cached. The singleton shares one token, including an in-progress token request, per process (Playwright worker); it does not provide separate sessions for concurrent users within a worker. Call `clearAccessToken()` after changing credentials or when the token expires.

```powershell
$env:API_EMAIL = "your-test-user@example.com"
$env:API_PASSWORD = "YourTestPassword@123"
npx playwright test --project=api
```

Swagger uses `UserRequest` for both registration and PUT updates, so `UpdateUserRequest` shares the registration fields. The required fields are `first_name`, `last_name`, `email`, and `password`. Optional fields include `address`, `phone`, and `dob`. Passwords must contain at least eight characters including uppercase, lowercase, a number, and a symbol; `dob` uses `YYYY-MM-DD` and must represent an age between 18 and 75.

```ts
import { ApiFactory } from "../api/apiFactory";
import { ApiRequestHelper } from "../helpers/apiRequestHelper";

const userApi = ApiFactory.userApi;

try {
    // The helper obtains the token using API_EMAIL and API_PASSWORD.
    const currentUser = await userApi.me();
    await userApi.logout();
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

## Registration Smoke Test

The spec lives in [`tests/api/smoke/userApi.spec.ts`](../tests/api/smoke/userApi.spec.ts). It initializes `userApi` through `ApiFactory.userApi` in `beforeAll`, generates a fresh request, and registers a user. It builds `expectedResponse` from the submitted fields, excludes the password, and checks `id` and `created_at` with `expect.any(String)`. These two checks accept empty strings and do not validate the timestamp format.

The response is compared with `toEqual()` and a custom message:

```ts
expect(response,
    "Response is incorrect")
    .toEqual(expectedResponse);
```

Unexpected JSON fields cause this comparison to fail. The actual response type is inferred from `UserApi.register`; the expected object also uses type inference because its matchers are not response string values.

`afterAll` calls `ApiRequestHelper.dispose()`. This releases the context and token but does not delete the newly registered user.

See [Commands](./commands.md#api-smoke-tests) for execution and [E2E Test Generation Instructions](../agents/generate-e2e-instruction.md) for the full API test conventions.
