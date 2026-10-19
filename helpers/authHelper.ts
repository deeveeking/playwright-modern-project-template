import type { LoginUserRequest } from "../api/userApi/types";
import { getEnvironment } from "../config/env";
import { ApiRequestHelper } from "./apiRequestHelper";

export const getUserStorageState = async (body: LoginUserRequest) => {
    const token = await ApiRequestHelper.getUserApiToken(body);

    return {
        cookies: [],
        origins: [{
            origin: new URL(getEnvironment().baseURL).origin,
            localStorage: [{
                name: "auth-token",
                value: token,
            }],
        }],
    };
};
