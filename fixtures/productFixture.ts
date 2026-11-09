import { test as pagesTest } from "./pagesFixture";
import { getCreateProductRequest } from "../helpers/requestHelper";
import { CreateProductResponse } from "../api/productsApi/types";
import { ProductFixtures, ProductOptions } from "./types";

export const test = pagesTest.extend<ProductFixtures & ProductOptions>({
    productCount: [1, { option: true }],

    products: async ({ productCount, productsApi, cartsApi, page }, use) => {
        if (!Number.isInteger(productCount) || productCount < 1) {
            throw new Error("productCount must be a positive integer");
        }

        const catalog = await productsApi.getAll();
        const referenceProduct = await productsApi.getById(
            catalog.data[0].id
        );
        const products: CreateProductResponse[] = [];

        try {
            for (let index = 0; index < productCount; index++) {
                const request = getCreateProductRequest(
                    referenceProduct.category.id,
                    referenceProduct.brand.id,
                    referenceProduct.product_image.id
                );

                const product = await productsApi.create({
                    ...request,
                    name: productCount > 1
                        ? `${request.name} ${index + 1}`
                        : request.name,
                    price: 24.99,
                    is_location_offer: false,
                    is_rental: false,
                    co2_rating: "C",
                    stock: 10,
                });

                products.push(product);
            }

            await use(products);
        } finally {
            const cartId = await page.evaluate(() =>
                sessionStorage.getItem("cart_id")
            );

            if (cartId) {
                await cartsApi.delete(cartId);
            }

            await Promise.all(
                products.map(product => productsApi.delete(product.id))
            );
        }
    },

    product: async ({ products }, use) => {
        await use(products[0]);
    },
});

export { expect } from "./pagesFixture";
