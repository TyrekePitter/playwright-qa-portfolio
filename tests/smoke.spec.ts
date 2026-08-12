import { test, expect } from "@playwright/test";

test("harness renders and locates content", async ({ page }) => {
  await page.setContent('<h1 data-test="title">AlphaEdge QA</h1>');
  await expect(page.getByTestId("title")).toHaveText("AlphaEdge QA");
});
