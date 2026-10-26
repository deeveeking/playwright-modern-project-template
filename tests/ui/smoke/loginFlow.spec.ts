import { expect, test } from "../../../fixtures/pagesFixture";
import { staticTestMessages } from "../../../data/staticTestMessages";

test.use({
    storageState: { cookies: [], origins: [] },
});

test.describe("Login flow smoke tests", () => {
    test("User can sign in and view the account page", async ({
        page,
        loginPage,
        accountPage,
        user,
    }) => {
        await loginPage.open();
        await loginPage.login(
            user.credentials.email,
            user.credentials.password
        );

        await expect(page, "Login should open the account page")
            .toHaveURL("/account");

        const messages = staticTestMessages.accountPage;

        await expect(accountPage.getTitle()).toBeVisible();
        await expect(accountPage.getTitle())
            .toHaveText(messages.title);

        await expect(accountPage.getDescription()).toBeVisible();
        await expect(accountPage.getDescription())
            .toHaveText(messages.description);

        await expect(accountPage.getFavoritesLink()).toBeVisible();
        await expect(accountPage.getFavoritesLink())
            .toHaveText(messages.favorites);

        await expect(accountPage.getProfileLink()).toBeVisible();
        await expect(accountPage.getProfileLink())
            .toHaveText(messages.profile);

        await expect(accountPage.getInvoicesLink()).toBeVisible();
        await expect(accountPage.getInvoicesLink())
            .toHaveText(messages.invoices);

        await expect(accountPage.getMessagesLink()).toBeVisible();
        await expect(accountPage.getMessagesLink())
            .toHaveText(messages.messages);
    });

    test("User can sign out through the header menu", async ({
        page,
        loginPage,
        accountPage,
        user,
    }) => {
        await loginPage.open();
        await loginPage.login(
            user.credentials.email,
            user.credentials.password
        );

        await expect(page, "Login should open the account page")
            .toHaveURL("/account");

        await accountPage.header.openUserMenu();

        await expect(accountPage.header.getSignOutLink())
            .toBeVisible();
        await expect(accountPage.header.getSignOutLink())
            .toHaveText(staticTestMessages.header.signOut);

        await accountPage.header.signOut();

        await expect(page, "Sign-out should open the login page")
            .toHaveURL("/auth/login");

        await loginPage.header.openNavigation();

        await expect(loginPage.header.getSignInLink())
            .toBeVisible();
        await expect(loginPage.header.getSignInLink())
            .toHaveText(staticTestMessages.header.signIn);
        await expect(loginPage.header.getUserMenu())
            .toBeHidden();

        await accountPage.open();

        await expect(page, "Signed-out users must not access the account page")
            .toHaveURL("/auth/login");
    });
});
