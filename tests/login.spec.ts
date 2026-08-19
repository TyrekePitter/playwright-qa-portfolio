import { test, expect } from "../fixtures/test-fixtures";
import { InventoryPage } from "../pages/InventoryPage";

test.describe("Login", () => {
    test("valid credentials land on the inventory page", async ({ page, loginPage }) => {
        await loginPage.login("standard_user", "secret_sauce");

        const inventoryPage = new InventoryPage(page);
        await expect(page).toHaveURL(InventoryPage.url);
        await expect(inventoryPage.title).toHaveText("Products");
    });

    test("locked out user is rejected with the locked-out message", async ({ loginPage }) => {
        await loginPage.login("locked_out_user", "secret_sauce");

        await expect(loginPage.errorMessage).toHaveText(
            "Epic sadface: Sorry, this user has been locked out."
        );
    });

    test("valid username with wrong password is rejected", async ({ loginPage }) => {
        await loginPage.login("standard_user", "wrong_password");

        await expect(loginPage.errorMessage).toHaveText(
            "Epic sadface: Username and password do not match any user in this service"
        );
    });

    test("nonexistent username returns the same error as a wrong password, so accounts cannot be enumerated", async ({ loginPage }) => {
        await loginPage.login("cookie", "secret_sauce");

        await expect(loginPage.errorMessage).toHaveText(
            "Epic sadface: Username and password do not match any user in this service"
        );
    });

    test("submitting both fields empty reports the username as required", async ({ loginPage }) => {
        await loginPage.submit();

        await expect(loginPage.errorMessage).toHaveText(
            "Epic sadface: Username is required"
        );
    });

    test("username filled with password empty reports the password as required", async ({ loginPage }) => {
        await loginPage.fillUsername("standard_user");
        await loginPage.submit();

        await expect(loginPage.errorMessage).toHaveText(
            "Epic sadface: Password is required"
        );
    });

    test("an empty username with a password filled still reports the username, proving username is validated first", async ({ loginPage }) => {
        await loginPage.fillPassword("secret_sauce");
        await loginPage.submit();

        await expect(loginPage.errorMessage).toHaveText(
            "Epic sadface: Username is required"
        );
    });

    const failureCases = [
        { username: "locked_out_user", password: "secret_sauce" },
        { username: "standard_user", password: "wrong_password" },
        { username: "", password: "" },
        { username: "standard_user", password: "" },
    ];

    for (const { username, password } of failureCases) {
        test(`every failure message opens with the Epic sadface prefix: "${username}" / "${password}"`, async ({ loginPage }) => {
            if (username) await loginPage.fillUsername(username);
            if (password) await loginPage.fillPassword(password);
            await loginPage.submit();

            await expect(loginPage.errorMessage).toContainText("Epic sadface: ");
        });
    }

    test("the error banner survives typing and only clears on submit", async ({ loginPage }) => {
        await loginPage.submit();
        await expect(loginPage.errorMessage).toHaveText(
            "Epic sadface: Username is required"
        );

        await loginPage.fillUsername("standard_user");

        await expect(loginPage.errorMessage).toHaveText(
            "Epic sadface: Username is required"
        );
    });
});