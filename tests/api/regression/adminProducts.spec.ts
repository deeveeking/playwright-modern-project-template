import { expect, test } from "@playwright/test";
import { ApiFactory } from "../../../api/apiFactory";
import type { ProductsApi } from "../../../api/productsApi/productsApi";
import type { GetProductResponse } from "../../../api/productsApi/types";
import { ApiRequestHelper } from "../../../helpers/apiRequestHelper";
import { getCreateProductRequest } from "../../../helpers/requestHelper";

test.describe("Admin Products API Regression Tests", () => {
    let productsApi: ProductsApi;
    let referenceProduct: GetProductResponse;
    const createdProductIds = new Set<string>();

    test.beforeAll(async () => {
        productsApi = ApiFactory.productsApi;

        // Related test data can also be created before each test.
        // Here we reuse existing category, brand, and image records to keep
        // the framework simple, as its main purpose is to demonstrate architecture.
        const products = await productsApi.getAll();
        referenceProduct = await productsApi.getById(products.data[0].id);
    });

    test.afterAll(async () => {
        await Promise.all(
            [...createdProductIds].map(id => productsApi.delete(id))
        );
        await ApiRequestHelper.dispose();
    });

    test("Admin cannot create product with an empty name", async () => {
        const request = {
            ...getCreateProductRequest(
                referenceProduct.category.id,
                referenceProduct.brand.id,
                referenceProduct.product_image.id
            ),
            name: "",
        };

        await expect(productsApi.create(request),
            "Product creation should fail with status 422")
            .rejects.toThrow(
                "Method: POST. URL: /products. Status: 422."
            );
    });

    test("Admin cannot get deleted product by id", async () => {
        const request = getCreateProductRequest(
            referenceProduct.category.id,
            referenceProduct.brand.id,
            referenceProduct.product_image.id
        );
        const product = await productsApi.create(request);
        createdProductIds.add(product.id);

        await productsApi.delete(product.id);
        createdProductIds.delete(product.id);

        await expect(productsApi.getById(product.id),
            "Getting a deleted product should fail with status 404")
            .rejects.toThrow(
                `Method: GET. URL: /products/${product.id}. Status: 404.`
            );
    });
});
