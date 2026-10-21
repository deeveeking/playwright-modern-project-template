import { expect, test } from "../../../fixtures/apiFixture";
import { getCreateCategoryRequest } from "../../../helpers/requestHelper";

test.describe("Admin Category API Smoke Tests", () => {
    const createdCategoryIds: string[] = [];

    test.afterAll(async ({ categoryApi }) => {
        await Promise.all(createdCategoryIds.map(id => categoryApi.delete(id)));
    });

    test("Admin is create category successfuly with correct data", async ({ categoryApi }) => {
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

    test("Admin is get category by id successfuly", async ({ categoryApi }) => {
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
