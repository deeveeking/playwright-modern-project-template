import { ApiRequestHelper } from "../../helpers/apiRequestHelper";
import type {
    ChangeUserPasswordRequest,
    ChangeUserPasswordResponse,
    DeleteUserResponse,
    RegisterUserRequest,
    RegisterUserResponse,
    SearchUserRequest,
    SearchUserResponse,
    UpdateUserRequest,
    UpdateUserResponse,
} from "./types";

export class UserApi {
    public async register(body: RegisterUserRequest): Promise<RegisterUserResponse> {
        return ApiRequestHelper.executeApiRequest<RegisterUserResponse, RegisterUserRequest>({
            url: "/users/register",
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

    public async delete(userId: string): Promise<DeleteUserResponse> {
        return ApiRequestHelper.executeApiRequest<DeleteUserResponse, never>({
            url: `/users/${encodeURIComponent(userId)}`,
            method: "DELETE",
        });
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
            method: "PATCH",
            body,
        });
    }
}
