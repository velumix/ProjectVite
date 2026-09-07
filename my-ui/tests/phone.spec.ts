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

test('music app plays tracks, switches radio stations, skips songs and synchronizes playback state via Roblox MusicService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Music App from Springboard
  await page.getByRole('button', { name: 'Open Music' }).click()
  await expect(page.locator('.music-app-root')).toBeVisible()
  await expect(page.locator('.music-now-playing-tab')).toBeVisible()

  // Verify default track displayed
  await expect(page.locator('.music-title')).toContainText('Midnight City')
  await expect(page.locator('.music-artist')).toContainText('M83')

  // Toggle playback: Play
  await page.locator('.music-play-btn').click()
  await expect(page.locator('.music-play-btn')).toHaveAttribute('title', 'Pause')
  await expect(page.locator('.music-album-art')).toHaveClass(/is-spinning/)

  // Skip to next track
  await page.locator('.music-ctrl-btn[title="Next Track"]').click()
  await expect(page.locator('.music-title')).toContainText('Sleepwalking')
  await expect(page.locator('.music-artist')).toContainText('The Chain Gang of 1974')

  // Switch to Tracks tab
  await page.getByRole('button', { name: 'Tracks (6)' }).click()
  await expect(page.locator('.music-tracks-tab')).toBeVisible()

  // Search track
  await page.getByPlaceholder('Search tracks or artists...').fill('Blinding')
  const searchCards = page.locator('.music-track-card')
  await expect(searchCards).toHaveCount(1)
  await expect(searchCards.first()).toContainText('Blinding Lights')

  // Select track from search
  await searchCards.first().click()
  await expect(page.locator('.music-now-playing-tab')).toBeVisible()
  await expect(page.locator('.music-title')).toContainText('Blinding Lights')
  await expect(page.locator('.music-artist')).toContainText('The Weeknd')

  // Switch to Radio Stations tab
  await page.getByRole('button', { name: 'Radio Stations' }).click()
  await expect(page.locator('.music-radio-tab')).toBeVisible()

  // Select West Coast Classics station
  const stationCard = page.locator('.music-station-card').filter({ hasText: 'West Coast Classics' })
  await stationCard.click()
  await expect(page.locator('.music-title')).toContainText('Still D.R.E.')

  // Return to Springboard via Home Indicator and verify Dynamic Island sync
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
  await expect(page.locator('.phone-island-music-pill')).toBeVisible()
  await expect(page.locator('.phone-island-music-pill small')).toContainText('Still D.R.E.')
})

test('garage app lists owned vehicles, filters by status, opens remote key fob, toggles locks and requests valet via Roblox GarageService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Garage App from Springboard
  await page.getByRole('button', { name: 'Open Garage' }).click()
  await expect(page.locator('.garage-app-root')).toBeVisible()

  // Verify initial vehicle cards
  const cards = page.locator('.garage-card')
  await expect(cards).toHaveCount(5)

  // Filter by Out in World
  await page.getByRole('button', { name: 'Out in World' }).click()
  await expect(page.locator('.garage-card')).toHaveCount(1)
  await expect(page.locator('.garage-card-name')).toHaveText('Obey 9F Cabrio')

  // Switch back to All
  await page.getByRole('button', { name: 'All' }).click()
  await expect(page.locator('.garage-card')).toHaveCount(5)

  // Search by model
  await page.getByPlaceholder('Search by model or plate...').fill('Zentorno')
  await expect(page.locator('.garage-card')).toHaveCount(1)
  await expect(page.locator('.garage-card-name')).toHaveText('Pegassi Zentorno')

  // Open Remote Key FOB sheet
  await page.locator('.garage-fob-link-btn').first().click()
  await expect(page.locator('.garage-fob-sheet')).toBeVisible()
  await expect(page.locator('.garage-fob-sheet h4')).toHaveText('Pegassi Zentorno')
  await expect(page.locator('.garage-fob-plate')).toHaveText('FAST-77')

  // Toggle doors lock via FOB
  const lockFobBtn = page.locator('.garage-fob-button').filter({ hasText: /Doors/ })
  await expect(lockFobBtn).toContainText('Unlock Doors')
  await lockFobBtn.click()
  await expect(lockFobBtn).toContainText('Lock Doors')
  await expect(page.locator('.garage-fob-notice')).toBeVisible()

  // Request Valet
  const valetBtn = page.locator('.garage-fob-button').filter({ hasText: 'Call Valet' })
  await valetBtn.click()
  await expect(page.locator('.garage-fob-notice')).toContainText('Valet has delivered')

  // Set GPS Route
  const gpsBtn = page.locator('.garage-fob-button').filter({ hasText: 'GPS Route' })
  await gpsBtn.click()
  await expect(page.locator('.garage-fob-notice')).toContainText('GPS Route set')

  // Close FOB sheet
  await page.locator('.garage-fob-close').click()
  await expect(page.locator('.garage-fob-sheet')).toBeHidden()

  // Verify updated status on card is Out in World
  await expect(page.locator('.garage-status-badge')).toHaveText('Out in World')
})

test('feather social app loads timeline, likes and retweets posts, filters tags and publishes new chirps via Roblox SocialService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Feather App from Springboard
  await page.getByRole('button', { name: 'Open Feather' }).click()
  await expect(page.locator('.feather-app-root')).toBeVisible()

  // Verify initial posts loaded
  const postCards = page.locator('.feather-post-card')
  await expect(postCards).toHaveCount(4)
  await expect(page.locator('.feather-author-name').first()).toHaveText('Weazel News')

  // Like a post
  const firstLikeBtn = page.locator('.feather-action-btn').filter({ hasText: /🤍|❤️/ }).first()
  await firstLikeBtn.click()
  await expect(page.locator('.feather-action-btn.is-liked').first()).toBeVisible()
  await expect(page.locator('.feather-toast')).toContainText('Liked post')

  // Retweet a post
  const secondRetweetBtn = page.locator('.feather-action-btn').filter({ hasText: '🔁' }).nth(1)
  await secondRetweetBtn.click()
  await expect(page.locator('.feather-action-btn.is-retweeted').first()).toBeVisible()
  await expect(page.locator('.feather-toast')).toContainText('Retweeted')

  // Filter by tag
  await page.locator('.feather-tag-pill').filter({ hasText: '#Bennys' }).click()
  await expect(page.locator('.feather-post-card')).toHaveCount(1)
  await expect(page.locator('.feather-author-name')).toHaveText("Benny's Original Motor Works")

  // Return to All
  await page.locator('.feather-tag-pill').filter({ hasText: '#All' }).click()
  await expect(page.locator('.feather-post-card')).toHaveCount(4)

  // Open Compose Modal
  await page.getByRole('button', { name: '+ Chirp' }).click()
  await expect(page.locator('.feather-compose-modal')).toBeVisible()

  // Type new chirp
  await page.locator('.feather-textarea').fill('Cruising down Vinewood Blvd tonight! #SunCity #Nightlife')
  await expect(page.locator('.feather-char-count')).toContainText('224')

  // Submit chirp
  await page.getByRole('button', { name: 'Chirp 🪶' }).click()
  await expect(page.locator('.feather-compose-modal')).toBeHidden()
  await expect(page.locator('.feather-toast')).toContainText('Chirped to Feather')

  // Verify new post appears at the top
  await expect(page.locator('.feather-post-card')).toHaveCount(5)
  await expect(page.locator('.feather-author-name').first()).toHaveText('Alex Mercer')
  await expect(page.locator('.feather-text').first()).toContainText('Cruising down Vinewood Blvd')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('app store loads catalog, filters categories, installs snake game, and adds it to springboard via Roblox AppStoreService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch App Store
  await page.getByRole('button', { name: 'Open App Store' }).click()
  await expect(page.locator('.store-app-root')).toBeVisible()
  await expect(page.locator('.store-brand h3')).toHaveText('App Store')

  // Verify categories and initial apps
  const appCards = page.locator('.store-app-card')
  await expect(appCards).toHaveCount(12)

  // Switch to Games category
  await page.getByRole('button', { name: 'Games' }).click()
  await expect(page.locator('.store-cat-pill.active')).toHaveText('Games')

  // Find Snake card
  const snakeCard = page.locator('.store-app-card', { hasText: 'Snake' })
  await expect(snakeCard).toBeVisible()
  await expect(snakeCard).toContainText('RetroByte Studios')
  await expect(snakeCard).toContainText('4.9')

  // Click GET to install Snake
  const getButton = snakeCard.locator('.store-btn-get')
  await expect(getButton).toHaveText('GET')
  await getButton.click()

  // Verify toast appears
  await expect(page.locator('.store-toast')).toContainText('Snake installed to Springboard!')

  // Verify action button transitions to OPEN & UNINSTALL
  await expect(snakeCard.locator('.store-btn-open')).toBeVisible()
  await expect(snakeCard.locator('.store-btn-remove')).toBeVisible()

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()

  // Verify Snake app is now present on the Springboard grid
  const snakeIconBtn = page.getByRole('button', { name: 'Open Snake' })
  await expect(snakeIconBtn).toBeVisible()

  // Launch newly installed Snake app
  await snakeIconBtn.click()
  await expect(page.locator('.phone-appbar strong')).toHaveText('Snake')
})

test('crypto app displays portfolio, switches tabs, executes coin trade and logs history via Roblox CryptoService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Crypto
  await page.getByRole('button', { name: 'Open Crypto' }).click()
  await expect(page.locator('.crypto-app-root')).toBeVisible()
  await expect(page.locator('.crypto-branding h3')).toHaveText('Satoshi Wallet')

  // Portfolio value and holdings
  await expect(page.locator('.crypto-balance-num')).toContainText('$')
  const coinCards = page.locator('.crypto-coin-card')
  await expect(coinCards).toHaveCount(4)

  // Switch to Markets tab
  await page.getByRole('button', { name: 'Markets' }).click()
  await expect(page.locator('.crypto-market-row')).toHaveCount(4)

  // Switch to Trade tab
  await page.getByRole('button', { name: 'Trade' }).click()
  await expect(page.locator('.crypto-trade-panel')).toBeVisible()

  // Select ETH and buy
  await page.locator('.crypto-coin-pill', { hasText: 'ETH' }).click()
  await page.locator('.crypto-amount-input-box input').fill('0.25')
  await page.getByRole('button', { name: 'BUY ETH NOW' }).click()

  // Check toast
  await expect(page.locator('.crypto-toast')).toContainText('bought 0.25 ETH')

  // Switch to History tab
  await page.getByRole('button', { name: 'History' }).click()
  await expect(page.locator('.crypto-tx-card').first()).toContainText('BUY ETH')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('house app displays properties, toggles door locks and security alarms, and manages guest keys via Roblox HouseService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch House
  await page.getByRole('button', { name: 'Open House' }).click()
  await expect(page.locator('.house-app-root')).toBeVisible()
  await expect(page.locator('.house-branding h3')).toHaveText('Dynasty 8')

  // Verify properties loaded
  const houseCards = page.locator('.house-card')
  await expect(houseCards).toHaveCount(3)
  await expect(page.locator('.house-title').first()).toHaveText('Eclipse Towers Penthouse 3')

  // Toggle lock
  const firstCard = houseCards.first()
  const lockBtn = firstCard.locator('.house-fob-btn.locked')
  await expect(lockBtn).toBeVisible()
  await lockBtn.click()

  // Verify toast and unlocked state
  await expect(page.locator('.house-toast')).toContainText('Unlocked 🔓')
  await expect(firstCard.locator('.house-fob-btn.unlocked')).toBeVisible()

  // Toggle alarm
  const alarmBtn = firstCard.locator('.house-fob-btn.armed')
  await expect(alarmBtn).toBeVisible()
  await alarmBtn.click()
  await expect(page.locator('.house-toast')).toContainText('Disarmed 🛡️')

  // Open Keys modal
  await firstCard.locator('.house-fob-btn.keys').click()
  await expect(page.locator('.house-keys-modal')).toBeVisible()
  await expect(page.locator('.house-key-card')).toHaveCount(2)

  // Issue new key
  await page.locator('.house-issue-key-form input').fill('Samantha Cole')
  await page.getByRole('button', { name: '+ Grant Key' }).click()
  await expect(page.locator('.house-toast')).toContainText('Key issued to Samantha Cole')
  await expect(page.locator('.house-key-card')).toHaveCount(3)

  // Close modal
  await page.locator('.house-close-modal').click()
  await expect(page.locator('.house-keys-modal')).toBeHidden()

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('billing app displays municipal invoices, filters by status, pays citations, and pays batch balance via Roblox BillingService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Billing
  await page.getByRole('button', { name: 'Open Billing' }).click()
  await expect(page.locator('.billing-app-root')).toBeVisible()
  await expect(page.locator('.billing-branding h3')).toHaveText('Billing & Citations')

  // Total outstanding balance
  await expect(page.locator('.billing-summary-num')).toContainText('$1,885.00')
  const cards = page.locator('.billing-invoice-card')
  await expect(cards).toHaveCount(4)

  // Filter Unpaid
  await page.locator('.billing-filter-pill').nth(1).click()
  await expect(page.locator('.billing-invoice-card')).toHaveCount(3)

  // Pay single citation
  const firstPayBtn = page.locator('.billing-invoice-card').first().locator('.billing-pay-btn')
  await firstPayBtn.click()
  await expect(page.locator('.billing-toast')).toContainText('Paid $450')

  // Pay all remaining
  const payAllBtn = page.getByRole('button', { name: 'PAY ALL' })
  await payAllBtn.click()
  await expect(page.locator('.billing-toast')).toContainText('Paid all 2 pending invoices')

  // Switch to Paid tab
  await page.locator('.billing-filter-pill').nth(2).click()
  await expect(page.locator('.billing-invoice-card')).toHaveCount(4)

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('citywarn app displays emergency broadcasts, filters by category, resolves incidents, and broadcasts citywide alerts via Roblox EmergencyService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch CityWarn
  await page.getByRole('button', { name: 'Open CityWarn' }).click()
  await expect(page.locator('.citywarn-app-root')).toBeVisible()
  await expect(page.locator('.citywarn-branding h3')).toHaveText('CityWarn')

  // Live indicators and alerts list
  await expect(page.locator('.citywarn-live-indicator')).toContainText('Active Incident')
  const alertCards = page.locator('.citywarn-alert-card')
  await expect(alertCards).toHaveCount(4)

  // Filter Police
  await page.getByRole('button', { name: 'POLICE' }).click()
  await expect(page.locator('.citywarn-alert-card')).toHaveCount(1)
  await expect(page.locator('.citywarn-alert-title')).toContainText('Armed Robbery')

  // Broadcast new alert
  await page.getByRole('button', { name: '+ Broadcast' }).click()
  await expect(page.locator('.citywarn-modal-backdrop')).toBeVisible()

  await page.locator('input[placeholder*="headline"]').fill('Chemical Hazard Alert')
  await page.locator('input[placeholder*="Location"]').fill('Elysian Island Refinery')
  await page.locator('textarea[placeholder*="Incident details"]').fill('Vapor cloud detected. Shelter in place.')
  await page.getByRole('button', { name: '🚨 ISSUE BROADCAST NOW' }).click()

  // Verify toast and new broadcast
  await expect(page.locator('.citywarn-toast')).toContainText('broadcasted citywide')
  await page.getByRole('button', { name: 'ALL' }).click()
  await expect(page.locator('.citywarn-alert-title').first()).toHaveText('Chemical Hazard Alert')

  // Resolve top active alert
  const resolveBtn = page.locator('.citywarn-alert-card').first().locator('.citywarn-action-btn.resolve')
  await resolveBtn.click()
  await expect(page.locator('.citywarn-toast')).toContainText('Incident marked as resolved')
  await expect(page.locator('.citywarn-alert-card').first().locator('.citywarn-resolved-tag')).toHaveText('RESOLVED')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('darkchat app displays encrypted channels, unlocks passcode-protected rooms, and transmits ephemeral messages via Roblox DarkChatService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch DarkChat
  await page.getByRole('button', { name: 'Open DarkChat' }).click()
  await expect(page.locator('.darkchat-app-root')).toBeVisible()
  await expect(page.locator('.darkchat-branding h3')).toHaveText('DarkChat')

  // Channels list
  const channels = page.locator('.darkchat-channel-card')
  await expect(channels).toHaveCount(3)

  // Open first open channel (#ghost-drop)
  await channels.first().click()
  await expect(page.locator('.darkchat-room-container')).toBeVisible()
  await expect(page.locator('.darkchat-room-info strong')).toHaveText('#ghost-drop')
  await expect(page.locator('.darkchat-msg-row')).toHaveCount(2)

  // Transmit encrypted message
  await page.locator('.darkchat-input-bar input').fill('Meet at Pier 400 at 0200 hours')
  await page.getByRole('button', { name: 'SEND' }).click()
  await expect(page.locator('.darkchat-msg-row')).toHaveCount(3)
  await expect(page.locator('.darkchat-msg-text').last()).toHaveText('Meet at Pier 400 at 0200 hours')

  // Return to channels
  await page.getByRole('button', { name: '← Channels' }).click()
  await expect(page.locator('.darkchat-channels-scroll')).toBeVisible()

  // Open passcode protected channel (#night-market)
  await page.locator('.darkchat-channel-title', { hasText: '#night-market' }).click()
  await expect(page.locator('.darkchat-passcode-modal')).toBeVisible()

  // Wrong passcode
  await page.locator('.darkchat-passcode-dialog input').fill('0000')
  await page.getByRole('button', { name: 'Decrypt & Enter' }).click()
  await expect(page.locator('.darkchat-toast')).toContainText('Incorrect channel passcode')

  // Correct passcode
  await page.locator('.darkchat-passcode-dialog input').fill('7701')
  await page.getByRole('button', { name: 'Decrypt & Enter' }).click()
  await expect(page.locator('.darkchat-room-info strong')).toHaveText('#night-market')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('companies app displays city business directory, applies to hiring job roles, and files support tickets via Roblox CompanyService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Companies
  await page.getByRole('button', { name: 'Open Companies' }).click()
  await expect(page.locator('.companies-app-root')).toBeVisible()
  await expect(page.locator('.companies-branding h3')).toHaveText('City Directory')

  // Directory cards
  const cards = page.locator('.companies-card')
  await expect(cards).toHaveCount(4)
  await expect(page.locator('.companies-card-name').first()).toHaveText('Los Santos Customs')

  // Jobs tab
  await page.getByRole('button', { name: 'Jobs (3)' }).click()
  const jobCards = page.locator('.companies-job-card')
  await expect(jobCards).toHaveCount(3)
  await expect(page.locator('.companies-job-role').first()).toHaveText('Master Technician')

  // Quick Apply
  await page.locator('.companies-apply-btn').first().click()
  await expect(page.locator('.companies-toast')).toContainText('Application submitted for Master Technician')

  // Tickets tab
  await page.getByRole('button', { name: 'Tickets (1)' }).click()
  await expect(page.locator('.companies-ticket-card')).toHaveCount(1)

  // Back to Directory to file a new ticket
  await page.getByRole('button', { name: 'Directory' }).click()
  await page.locator('.companies-card').nth(2).locator('.companies-action-btn', { hasText: 'Ticket' }).click()
  await expect(page.locator('.companies-modal-backdrop')).toBeVisible()

  await page.locator('input[placeholder="Inquiry Subject..."]').fill('Catering Inquiry for 50 Pax')
  await page.locator('textarea[placeholder*="Describe your request"]').fill('Need burger platters and shakes delivered.')
  await page.getByRole('button', { name: 'SUBMIT INQUIRY' }).click()

  // Toast & tickets count verification
  await expect(page.locator('.companies-toast')).toContainText('opened with Up-n-Atom Burgers')
  await expect(page.locator('.companies-ticket-card')).toHaveCount(2)
  await expect(page.locator('.companies-ticket-subject').first()).toHaveText('Catering Inquiry for 50 Pax')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('crewlink app displays syndicate roster, deposits crew vault funds, monitors turf control, and broadcasts comms via Roblox CrewService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch CrewLink
  await page.getByRole('button', { name: 'Open CrewLink' }).click()
  await expect(page.locator('.crew-app-root')).toBeVisible()
  await expect(page.locator('.crew-branding h3')).toHaveText('Midnight Syndicate')

  // Initial vault balance check
  await expect(page.locator('.crew-bank-balance')).toContainText('$145,200.00')

  // Deposit funds
  await page.getByRole('button', { name: '+$5k' }).click()
  await expect(page.locator('.crew-toast')).toContainText('Deposited $5,000 into Crew Vault')
  await expect(page.locator('.crew-bank-balance')).toContainText('$150,200.00')

  // Turf tab
  const turfs = page.locator('.crew-turf-card')
  await expect(turfs).toHaveCount(3)
  await expect(page.locator('.crew-turf-name').first()).toHaveText('Cypress Flats Industrial')

  // Roster tab
  await page.getByRole('button', { name: 'Roster (4)' }).click()
  const members = page.locator('.crew-member-card')
  await expect(members).toHaveCount(4)

  // Promote recruit
  const recruitSelect = page.locator('.crew-rank-select').last()
  await recruitSelect.selectOption('enforcer')
  await expect(page.locator('.crew-toast')).toContainText('promoted to ENFORCER')

  // Comms tab
  await page.getByRole('button', { name: 'Comms (1)' }).click()
  await page.locator('.crew-broadcast-input-box input').fill('Meeting at warehouse in 10')
  await page.getByRole('button', { name: 'BROADCAST' }).click()
  await expect(page.locator('.crew-toast')).toContainText('Tactical broadcast transmitted')
  await expect(page.locator('.crew-bc-msg').first()).toHaveText('Meeting at warehouse in 10')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('health app tracks vitals, biometrics, updates medical id profile, and dispatches 911 EMS SOS beacons via Roblox HealthService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Health
  await page.getByRole('button', { name: 'Open Health' }).click()
  await expect(page.locator('.health-app-root')).toBeVisible()
  await expect(page.locator('.health-branding h3')).toHaveText('Health')

  // Vitals check
  await expect(page.locator('.hr-card .health-card-val-row strong')).toHaveText('72')
  await expect(page.locator('.spo2-card .health-card-val-row strong')).toHaveText('99%')
  await expect(page.locator('.health-metric-item strong').first()).toHaveText('8,420')

  // Switch to Medical ID tab
  await page.getByRole('button', { name: 'Medical ID' }).click()
  await expect(page.locator('.health-medical-id-view')).toBeVisible()
  await expect(page.locator('.health-select')).toHaveValue('O+')

  // Update allergies
  const allergiesInput = page.locator('input[placeholder*="Penicillin"]')
  await allergiesInput.fill('Penicillin, Peanuts')
  await page.getByRole('button', { name: 'SAVE MEDICAL ID' }).click()
  await expect(page.locator('.health-toast')).toContainText('Medical ID profile updated')

  // Dispatch SOS 911 Beacon
  await page.getByRole('button', { name: '🚨 SOS 911' }).click()
  await expect(page.locator('.health-toast')).toContainText('Emergency SOS Beacon broadcasted')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('local-pages app displays yellow pages classifieds, filters by category, likes ads, and publishes new community postings via Roblox LocalPagesService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Local Pages
  await page.getByRole('button', { name: 'Open Local Pages' }).click()
  await expect(page.locator('.localpages-app-root')).toBeVisible()
  await expect(page.locator('.localpages-branding h3')).toHaveText('Local Pages')

  // Classifieds feed
  const ads = page.locator('.localpages-card')
  await expect(ads).toHaveCount(3)
  await expect(page.locator('.localpages-ad-title').first()).toContainText('Locksmith')

  // Filter Automotive
  await page.getByRole('button', { name: 'Automotive' }).click()
  await expect(page.locator('.localpages-card')).toHaveCount(1)
  await expect(page.locator('.localpages-ad-title')).toContainText('Lowrider Hydraulics')

  // Like ad
  const likeBtn = page.locator('.localpages-action-btn.like').first()
  await expect(likeBtn).toContainText('34')
  await likeBtn.click()
  await expect(likeBtn).toContainText('35')

  // Return to All
  await page.getByRole('button', { name: 'All' }).click()

  // Publish new classified ad
  await page.getByRole('button', { name: '+ Post Ad' }).click()
  await expect(page.locator('.localpages-modal-backdrop')).toBeVisible()

  await page.locator('input[placeholder="Listing headline..."]').fill('24/7 Heavy Equipment Towing')
  await page.locator('input[placeholder*="District"]').fill('Cypress Flats')
  await page.locator('textarea[placeholder*="Describe your services"]').fill('Flatbed towing and heavy recovery across LS.')
  await page.getByRole('button', { name: 'PUBLISH CLASSIFIED' }).click()

  // Verify toast and published ad
  await expect(page.locator('.localpages-toast')).toContainText('Classified ad published')
  await expect(page.locator('.localpages-card')).toHaveCount(4)
  await expect(page.locator('.localpages-ad-title').first()).toHaveText('24/7 Heavy Equipment Towing')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('weazel-news app displays headlines, breaking tickers, reads articles, and publishes field reports via Roblox NewsService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Weazel News
  await page.getByRole('button', { name: 'Open Weazel News' }).click()
  await expect(page.locator('.weazel-app-root')).toBeVisible()
  await expect(page.locator('.weazel-branding h3')).toHaveText('WEAZEL NEWS')
  await expect(page.locator('.weazel-ticker')).toBeVisible()

  // Articles feed count
  const articles = page.locator('.weazel-card')
  await expect(articles).toHaveCount(3)

  // Filter Crime
  await page.getByRole('button', { name: 'CRIME', exact: true }).click()
  await expect(page.locator('.weazel-card')).toHaveCount(1)
  await expect(page.locator('.weazel-card-headline')).toContainText('Vault Breach')

  // Open full article
  await page.locator('.weazel-card').first().click()
  await expect(page.locator('.weazel-full-article')).toBeVisible()
  await expect(page.locator('.weazel-detail-views')).toContainText('1421 reads')

  // Back to Headlines
  await page.getByRole('button', { name: '← Back to Headlines' }).click()
  await expect(page.locator('.weazel-main-scroll')).toBeVisible()

  // Back to All
  await page.getByRole('button', { name: 'Top' }).click()

  // Submit new report
  await page.getByRole('button', { name: '+ Report' }).click()
  await expect(page.locator('.weazel-modal-backdrop')).toBeVisible()

  await page.locator('input[placeholder="Article Headline..."]').fill('Port of Los Santos Seizes Smuggled Exotic Supercars')
  await page.locator('textarea[placeholder*="Full article copy"]').fill('Customs border patrol impounded six unreleased European hypercars at Terminal 4.')
  await page.locator('.weazel-breaking-checkbox-label input').check()
  await page.getByRole('button', { name: 'TRANSMIT ARTICLE TO WIRE' }).click()

  // Verify toast and new story
  await expect(page.locator('.weazel-toast')).toContainText('Story published across Weazel News Network')
  await expect(page.locator('.weazel-card')).toHaveCount(4)
  await expect(page.locator('.weazel-card-headline').first()).toHaveText('Port of Los Santos Seizes Smuggled Exotic Supercars')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('flare app browses discover deck, swipes profiles, celebrates matches, and chats with matches via Roblox FlareService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Flare
  await page.getByRole('button', { name: 'Open Flare' }).click()
  await expect(page.locator('.flare-app-root')).toBeVisible()
  await expect(page.locator('.flare-branding h3')).toHaveText('FLARE')
  await expect(page.locator('.flare-matches-pill')).toContainText('1 Matches')

  // First profile: Valentina Ross
  await expect(page.locator('.flare-name-age strong')).toHaveText('Valentina Ross')

  // Pass Valentina
  await page.getByRole('button', { name: 'Pass' }).click()

  // Second profile: Sierra Quinn
  await expect(page.locator('.flare-name-age strong')).toHaveText('Sierra Quinn')

  // Like Sierra -> Triggers Match popup
  await page.getByRole('button', { name: 'Like' }).click()
  await expect(page.locator('.flare-match-backdrop')).toBeVisible()
  await expect(page.locator('.flare-match-card h2')).toHaveText("IT'S A MATCH!")

  // Click Send a Message
  await page.getByRole('button', { name: 'Send a Message' }).click()
  await expect(page.locator('.flare-chat-view')).toBeVisible()
  await expect(page.locator('.flare-chat-header strong')).toHaveText('Sierra Quinn')

  // Send message
  await page.locator('.flare-chat-input-bar input').fill('Down for skydiving this Saturday?')
  await page.getByRole('button', { name: 'Send' }).click()
  await expect(page.locator('.flare-bubble.outgoing p')).toHaveText('Down for skydiving this Saturday?')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('fliptok app plays vertical video reels, likes clips, comments in drawer, cycles reels, and uploads new clips via Roblox FlipTokService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch FlipTok
  await page.getByRole('button', { name: 'Open FlipTok' }).click()
  await expect(page.locator('.fliptok-app-root')).toBeVisible()
  await expect(page.locator('.fliptok-creator')).toHaveText('@drift_king_ls')

  // Like video
  const likeBtn = page.locator('.fliptok-action-pill.like')
  await expect(likeBtn).toContainText('18,400')
  await likeBtn.click()
  await expect(likeBtn).toContainText('18,401')

  // Open comments
  await page.getByRole('button', { name: 'Comments' }).click()
  await expect(page.locator('.fliptok-drawer')).toBeVisible()
  await expect(page.locator('.fliptok-comment-item')).toHaveCount(1)

  // Add comment
  await page.locator('.fliptok-comment-input-bar input').fill('Sick drift angle!')
  await page.locator('.picstagram-post-comm-btn').click()
  await expect(page.locator('.fliptok-comment-item')).toHaveCount(2)
  await expect(page.locator('.fliptok-comment-text').first()).toHaveText('Sick drift angle!')

  // Close drawer
  await page.locator('.fliptok-drawer-close').click()
  await expect(page.locator('.fliptok-drawer')).not.toBeVisible()

  // Next reel
  await page.getByRole('button', { name: 'Next Reel' }).click()
  await expect(page.locator('.fliptok-creator')).toHaveText('@vinewood_glam')

  // Upload new reel
  await page.getByRole('button', { name: '+ Upload' }).click()
  await expect(page.locator('.fliptok-modal-backdrop')).toBeVisible()

  await page.locator('textarea[placeholder*="Describe your video"]').fill('Night drive through Del Perro #nightdrive')
  await page.getByRole('button', { name: 'POST TO FOR YOU' }).click()

  // Verify toast and newly active reel
  await expect(page.locator('.fliptok-toast')).toContainText('Reel uploaded to FlipTok')
  await expect(page.locator('.fliptok-creator')).toHaveText('@alex_mercer')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('picstagram app browses photo feed, views stories tray, likes photos, adds comments, and publishes new photos with filters via Roblox PicstagramService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Picstagram
  await page.getByRole('button', { name: 'Open Picstagram' }).click()
  await expect(page.locator('.picstagram-app-root')).toBeVisible()
  await expect(page.locator('.picstagram-brand')).toHaveText('Picstagram')

  // Stories tray
  await expect(page.locator('.picstagram-story-bubble')).toHaveCount(4)

  // Posts feed
  const posts = page.locator('.picstagram-post-card')
  await expect(posts).toHaveCount(2)

  // Like first post
  const likeBtn = page.locator('.picstagram-action-icon.like').first()
  await expect(page.locator('.picstagram-likes-count').first()).toHaveText('428 likes')
  await likeBtn.click()
  await expect(page.locator('.picstagram-likes-count').first()).toHaveText('429 likes')

  // Open comments
  await page.locator('.picstagram-action-icon[aria-label="Comments"]').first().click()
  await expect(page.locator('.picstagram-drawer')).toBeVisible()
  await expect(page.locator('.picstagram-comment-item')).toHaveCount(1)

  // Post comment
  await page.locator('.picstagram-comment-input-bar input').fill('Love this vibe!')
  await page.locator('.picstagram-post-comm-btn').click()
  await expect(page.locator('.picstagram-comment-item')).toHaveCount(2)
  await expect(page.locator('.picstagram-comment-item p').first()).toHaveText('Love this vibe!')

  // Close drawer
  await page.locator('.picstagram-drawer .picstagram-modal-close').click()
  await expect(page.locator('.picstagram-drawer')).not.toBeVisible()

  // Create new post
  await page.getByRole('button', { name: '+ New Post' }).click()
  await expect(page.locator('.picstagram-modal-backdrop')).toBeVisible()

  await page.locator('input[placeholder*="Add location"]').fill('Puerto Del Sol Marina')
  await page.locator('textarea[placeholder*="Write a caption"]').fill('Sunset cruise on the yacht #lossantos')
  await page.locator('.picstagram-select').selectOption('Clarendon')
  await page.getByRole('button', { name: 'SHARE TO FEED' }).click()

  // Verify toast and new post
  await expect(page.locator('.picstagram-toast')).toContainText('Photo posted to Picstagram feed')
  await expect(page.locator('.picstagram-post-card')).toHaveCount(3)
  await expect(page.locator('.picstagram-post-author-row strong').first()).toHaveText('alex_mercer')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})

test('radio app connects to walkie frequency, switches channel presets, adjusts audio volume, mutes mic, and pushes to talk via Roblox RadioService', async ({ page }) => {
  await openPhone(page)
  await page.getByRole('button', { name: 'Return to Springboard' }).click()

  // Launch Radio
  await page.getByRole('button', { name: 'Open Radio' }).click()
  await expect(page.locator('.radio-app-root')).toBeVisible()
  await expect(page.locator('.radio-freq-num')).toHaveText('101.5')
  await expect(page.locator('.radio-lcd-indicator')).toHaveText('● TX/RX LIVE')
  await expect(page.locator('.radio-speaker-active')).toContainText('Officer Davis')

  // Switch preset to Dispatch 1
  await page.locator('.radio-preset-chip').filter({ hasText: 'Dispatch 1' }).click()
  await expect(page.locator('.radio-freq-num')).toHaveText('1.0')
  await expect(page.locator('.radio-toast')).toContainText('Tuned to 1.0 MHz')

  // Toggle Mute
  const muteBtn = page.locator('.radio-mute-btn')
  await expect(muteBtn).toHaveText('🎤 MIC LIVE')
  await muteBtn.click()
  await expect(muteBtn).toHaveText('🔇 MIC MUTED')
  await muteBtn.click()
  await expect(muteBtn).toHaveText('🎤 MIC LIVE')

  // Push To Talk
  const pttBtn = page.locator('.radio-ptt-button')
  await expect(pttBtn).toContainText('HOLD TO TALK')
  await pttBtn.dispatchEvent('pointerdown', { bubbles: true })
  await expect(pttBtn).toContainText('TRANSMITTING')
  await pttBtn.dispatchEvent('pointerup', { bubbles: true })
  await expect(pttBtn).toContainText('HOLD TO TALK')

  // Toggle Power
  const pwrBtn = page.locator('.radio-power-btn')
  await expect(pwrBtn).toHaveText('PWR ON')
  await pwrBtn.click()
  await expect(pwrBtn).toHaveText('PWR OFF')
  await expect(page.locator('.radio-freq-num')).toHaveText('---.-')

  // Return to Springboard
  await page.getByRole('button', { name: 'Return to Springboard' }).click()
  await expect(page.locator('.phone-springboard')).toBeVisible()
})
