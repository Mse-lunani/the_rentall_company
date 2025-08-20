import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Rental/);
});

test('navigation works', async ({ page }) => {
  await page.goto('/');

  // Example: Test that the page loads
  await expect(page.locator('body')).toBeVisible();
});