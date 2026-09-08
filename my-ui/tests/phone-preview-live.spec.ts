import { test, expect } from '@playwright/test'
import path from 'node:path'

const ARTIFACT_DIR = 'C:/Users/TheRe/.gemini/antigravity-acp/brain/046ff4ac-a214-4f39-941b-a2d1fc850725'

test('opens phone in vite project and captures live screenshots at standard and compact viewports', async ({ page }) => {
  // Test at compact viewport height (e.g. 720px height) to ensure responsiveness
  await page.setViewportSize({ width: 1280, height: 720 })
  await page.goto('/')

  // Wait for loading screen to clear
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden({ timeout: 15000 })

  // Click the top bar Phone button to open the Phone
  const headerPhoneBtn = page.getByRole('button', { name: 'Toggle Phone' })
  await expect(headerPhoneBtn).toBeVisible()
  await headerPhoneBtn.click()

  // Verify Phone Device is visible
  const phoneDevice = page.locator('[data-roblox-name="PhoneDevice"]')
  await expect(phoneDevice).toBeVisible()

  // Verify springboard and dock are visible
  await expect(page.locator('.phone-springboard')).toBeVisible()
  await expect(page.locator('.phone-dock')).toBeVisible()
  await expect(page.locator('.phone-home-indicator-bar')).toBeVisible()

  // Wait for icons and widgets to render smoothly
  await page.waitForTimeout(800)

  // Capture compact viewport screenshot
  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phone_vite_live_720p.png'),
  })
  await phoneDevice.screenshot({
    path: path.join(ARTIFACT_DIR, 'phone_springboard_720p.png'),
  })

  // Now test at standard 882p viewport
  await page.setViewportSize({ width: 1567, height: 882 })
  await page.waitForTimeout(500)

  await page.screenshot({
    path: path.join(ARTIFACT_DIR, 'phone_vite_live.png'),
  })
  await phoneDevice.screenshot({
    path: path.join(ARTIFACT_DIR, 'phone_springboard_full.png'),
  })
})

test('home indicator returns to springboard from app and closes phone from springboard', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden({ timeout: 15000 })

  // Open phone with keyboard shortcut 'P'
  await page.keyboard.press('KeyP')
  const phoneDevice = page.locator('[data-roblox-name="PhoneDevice"]')
  await expect(phoneDevice).toBeVisible()

  // Verify no floating desktop close button exists
  await expect(page.locator('.phone-stage-close-btn')).toHaveCount(0)

  // Launch Messages app from dock
  await page.locator('.phone-dock').getByRole('button', { name: /Messages/ }).click()
  await expect(page.locator('.phone-messages')).toBeVisible()

  // Press Home Indicator inside app -> navigates back to Springboard
  const homeIndicatorApp = page.getByRole('button', { name: 'Return to Springboard' })
  await expect(homeIndicatorApp).toBeVisible()
  await homeIndicatorApp.click()

  // Verify we are back on Springboard
  await expect(page.locator('.phone-springboard')).toBeVisible()

  // Press Home Indicator on Springboard -> closes phone!
  const homeIndicatorSpringboard = page.getByRole('button', { name: 'Close Phone' })
  await expect(homeIndicatorSpringboard).toBeVisible()
  await homeIndicatorSpringboard.click()

  // Verify phone is closed
  await expect(phoneDevice).toBeHidden()
})
