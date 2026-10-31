import { test as userTest } from "./userFixture";
import { getUserStorageState } from "../helpers/authHelper";

export const test = userTest.extend({
    storageState: async ({ user }, use) => {
        const storageState = await getUserStorageState(user.credentials);
        await use(storageState);
    },

    page: async ({ page }, use) => {
        await page.goto("/");
        await page.locator("app-header")
            .getByRole("navigation")
            .waitFor({
                state: "visible",
                timeout: 30_000,
            });
        await use(page);
    },
});

export { expect } from "@playwright/test";
