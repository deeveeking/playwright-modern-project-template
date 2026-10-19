import { expect, test } from "@playwright/test";
import { ApiFactory } from "../../../api/apiFactory";
import type { UserApi } from "../../../api/userApi/userApi";
import type { UpdateUserRequest } from "../../../api/userApi/types";
import { ApiRequestHelper } from "../../../helpers/apiRequestHelper";
import {
    getRegisterUserRequest,
    getSearchUserRequest,
} from "../../../helpers/requestHelper";

test.describe("Admin User API Regression Tests", () => {
    let userApi: UserApi;
    const createdUserIds = new Set<string>();

    test.beforeAll(async () => {
        userApi = ApiFactory.userApi;
    });

    test.afterAll(async () => {
        await Promise.all(
            [...createdUserIds].map(id => userApi.delete(id))
        );
        await ApiRequestHelper.dispose();
    });

    test("Admin cannot register user with blank email and password", async () => {
        const request = {
            ...getRegisterUserRequest(),
            email: " ",
            password: " ",
        };

        await expect(userApi.register(request),
            "Registration with blank email and password should fail with status 422")
            .rejects.toThrow(
                "Method: POST. URL: /users/register. Status: 422."
            );
    });

    test("Admin cannot update user email exceeding 256 characters", async () => {
        const request = getRegisterUserRequest();
        const user = await userApi.register(request);
        createdUserIds.add(user.id);

        const updateRequest: UpdateUserRequest = {
            ...request,
            email: `${"a".repeat(245)}@example.com`,
        };

        await expect(userApi.update(user.id, updateRequest),
            "Email update should fail with status 422")
            .rejects.toThrow(
                `Method: PATCH. URL: /users/${user.id}. Status: 422.`
            );

        const searchRequest = getSearchUserRequest(request.email);
        const response = await userApi.search(searchRequest);
        const foundUser = response.data.find(item => item.id === user.id);

        expect(foundUser?.email,
            "Original email should remain unchanged")
            .toEqual(request.email);
    });

    test("Admin search returns no results for a deleted user", async () => {
        const request = getRegisterUserRequest();
        const user = await userApi.register(request);

        await userApi.delete(user.id);

        const searchRequest = getSearchUserRequest(request.email);
        const response = await userApi.search(searchRequest);
        const expectedResponse: [] = [];

        expect(response.data,
            "Search returned a deleted user")
            .toEqual(expectedResponse);

        expect(response.total,
            "Search total should be zero")
            .toEqual(0);
    });
});
