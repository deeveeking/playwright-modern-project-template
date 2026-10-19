import { expect, test } from "@playwright/test";
import { ApiFactory } from "../../../api/apiFactory";
import type { CategoryApi } from "../../../api/categoryApi/categoryApi";
import { ApiRequestHelper } from "../../../helpers/apiRequestHelper";
import { getCreateCategoryRequest } from "../../../helpers/requestHelper";

test.describe("Admin Category API Smoke Tests", () => {
    let categoryApi: CategoryApi;
    const createdCategoryIds: string[] = [];

    test.beforeAll(async () => {
        categoryApi = ApiFactory.categoryApi;
    });

    test.afterAll(async () => {
        await Promise.all(createdCategoryIds.map(id => categoryApi.delete(id)));
        await ApiRequestHelper.dispose();
    });

    test("Admin is create category successfuly with correct data", async () => {
        const request = getCreateCategoryRequest();
        const expectedResponse = {
            id: expect.any(String),
            name: request.name,
            slug: request.slug,
            parent_id: request.parent_id,
        };

        const response = await categoryApi.create(request);
        createdCategoryIds.push(response.id);

        expect(response,
            "Create category response is incorrect")
            .toEqual(expectedResponse);
    });

    test("Admin is get category by id successfuly", async () => {
        const request = getCreateCategoryRequest();
        const createdCategory = await categoryApi.create(request);
        createdCategoryIds.push(createdCategory.id);

        const expectedResponse = {
            id: createdCategory.id,
            name: request.name,
            slug: request.slug,
            parent_id: request.parent_id,
            sub_categories: [],
        };

        const response = await categoryApi.getById(createdCategory.id);

        expect(response,
            "Get category response is incorrect")
            .toEqual(expectedResponse);
    });
});
