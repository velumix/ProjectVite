import { test, expect } from '@playwright/test'
import path from 'node:path'

const ARTIFACT_DIR = 'C:/Users/TheRe/.gemini/antigravity-acp/brain/046ff4ac-a214-4f39-941b-a2d1fc850725'

test('opens phone in vite project and captures live screenshots', async ({ page }) => {
  await page.goto('/')

  // Wait for loading screen to clear
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden({ timeout: 15000 })

  // Find the top bar Phone button
  const headerPhoneBtn = page.getByRole('button', { name: 'Toggle Phone' })
  await expect(headerPhoneBtn).toBeVisible()

  // Click the top bar Phone button to open the Phone
  await headerPhoneBtn.click()

  // Verify Phone Device is visible
  const phoneDevice = page.locator('[data-roblox-name="PhoneDevice"]')
  await expect(phoneDevice).toBeVisible()

  // Verify springboard is visible
  await expect(page.locator('.phone-springboard')).toBeVisible()

  // Wait for icons and widgets to render smoothly
  await page.waitForTimeout(1000)

  // Capture full Vite workspace screenshot showing the phone running in the canvas
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phone_vite_live.png'),
  })

  // Capture close-up screenshot of the Phone Device itself
  await phoneDevice.screenshot({
    path: path.join(ARTIFACT_DIR, 'phone_springboard_full.png'),
  })
})
