import { expect, test } from "../../../fixtures/productFixture";

test.describe("Product details regression tests", () => {
    test("User cannot decrease the product quantity below one", async ({
        productDetailPage,
        product,
    }) => {
        const expectedQuantity = 1;

        await productDetailPage.open(product.id);

        expect(await productDetailPage.getQuantity(),
            `Product quantity should start at ${expectedQuantity}`)
            .toEqual(expectedQuantity);

        await productDetailPage.decreaseQuantity();

        expect(await productDetailPage.getQuantity(),
            `Product quantity should remain ${expectedQuantity} after decreasing`)
            .toEqual(expectedQuantity);
    });

    test("User can increase and decrease the product quantity", async ({
        productDetailPage,
        product,
    }) => {
        const expectedIncreasedQuantity = 3;
        const expectedDecreasedQuantity = 2;

        await productDetailPage.open(product.id);

        await productDetailPage.increaseQuantity();
        await productDetailPage.increaseQuantity();

        expect(await productDetailPage.getQuantity(),
            `Product quantity should increase to ${expectedIncreasedQuantity}`)
            .toEqual(expectedIncreasedQuantity);

        await productDetailPage.decreaseQuantity();

        expect(await productDetailPage.getQuantity(),
            `Product quantity should decrease to ${expectedDecreasedQuantity}`)
            .toEqual(expectedDecreasedQuantity);
    });
});
