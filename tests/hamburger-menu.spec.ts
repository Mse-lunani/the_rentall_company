import { test, expect } from '@playwright/test';

test('hamburger menu toggle works on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 812 });
  
  await page.goto('/dashboard');

  // Wait for page to load
  await expect(page.locator('body')).toBeVisible();

  // Check that hamburger menu button is visible on mobile
  const hamburgerButton = page.locator('.layout-menu-toggle .nav-link');
  await expect(hamburgerButton).toBeVisible();

  // Check sidebar is initially closed (menu not expanded)
  const layoutContainer = page.locator('.layout-container');
  await expect(layoutContainer).not.toHaveClass(/layout-menu-expanded/);

  // Click hamburger menu to open sidebar
  await hamburgerButton.click();

  // Check sidebar is now open
  await expect(layoutContainer).toHaveClass(/layout-menu-expanded/);

  // Click overlay to close sidebar
  const overlay = page.locator('.layout-overlay');
  await overlay.click();

  // Check sidebar is closed again
  await expect(layoutContainer).not.toHaveClass(/layout-menu-expanded/);
});

test('hamburger menu not visible on desktop', async ({ page }) => {
  // Set desktop viewport
  await page.setViewportSize({ width: 1200, height: 800 });
  
  await page.goto('/dashboard');

  // Check that hamburger menu button is hidden on desktop
  const hamburgerButton = page.locator('.layout-menu-toggle');
  await expect(hamburgerButton).toHaveClass(/d-xl-none/);
});