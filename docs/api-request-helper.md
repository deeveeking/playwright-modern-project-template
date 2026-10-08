# API Request Helper

The API request helper lives in `helpers/apiRequestHelper.ts`.

It creates one shared Playwright `APIRequestContext`. This follows the singleton pattern.

## Singleton

`ApiRequestHelper` uses a private constructor, so it cannot be created with `new`.

Use static methods instead.

```ts
await ApiRequestHelper.executeApiRequest<UserResponse>({
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
};
```

## Execute Request

Use `executeApiRequest` to send API requests.

```ts
const user = await ApiRequestHelper.executeApiRequest<UserResponse>({
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

## Error Handling

If the API response is not successful, the helper throws an error with:

- method
- URL
- status code
- response body

## Dispose

Use `dispose()` when the shared API context should be closed.

```ts
await ApiRequestHelper.dispose();
```
