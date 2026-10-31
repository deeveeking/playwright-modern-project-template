import type { Locator, Page } from "@playwright/test";

export class HeaderComponent {
    private readonly container = this.page.locator("app-header");
    private readonly navigation =
        this.container.locator("#navbarSupportedContent");
    private readonly navigationToggle = this.container.locator(
        '[aria-controls="navbarSupportedContent"]'
    );
    private readonly userMenu = this.container.getByTestId("nav-menu");
    private readonly signInLink = this.container.getByTestId("nav-sign-in");
    private readonly signOutLink = this.container.getByTestId("nav-sign-out");

    constructor(private readonly page: Page) {}

    public async openNavigation(): Promise<void> {
        await this.navigation.waitFor({ state: "attached" });

        if (!(await this.navigation.isVisible())) {
            await this.navigationToggle.click();
        }
    }

    public async openUserMenu(): Promise<void> {
        await this.openNavigation();

        if ((await this.userMenu.getAttribute("aria-expanded")) !== "true") {
            await this.userMenu.click();
        }
    }

    public async signOut(): Promise<void> {
        await this.openUserMenu();
        await this.signOutLink.click();
    }

    public getUserMenu(): Locator {
        return this.userMenu;
    }

    public getSignInLink(): Locator {
        return this.signInLink;
    }

    public getSignOutLink(): Locator {
        return this.signOutLink;
    }
}
