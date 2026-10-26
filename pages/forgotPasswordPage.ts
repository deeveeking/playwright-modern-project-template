import type { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "./components/headerComponent";

export class ForgotPasswordPage {
    public readonly header = new HeaderComponent(this.page);

    private readonly container =
        this.page.locator("app-forgot-password");
    private readonly form =
        this.container.getByTestId("forgot-password-form");
    private readonly title =
        this.container.getByRole("heading", { level: 1 });
    private readonly emailInput =
        this.form.getByTestId("email");
    private readonly submitButton =
        this.form.getByTestId("forgot-password-submit");
    private readonly successMessage =
        this.form.locator('.alert-success[role="alert"]');

    constructor(private readonly page: Page) {}

    public async resetPassword(email: string): Promise<void> {
        await this.emailInput.fill(email);
        await this.submitButton.click();
    }

    public getTitle(): Locator {
        return this.title;
    }

    public getSuccessMessage(): Locator {
        return this.successMessage;
    }
}
