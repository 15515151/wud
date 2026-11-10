import { test, expect } from '@playwright/test';

test.describe('Home Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('用户名').fill('john');
    await page.getByLabel('密码', { exact: true }).fill('doe');
    await page.getByRole('button', { name: '登录' }).click();
  });

  test('should display dashboard tiles with counts', async ({ page }) => {
    const homeCard = page.locator('.home-card');
    await expect(homeCard.filter({ hasText: '容器' })).toBeVisible();
    await expect(homeCard.filter({ hasText: '触发器' })).toBeVisible();
    await expect(homeCard.filter({ hasText: '监视器' })).toBeVisible();
    await expect(homeCard.filter({ hasText: '镜像仓库' })).toBeVisible();

    // We expect some containers to be loaded by setup-test-containers.sh
    // The exact number might vary, but should be > 0.
    const containersText = await homeCard.filter({ hasText: '容器' }).textContent();
    expect(containersText).toMatch(/\d+ 个容器/);

    // Check if the count is not 0
    const count = parseInt(containersText?.match(/(\d+)/)?.[1] || '0');
    expect(count).toBeGreaterThan(0);
  });
});
