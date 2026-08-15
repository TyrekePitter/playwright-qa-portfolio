import { Page, Locator } from "@playwright/test";

export class InventoryPage {
    static readonly url = "https://www.saucedemo.com/inventory.html";

    readonly page: Page;
    readonly title: Locator;

    constructor(page: Page) {
        this.page = page;
        this.title = page.getByTestId("title");
    }
}