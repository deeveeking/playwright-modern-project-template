import { test as browserTest } from "./browserFixture";
import { MainPage } from "../pages/mainPage";
import { ProductDetailPage } from "../pages/productDetailPage";
import { CartPage } from "../pages/cartPage";
import { LoginPage } from "../pages/loginPage";
import { AccountPage } from "../pages/accountPage";
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

    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    accountPage: async ({ page }, use) => {
        await use(new AccountPage(page));
    },
});

export { expect } from "./browserFixture";
