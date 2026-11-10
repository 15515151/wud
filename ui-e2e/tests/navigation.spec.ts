import { test, expect } from '@playwright/test';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('用户名').fill('john');
    await page.getByLabel('密码', { exact: true }).fill('doe');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should navigate to Containers', async ({ page }) => {
    await page.locator('nav').getByRole('link', { name: '容器' }).click();
    await expect(page).toHaveURL(/.*containers/);
  });

  test('should navigate to Configuration sections', async ({ page }) => {
    const sections = ['triggers', 'watchers', 'registries', 'authentications', 'server'];

    for (const section of sections) {
      const navItem = page.locator(`nav a[href*="/configuration/${section}"]`);
      await navItem.click();
      await expect(page).toHaveURL(new RegExp(`.*configuration/${section}`), { timeout: 10000 });
      // Wait for the page transition to settle before the next navigation
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(800);
    }
  });

  test('should toggle sidebar and open user menu', async ({ page }) => {
    // 1. Toggle collapse/expand sidebar
    const toggleBtn = page.locator('.drawer-header button');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(300);
    }

    // 2. Open user menu popover
    const userItem = page.locator('.user-item');
    if (await userItem.isVisible()) {
      await userItem.click();
      await expect(page.getByText('深色模式')).toBeVisible();
    }
  });
});


test.describe('Language switching', () => {
  test.beforeEach(async ({ page }) => {
    // Language choices are persisted per browser: start from a clean slate.
    await page.goto('/');
    await page.evaluate(() => localStorage.removeItem('wudLocale'));
    await page.goto('/');
    await page.getByLabel('用户名').fill('john');
    await page.getByLabel('密码', { exact: true }).fill('doe');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/');
  });

  test('defaults to Simplified Chinese', async ({ page }) => {
    await expect(page.locator('nav').getByRole('link', { name: '容器' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  });

  test('switches the whole UI to English and back to Chinese from the user menu', async ({ page }) => {
    // Expand the drawer so the user menu entry (with the language selector) is visible
    await page.locator('.drawer-header button').click();
    const userMenu = page.locator('.user-item');
    const languageSelect = page.locator('.language-select input');

    await userMenu.click();
    await expect(languageSelect).toBeVisible();
    await page.waitForTimeout(400);
    await languageSelect.click({ force: true });
    await page.getByRole('option', { name: 'English' }).click();

    await expect(page.locator('nav').getByRole('link', { name: 'Containers' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    // The preference survives a reload
    await page.reload();
    await expect(page.locator('nav').getByRole('link', { name: 'Containers' })).toBeVisible();

    // Switch back to Chinese. The drawer may have collapsed after the reload,
    // so expand it again before opening the user menu.
    const expandBtn = page.getByRole('button', { name: /Expand sidebar|展开侧边栏/ });
    if (await expandBtn.count()) {
      await expandBtn.click();
      await page.waitForTimeout(400);
    }
    await userMenu.click();
    await page.waitForTimeout(400);
    await languageSelect.click({ force: true });
    await page.getByRole('option', { name: '简体中文' }).click();
    await expect(page.locator('nav').getByRole('link', { name: '容器' })).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  });

  test.afterEach(async ({ page, request }) => {
    // Do not leak the language preference into the other suites: it is both
    // stored locally and persisted on the user profile.
    await page.evaluate(() => localStorage.removeItem('wudLocale'));
    await request.put('http://127.0.0.1:3900/api/profile/preferences', {
      headers: {
        Authorization: 'Basic ' + Buffer.from('john:doe').toString('base64'),
        'Content-Type': 'application/json',
      },
      data: { locale: 'zh-CN' },
    });
  });
});
