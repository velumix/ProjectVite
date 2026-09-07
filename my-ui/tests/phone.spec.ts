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

test('calculator utility app performs calculations and preserves history', async ({ page }) => {
  await openPhone(page)
  // Navigate to Springboard then launch Calculator
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await page.getByRole('button', { name: 'Open Calculator' }).click()
  await expect(page.locator('.calc-container')).toBeVisible()

  // 7 + 8 = 15
  await page.locator('.calc-btn', { hasText: '7' }).click({ force: true })
  await page.locator('.calc-btn-op', { hasText: '+' }).click({ force: true })
  await page.locator('.calc-btn', { hasText: '8' }).click({ force: true })
  await page.locator('.calc-btn-equals').click({ force: true })
  await expect(page.locator('.calc-result')).toHaveText('15')

  // Open history
  await page.getByRole('button', { name: 'Calculation history' }).click({ force: true })
  await expect(page.locator('.calc-history-drawer')).toBeVisible()
  await expect(page.locator('.calc-history-row')).toContainText('7 + 8')
})

test('clock utility app tracks stopwatch laps and displays world cities', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await page.getByRole('button', { name: 'Open Clock' }).click()
  await expect(page.locator('.clock-app-container')).toBeVisible()

  // Verify World Clock tab cities
  await expect(page.locator('.clock-city-name:has-text("Sun City")')).toBeVisible()
  await expect(page.locator('.clock-city-name:has-text("Tokyo")')).toBeVisible()

  // Switch to Stopwatch tab
  await page.getByRole('button', { name: 'Stopwatch' }).click()
  await expect(page.locator('.clock-stopwatch-display')).toBeVisible()
  await page.getByRole('button', { name: 'Start' }).click()
  await page.waitForTimeout(100)
  await page.getByRole('button', { name: 'Lap' }).click()
  await expect(page.locator('.clock-laps-table')).toContainText('Lap 1')
  await page.getByRole('button', { name: 'Stop' }).click()
})

test('weather and notes utility apps render forecasts and manage notes', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  
  // Weather
  await page.getByRole('button', { name: 'Open Weather' }).click()
  await expect(page.locator('.weather-container')).toBeVisible()
  await expect(page.locator('.weather-city-name')).toHaveText('Sun City')
  await expect(page.locator('.weather-hourly-card')).toBeVisible()

  // Return to Springboard & open Notes
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await page.getByRole('button', { name: 'Open Notes' }).click()
  await expect(page.locator('.notes-app-container')).toBeVisible()
  await expect(page.locator('.notes-item-card:has-text("Garage Access Codes")')).toBeVisible()

  // Create a note
  await page.getByRole('button', { name: 'Create note' }).click()
  await expect(page.locator('.notes-editor-view')).toBeVisible()
  await page.locator('.notes-title-input').fill('Emergency Meeting')
  await page.locator('.notes-body-input').fill('Meet at Del Perro pier at midnight.')
  await page.locator('.notes-back-btn').click()
  await expect(page.locator('.notes-item-card:has-text("Emergency Meeting")')).toBeVisible()
})
