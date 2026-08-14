import { test, expect } from "@playwright/test";

test.describe("Login", () => {
    test.beforeEach(async ({ page }) => {
        await page.goto("https://www.saucedemo.com");
    });

    test("valid credentials land on the inventory page", async ({ page }) => {
        await page.getByTestId("username").fill("standard_user");
        await page.getByTestId("password").fill("secret_sauce");
        await page.getByTestId("login-button").click();

        await expect(page).toHaveURL("https://www.saucedemo.com/inventory.html");
        await expect(page.getByTestId("title")).toHaveText("Products");
    });

    test("locked out user is rejected with the locked-out message", async ({ page }) => {
        await page.getByTestId("username").fill("locked_out_user");
        await page.getByTestId("password").fill("secret_sauce");
        await page.getByTestId("login-button").click();

        await expect(page.getByTestId("error")).toHaveText(
            "Epic sadface: Sorry, this user has been locked out."
        );
    });

    test("valid username with wrong password is rejected", async ({ page }) => {
        await page.getByTestId("username").fill("standard_user");
        await page.getByTestId("password").fill("wrong_password");
        await page.getByTestId("login-button").click();

        await expect(page.getByTestId("error")).toHaveText(
            "Epic sadface: Username and password do not match any user in this service"
        );
    });

    test("nonexistent username returns the same error as a wrong password, so accounts cannot be enumerated", async ({ page }) => {
        await page.getByTestId("username").fill("cookie");
        await page.getByTestId("password").fill("secret_sauce");
        await page.getByTestId("login-button").click();

        await expect(page.getByTestId("error")).toHaveText(
            "Epic sadface: Username and password do not match any user in this service"
        );
    });

    test("submitting both fields empty reports the username as required", async ({ page }) => {
        await page.getByTestId("login-button").click();

        await expect(page.getByTestId("error")).toHaveText(
            "Epic sadface: Username is required"
        );
    });

    test("username filled with password empty reports the password as required", async ({ page }) => {
        await page.getByTestId("username").fill("standard_user");
        await page.getByTestId("login-button").click();

        await expect(page.getByTestId("error")).toHaveText(
            "Epic sadface: Password is required"
        );
    });

    test("an empty username with a password filled still reports the username, proving username is validated first", async ({ page }) => {
        await page.getByTestId("password").fill("secret_sauce");
        await page.getByTestId("login-button").click();

        await expect(page.getByTestId("error")).toHaveText(
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
        test(`every failure message opens with the Epic sadface prefix: "${username}" / "${password}"`, async ({ page }) => {
            if (username) await page.getByTestId("username").fill(username);
            if (password) await page.getByTestId("password").fill(password);
            await page.getByTestId("login-button").click();

            await expect(page.getByTestId("error")).toContainText("Epic sadface: ");
        });
    }

    test("the error banner survives typing and only clears on submit", async ({ page }) => {
        await page.getByTestId("login-button").click();
        await expect(page.getByTestId("error")).toHaveText(
            "Epic sadface: Username is required"
        );

        await page.getByTestId("username").fill("standard_user");

        await expect(page.getByTestId("error")).toHaveText(
            "Epic sadface: Username is required"
        );
    });
});