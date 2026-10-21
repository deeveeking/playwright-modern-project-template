import { expect, test } from "../../../fixtures/apiFixture";
import { getRegisterUserRequest, getSearchUserRequest } from "../../../helpers/requestHelper";
import type { UpdateUserRequest } from "../../../api/userApi/types";

test.describe("Admin User API Smoke Tests", () => {
    let createdUserIds: string[] = [];

    test.afterAll(async ({ userApi }) => {
        await Promise.all(createdUserIds.map(async (id) => await userApi.delete(id)));
    });

    test("Admin is register user successfuly with correct data", async ({ userApi }) => {
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
    
    test("Admin is update user email successfuly with correct data", async ({ userApi }) => {
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
    
    test("Admin is delete user successfuly", async ({ userApi }) => {
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
