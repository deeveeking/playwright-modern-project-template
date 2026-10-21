import { expect, test } from "../../../fixtures/apiFixture";
import { getCreateCategoryRequest } from "../../../helpers/requestHelper";

test.describe("Admin Category API Regression Tests", () => {
    const createdCategoryIds = new Set<string>();

    test.afterAll(async ({ categoryApi }) => {
        await Promise.all(
            [...createdCategoryIds].map(id => categoryApi.delete(id))
        );
    });

    test("Admin cannot create category with an empty name", async ({ categoryApi }) => {
        const request = {
            ...getCreateCategoryRequest(),
            name: "",
        };

        await expect(categoryApi.create(request),
            "Category creation should fail with status 422")
            .rejects.toThrow(
                "Method: POST. URL: /categories. Status: 422."
            );
    });

    test("Admin cannot get deleted category by id", async ({ categoryApi }) => {
        const request = getCreateCategoryRequest();
        const category = await categoryApi.create(request);
        createdCategoryIds.add(category.id);

        await categoryApi.delete(category.id);
        createdCategoryIds.delete(category.id);

        const response = categoryApi.getById(category.id);

        await expect(response,
            "Getting a deleted category should fail with status 404")
            .rejects.toThrow(
                `Method: GET. URL: /categories/tree/${category.id}. Status: 404.`
            );
    });
});
