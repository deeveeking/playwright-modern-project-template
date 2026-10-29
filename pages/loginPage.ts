import type { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "./components/headerComponent";
import { ForgotPasswordPage } from "./forgotPasswordPage";

export class LoginPage {
    public readonly header = new HeaderComponent(this.page);

    private readonly emailInput = this.page.getByTestId("email");
    private readonly passwordInput = this.page.getByTestId("password");
    private readonly submitButton = this.page.getByTestId("login-submit");
    private readonly errorMessage =
        this.page.getByTestId("login-error");
    private readonly forgotPasswordLink =
        this.page.getByTestId("forgot-password-link");

    constructor(private readonly page: Page) {}

    public async open(): Promise<void> {
        await this.page.goto("/auth/login");
    }

    public async login(email: string, password: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.passwordInput.fill(password);
        await this.submitButton.click();
    }

    public getErrorMessage(): Locator {
        return this.errorMessage;
    }

    public getForgotPasswordLink(): Locator {
        return this.forgotPasswordLink;
    }

    public async openForgotPassword(): Promise<ForgotPasswordPage> {
        await this.forgotPasswordLink.click();
        await this.page.waitForURL("**/auth/forgot-password");

        return new ForgotPasswordPage(this.page);
    }
}
