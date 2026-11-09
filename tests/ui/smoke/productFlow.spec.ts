import { expect, test } from "../../../fixtures/productFixture";

test.describe("Main page smoke tests", () => {
    test("User can find a product by its exact name", async ({
        mainPage,
        product,
    }) => {
        await mainPage.searchProduct(product.name);

        await expect(mainPage.getProductCardByName(product.name),
            `Product "${product.name}" should be visible in search results`)
            .toBeVisible();
        expect(await mainPage.getProductCardNames(),
            "Search should return only the requested product")
            .toEqual([product.name]);
        expect(await mainPage.getProductPrice(product.name),
            "Catalog should display the expected product price")
            .toEqual(product.price.toFixed(2));
    });

    test("User can open a product from the catalog", async ({
        page,
        mainPage,
        product,
    }) => {
        await mainPage.searchProduct(product.name);

        await expect(mainPage.getProductCardByName(product.name),
            `Product "${product.name}" should be visible before opening`)
            .toBeVisible();

        const productPage = await mainPage.clickProductCard(
            product.name
        );

        await expect(page,
            "Opening the product card should navigate to its detail page")
            .toHaveURL(`/product/${product.id}`);
        expect(await productPage.getProductName(),
            "Product details should display the selected product name")
            .toEqual(product.name);
        expect(await productPage.getProductPrice(),
            "Product details should display the expected product price")
            .toEqual(product.price.toFixed(2));
    });
});
