import type { Locator, Page } from "@playwright/test";
import { removeDollarSign } from "../helpers/dataHelper";
import { ProductDetailPage } from "./productDetailPage";

export class MainPage {
    private readonly productCards =
        this.page.locator('a[data-test^="product-"]');
    private readonly searchInput =
        this.page.getByTestId("search-query");
    private readonly searchButton =
        this.page.getByTestId("search-submit");
    private readonly searchResults =
        this.page.getByTestId("search_completed");
    private readonly noResults =
        this.page.getByTestId("no-results");

    constructor(private readonly page: Page) {}

    public async getProductCardNames(): Promise<string[]> {
        await this.productCards.or(this.noResults).first().waitFor();

        const names = await this.productCards
            .getByTestId("product-name")
            .allInnerTexts();

        return names.map(name => name.trim());
    }

    public getProductCardByName(productName: string): Locator {
        return this.productCards.filter({
            has: this.page.getByRole("heading", {
                name: productName,
                exact: true,
            }),
        });
    }

    public async clickProductCard(
        productName: string
    ): Promise<ProductDetailPage> {
        await this.getProductCardByName(productName).click();
        await this.page.waitForURL("**/product/*");

        return new ProductDetailPage(this.page);
    }

    public async searchProduct(query: string): Promise<void> {
        await this.searchInput.fill(query);
        await this.searchButton.click();
        await this.searchResults.waitFor();
    }

    public async getProductPrice(productName: string): Promise<string> {
        const price = await this.getProductCardByName(productName)
            .getByTestId("product-price")
            .innerText();

        return removeDollarSign(price);
    }
}
