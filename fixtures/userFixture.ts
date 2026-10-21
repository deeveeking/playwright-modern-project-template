import { test as apiTest } from "./apiFixture";
import { getRegisterUserRequest } from "../helpers/requestHelper";
import type { UserFixtures, UserOptions } from "./types";

export const test = apiTest.extend<UserFixtures & UserOptions>({
    userCredentials: [undefined, { option: true }],

    user: async ({ userApi, userCredentials }, use) => {
        if (userCredentials) {
            await use({
                credentials: userCredentials,
                cleanup: async () => {},
            });
            return;
        }

        const request = getRegisterUserRequest();
        const profile = await userApi.register(request);
        let createdUserId: string | undefined = profile.id;

        const cleanup = async (): Promise<void> => {
            if (createdUserId) {
                await userApi.delete(createdUserId);
                createdUserId = undefined;
            }
        };

        try {
            await use({
                credentials: {
                    email: request.email,
                    password: request.password,
                },
                profile,
                cleanup,
            });
        } finally {
            await cleanup();
        }
    },
});
