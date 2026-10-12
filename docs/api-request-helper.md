# API Request Helper

The API request helper lives in `helpers/apiRequestHelper.ts`.

It creates one shared Playwright `APIRequestContext`. This follows the singleton pattern.

## Singleton

`ApiRequestHelper` uses a private constructor, so it cannot be created with `new`.

Use static methods instead.

```ts
await ApiRequestHelper.executeApiRequest<UserResponse, unknown>({
    url: "/api/users/2",
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

Use `params` for URL query parameters. The helper automatically attaches the Bearer token except for `/users/login` and `/users/register`. It builds authorization headers internally; custom request headers are not exposed in `ExecuteApiRequestParams`. A `204 No Content` response returns `undefined`; use `void` as the response type. Other successful responses are parsed as JSON.

```ts
const user = await ApiRequestHelper.executeApiRequest<UserResponse, unknown>({
    url: "/api/users/2",
    method: "GET",
});
```

For requests with body, pass the request type and response type.

```ts
const user = await ApiRequestHelper.executeApiRequest<CreateUserResponse, CreateUserRequest>({
    url: "/api/users",
    method: "POST",
    body: {
        name: "John",
        job: "QA",
    },
});
```

## Authentication

`getApiToken(): Promise<string>` reads `API_EMAIL` and `API_PASSWORD` from the process environment, sends `POST /users/login`, validates `access_token`, and returns it. The token request is cached, so concurrent and subsequent calls reuse it. Failed token requests are removed from the cache so a later call can retry.

The helper determines authentication from the URL pathname. Routes in its `publicEndpoints` set (`/users/login` and `/users/register`) do not obtain or receive the cached token. Query parameters and trailing slashes do not affect this check. This also prevents recursion when `getApiToken()` sends its login request. For all other routes, the helper awaits `getApiToken()` and adds `Authorization: Bearer <token>`. Missing credentials or failed authentication prevent that request from being sent. Add any future public routes to `publicEndpoints`.

`UserApi.login(body)` remains an ordinary request: it returns the login response without reading, replacing, or clearing the helper's token. `clearAccessToken()` clears the cached token without closing the context. Successful `UserApi.logout()` and `dispose()` also clear it; the next authenticated request obtains a new token. The singleton holds one token per process, shared by API clients in that process. Clear the cache after changing credentials or when the token expires; automatic refresh is not implemented.

## Error Handling

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
| Successful HTTP response | `info` | `Response (GET /api/users/2): 200 OK` |
| Unsuccessful HTTP response, including 4xx and 5xx | `error` | `Response ERROR (GET /api/users/2): 404 Not Found - URL: ...` |
| Unsuccessful response body, when readable | `error` | `Error Body: ...` |
| Context creation, network, or JSON parsing error | `error` | `API request failed` |

The response logging method starts an asynchronous read of unsuccessful response bodies and ignores failures from that logging operation. HTTP errors are rethrown with the method, URL, status, and response body in their message, without an additional duplicate status log. Context creation, network, and JSON parsing failures are logged under `err` and rethrown. Request bodies and successful response bodies are not logged. A successful HTTP status log does not guarantee that JSON parsing succeeds.

```ts
import { ApiRequestHelper } from "../helpers/apiRequestHelper";

try {
    const user = await ApiRequestHelper.executeApiRequest<{ id: number }, unknown>({
        url: "/api/users/2",
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
