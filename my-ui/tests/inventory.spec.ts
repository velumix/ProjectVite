import { test, expect, type Page } from '@playwright/test'

async function openInventory(page: Page) {
  await page.goto('/')
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden()
  await page.locator('[data-roblox-name="SideInventoryButton"]').click()
  await expect(page.getByRole('dialog', { name: 'Inventory menu' })).toBeVisible()
}

test('inventory search, selection, split, drop, undo and quick assignment', async ({ page }) => {
  await openInventory(page)
  const grid = page.getByLabel('Inventory slots')
  const details = page.getByLabel('Item details')
  await expect(grid.locator('button')).toHaveCount(15)
  await page.getByLabel('Search inventory').fill('water')
  await expect(grid.locator('button')).toHaveCount(1)
  await grid.getByRole('button', { name: 'Water bottle, 3', exact: true }).click()
  await expect(details.getByRole('heading')).toHaveText('Water bottle')
  await page.getByRole('button', { name: 'Split', exact: true }).click()
  await page.getByLabel('Split quantity').fill('1')
  await page.getByRole('button', { name: 'Split stack', exact: true }).click()
  await expect(grid.getByRole('button', { name: 'Water bottle, 2', exact: true })).toBeVisible()
  await expect(grid.getByRole('button', { name: 'Water bottle, 1', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Quick slot 5: empty', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Quick slot 5: Water bottle', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Drop', exact: true }).click()
  await expect(grid.getByRole('button', { name: 'Water bottle, 2', exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Quick slot 5: empty', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Undo drop', exact: true }).click()
  await expect(grid.getByRole('button', { name: 'Water bottle, 2', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Quick slot 5: Water bottle', exact: true })).toBeVisible()
  await grid.getByRole('button', { name: 'Water bottle, 2', exact: true }).click()
  await page.getByRole('button', { name: 'Use item', exact: true }).click()
  await expect(grid.getByRole('button', { name: 'Water bottle, 1', exact: true })).toHaveCount(2)
  await page.getByLabel('Search inventory').fill('nonexistent')
  await expect(page.getByText('No items found.', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search', exact: true }).last().click()
  await expect(grid.locator('button')).toHaveCount(16)
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.locator('[data-roblox-name="SideInventoryButton"]').click()
  await expect(grid.locator('button')).toHaveCount(16)
})

test('consumables update player health and menu tabs share state', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden()
  await page.getByRole('button', { name: /Take Damage/ }).click()
  await page.locator('[data-roblox-name="SideInventoryButton"]').click()
  await page.getByLabel('Inventory slots').getByRole('button', { name: 'Toasted sandwich, 2', exact: true }).click()
  await page.getByRole('button', { name: 'Use item', exact: true }).click()
  await page.getByRole('navigation', { name: 'Game menu' }).getByRole('button', { name: 'STATS', exact: true }).click()
  await expect(page.getByText('60%', { exact: true })).toBeVisible()
  await page.getByRole('navigation').getByRole('button', { name: 'SETTINGS', exact: true }).click()
  await page.getByRole('switch', { name: 'Item quantities' }).uncheck()
  await page.getByRole('navigation').getByRole('button', { name: 'INVENTORY', exact: true }).click()
  await expect(page.locator('.city-item-quantity')).toHaveCount(0)
  await page.getByRole('navigation').getByRole('button', { name: 'MAP', exact: true }).click()
  await page.getByRole('button', { name: 'Central garage', exact: true }).click()
  await page.getByRole('button', { name: 'Set waypoint', exact: true }).click()
  await expect(page.getByText('Waypoint: Central garage', { exact: true })).toBeVisible()
  await page.getByRole('navigation').getByRole('button', { name: 'PHONE', exact: true }).click()
  await page.locator('.city-message-list').getByRole('button', { name: /City Services/ }).click()
  await expect(page.locator('.city-conversation h2')).toHaveText('City Services')
})

test('keyboard opens and closes the menu, confines focus, and reset restores items', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden()
  await page.keyboard.press('i')
  const menu = page.getByRole('dialog', { name: 'Inventory menu' })
  await expect(menu).toBeVisible()
  await page.keyboard.press('Shift+Tab')
  await expect(menu.getByRole('button', { name: 'ESC Close', exact: true })).toBeFocused()
  await page.keyboard.press('Tab')
  await expect(menu.getByRole('button', { name: 'INVENTORY', exact: true })).toBeFocused()
  await page.keyboard.press('4')
  await expect(page.getByLabel('Item details').getByRole('heading')).toHaveText('Water bottle')
  await page.keyboard.press('r')
  await expect(page.getByLabel('Split quantity')).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByLabel('Split quantity')).toBeHidden()
  await expect(menu).toBeVisible()
  await page.getByRole('button', { name: 'Drop', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(menu).toBeHidden()
  await page.getByRole('button', { name: 'Reset', exact: true }).click()
  await expect(page.locator('[data-roblox-name="LoadingScreen"]')).toBeHidden()
  await page.locator('[data-roblox-name="SideInventoryButton"]').click()
  await expect(page.getByLabel('Inventory slots').getByRole('button', { name: 'Water bottle, 3', exact: true })).toBeVisible()
})

test('inventory remains clickable in portrait and landscape previews', async ({ page }) => {
  await openInventory(page)
  await page.getByRole('button', { name: 'Expand preview' }).click()
  for (const device of ['PhonePortrait', 'PhoneLandscape', 'Desktop']) {
    await page.getByLabel('Viewport device mode').selectOption(device)
    await page.getByLabel('Inventory slots').getByRole('button', { name: 'Water bottle, 3', exact: true }).click()
    await expect(page.getByLabel('Item details').getByRole('heading')).toHaveText('Water bottle')
    await expect(async () => {
      const bounds = await page.locator('.city-content').boundingBox()
      const menu = await page.locator('.city-menu').boundingBox()
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(menu!.x + menu!.width + 1)
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(menu!.y + menu!.height + 1)
    }).toPass()
  }
})

test('drag and drop enables assigning to quick slots, reordering quick slots, moving, and dropping items', async ({ page }) => {
  await openInventory(page)
  const grid = page.getByLabel('Inventory slots')

  // 1. Drag an item to empty quick slot 5 to assign it
  const waterSlot = grid.getByRole('button', { name: 'Water bottle, 3', exact: true })
  const quickSlot5 = page.getByRole('button', { name: 'Quick slot 5: empty', exact: true })
  await waterSlot.dragTo(quickSlot5)
  await expect(page.getByRole('button', { name: 'Quick slot 5: Water bottle', exact: true })).toBeVisible()

  // 2. Drag quick slot 5 onto quick slot 4 to swap them
  const quickSlot4 = page.getByRole('button', { name: /Quick slot 4:/, exact: true })
  await page.getByRole('button', { name: 'Quick slot 5: Water bottle', exact: true }).dragTo(quickSlot4)
  await expect(page.getByRole('button', { name: 'Quick slot 4: Water bottle', exact: true })).toBeVisible()

  // 3. Drag item to empty grid slot to move it
  const emptySlot = grid.locator('.city-item-slot.is-empty').first()
  await waterSlot.dragTo(emptySlot)
  await expect(grid.getByRole('button', { name: 'Water bottle, 3', exact: true })).toBeVisible()

  // 4. Drag item onto the Drop button to drop it
  const dropButton = page.getByRole('button', { name: 'Drop', exact: true })
  await grid.getByRole('button', { name: 'Water bottle, 3', exact: true }).dragTo(dropButton)
  await expect(grid.getByRole('button', { name: 'Water bottle, 3', exact: true })).toHaveCount(0)
})

test('character equipment displays ViewportFrame and branding does not include Los Santos', async ({ page }) => {
  await openInventory(page)
  const viewport = page.locator('[data-roblox-class="ViewportFrame"][data-roblox-name="CharacterViewport"]')
  await expect(viewport).toBeVisible()
  await expect(page.getByText(/LOS SANTOS INSPIRED/i)).toHaveCount(0)
  const rotateRightBtn = viewport.getByRole('button', { name: 'Rotate right' })
  await expect(rotateRightBtn).toBeVisible()
  await rotateRightBtn.click()
  await expect(viewport.getByText(/45°/)).toBeVisible()
})

test('revamped quests screen renders 3-column layout, categories, hero banner, interactive checklist and tracking', async ({ page }) => {
  await openInventory(page)
  await page.getByRole('button', { name: 'QUESTS', exact: true }).click()
  const questsModal = page.locator('[data-roblox-name="QuestsPanelModal"]')
  await expect(questsModal).toBeVisible()

  // Left column categories and Sun City branding
  await expect(page.getByText(/EXPLORE. WORK. BUILD./i)).toBeVisible()
  await expect(page.getByText(/A BRIGHTER TOMORROW IN SUN CITY./i)).toBeVisible()
  await expect(page.getByRole('button', { name: /Side Jobs/i })).toBeVisible()

  // Center column quests list and search
  const questCard = page.locator('.quest-card', { hasText: 'Pizza Run' })
  await expect(questCard).toBeVisible()
  await questCard.click()

  // Right column details, hero banner, objectives checklist, rewards
  await expect(page.locator('.quests-hero-banner')).toBeVisible()
  await expect(page.locator('.quests-detail-title', { hasText: 'Pizza Run' })).toBeVisible()
  await expect(page.locator('.quests-hero-location-badge')).toContainText('Downtown')

  // Checkbox interactivity
  const firstCheckbox = page.locator('[role="checkbox"]').first()
  await firstCheckbox.click()

  // Track Quest button toggle
  const trackBtn = page.getByRole('button', { name: 'Tracking' })
  await expect(trackBtn).toBeVisible()
  await trackBtn.click()
  await expect(page.getByRole('button', { name: 'Track Quest' })).toBeVisible()

  // Close quests panel via ESC button
  await page.locator('[data-roblox-name="CloseQuestsButton"]').click()
  await expect(questsModal).toBeHidden()
})

test('dynamic UI adapts across all devices without overflowing canvas bounds', async ({ page }) => {
  await openInventory(page)
  await page.getByRole('button', { name: 'Expand preview' }).click()
  const mode = page.getByLabel('Viewport device mode')

  for (const device of ['PhonePortrait', 'PhoneLandscape', 'Tablet', 'Desktop']) {
    await mode.selectOption(device)
    await expect(mode).toHaveValue(device)

    // Switch to Quests tab
    await page.getByRole('button', { name: 'QUESTS', exact: true }).click()
    const questsScreen = page.locator('.quests-screen')
    await expect(questsScreen).toBeVisible()

    // Assert Quests screen remains within menu bounds
    await expect(async () => {
      const qBounds = await questsScreen.boundingBox()
      const menuBounds = await page.locator('.city-menu').boundingBox()
      expect(qBounds).not.toBeNull()
      expect(menuBounds).not.toBeNull()
      expect(qBounds!.x + qBounds!.width).toBeLessThanOrEqual(menuBounds!.x + menuBounds!.width + 2)
      expect(qBounds!.y + qBounds!.height).toBeLessThanOrEqual(menuBounds!.y + menuBounds!.height + 2)
    }).toPass()

    // Switch back to Inventory tab
    await page.getByRole('button', { name: 'INVENTORY', exact: true }).click()
    const inventoryContent = page.locator('.city-content')
    await expect(inventoryContent).toBeVisible()
    await expect(async () => {
      const iBounds = await inventoryContent.boundingBox()
      const menuBounds = await page.locator('.city-menu').boundingBox()
      expect(iBounds).not.toBeNull()
      expect(menuBounds).not.toBeNull()
      expect(iBounds!.x + iBounds!.width).toBeLessThanOrEqual(menuBounds!.x + menuBounds!.width + 2)
      expect(iBounds!.y + iBounds!.height).toBeLessThanOrEqual(menuBounds!.y + menuBounds!.height + 2)
    }).toPass()
  }

  await page.getByRole('button', { name: 'Exit preview' }).click()
})

test('revamped stats screen renders 2-column progression dashboard with interactive attributes and quest tracking', async ({ page }) => {
  await openInventory(page)
  await page.getByRole('button', { name: 'STATS', exact: true }).click()
  const statsModal = page.locator('[data-roblox-name="StatsPanelModal"]')
  await expect(statsModal).toBeVisible()

  // Left Column: Progression
  await expect(page.locator('.stats-level-number')).toHaveText('42')
  await expect(page.getByText(/Same city, different story/i)).toBeVisible()
  await expect(page.locator('.stats-player-name')).toHaveText('Player1')
  await expect(page.locator('.stats-citizen-badge')).toHaveText('CITIZEN')

  // Left Column: Attributes & interactive point allocation
  await expect(page.getByText(/0 POINTS AVAILABLE/i)).toBeVisible()
  const plusPointBtn = page.getByRole('button', { name: '+ Point' })
  await plusPointBtn.click()
  await expect(page.getByText(/2 POINTS AVAILABLE/i)).toBeVisible()

  // Upgrade Health attribute
  const healthCard = page.locator('.stats-attr-card', { hasText: 'HEALTH' })
  await expect(healthCard.locator('.stats-attr-level')).toHaveText('LV. 4')
  await healthCard.locator('.stats-attr-plus-btn').click()
  await expect(healthCard.locator('.stats-attr-level')).toHaveText('LV. 5')
  await expect(page.getByText(/1 POINT AVAILABLE/i)).toBeVisible()

  // Left Column: Skills
  await expect(page.getByText(/TOTAL SKILL LEVEL 28/i)).toBeVisible()
  await expect(page.getByText('Driving', { exact: true })).toBeVisible()
  await expect(page.getByText('Shooting', { exact: true })).toBeVisible()
  await expect(page.getByText('Charisma', { exact: true })).toBeVisible()

  // Left Column: Reputation
  const policeRep = page.locator('.stats-rep-card', { hasText: 'Police' })
  await expect(policeRep).toBeVisible()
  await policeRep.click()
  await expect(page.locator('.stats-faction-tooltip')).toContainText('Police')

  // Right Column: Active Quests
  const betterRideQuest = page.locator('.stats-active-quest-item', { hasText: 'A Better Ride' })
  await expect(betterRideQuest).toBeVisible()
  await expect(betterRideQuest.getByText('MAIN')).toBeVisible()
  const mechanicCheck = betterRideQuest.locator('input[type="checkbox"]')
  await expect(mechanicCheck).not.toBeChecked()
  await mechanicCheck.click()
  await expect(mechanicCheck).toBeChecked()

  // City Life photo progress
  const cityLifeQuest = page.locator('.stats-active-quest-item', { hasText: 'City Life' })
  await expect(cityLifeQuest.locator('.stats-quest-progress-num')).toHaveText('2 / 5')
  await cityLifeQuest.locator('.stats-quest-progress-track').click()
  await expect(cityLifeQuest.locator('.stats-quest-progress-num')).toHaveText('3 / 5')

  // Right Column: Completed Quests
  await expect(page.getByText('124 COMPLETED')).toBeVisible()
  await expect(page.getByText('First Steps')).toBeVisible()
  await expect(page.getByText('Helping Hands')).toBeVisible()

  // Right Column: Milestones & Modal
  await expect(page.getByText('Own 5 Properties')).toBeVisible()
  const viewAllBtn = page.getByRole('button', { name: 'VIEW ALL' })
  await viewAllBtn.click()
  const modal = page.locator('.stats-milestones-modal')
  await expect(modal).toBeVisible()
  await expect(modal.getByText(/SUN CITY CITIZEN MILESTONES/i)).toBeVisible()
  await page.locator('.stats-modal-close').click()
  await expect(modal).toBeHidden()

  // Footer lore & motto
  await expect(page.getByText('SUN CITY • A BRIGHTER TOMORROW IN SUN CITY')).toBeVisible()
  await expect(page.getByText('OPPORTUNITY')).toBeVisible()

  // Close Stats modal
  await page.locator('[data-roblox-name="CloseStatsButton"]').click()
  await expect(statsModal).toBeHidden()
})

test('revamped settings screen renders full dashboard matching mockup with general, graphics, and audio sections', async ({ page }) => {
  await openInventory(page)
  await page.getByRole('button', { name: 'SETTINGS', exact: true }).click()
  const settingsModal = page.locator('[data-roblox-name="SettingsPanelModal"]')
  await expect(settingsModal).toBeVisible()

  // Top header elements
  await expect(page.locator('.city-brand strong')).toHaveText('SUN CITY')
  await expect(page.locator('.city-brand span')).toHaveText('SETTINGS')
  await expect(page.locator('.city-quote-tagline')).toHaveText('SAME CITY, DIFFERENT STORY.')

  // Left sidebar categories
  await expect(page.getByRole('button', { name: /General Language, UI, gameplay/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Graphics Visuals, performance/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Audio Volumes, radio, voice/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Controls Keybinds, sensitivity/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /HUD Interface, minimap, UI/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Notifications In-game alerts, messages/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Accessibility Visual, audio, input/i })).toBeVisible()
  await expect(page.getByRole('button', { name: /Advanced Experimental, developer/i })).toBeVisible()

  // Section 1: GENERAL
  await expect(page.getByRole('heading', { name: 'GENERAL', exact: true })).toBeVisible()
  await expect(page.getByRole('combobox', { name: 'Language' })).toHaveValue('English')
  await expect(page.getByRole('slider', { name: 'UI Scale' })).toBeVisible()
  const tooltipsSwitch = page.getByRole('switch', { name: 'Show Tooltips' })
  await expect(tooltipsSwitch).toBeChecked()
  await tooltipsSwitch.click()
  await expect(tooltipsSwitch).not.toBeChecked()

  const streamerSwitch = page.getByRole('switch', { name: 'Streamer Mode' })
  await expect(streamerSwitch).not.toBeChecked()
  await streamerSwitch.click()
  await expect(streamerSwitch).toBeChecked()

  // Section 2: GRAPHICS
  await expect(page.getByRole('heading', { name: 'GRAPHICS', exact: true })).toBeVisible()
  const performancePill = page.getByRole('radio', { name: 'Performance' })
  await performancePill.click()
  await expect(performancePill).toHaveClass(/is-active/)

  const postProcSwitch = page.getByRole('switch', { name: 'Disable Post Processing' })
  await expect(postProcSwitch).not.toBeChecked()
  await postProcSwitch.click()
  await expect(postProcSwitch).toBeChecked()

  await expect(page.getByRole('switch', { name: 'Reduce Effects' })).toBeChecked()
  await expect(page.getByRole('switch', { name: 'Lower Reflection Detail' })).toBeChecked()
  await expect(page.getByRole('slider', { name: 'Shadow Detail' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'View Distance' })).toBeVisible()

  // Section 3: AUDIO
  await expect(page.getByRole('heading', { name: 'AUDIO', exact: true })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Master Volume' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Music Volume' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'SFX Volume' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Radio Volume' })).toBeVisible()
  await expect(page.getByRole('slider', { name: 'Voice Chat Volume' })).toBeVisible()

  // Footer lore & autosave notice (NO Los Santos text)
  await expect(page.getByText('SUN CITY STATE OF MIND')).toBeVisible()
  await expect(page.getByText('SETTINGS SAVE AUTOMATICALLY.')).toBeVisible()
  await expect(page.locator('body')).not.toContainText('LOS SANTOS')

  // Close Settings button
  const closeBtn = page.locator('[data-roblox-name="CloseSettingsButton"]')
  await expect(closeBtn).toBeVisible()
  await closeBtn.click()
  await expect(settingsModal).toBeHidden()
})
