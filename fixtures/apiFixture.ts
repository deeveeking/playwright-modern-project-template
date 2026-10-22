import { test as base } from "@playwright/test";
import { UserApi } from "../api/userApi/userApi";
import { ProductsApi } from "../api/productsApi/productsApi";
import { CategoryApi } from "../api/categoryApi/categoryApi";
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
            await use(new UserApi());
        },
        { scope: "worker" },
    ],

    productsApi: [
        async ({}, use) => {
            await use(new ProductsApi());
        },
        { scope: "worker" },
    ],

    categoryApi: [
        async ({}, use) => {
            await use(new CategoryApi());
        },
        { scope: "worker" },
    ],
});

export { expect } from "@playwright/test";
