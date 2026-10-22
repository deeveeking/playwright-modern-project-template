import type { Locator, Page } from "@playwright/test";
import { removeDollarSign } from "../helpers/dataHelper";
import { PaymentMethod } from "./enums/paymentMethod";

export class CartPage {
    private readonly totalPrice =
        this.page.getByTestId("cart-total");
    private readonly products =
        this.page.getByRole("row").filter({
            has: this.page.getByTestId("product-title"),
        });
    private readonly proceedToCheckoutButton =
        this.page.getByTestId("proceed-1");
    private readonly signInProceedButton =
        this.page.getByTestId("proceed-2");
    private readonly addressProceedButton =
        this.page.getByTestId("proceed-3");
    private readonly paymentMethodSelect =
        this.page.getByTestId("payment-method");
    private readonly finishButton =
        this.page.getByTestId("finish");
    private readonly paymentSuccessMessage =
        this.page.getByTestId("payment-success-message");

    constructor(private readonly page: Page) {}

    public static async visit(page: Page): Promise<CartPage> {
        await page.goto("/checkout");

        return new CartPage(page);
    }

    public getProducts(): Locator {
        return this.products;
    }

    public getPaymentSuccessMessage(): Locator {
        return this.paymentSuccessMessage;
    }

    public getProductByName(productName: string): Locator {
        return this.products.filter({
            has: this.page.getByRole("spinbutton", {
                name: `Quantity for ${productName}`,
                exact: true,
            }),
        });
    }

    public async getTotalPrice(): Promise<string> {
        const price = await this.totalPrice.innerText();

        return removeDollarSign(price);
    }

    public async getProductPrice(productName: string): Promise<string> {
        const price = await this.getProductByName(productName)
            .getByTestId("product-price")
            .innerText();

        return removeDollarSign(price);
    }

    public async removeProduct(productName: string): Promise<void> {
        const product = this.getProductByName(productName);

        await product.locator("a.btn-danger").click();
        await product.waitFor({ state: "detached" });
    }

    public async proceedToCheckout(): Promise<void> {
        await this.proceedToCheckoutButton.click();
    }

    public async purchsaeProduct(
        paymentMethod: PaymentMethod = PaymentMethod.CashOnDelivery
    ): Promise<void> {
        await this.proceedToCheckout();
        await this.signInProceedButton.click();
        await this.addressProceedButton.click();
        await this.paymentMethodSelect.selectOption(paymentMethod);
        await this.finishButton.click();
    }
}
