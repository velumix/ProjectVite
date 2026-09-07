import { test, expect } from '@playwright/test'

test('HUD buttons open and close panels after playback ends', async ({ page }) => {
  await page.goto('/')
  const node = (name: string) => page.locator(`[data-roblox-name="${name}"]`)
  await expect(node('LoadingScreen')).toBeHidden()
  await expect(page.getByRole('button', { name: 'Play', exact: true })).toBeVisible()
  for (const [button, panel] of [
    ['SideInventoryButton', 'Inventory'], ['SideQuestsButton', 'Quests'],
    ['SideStatsButton', 'Stats'], ['SideShopButton', 'Shop'],
    ['SideSettingsButton', 'Settings'], ['TopButton_Bell', 'Quests'],
    ['TopButton_Party', 'Stats'], ['TopButton_Settings', 'Settings'],
  ]) {
    await node(button).click({ timeout: 2500 })
    await expect(node(`${panel}PanelModal`)).toBeVisible()
    await node(`Close${panel}Button`).click()
    await expect(node(`${panel}PanelModal`)).toBeHidden()
  }
  await node('HotbarSlot_3').click()
  await expect(node('HotbarSlot_3')).toHaveCSS('border-top-color', 'rgb(0, 179, 255)')
  await node('SideShopButton').click()
  await node('BuyPotionButton').click()
  await expect(node('MoneyCounter')).toContainText('$475')
})

test('HUD layout preserves reference order and hidden labels stay hidden', async ({ page }) => {
  await page.goto('/')
  const dock = page.locator('[data-roblox-name="SideActionDock"]')
  await expect(dock).toBeVisible()
  const labels = await dock.locator('button').allTextContents()
  expect(labels.map(label => label.trim())).toEqual(['Items', 'Quests', 'Stats', 'Shop', 'Options'])
  await expect(page.locator('[data-roblox-name="ShopMoneyDisplay"]')).toBeHidden()
  const compass = page.locator('[data-roblox-name="CompassContainer"]')
  await expect(compass).toBeVisible()
  const headings = page.locator('[data-roblox-name^="Compass_"]')
  const boxes = await headings.evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top))
  expect(new Set(boxes).size).toBe(1)
})

test('expanded preview and device selection keep the canvas in view', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('button', { name: 'Expand preview' }).click()
  const mode = page.getByLabel('Viewport device mode')
  for (const device of ['Desktop', 'Tablet', 'PhonePortrait', 'PhoneLandscape']) {
    await mode.selectOption(device)
    await expect(mode).toHaveValue(device)
    await expect(async () => {
      const box = await page.locator('.ag-canvas-frame').boundingBox()
      expect(box).not.toBeNull()
      expect(box!.x).toBeGreaterThanOrEqual(-1)
      expect(box!.y).toBeGreaterThanOrEqual(0)
      expect(box!.x + box!.width).toBeLessThanOrEqual(1568)
      expect(box!.y + box!.height).toBeLessThanOrEqual(883)
    }).toPass()
  }
  await page.getByRole('button', { name: 'Exit preview' }).click()
  await expect(page.getByRole('button', { name: 'Expand preview' })).toBeVisible()
})
