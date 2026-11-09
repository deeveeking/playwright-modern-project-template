import type { Locator, Page } from "@playwright/test";
import { removeDollarSign } from "../helpers/dataHelper";
import { ProductDetailPage } from "./productDetailPage";
import { HeaderComponent } from "./components/headerComponent";

export class MainPage {
    public readonly header = new HeaderComponent(this.page);

    private readonly productCards =
        this.page.locator('a[data-test^="product-"]');
    private readonly searchInput =
        this.page.getByTestId("search-query");
    private readonly filtersButton =
        this.page.locator('button[data-test="filters"]');
    private readonly searchButton =
        this.page.getByTestId("search-submit");
    private readonly searchResetButton =
        this.page.getByTestId("search-reset");
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

    public async isNoResultsMessageVisible(): Promise<boolean> {
        return this.noResults.isVisible();
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

    private async openFilters(): Promise<void> {
        await this.searchInput.waitFor({ state: "attached" });

        if (!(await this.searchInput.isVisible())) {
            await this.filtersButton.click();
        }

        await this.searchInput.waitFor({ state: "visible" });
    }

    public async resetSearch(): Promise<void> {
        await this.openFilters();
        await this.searchResetButton.click();
    }

    public async searchProduct(query: string): Promise<void> {
        await this.openFilters();
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
