import { expect, test } from "@playwright/test";
import { ApiFactory } from "../../../api/apiFactory";
import type { UserApi } from "../../../api/userApi/userApi";
import { ApiRequestHelper } from "../../../helpers/apiRequestHelper";
import { getRegisterUserRequest, getSearchUserRequest } from "../../../helpers/requestHelper";
import type { UpdateUserRequest } from "../../../api/userApi/types";

test.describe("User API Smoke Tests", () => {
    let userApi: UserApi;
    let createdUserIds: string[] = [];

    test.beforeAll(async () => {
        userApi = ApiFactory.userApi;
    });

    test.afterAll(async () => {
        await Promise.all(createdUserIds.map(async (id) => await userApi.delete(id)));
        await ApiRequestHelper.dispose();
    });

    test("User is registered successfuly with correct data", async () => {
        const request = getRegisterUserRequest();

        const expectedResponse = {
            id: expect.any(String),
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            address: request.address,
            phone: request.phone,
            dob: request.dob,
            created_at: expect.any(String),
            enabled: null,
            failed_login_attempts: null,
            role: 'user'
        };
        const expectedGetUserResponse = {
            ...expectedResponse,
            provider: null,
            totp_enabled: false,
            failed_login_attempts: 0,
            enabled: true,
        };

        const response = await userApi.register(request);
        createdUserIds.push(response.id);
        const searchUserRequest = getSearchUserRequest(`${response.first_name} ${response.last_name}`);
        const getUserResponse = await userApi.search(searchUserRequest);

        expect(response,
            "Register response is incorrect")
            .toEqual(expectedResponse);
        expect(getUserResponse.data[0],
            'Incorrect search response')
            .toEqual(expectedGetUserResponse);
    });
    
    test("User email is updated successfully with correct data", async () => {
        const request = getRegisterUserRequest();
        const registeredUser = await userApi.register(request);
        createdUserIds.push(registeredUser.id);

        const updateRequest: UpdateUserRequest = {
            ...request,
            email: getRegisterUserRequest().email,
        };
        const expectedResponse = { success: true };

        const response = await userApi.update(registeredUser.id, updateRequest);

        expect(response,
            "Update response is incorrect")
            .toEqual(expectedResponse);

        const searchRequest = getSearchUserRequest(`${registeredUser.first_name} ${registeredUser.last_name}`);
        const searchResponse = await userApi.search(searchRequest);

        expect(searchResponse.data[0].email,
            "Updated user was not found or the email was not saved")
            .toEqual(updateRequest.email);
    });
    test("User is deleted successfully", async () => {
        const request = getRegisterUserRequest();
        const registeredUser = await userApi.register(request);

        await userApi.delete(registeredUser.id);

        const searchRequest = getSearchUserRequest(registeredUser.email);
        const searchResponse = await userApi.search(searchRequest);

        expect(searchResponse.data,
            "Search returned users after deletion")
            .toEqual([]);
        expect(searchResponse.total,
            "Search total is not zero after deletion")
            .toEqual(0);
    });
});
