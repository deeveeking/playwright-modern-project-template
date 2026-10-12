import { request, type APIRequestContext, type APIResponse } from "@playwright/test";
import { getEnvironment } from "../config/env";
import { logger } from "./loggerHelper";
import { type ExecuteApiRequestParams } from "./types/types";

class ApiRequestHelper {
    private static context: APIRequestContext | null = null;
    private static tokenPromise: Promise<string> | null = null;
    private static readonly publicEndpoints = new Set(["/users/login", "/users/register"]);

    private constructor() {}

    public static async getApiToken(): Promise<string> {
        if (ApiRequestHelper.tokenPromise) {
            return ApiRequestHelper.tokenPromise;
        }

        const email = process.env.API_EMAIL;
        const password = process.env.API_PASSWORD;

        if (!email || !password) {
            throw new Error("API_EMAIL and API_PASSWORD must be set for authenticated API requests");
        }

        const tokenPromise: Promise<string> = ApiRequestHelper.executeApiRequest<
            { access_token: string },
            { email: string; password: string }
        >({
            url: "/users/login",
            method: "POST",
            body: { email, password },
        }).then(response => {
            if (!response || typeof response.access_token !== "string" || !response.access_token.trim()) {
                throw new Error("Authentication response does not contain a valid access_token");
            }

            return response.access_token;
        }).catch(err => {
            if (ApiRequestHelper.tokenPromise === tokenPromise) {
                ApiRequestHelper.clearAccessToken();
            }
            throw err;
        });

        ApiRequestHelper.tokenPromise = tokenPromise;
        return tokenPromise;
    }

    public static clearAccessToken(): void {
        ApiRequestHelper.tokenPromise = null;
    }

    private static async getRequestHeaders(
        params: ExecuteApiRequestParams
    ): Promise<Record<string, string>> {
        const pathname = new URL(params.url, getEnvironment().baseApiURL).pathname.replace(/\/+$/, "");

        if (ApiRequestHelper.publicEndpoints.has(pathname)) {
            return {};
        }

        const accessToken = await ApiRequestHelper.getApiToken();
        return { Authorization: `Bearer ${accessToken}` };
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
            const headers = await ApiRequestHelper.getRequestHeaders(params);
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
