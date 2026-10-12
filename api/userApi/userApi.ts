import { ApiRequestHelper } from "../../helpers/apiRequestHelper";
import type {
    ChangeUserPasswordRequest,
    ChangeUserPasswordResponse,
    DeleteUserRequest,
    DeleteUserResponse,
    LoginUserRequest,
    LoginUserResponse,
    LogoutUserResponse,
    MeUserResponse,
    RegisterUserRequest,
    RegisterUserResponse,
    SearchUserRequest,
    SearchUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
} from "./types";

class UserApi {
    public async register(body: RegisterUserRequest): Promise<RegisterUserResponse> {
        return ApiRequestHelper.executeApiRequest<RegisterUserResponse, RegisterUserRequest>({
            url: "/users/register",
            method: "POST",
            body,
        });
    }

    public async login(body: LoginUserRequest): Promise<LoginUserResponse> {
        return ApiRequestHelper.executeApiRequest<LoginUserResponse, LoginUserRequest>({
            url: "/users/login",
            method: "POST",
            body,
        });
    }

    public async changePassword(
        body: ChangeUserPasswordRequest
    ): Promise<ChangeUserPasswordResponse> {
        return ApiRequestHelper.executeApiRequest<ChangeUserPasswordResponse, ChangeUserPasswordRequest>({
            url: "/users/change-password",
            method: "POST",
            body,
        });
    }

    public async me(): Promise<MeUserResponse> {
        return ApiRequestHelper.executeApiRequest<MeUserResponse, never>({
            url: "/users/me",
            method: "GET",
        });
    }

    /** Requires an admin account for automatic authentication. */
    public async delete({ userId }: DeleteUserRequest): Promise<DeleteUserResponse> {
        return ApiRequestHelper.executeApiRequest<DeleteUserResponse, never>({
            url: `/users/${encodeURIComponent(userId)}`,
            method: "DELETE",
        });
    }

    public async logout(): Promise<LogoutUserResponse> {
        const response = await ApiRequestHelper.executeApiRequest<LogoutUserResponse, never>({
            url: "/users/logout",
            method: "GET",
        });

        ApiRequestHelper.clearAccessToken();
        return response;
    }

    public async search(params: SearchUserRequest): Promise<SearchUserResponse> {
        return ApiRequestHelper.executeApiRequest<SearchUserResponse, never>({
            url: "/users/search",
            method: "GET",
            params: { ...params },
        });
    }

    public async update(
        userId: string,
        body: UpdateUserRequest
    ): Promise<UpdateUserResponse> {
        return ApiRequestHelper.executeApiRequest<UpdateUserResponse, UpdateUserRequest>({
            url: `/users/${encodeURIComponent(userId)}`,
            method: "PUT",
            body,
        });
    }
}
