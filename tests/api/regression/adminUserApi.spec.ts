import { expect, test } from "../../../fixtures/apiFixture";
import type { UpdateUserRequest } from "../../../api/userApi/types";
import {
    getRegisterUserRequest,
    getSearchUserRequest,
} from "../../../helpers/requestHelper";

test.describe("Admin User API Regression Tests", () => {
    const createdUserIds = new Set<string>();

    test.afterAll(async ({ userApi }) => {
        await Promise.all(
            [...createdUserIds].map(id => userApi.delete(id))
        );
    });

    test("Admin cannot register user with blank email and password", async ({ userApi }) => {
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

    test("Admin cannot update user email exceeding 256 characters", async ({ userApi }) => {
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

    test("Admin search returns no results for a deleted user", async ({ userApi }) => {
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
