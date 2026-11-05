import { expect, test } from "../../../fixtures/productFixture";

test.describe("Product details smoke tests", () => {
    test("User can view product details with the default quantity", async ({
        productDetailPage,
        product,
    }) => {
        await productDetailPage.open(product.id);

        expect(await productDetailPage.getProductName(),
            "Product details should display the expected product name")
            .toEqual(product.name);
        expect(await productDetailPage.getProductPrice(),
            "Product details should display the expected product price")
            .toEqual(product.price.toFixed(2));
        expect(await productDetailPage.getQuantity(),
            "The default product quantity should be one")
            .toEqual(1);
    });
});
