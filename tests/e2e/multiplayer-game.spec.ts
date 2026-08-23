import { test, expect } from '@playwright/test';

test.describe('Multiplayer Tattoo Party Game E2E', () => {
  test('landing page renders host and join game options', async ({ page }) => {
    await page.goto('/');

    // Check title and hero text
    await expect(page.getByText('THROAT GOAT')).toBeVisible();
    await expect(page.getByText('Host a Game')).toBeVisible();
    await expect(page.getByText('Join Room')).toBeVisible();
  });
});
