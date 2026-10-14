import { expect, test } from "@playwright/test";
import { ApiFactory } from "../../../api/apiFactory";
import type { UserApi } from "../../../api/userApi/userApi";
import { ApiRequestHelper } from "../../../helpers/apiRequestHelper";
import { getRegisterUserRequest } from "../../../helpers/requestHelper";
import type { RegisterUserResponse } from "../../../api/userApi/types";

test.describe("User API Tests", () => {
    let userApi: UserApi;

    test.beforeAll(async () => {
        userApi = ApiFactory.userApi;
    });

    test.afterAll(async () => {
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
        };

        const response = await userApi.register(request);

        expect(response,
            "Response is incorrect")
            .toEqual(expectedResponse);
    });
});
