import { test, expect } from '@playwright/test';

test.describe('Drawing Studio User Journey', () => {
  test('should render canvas, tools, and allow navigating to gallery', async ({ page }) => {
    await page.goto('/');

    // Verify title branding
    await expect(page.locator('h1')).toContainText('THROAT GOAT');

    // Verify toolbar elements
    await expect(page.getByTitle('Pen Tool')).toBeVisible();
    await expect(page.getByTitle('Eraser Tool')).toBeVisible();
    await expect(page.getByTitle('Undo (Ctrl+Z)')).toBeVisible();
    await expect(page.getByTitle('Clear Canvas')).toBeVisible();

    // Verify publish button exists
    await expect(page.locator('button', { hasText: 'Publish Goat' })).toBeVisible();

    // Navigate to gallery
    await page.click('text=Gallery');
    await expect(page).toHaveURL('/gallery');
    await expect(page.locator('h2')).toContainText('The Goat Gallery');
  });
});
