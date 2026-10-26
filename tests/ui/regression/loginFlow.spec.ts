import { expect, test } from "../../../fixtures/pagesFixture";
import { staticTestMessages } from "../../../data/staticTestMessages";

test.use({
    storageState: { cookies: [], origins: [] },
});

test.describe("Login flow regression tests", () => {
    test("User cannot sign in with an incorrect password", async ({
        page,
        loginPage,
        accountPage,
        user,
    }) => {
        await loginPage.open();
        await loginPage.login(
            user.credentials.email,
            `${user.credentials.password}Wrong1!`
        );

        await expect(loginPage.getErrorMessage()).toBeVisible();
        await expect(loginPage.getErrorMessage())
            .toHaveText(staticTestMessages.loginPage.invalidCredentials);

        await expect(page, "Failed login should keep the login page open")
            .toHaveURL("/auth/login");

        await accountPage.open();

        await expect(page, "Unauthenticated users must not access the account page")
            .toHaveURL("/auth/login");
        await expect(loginPage.header.getUserMenu()).toBeHidden();
    });

    test("User can reset the password and sign in with the new password", async ({
        page,
        loginPage,
        accountPage,
        user,
    }) => {
        // The demo application resets passwords to this fixed value.
        const newPassword = "welcome02";

        await loginPage.open();

        await expect(loginPage.getForgotPasswordLink()).toBeVisible();
        await expect(loginPage.getForgotPasswordLink())
            .toHaveText(staticTestMessages.loginPage.forgotPasswordLink);

        const forgotPasswordPage = await loginPage.openForgotPassword();

        await expect(page, "The recovery link should open the forgot-password page")
            .toHaveURL("/auth/forgot-password");
        await expect(forgotPasswordPage.getTitle()).toBeVisible();
        await expect(forgotPasswordPage.getTitle())
            .toHaveText(staticTestMessages.forgotPasswordPage.title);

        await forgotPasswordPage.resetPassword(user.credentials.email);

        await expect(forgotPasswordPage.getSuccessMessage()).toBeVisible();

        await loginPage.open();
        await loginPage.login(
            user.credentials.email,
            user.credentials.password
        );

        await expect(loginPage.getErrorMessage()).toBeVisible();
        await expect(loginPage.getErrorMessage())
            .toHaveText(staticTestMessages.loginPage.invalidCredentials);
        await expect(page, "The old password should no longer grant access")
            .toHaveURL("/auth/login");

        await loginPage.login(user.credentials.email, newPassword);

        await expect(page, "The new password should grant access")
            .toHaveURL("/account");
        await expect(accountPage.getTitle()).toBeVisible();
        await expect(accountPage.getTitle())
            .toHaveText(staticTestMessages.accountPage.title);
    });
});
