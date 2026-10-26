import type { Locator, Page } from "@playwright/test";
import { HeaderComponent } from "./components/headerComponent";

export class AccountPage {
    public readonly header = new HeaderComponent(this.page);

    private readonly container = this.page.locator("app-overview");

    private readonly title = this.container.getByTestId("page-title");
    private readonly description = this.container.locator(":scope > p");
    private readonly favoritesLink = this.container.getByTestId("nav-favorites");
    private readonly profileLink = this.container.getByTestId("nav-profile");
    private readonly invoicesLink = this.container.getByTestId("nav-invoices");
    private readonly messagesLink = this.container.getByTestId("nav-messages");

    constructor(private readonly page: Page) {}

    public async open(): Promise<void> {
        await this.page.goto("/account");
    }

    public getTitle(): Locator {
        return this.title;
    }

    public getDescription(): Locator {
        return this.description;
    }

    public getFavoritesLink(): Locator {
        return this.favoritesLink;
    }

    public getProfileLink(): Locator {
        return this.profileLink;
    }

    public getInvoicesLink(): Locator {
        return this.invoicesLink;
    }

    public getMessagesLink(): Locator {
        return this.messagesLink;
    }
}
