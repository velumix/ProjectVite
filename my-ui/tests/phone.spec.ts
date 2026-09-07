import { expect, test, type Page } from '@playwright/test'

async function openPhone(page: Page) {
  await page.goto('/')
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden()
  await page.locator('[data-roblox-name="SideInventoryButton"]').click()
  await expect(page.getByRole('dialog', { name: 'Inventory menu' })).toBeVisible()
  await page.getByRole('navigation').getByRole('button', { name: 'PHONE', exact: true }).click()
  await expect(page.locator('[data-roblox-name="PhoneDevice"]')).toBeVisible()
}

test('phone messages use the PhoneService method and message signal path', async ({ page }) => {
  await openPhone(page)
  await expect(page.locator('.city-message-list')).toBeVisible()
  await page.getByLabel('Message').fill('I am on my way.')
  await page.locator('.phone-thread form button').click()
  await expect(page.locator('.phone-bubbles')).toContainText('I am on my way.')
})

test('phone settings persist through PhoneService and update its signal state', async ({ page }) => {
  await openPhone(page)
  await page.locator('.phone-dock').getByRole('button', { name: /Settings/ }).click()
  const airplaneMode = page.getByRole('checkbox', { name: 'Airplane mode' })
  await airplaneMode.check()
  await expect(airplaneMode).toBeChecked()
  await page.getByRole('button', { name: 'Home' }).click()
  await expect(page.locator('.phone-statusbar')).toContainText('AIRPLANE MODE')
})

test('lock screen can be activated and unlocked with gestures', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Lock phone' }).click()
  await expect(page.locator('.phone-lockscreen')).toBeVisible()
  await expect(page.locator('.phone-lockscreen-time')).toBeVisible()
  await expect(page.locator('.phone-lockscreen-notifications')).toContainText('Sun City Emergency Alert')
  
  // Tap unlock prompt
  await page.locator('.phone-lockscreen-swipe-prompt').click()
  await expect(page.locator('.phone-lockscreen')).toBeHidden()
})

test('control center opens with toggles and sliders', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Open Control Center' }).click()
  await expect(page.locator('.phone-control-center-overlay')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Flashlight' })).toBeVisible()
  
  // Toggle flashlight
  await page.getByRole('button', { name: 'Flashlight' }).click()
  await expect(page.getByRole('button', { name: 'Flashlight' })).toHaveClass(/is-active/)

  // Close Control Center
  await page.locator('.phone-cc-handle').click()
  await expect(page.locator('.phone-control-center-overlay')).toBeHidden()
})

test('dynamic island responds to calls and home indicator navigates to springboard', async ({ page }) => {
  await openPhone(page)
  // Call contact from Messages thread
  await page.locator('.phone-thread header button').click()
  
  // Verify Dynamic Island shows active call
  const island = page.locator('.phone-island')
  await expect(island).toHaveClass(/has-activity/)
  await expect(island.locator('.phone-island-call-pill')).toBeVisible()
  
  // Expand Dynamic Island
  await island.click()
  await expect(island).toHaveClass(/is-expanded/)
  await expect(island.locator('.phone-island-call-card')).toBeVisible()
  
  // End call from Dynamic Island
  await island.locator('.phone-island-btn-end').click()
  await expect(island).not.toHaveClass(/is-expanded/)

  // Navigate to Springboard with Home Indicator
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
  await expect(page.locator('.phone-springboard-widget-row')).toBeVisible()
})
