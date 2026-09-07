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
  await page.getByRole('button', { name: 'Flashlight' }).dispatchEvent('click')
  await expect(page.getByRole('button', { name: 'Flashlight' })).toHaveClass(/is-active/)

  // Close Control Center
  await page.locator('.phone-cc-handle').dispatchEvent('click')
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

  // 7 + 8 = 15 using dispatchEvent to avoid viewport scroll offsets
  await page.locator('.calc-keypad-grid button', { hasText: '7' }).dispatchEvent('click')
  await page.locator('.calc-keypad-grid button', { hasText: '+' }).dispatchEvent('click')
  await page.locator('.calc-keypad-grid button', { hasText: '8' }).dispatchEvent('click')
  await page.locator('.calc-btn-equals').dispatchEvent('click')
  await expect(page.locator('.calc-result')).toHaveText('15')

  // Open history
  await page.getByRole('button', { name: 'Calculation history' }).dispatchEvent('click')
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
  await page.getByRole('button', { name: 'Stop', exact: true }).click()
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

test('banking app displays accounts, performs transfers and updates balances via Nerve', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Banking app
  await page.getByRole('button', { name: 'Open Banking' }).click()
  await expect(page.locator('.bank-app-container')).toBeVisible()
  await expect(page.locator('.bank-brand')).toContainText('Sun City Bank')
  await expect(page.locator('.bank-balance-num')).toHaveText('$24,850')
  await expect(page.locator('.bank-hero-bottom')).toContainText('$1,240')

  // Open Send Transfer modal
  await page.getByRole('button', { name: 'Transfer money' }).click()
  await expect(page.getByRole('dialog', { name: 'Transfer Money' })).toBeVisible()

  // Choose contact "Alex Morgan"
  await page.getByRole('button', { name: 'Alex Morgan' }).click()
  await page.getByPlaceholder('0', { exact: true }).fill('1200')
  await page.getByPlaceholder(/e\.g\. For car repairs/).fill('Vehicle Upgrade')
  await page.getByRole('button', { name: 'Confirm Transfer' }).click()

  // Wait for success and balance update
  await expect(page.locator('.bank-alert-success')).toContainText('Sent $1,200 successfully')
  await expect(page.locator('.bank-balance-num')).toHaveText('$23,650')

  // Switch to Activity tab and verify new transaction is recorded
  await page.getByRole('button', { name: 'Activity' }).click()
  await expect(page.locator('.bank-tx-list')).toContainText('Vehicle Upgrade')
  await expect(page.locator('.bank-tx-list')).toContainText('−$1,200')

  // Switch back to Overview & test ATM Cash Deposit
  await page.getByRole('button', { name: 'Overview' }).click()
  await page.getByRole('button', { name: 'ATM Deposit' }).click()
  await expect(page.getByRole('dialog', { name: 'ATM deposit' })).toBeVisible()
  await page.getByRole('button', { name: '+$500' }).click()
  await page.getByRole('button', { name: 'Confirm Deposit' }).click()

  await expect(page.locator('.bank-alert-success')).toContainText('Deposited $500')
  await expect(page.locator('.bank-balance-num')).toHaveText('$24,150')
  await expect(page.locator('.bank-hero-bottom')).toContainText('$740')
})

test('camera and photos apps capture media, display gallery grid, toggle favorites and manage photos via Nerve', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Camera App
  await page.getByRole('button', { name: 'Open Camera' }).click()
  await expect(page.locator('.camera-app-root')).toBeVisible()
  await expect(page.locator('.camera-viewfinder')).toBeVisible()

  // Shutter click - capture a photo
  await page.getByRole('button', { name: 'Camera Shutter' }).click()
  await expect(page.locator('.camera-toast-pill')).toContainText('Photo Saved to Gallery')

  // Click on thumbnail to open Photos app
  await page.getByRole('button', { name: 'Open Photos Gallery' }).click()
  await expect(page.locator('.photos-app-root')).toBeVisible()
  await expect(page.locator('.photos-grid')).toBeVisible()
  await expect(page.locator('.photos-grid-tile')).toHaveCount(5) // 4 initial + 1 new

  // Open the newly captured photo (first item in grid)
  await page.locator('.photos-grid-tile').first().click()
  await expect(page.locator('.photos-detail-overlay')).toBeVisible()

  // Toggle Favorite
  await page.getByTitle('Favorite').click()
  await expect(page.getByTitle('Remove Favorite')).toBeVisible()

  // Close detail
  await page.getByTitle('Back').click()
  await expect(page.locator('.photos-detail-overlay')).toBeHidden()

  // Switch to Favorites filter
  await page.getByRole('button', { name: 'Favorites', exact: true }).click()
  await expect(page.locator('.photos-grid-tile')).toHaveCount(3) // 2 initial + 1 newly favorited

  // Switch back to All
  await page.getByRole('button', { name: 'All', exact: true }).click()

  // Test Selection Mode & Deletion
  await page.getByRole('button', { name: 'Select', exact: true }).click()
  await page.locator('.photos-grid-tile').first().click()
  await expect(page.locator('.photos-selection-count')).toContainText('1 Selected')

  // Click Delete in selection toolbar
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await expect(page.locator('.photos-toast-pill')).toContainText('1 items deleted')
  await expect(page.locator('.photos-grid-tile')).toHaveCount(4)
})

test('mail app displays folders, reads messages, toggles stars and sends mail via Roblox MailService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Mail App from Springboard
  await page.getByRole('button', { name: 'Open Mail' }).click()
  await expect(page.locator('.mail-app-root')).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Mail', exact: true })).toBeVisible()

  // Verify Inbox messages render
  const mailCards = page.locator('.mail-item-card')
  await expect(mailCards).toHaveCount(3)
  await expect(page.locator('.mail-item-sender').first()).toContainText('City Services')

  // Open first email to read
  await mailCards.first().click()
  await expect(page.locator('.mail-detail-view')).toBeVisible()
  await expect(page.locator('.mail-detail-subject')).toContainText('Welcome to Sun City')
  await expect(page.locator('.mail-detail-body')).toContainText('Welcome to Sun City! Please remember to register')

  // Return back to Inbox
  await page.getByTitle('Back to List').click()
  await expect(page.locator('.mail-detail-view')).toBeHidden()

  // Filter to Starred folder
  await page.getByRole('button', { name: 'Starred', exact: true }).click()
  await expect(page.locator('.mail-item-card')).toHaveCount(1)
  await expect(page.locator('.mail-item-sender')).toContainText('City Services')

  // Open Compose Modal
  await page.getByTitle('Compose New Mail').click()
  await expect(page.locator('.mail-compose-overlay')).toBeVisible()

  // Use suggested contact chip
  await page.getByRole('button', { name: 'PDM Autos' }).click()
  await expect(page.locator('#compose-to')).toHaveValue('sales@pdm-autos.com')

  // Fill in Subject & Body
  await page.getByPlaceholder('Subject line').fill('Inquiry about Sultan RS')
  await page.getByPlaceholder('Write your email here...').fill('Hello PDM team, do you have any blue Sultan RS units currently in stock?')

  // Send email
  await page.getByRole('button', { name: 'Send', exact: true }).click()
  await expect(page.locator('.mail-toast-pill')).toContainText('Email Sent Successfully')
  await expect(page.locator('.mail-compose-overlay')).toBeHidden()

  // Switch to Sent folder and verify newly sent mail
  await page.getByRole('button', { name: 'Sent', exact: true }).click()
  const sentCards = page.locator('.mail-item-card')
  await expect(sentCards).toHaveCount(2) // 1 initial + 1 new
  await expect(sentCards.first()).toContainText('Inquiry about Sultan RS')
})

test('map app displays interactive map, filters POIs, opens directory drawer, sets and clears GPS waypoints via Roblox MapService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Map App from Springboard
  await page.getByRole('button', { name: 'Open Map' }).click()
  await expect(page.locator('.map-app-root')).toBeVisible()
  await expect(page.locator('.map-vector-canvas')).toBeVisible()

  // Verify initial POI markers on canvas
  const markers = page.locator('.map-marker')
  await expect(markers).toHaveCount(7)

  // Open Locations Directory Sheet
  await page.getByTitle('Toggle Locations Directory').click()
  await expect(page.locator('.map-locations-sheet')).toBeVisible()

  // Filter in search bar
  await page.getByPlaceholder('Search places in Sun City...').fill('Benny')
  const sheetItems = page.locator('.map-sheet-item')
  await expect(sheetItems).toHaveCount(1)
  await expect(sheetItems.first()).toContainText("Benny's Original Motor Works")

  // Click GPS button on Benny's
  await page.locator('.map-sheet-wp-btn').first().click()

  // Verify Directory closes and GPS active banner appears
  await expect(page.locator('.map-locations-sheet')).toBeHidden()
  await expect(page.locator('.map-gps-banner')).toBeVisible()
  await expect(page.locator('.map-gps-destination')).toContainText("Benny's Original Motor Works")
  await expect(page.locator('.map-gps-distance')).toBeVisible()

  // End navigation / Clear GPS
  await page.getByRole('button', { name: 'End Navigation Route' }).click()
  await expect(page.locator('.map-gps-banner')).toBeHidden()

  // Test category filtering on map
  await page.getByPlaceholder('Search places in Sun City...').fill('')
  await page.getByRole('button', { name: '🏥 Hospitals' }).click()
  await expect(page.locator('.map-marker')).toHaveCount(1)

  // Click hospital marker on map to open detail card
  await page.locator('.map-marker').first().click()
  await expect(page.locator('.map-poi-card')).toBeVisible()
  await expect(page.locator('.map-poi-title-col h4')).toHaveText('Pillbox Hill Medical Center')

  // Set waypoint from card
  await page.getByRole('button', { name: '📍 Set GPS Waypoint' }).click()
  await expect(page.locator('.map-gps-banner')).toBeVisible()
  await expect(page.locator('.map-gps-destination')).toContainText('Pillbox Hill Medical Center')
})
