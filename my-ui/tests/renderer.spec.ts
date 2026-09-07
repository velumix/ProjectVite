import { test, expect } from '@playwright/test'

test('image buttons dispatch both registered events and the observer once', async ({ page }) => {
  await page.goto('/tests/renderer.html')
  await page.locator('[data-roblox-name="ImageAction"]').click()
  await expect(page.locator('output')).toHaveText('{"activated":1,"clicked":1,"observed":1,"parent":0}')
  await expect(page.locator('[data-roblox-name="HiddenAlignedLabel"]')).toBeHidden()
  await expect(page.locator('[data-roblox-name="HiddenList"]')).toBeHidden()
})
