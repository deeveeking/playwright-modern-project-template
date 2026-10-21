import { test as base } from "@playwright/test";
import { ApiFactory } from "../api/apiFactory";
import { ApiRequestHelper } from "../helpers/apiRequestHelper";
import type { ApiWorkerFixtures } from "./types";

export const test = base.extend<{}, ApiWorkerFixtures>({
    _apiLifecycle: [
        async ({}, use) => {
            try {
                await use();
            } finally {
                await ApiRequestHelper.dispose();
            }
        },
        { scope: "worker", auto: true },
    ],

    userApi: [
        async ({}, use) => {
            await use(ApiFactory.userApi);
        },
        { scope: "worker" },
    ],

    productsApi: [
        async ({}, use) => {
            await use(ApiFactory.productsApi);
        },
        { scope: "worker" },
    ],

    categoryApi: [
        async ({}, use) => {
            await use(ApiFactory.categoryApi);
        },
        { scope: "worker" },
    ],
});

export { expect } from "@playwright/test";
