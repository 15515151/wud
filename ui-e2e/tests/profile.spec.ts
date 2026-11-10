import { test, expect } from '@playwright/test';

test.describe('User Profile & Personal API Tokens', () => {
  test.beforeEach(async ({ page }) => {
    // Log in as default admin
    await page.goto('/');
    await page.getByLabel('用户名').fill('john');
    await page.getByLabel('密码', { exact: true }).fill('doe');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/');
  });

  test('should display Profile page with user info, theme preference, and manage API tokens', async ({ page }) => {
    // Navigate to Profile page via URL
    await page.goto('/profile');
    await expect(page).toHaveURL(/.*profile/);

    // Verify Profile header
    await expect(page.getByText('我的资料')).toBeVisible();
    await expect(page.locator('.text-h6').getByText('john')).toBeVisible();
    await expect(page.getByText('管理员').first()).toBeVisible();

    // Verify Appearance section & theme radios
    await expect(page.getByText('外观')).toBeVisible();
    const darkRadio = page.getByLabel('深色主题');
    const lightRadio = page.getByLabel('浅色主题');
    await expect(darkRadio).toBeVisible();
    await expect(lightRadio).toBeVisible();

    // Toggle theme to dark and verify
    await darkRadio.check();
    await expect(page.locator('.v-application')).toHaveClass(/v-theme--dark/);

    // Toggle theme back to light
    await lightRadio.check();
    await expect(page.locator('.v-application')).toHaveClass(/v-theme--light/);

    // Verify Personal API Tokens section
    await expect(page.getByText('个人 API Token')).toBeVisible();
    const generateBtn = page.getByRole('button', { name: '生成 Token' });
    await expect(generateBtn).toBeVisible();

    // 1. Generate an API Token
    const tokenName = `token_${Date.now()}`;
    await generateBtn.click();

    const createDialog = page.locator('.v-dialog');
    await expect(createDialog).toBeVisible();
    await expect(createDialog.getByText('生成 Token')).toBeVisible();

    await createDialog.getByLabel('Token 名称 / 描述').fill(tokenName);
    // Read is checked by default; also check Write
    await createDialog.getByLabel('读写（触发更新、管理容器更新）').check();

    await createDialog.getByRole('button', { name: '生成', exact: true }).click();
    await expect(createDialog.getByText('生成 Token')).not.toBeVisible();

    // 2. Secret Display Dialog
    const secretDialog = page.locator('.v-dialog');
    await expect(secretDialog).toBeVisible();
    await expect(secretDialog.getByText('API Token 已生成')).toBeVisible();
    const secretInput = secretDialog.locator('input[readonly]');
    await expect(secretInput).toBeVisible();
    const rawSecret = await secretInput.inputValue();
    expect(rawSecret).toMatch(/^wud_/);

    await secretDialog.getByRole('button', { name: '我已保存该 Token' }).click();
    await expect(secretDialog).not.toBeVisible();

    // 3. Verify token appears in tokens table
    const tokenRow = page.locator('table').locator('tr').filter({ hasText: tokenName });
    await expect(tokenRow).toBeVisible();
    await expect(tokenRow.getByText('READ')).toBeVisible();
    await expect(tokenRow.getByText('WRITE')).toBeVisible();

    // 4. Revoke the token
    await tokenRow.locator('button[title="吊销 Token"]').click();
    const revokeDialog = page.locator('.v-dialog');
    await expect(revokeDialog).toBeVisible();
    await expect(revokeDialog.locator('.v-card-title').getByText('吊销 Token')).toBeVisible();

    await revokeDialog.getByRole('button', { name: '吊销', exact: true }).click();
    await expect(revokeDialog).not.toBeVisible();

    // Verify token removed from table
    await expect(page.locator('table').locator('tr').filter({ hasText: tokenName })).toHaveCount(0);
  });
});
