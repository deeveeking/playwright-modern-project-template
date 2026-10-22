# API Request Helper

The API request helper lives in `helpers/apiRequestHelper.ts`.

It creates one shared Playwright `APIRequestContext` per process (Playwright worker). This follows the singleton pattern.

## Singleton

`ApiRequestHelper` uses a private constructor, so it cannot be created with `new`.

Use static methods instead.

```ts
import type { GetProductsResponse } from "../api/productsApi/types";
import { ApiRequestHelper } from "../helpers/apiRequestHelper";

await ApiRequestHelper.executeApiRequest<GetProductsResponse, never>({
    url: "/products",
    method: "GET",
});
```

## Base API URL

The helper uses `baseApiURL` from the selected environment config.

```ts
request.newContext({
    baseURL: getEnvironment().baseApiURL,
});
```

## Request Params

The request params type lives in `helpers/types/types.ts`.

```ts
export type ExecuteApiRequestParams<TRequest = unknown> = {
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: TRequest;
    params?: Record<string, string | number | boolean>;
};
```

## Execute Request

Use `executeApiRequest` to send API requests.

Use `params` for URL query parameters. Every call to `executeApiRequest()` automatically attaches the Bearer token, including requests to public endpoints such as `/users/register`. It builds authorization headers internally; custom request headers are not exposed in `ExecuteApiRequestParams`. A `204 No Content` response returns `undefined`; use `void` as the response type. Other successful responses are parsed as JSON.

```ts
import type { SearchUserResponse } from "../api/userApi/types";

const users = await ApiRequestHelper.executeApiRequest<SearchUserResponse, never>({
    url: "/users/search",
    method: "GET",
    params: { q: "Jane", page: 1 },
});
```

For requests with body, pass the request type and response type.

```ts
import type { RegisterUserRequest, RegisterUserResponse } from "../api/userApi/types";
import { getRegisterUserRequest } from "../helpers/requestHelper";

const user = await ApiRequestHelper.executeApiRequest<RegisterUserResponse, RegisterUserRequest>({
    url: "/users/register",
    method: "POST",
    body: getRegisterUserRequest(),
});
```

These are excerpts from an async test or setup function. Record `user.id` for deletion during teardown when registering test users. Specs normally obtain typed API clients through `fixtures/apiFixture.ts`; the snippets above illustrate the transport helper itself.

## Authentication

`getApiToken()` reads `API_ADMIN_EMAIL` and `API_ADMIN_PASSWORD`
and delegates login to `getUserApiToken()`. It caches the admin
token request, including concurrent calls. Failed requests are
removed from the cache so a later call can retry.

`getUserApiToken(body: LoginUserRequest)` sends `POST /users/login`
with the supplied email and password. It validates the response
and returns `access_token`. This method does not cache its result
or replace the cached admin token.

Login requests use `APIRequestContext.post()` directly, without
a Bearer header. Both methods use the shared request context.

`executeApiRequest()` always uses the cached admin token.
Calling `getUserApiToken()` does not change the account used
by subsequent API client requests.

`clearAccessToken()` clears the admin token cache. `dispose()`
also closes the shared request context. Automatic token refresh
is not implemented.

## Browser authentication

`getUserStorageState()` from `helpers/authHelper.ts` obtains
a token for the supplied credentials and builds browser storage
state with `localStorage["auth-token"]`.

The origin comes from the selected environment's `baseURL`.
Use `TEST_ENV=prod` for `https://practicesoftwaretesting.com/`.

```ts
import { getUserStorageState } from "../helpers/authHelper";
import { getEnvironment } from "../config/env";

// email and password belong to the user being tested.
const storageState = await getUserStorageState({ email, password });
const context = await browser.newContext({ storageState });
const page = await context.newPage();

await page.goto(getEnvironment().baseURL);
```

Storage state stays in memory. Close the browser context and call
`ApiRequestHelper.dispose()` during test teardown.

## Error Handling

Negative tests assert a rejected promise. Include the method, URL, and status in the expected message so a login failure or a different request error does not satisfy the assertion:

```ts
await expect(userApi.register({
    ...getRegisterUserRequest(),
    email: " ",
    password: " ",
}),
    "Registration with blank email and password should fail with status 422")
    .rejects.toThrow("Method: POST. URL: /users/register. Status: 422.");
```

If the API response is not successful, the helper throws an error with:

- method
- URL
- status code
- response body

## Logging

Every call uses the shared `logger` from `helpers/loggerHelper.ts`. No extra setup is needed.

The helper logs the request method and URL. Immediately after receiving a response, it calls `protected static logResponseStatus(response, method, endpoint)` to log the HTTP status code and status text before parsing JSON.

| Event | Level | Message |
| --- | --- | --- |
| Request starts | `info` | `API request started` |
| Successful HTTP response | `info` | `Response (GET /products): 200 OK` |
| Unsuccessful HTTP response, including 4xx and 5xx | `error` | `Response ERROR (GET /products/missing-id): 404 Not Found - URL: ...` |
| Unsuccessful response body, when readable | `error` | `Error Body: ...` |
| Context creation, network, or JSON parsing error | `error` | `API request failed` |

The response logging method starts an asynchronous read of unsuccessful response bodies and ignores failures from that logging operation. HTTP errors are rethrown with the method, URL, status, and response body in their message, without an additional duplicate status log. Context creation, network, and JSON parsing failures are logged under `err` and rethrown. Request bodies and successful response bodies are not logged. A successful HTTP status log does not guarantee that JSON parsing succeeds.

```ts
import { ApiRequestHelper } from "../helpers/apiRequestHelper";
import type { GetProductsResponse } from "../api/productsApi/types";

try {
    const products = await ApiRequestHelper.executeApiRequest<GetProductsResponse, never>({
        url: "/products",
        method: "GET",
    });
    // The helper has already logged the request and its outcome.
} finally {
    await ApiRequestHelper.dispose();
}
```

See [Logger Helper](./logger-helper.md) for logger configuration and direct usage.

## Dispose

Use `dispose()` when the shared API context should be closed and its stored token cleared.

```ts
await ApiRequestHelper.dispose();
```
