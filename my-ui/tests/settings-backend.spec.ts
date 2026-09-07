import { test, expect } from '@playwright/test'

test('settings categories navigate and changes persist through the Roblox service', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden()
  await page.locator('[data-roblox-name="SideInventoryButton"]').click()
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click()

  const content = page.locator('.settings-v2-content')
  await page.getByRole('button', { name: /Advanced Experimental, developer/i }).click()
  await expect(page.getByRole('button', { name: /Advanced Experimental, developer/i })).toHaveAttribute('aria-current', 'page')
  await expect.poll(() => content.evaluate(element => element.scrollTop)).toBeGreaterThan(0)

  const developerMode = page.getByRole('switch', { name: 'Developer Mode' })
  await developerMode.check()
  await expect(page.locator('.settings-v2-save-state')).toHaveText('SETTINGS SAVED.')

  await page.locator('[data-roblox-name="CloseSettingsButton"]').click()
  await page.locator('[data-roblox-name="SideSettingsButton"]').click()
  await expect(page.getByRole('switch', { name: 'Developer Mode' })).toBeChecked()
})
