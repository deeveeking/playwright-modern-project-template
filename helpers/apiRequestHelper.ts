import { request, type APIRequestContext, type APIResponse } from "@playwright/test";
import type { LoginUserRequest, LoginUserResponse } from "../api/userApi/types";
import { getEnvironment } from "../config/env";
import { logger } from "./loggerHelper";
import { type ExecuteApiRequestParams } from "./types/types";

class ApiRequestHelper {
    private static context: APIRequestContext | null = null;
    private static tokenPromise: Promise<string> | null = null;

    private constructor() {}

    public static async getApiToken(): Promise<string> {
        if (!ApiRequestHelper.tokenPromise) {
            ApiRequestHelper.tokenPromise = ApiRequestHelper.requestApiToken();
        }

        const tokenPromise = ApiRequestHelper.tokenPromise;

        try {
            return await tokenPromise;
        } catch (err) {
            if (ApiRequestHelper.tokenPromise === tokenPromise) {
                ApiRequestHelper.clearAccessToken();
            }
            throw err;
        }
    }

    private static async requestApiToken(): Promise<string> {
        const email = process.env.API_EMAIL;
        const password = process.env.API_PASSWORD;

        if (!email || !password) {
            throw new Error("API_EMAIL and API_PASSWORD must be set for authenticated API requests");
        }

        const requestDetails = { method: "POST", url: "/users/login" };
        let response: APIResponse | undefined;

        logger.info(requestDetails, "API request started");

        try {
            const context = await ApiRequestHelper.getContext();
            const body: LoginUserRequest = { email, password };
            response = await context.post(requestDetails.url, { data: body });
            ApiRequestHelper.logResponseStatus(response, requestDetails.method, requestDetails.url);

            if (!response.ok()) {
                throw new Error(
                    `API request failed. Method: POST. URL: ${requestDetails.url}. Status: ${response.status()}. Body: ${await response.text()}`
                );
            }

            const result = await response.json() as LoginUserResponse;
            if (!result || typeof result.access_token !== "string" || !result.access_token.trim()) {
                throw new Error("Authentication response does not contain a valid access_token");
            }

            return result.access_token;
        } catch (err) {
            if (!response || response.ok()) {
                logger.error(
                    { ...requestDetails, err, statusCode: response?.status() },
                    "API request failed"
                );
            }
            throw err;
        }
    }

    public static clearAccessToken(): void {
        ApiRequestHelper.tokenPromise = null;
    }

    private static async getContext(): Promise<APIRequestContext> {
        if (!ApiRequestHelper.context) {
            ApiRequestHelper.context = await request.newContext({
                baseURL: getEnvironment().baseApiURL,
            });
        }

        return ApiRequestHelper.context;
    }

    protected static logResponseStatus(response: APIResponse, method: string, endpoint: string): void {
        if (response.ok()) {
            logger.info(`Response (${method} ${endpoint}): ${response.status()} ${response.statusText()}`);
        } else {
            logger.error(`Response ERROR (${method} ${endpoint}): ${response.status()} ${response.statusText()} - URL: ${response.url()}`);

            // Optionally log response body for errors
            response.text().then(text => logger.error(`Error Body: ${text}`)).catch(() => { });
        }
    }

    public static async executeApiRequest<TResponse, TRequest>(
        params: ExecuteApiRequestParams<TRequest>
    ): Promise<TResponse> {
        const requestDetails = { method: params.method, url: params.url };
        let response: APIResponse | undefined;

        logger.info(requestDetails, "API request started");

        try {
            const headers = {
                Authorization: `Bearer ${await ApiRequestHelper.getApiToken()}`,
            };

            const context = await ApiRequestHelper.getContext();
            response = await context.fetch(params.url, {
                method: params.method,
                data: params.body,
                headers,
                params: params.params,
            });
            ApiRequestHelper.logResponseStatus(response, params.method, params.url);

            if (!response.ok()) {
                throw new Error(
                    `API request failed. Method: ${params.method}. URL: ${params.url}. Status: ${response.status()}. Body: ${await response.text()}`
                );
            }

            if (response.status() === 204) {
                return undefined as TResponse;
            }

            return await response.json() as TResponse;
        } catch (err) {
            if (!response || response.ok()) {
                logger.error(
                    { ...requestDetails, err, statusCode: response?.status() },
                    "API request failed"
                );
            }
            throw err;
        }
    }

    public static async dispose(): Promise<void> {
        ApiRequestHelper.clearAccessToken();

        if (!ApiRequestHelper.context) {
            return;
        }

        await ApiRequestHelper.context.dispose();
        ApiRequestHelper.context = null;
    }
}

export { ApiRequestHelper };
