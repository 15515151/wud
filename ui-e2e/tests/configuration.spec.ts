import { test, expect } from '@playwright/test';

test.describe('Configuration Views', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('用户名').fill('john');
    await page.getByLabel('密码', { exact: true }).fill('doe');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should display Registries table with search and drawer', async ({ page }) => {
    await page.locator('nav a[href*="/configuration/registries"]').click();
    await expect(page).toHaveURL(/.*configuration\/registries/);

    const searchInput = page.getByPlaceholder('搜索镜像仓库…');
    await expect(searchInput).toBeVisible();

    const table = page.locator('.v-data-table');
    await expect(table).toBeVisible();

    const row = table.locator('tbody tr').first();
    if (await row.count() > 0 && await row.isVisible()) {
      await row.click();
      const drawer = page.locator('.v-navigation-drawer--temporary.v-navigation-drawer--active');
      await expect(drawer).toBeVisible();
      await expect(drawer.getByText('配置参数')).toBeVisible();
      await drawer.getByTitle('关闭详情').click();
      await expect(page.locator('.v-navigation-drawer--temporary.v-navigation-drawer--active')).toHaveCount(0);
    }
  });

  test('should display Triggers table with search and drawer', async ({ page }) => {
    await page.locator('nav a[href*="/configuration/triggers"]').click();
    await expect(page).toHaveURL(/.*configuration\/triggers/);

    const searchInput = page.getByPlaceholder('搜索触发器…');
    await expect(searchInput).toBeVisible();

    const table = page.locator('.v-data-table');
    await expect(table).toBeVisible();

    const row = table.locator('tbody tr').first();
    if (await row.count() > 0 && await row.isVisible()) {
      await row.click();
      const drawer = page.locator('.v-navigation-drawer--temporary.v-navigation-drawer--active');
      await expect(drawer).toBeVisible();
      await expect(drawer.getByRole('button', { name: '测试' }).first()).toBeVisible();
      await drawer.getByTitle('关闭详情').click();
    }
  });

  test('should display Authentications table with search', async ({ page }) => {
    await page.locator('nav a[href*="/configuration/authentications"]').click();
    await expect(page).toHaveURL(/.*configuration\/authentications/);

    const searchInput = page.getByPlaceholder('搜索认证…');
    await expect(searchInput).toBeVisible();

    const table = page.locator('.v-data-table');
    await expect(table).toBeVisible();
  });

  test('should display Watchers table with search', async ({ page }) => {
    await page.locator('nav a[href*="/configuration/watchers"]').click();
    await expect(page).toHaveURL(/.*configuration\/watchers/);

    const searchInput = page.getByPlaceholder('搜索监视器…');
    await expect(searchInput).toBeVisible();

    const table = page.locator('.v-data-table');
    await expect(table).toBeVisible();
  });

  test('should display Server configuration dashboard with search and cards', async ({ page }) => {
    await page.locator('nav a[href*="/configuration/server"]').click();
    await expect(page).toHaveURL(/.*configuration\/server/);

    const searchInput = page.getByPlaceholder('筛选参数…');
    await expect(searchInput).toBeVisible();

    const serverCard = page.locator('.dashboard-card').filter({ hasText: '服务器' });
    await expect(serverCard).toBeVisible();

    const logsCard = page.locator('.dashboard-card').filter({ hasText: '日志' });
    await expect(logsCard).toBeVisible();

    const storeCard = page.locator('.dashboard-card').filter({ hasText: '存储' });
    await expect(storeCard).toBeVisible();
  });
});

