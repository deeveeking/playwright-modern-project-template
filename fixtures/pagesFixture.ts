import { test as browserTest } from "./browserFixture";
import { MainPage } from "../pages/mainPage";
import { ProductDetailPage } from "../pages/productDetailPage";
import { CartPage } from "../pages/cartPage";
import type { PagesFixtures } from "./types";

export const test = browserTest.extend<PagesFixtures>({
    mainPage: async ({ page }, use) => {
        await use(new MainPage(page));
    },

    productDetailPage: async ({ page }, use) => {
        await use(new ProductDetailPage(page));
    },

    cartPage: async ({ page }, use) => {
        await use(new CartPage(page));
    },
});

export { expect } from "./browserFixture";
