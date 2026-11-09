import { faker } from "@faker-js/faker";
import { expect, test } from "../../../fixtures/pagesFixture";

test.describe("Product flow regression tests", () => {
    test("User sees no results for a nonexistent product", async ({
        mainPage,
    }) => {
        const query = `Missing product ${faker.string.alphanumeric(12)}`;

        await mainPage.searchProduct(query);

        expect(await mainPage.isNoResultsMessageVisible(),
            "An empty search result message should be visible")
            .toBeTruthy();
        expect(await mainPage.getProductCardNames(),
            "Search should not return any product cards")
            .toEqual([]);
    });

    test("User can restore the catalog by resetting search", async ({
        mainPage,
    }) => {
        const [productName] = await mainPage.getProductCardNames();
        const query = `Missing product ${faker.string.alphanumeric(12)}`;

        await mainPage.searchProduct(query);

        expect(await mainPage.isNoResultsMessageVisible(),
            "An empty search result message should be visible")
            .toBeTruthy();

        await mainPage.resetSearch();

        await expect(mainPage.getProductCardByName(productName),
            "Resetting search should restore the original product")
            .toBeVisible();
        expect(await mainPage.getProductCardNames(),
            "The restored catalog should contain the original product")
            .toContain(productName);
        expect(await mainPage.isNoResultsMessageVisible(),
            "The empty search result message should disappear")
            .toBeFalsy();
    });
});
