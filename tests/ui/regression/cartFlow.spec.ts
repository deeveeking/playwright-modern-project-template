import { expect, test } from "../../../fixtures/productFixture";
import { CartPage } from "../../../pages/cartPage";

test.describe("Cart regression tests", () => {
    test("User can add multiple units of a product to the cart", async ({
        page,
        productDetailPage,
        product,
    }) => {
        const expectedQuantity = 2;
        const expectedTotal = (product.price * expectedQuantity).toFixed(2);

        await productDetailPage.open(product.id);
        await productDetailPage.increaseQuantity();
        await productDetailPage.addToCart();

        const cartPage = await CartPage.visit(page);

        await expect(cartPage.getProductByName(product.name),
            "The added product should be visible in the cart")
            .toBeVisible();
        expect(await cartPage.getProductQuantity(product.name),
            "The cart should display the selected product quantity")
            .toEqual(expectedQuantity);
        expect(await cartPage.getTotalPrice(),
            "The cart total should account for the selected quantity")
            .toEqual(expectedTotal);
    });
});

test.describe("Cart removal regression tests", () => {
    test.use({ productCount: 2 });

    test("User can remove products and empty the cart", async ({
        page,
        productDetailPage,
        products,
    }) => {
        const [product, secondProduct] = products;
        const expectedInitialCount = 2;
        const expectedEmptyCount = 0;
        const expectedInitialTotal =
            (product.price + secondProduct.price).toFixed(2);
        const expectedRemainingTotal = secondProduct.price.toFixed(2);

        await productDetailPage.open(product.id);
        await productDetailPage.addToCart();
        await productDetailPage.open(secondProduct.id);
        await productDetailPage.addToCart();

        const cartPage = await CartPage.visit(page);

        await expect(cartPage.getProducts(),
            "The cart should initially contain both products")
            .toHaveCount(expectedInitialCount);
        expect(await cartPage.getTotalPrice(),
            "The initial cart total should include both products")
            .toEqual(expectedInitialTotal);

        await cartPage.removeProduct(product.name);

        await expect(cartPage.getProductByName(product.name),
            "The removed product should disappear from the cart")
            .toBeHidden();
        await expect(cartPage.getProductByName(secondProduct.name),
            "The second product should remain in the cart")
            .toBeVisible();
        expect(await cartPage.getTotalPrice(),
            "The cart total should include only the remaining product")
            .toEqual(expectedRemainingTotal);

        await cartPage.removeProduct(secondProduct.name);

        await expect(cartPage.getProducts(),
            "The cart should contain no products")
            .toHaveCount(expectedEmptyCount);
        expect(await cartPage.isEmptyCartMessageVisible(),
            "The empty cart message should be visible")
            .toBeTruthy();
        expect(await cartPage.isProceedToCheckoutVisible(),
            "The checkout button should disappear when the cart is empty")
            .toBeFalsy();
    });
});
