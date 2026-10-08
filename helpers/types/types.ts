export type ExecuteApiRequestParams<TRequest = unknown> = {
    url: string;
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: TRequest;
};
