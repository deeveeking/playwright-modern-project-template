import { request, type APIRequestContext } from "@playwright/test";
import { getEnvironment } from "../config/env";
import { type ExecuteApiRequestParams } from "./types/types";

class ApiRequestHelper {
    private static context: APIRequestContext | null = null;

    private constructor() {}

    private static async getContext(): Promise<APIRequestContext> {
        if (!ApiRequestHelper.context) {
            ApiRequestHelper.context = await request.newContext({
                baseURL: getEnvironment().baseApiURL,
            });
        }

        return ApiRequestHelper.context;
    }

    public static async executeApiRequest<TResponse, TRequest>(
        params: ExecuteApiRequestParams<TRequest>
    ): Promise<TResponse> {
        const context = await ApiRequestHelper.getContext();

        const response = await context.fetch(params.url, {
            method: params.method,
            data: params.body,
        });

        if (!response.ok()) {
            throw new Error(
                `API request failed. Method: ${params.method}. URL: ${params.url}. Status: ${response.status()}. Body: ${await response.text()}`
            );
        }

        return response.json() as Promise<TResponse>;
    }

    public static async dispose(): Promise<void> {
        if (!ApiRequestHelper.context) {
            return;
        }

        await ApiRequestHelper.context.dispose();
        ApiRequestHelper.context = null;
    }
}

export { ApiRequestHelper };
