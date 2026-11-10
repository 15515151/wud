import { test, expect } from '@playwright/test';

test.describe('Containers View', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('用户名').fill('john');
    await page.getByLabel('密码', { exact: true }).fill('doe');
    await page.getByRole('button', { name: '登录' }).click();
    await page.locator('nav').getByRole('link', { name: '容器' }).click();
  });

  test('should list containers', async ({ page }) => {
    // Wait for containers to load in v-data-table
    const rows = page.locator('.v-data-table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should filter by update available', async ({ page }) => {
    const rows = page.locator('.v-data-table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });
    const initialCount = await rows.count();

    // Toggle Update Available switch
    const switchEl = page.locator('.switch-compact').filter({ hasText: '可更新' });
    await switchEl.click();
    await page.waitForTimeout(500);

    const filteredCount = await rows.count();
    expect(filteredCount).toBeGreaterThan(0);
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test('should filter by Registry', async ({ page }) => {
    const rows = page.locator('.v-data-table tbody tr');
    await expect(rows.first()).toBeVisible({ timeout: 10000 });

    // Open Registry dropdown
    const select = page.locator('.v-select').filter({ hasText: '镜像仓库' });
    await select.click();

    // Select the first available registry option
    const option = page.locator('.v-overlay .v-list-item').first();
    await expect(option).toBeVisible();
    await option.click();

    await page.waitForTimeout(500);

    const count = await rows.count();
    expect(count).toBeGreaterThan(0);
  });
});
