import { test, expect } from '@playwright/test'
import path from 'path'

const ARTIFACT_DIR = 'C:/Users/TheRe/.gemini/antigravity-acp/brain/046ff4ac-a214-4f39-941b-a2d1fc850725'

test('opens phone in vite project and captures live screenshots', async ({ page }) => {
  // Navigate to Vite app
  await page.goto('/')
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden()

  // Verify the Phone button is present in the Antigravity top header bar
  const headerPhoneBtn = page.getByRole('button', { name: 'Toggle Phone' })
  await expect(headerPhoneBtn).toBeVisible()

  // Click the top bar Phone button to open the Phone
  await headerPhoneBtn.click()

  // Verify Phone Device is visible
  const phoneDevice = page.locator('[data-roblox-name="PhoneDevice"]')
  await expect(phoneDevice).toBeVisible()

  // Return to Springboard if not already on springboard
  const springboardBtn = page.getByRole('button', { name: 'Return to Springboard' })
  if (await springboardBtn.isVisible()) {
    await springboardBtn.click()
  }
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

  // Test pressing P to toggle close
  await page.keyboard.press('KeyP')
  await expect(phoneDevice).toBeHidden()

  // Test pressing P again to toggle open
  await page.keyboard.press('KeyP')
  await expect(phoneDevice).toBeVisible()

  console.log('Screenshots saved successfully to brain artifacts directory!')
})
