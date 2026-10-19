import { expect, test } from "@playwright/test";
import { ApiFactory } from "../../../api/apiFactory";
import type { ProductsApi } from "../../../api/productsApi/productsApi";
import type { GetProductResponse } from "../../../api/productsApi/types";
import { ApiRequestHelper } from "../../../helpers/apiRequestHelper";
import { getCreateProductRequest } from "../../../helpers/requestHelper";

test.describe("Admin Products API Smoke Tests", () => {
    let productsApi: ProductsApi;
    let referenceProduct: GetProductResponse;
    const createdProductIds: string[] = [];

    test.beforeAll(async () => {
        productsApi = ApiFactory.productsApi;
        // Related test data can also be created before each test.
        // Here we reuse existing category, brand, and image records to keep
        // the framework simple, as its main purpose is to demonstrate architecture.
        const products = await productsApi.getAll();

        referenceProduct = await productsApi.getById(products.data[0].id);
    });

    test.afterAll(async () => {
        await Promise.all(createdProductIds.map(id => productsApi.delete(id)));
        await ApiRequestHelper.dispose();
    });

    test("Admin is create product successfuly with correct data", async () => {
        const request = getCreateProductRequest(
            referenceProduct.category.id,
            referenceProduct.brand.id,
            referenceProduct.product_image.id
        );
        const expectedResponse = {
            id: expect.any(String),
            name: request.name,
            description: request.description,
            price: request.price,
            is_location_offer: request.is_location_offer,
            is_rental: request.is_rental,
            co2_rating: request.co2_rating,
            in_stock: request.stock,
            is_eco_friendly: ["A", "B"].includes(request.co2_rating ?? ""),
            brand: {
                ...referenceProduct.brand,
                slug: expect.any(String),
            },
            category: referenceProduct.category,
            product_image: referenceProduct.product_image,
        };

        const response = await productsApi.create(request);
        createdProductIds.push(response.id);

        expect(response,
            "Create product response is incorrect")
            .toEqual(expectedResponse);
    });

    test("Admin is get product by id successfuly", async () => {
        const request = getCreateProductRequest(
            referenceProduct.category.id,
            referenceProduct.brand.id,
            referenceProduct.product_image.id
        );
        const createdProduct = await productsApi.create(request);
        createdProductIds.push(createdProduct.id);

        const expectedResponse = {
            id: createdProduct.id,
            name: request.name,
            description: request.description,
            price: request.price,
            is_location_offer: request.is_location_offer,
            is_rental: request.is_rental,
            co2_rating: request.co2_rating,
            in_stock: request.stock,
            is_eco_friendly: ["A", "B"].includes(request.co2_rating ?? ""),
            brand: referenceProduct.brand,
            category: referenceProduct.category,
            product_image: referenceProduct.product_image,
            specs: [],
        };

        const response = await productsApi.getById(createdProduct.id);

        expect(response,
            "Get product response is incorrect")
            .toEqual(expectedResponse);
    });
});
