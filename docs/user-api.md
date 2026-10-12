# User API

`api/userApi/userApi.ts` exports `UserApi`. Request and response types live in `api/userApi/types.ts` and use names such as `RegisterUserRequest` and `RegisterUserResponse`.

Routes and types follow the [User API documentation](https://api.practicesoftwaretesting.com/api/documentation#/User).

| Method | HTTP request | Result |
| --- | --- | --- |
| `register(body)` | `POST /users/register` | `RegisterUserResponse` |
| `login(body)` | `POST /users/login` | `LoginUserResponse` with `access_token` |
| `changePassword(body)` | `POST /users/change-password` | `ChangeUserPasswordResponse` |
| `me()` | `GET /users/me` | `MeUserResponse` |
| `delete({ userId })` | `DELETE /users/{userId}` | `DeleteUserResponse` (`void`, HTTP 204) |
| `logout()` | `GET /users/logout` | `LogoutUserResponse` |
| `search({ q, page? })` | `GET /users/search?q=...&page=...` | `SearchUserResponse` |
| `update(userId, body)` | `PUT /users/{userId}` | `UpdateUserResponse` |

Set `API_EMAIL` and `API_PASSWORD` before running protected methods. `ApiRequestHelper` automatically calls `getApiToken()` and attaches `Authorization: Bearer <token>` based on the request URL. No authentication flag, preliminary `UserApi.login()` call, or token argument is needed. Registration and login are listed as public routes in the helper and do not obtain or send the cached token. The `login(body)` method is an ordinary API operation that returns its response without changing the helper's authentication state. Deletion requires admin credentials. The `me` and `logout` requests have no body, so they only need response types. Search criteria are query parameters; the deletion ID is a path parameter.

A successful logout or `ApiRequestHelper.dispose()` clears the cached token; the next protected request authenticates again. Failed token requests are not cached. The singleton shares one token, including an in-progress token request, per process (Playwright worker); it does not provide separate sessions for concurrent users within a worker. Call `clearAccessToken()` after changing credentials or when the token expires.

```powershell
$env:API_EMAIL = "your-test-user@example.com"
$env:API_PASSWORD = "YourTestPassword@123"
npx playwright test --project=api
```

Swagger uses `UserRequest` for both registration and PUT updates, so `UpdateUserRequest` shares the registration fields. The required fields are `first_name`, `last_name`, `email`, and `password`. Optional fields include `address`, `phone`, and `dob`. Passwords must contain at least eight characters including uppercase, lowercase, a number, and a symbol; `dob` uses `YYYY-MM-DD` and must represent an age between 18 and 75.

```ts
import { UserApi } from "../api/userApi/userApi";
import { ApiRequestHelper } from "../helpers/apiRequestHelper";

const userApi = new UserApi();

try {
    // The helper obtains the token using API_EMAIL and API_PASSWORD.
    const currentUser = await userApi.me();
    await userApi.logout();
} finally {
    await ApiRequestHelper.dispose();
}
```

All methods use `ApiRequestHelper`, including its logging and error handling. Unsuccessful HTTP responses throw; the response types describe successful calls.
