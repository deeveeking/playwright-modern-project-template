import { expect, test } from "../../../fixtures/productFixture";
import { CartPage } from "../../../pages/cartPage";
import { PaymentMethod } from "../../../pages/enums/paymentMethod";

test.describe("Cart smoke tests", () => {
    test("User can add a product to the cart", async ({
        page,
        productDetailPage,
        product,
    }) => {
        const expectedQuantity = 1;
        const expectedPrice = product.price.toFixed(2);

        await productDetailPage.open(product.id);
        await productDetailPage.addToCart();

        const cartPage = await CartPage.visit(page);

        await expect(cartPage.getProductByName(product.name),
            "The added product should be visible in the cart")
            .toBeVisible();
        expect(await cartPage.getProductQuantity(product.name),
            "The cart should display the selected product quantity")
            .toEqual(expectedQuantity);
        expect(await cartPage.getProductPrice(product.name),
            "The cart should display the expected product price")
            .toEqual(expectedPrice);
        expect(await cartPage.getTotalPrice(),
            "The cart total should equal the price of one product")
            .toEqual(expectedPrice);
    });

    test("User can validate cash-on-delivery payment", async ({
        page,
        productDetailPage,
        product,
    }) => {
        await productDetailPage.open(product.id);
        await productDetailPage.addToCart();

        const cartPage = await CartPage.visit(page);

        await cartPage.purchsaeProduct(PaymentMethod.CashOnDelivery);

        await expect(cartPage.getPaymentSuccessMessage(),
            "Payment validation should display a success message")
            .toBeVisible();
    });
});
