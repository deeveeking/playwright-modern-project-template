import type { Page } from "@playwright/test";
import { removeDollarSign } from "../helpers/dataHelper";
import { HeaderComponent } from "./components/headerComponent";

export class ProductDetailPage {
    public readonly header = new HeaderComponent(this.page);

    private readonly productPrice =
        this.page.getByTestId("unit-price");
    private readonly productName =
        this.page.getByTestId("product-name");
    private readonly quantityInput =
        this.page.getByTestId("quantity");
    private readonly increaseQuantityButton =
        this.page.getByTestId("increase-quantity");
    private readonly decreaseQuantityButton =
        this.page.getByTestId("decrease-quantity");
    private readonly addToCartButton =
        this.page.getByTestId("add-to-cart");

    constructor(private readonly page: Page) {}

    public async open(productId: string): Promise<void> {
        await this.page.goto(`/product/${encodeURIComponent(productId)}`);
    }

    public async getQuantity(): Promise<number> {
        return Number(await this.quantityInput.inputValue());
    }

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
        const [response] = await Promise.all([
            this.page.waitForResponse(response =>
                response.request().method() === "POST" &&
                /^\/carts\/[^/]+$/.test(new URL(response.url()).pathname)
            ),
            this.addToCartButton.click(),
        ]);

        if (!response.ok()) {
            throw new Error(
                `Adding a product to the cart failed with HTTP ${response.status()}`
            );
        }
    }
}
