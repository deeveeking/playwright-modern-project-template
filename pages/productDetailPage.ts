import type { Page } from "@playwright/test";
import { removeDollarSign } from "../helpers/dataHelper";

export class ProductDetailPage {
    private readonly productPrice =
        this.page.getByTestId("unit-price");
    private readonly productName =
        this.page.getByTestId("product-name");
    private readonly increaseQuantityButton =
        this.page.getByTestId("increase-quantity");
    private readonly decreaseQuantityButton =
        this.page.getByTestId("decrease-quantity");
    private readonly addToCartButton =
        this.page.getByTestId("add-to-cart");

    constructor(private readonly page: Page) {}

    public async getProductPrice(): Promise<string> {
        const price = await this.productPrice.innerText();

        return removeDollarSign(price);
    }

    public async getProductName(): Promise<string> {
        return this.productName.evaluate(element =>
            Array.from(element.childNodes)
                .filter(node => node.nodeType === Node.TEXT_NODE)
                .map(node => node.textContent)
                .join("")
                .trim()
        );
    }

    public async increaseQuantity(): Promise<void> {
        await this.increaseQuantityButton.click();
    }

    public async decreaseQuantity(): Promise<void> {
        await this.decreaseQuantityButton.click();
    }

    public async addToCart(): Promise<void> {
        await this.addToCartButton.click();
    }
}
