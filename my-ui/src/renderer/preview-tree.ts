import { mainHudTree } from './hud-tree.ts'
import type { RobloxInstanceJson } from './RobloxRenderer.tsx'
import { bind, computed } from '../bindings/reactive-bindings.ts'

/**
 * Loading Screen Overlay
 * Displays game branding and animated loading progress bar driven by scenario playback.
 */
const loadingScreenTree: RobloxInstanceJson = {
  ClassName: 'Frame',
  Name: 'LoadingScreen',
  Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
  Position: { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 0 } },
  BackgroundColor3: { R: 0.03, G: 0.04, B: 0.07 },
  Visible: bind('Loading.Visible'),
  ZIndex: 100,
  Children: [
    // Game Title / Logo
    {
      ClassName: 'TextLabel',
      Name: 'GameTitle',
      Text: '⚡ SUN CITY ⚡',
      TextSize: 28,
      TextColor3: { R: 0.98, G: 0.76, B: 0.18 },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.36, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 36 } },
      TextXAlignment: 'Center',
      TextYAlignment: 'Center',
    },
    // Subtitle
    {
      ClassName: 'TextLabel',
      Name: 'GameSubtitle',
      Text: 'San Andreas Experience · Realtime Preview',
      TextSize: 13,
      TextColor3: { R: 0.55, G: 0.62, B: 0.74 },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.43, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 24 } },
      TextXAlignment: 'Center',
      TextYAlignment: 'Center',
    },
    // Loading Progress Bar Background
    {
      ClassName: 'Frame',
      Name: 'ProgressBarBackground',
      Size: { X: { Scale: 0, Offset: 380 }, Y: { Scale: 0, Offset: 10 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.54, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.08, G: 0.11, B: 0.16 },
      ClipsDescendants: true,
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
        { ClassName: 'UIStroke', Color: { R: 0.16, G: 0.22, B: 0.32 }, Thickness: 1 },
        // Animated Fill
        {
          ClassName: 'Frame',
          Name: 'ProgressBarFill',
          Size: computed(['Loading.Progress'], (state) => ({
            X: {
              Scale: Math.min(
                1,
                Math.max(
                  0,
                  Number((state.Loading as { Progress?: number })?.Progress ?? 0),
                ),
              ),
              Offset: 0,
            },
            Y: { Scale: 1, Offset: 0 },
          })),
          Position: { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 0 } },
          BackgroundColor3: { R: 0, G: 0.7, B: 1 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
          ],
        },
      ],
    },
    // Loading Percentage Indicator
    {
      ClassName: 'TextLabel',
      Name: 'ProgressPercentLabel',
      Text: bind('Loading.Progress', {
        Format: (val) => `${Math.round(Number(val ?? 0) * 100)}%`,
      }),
      TextSize: 12,
      TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.59, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0 },
      Size: { X: { Scale: 0, Offset: 80 }, Y: { Scale: 0, Offset: 20 } },
      TextXAlignment: 'Center',
      TextYAlignment: 'Center',
    },
    // Status message
    {
      ClassName: 'TextLabel',
      Name: 'LoadingStatusLabel',
      Text: bind('Loading.Status'),
      TextSize: 12,
      TextColor3: { R: 0.65, G: 0.72, B: 0.84 },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.65, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 20 } },
      TextXAlignment: 'Center',
      TextYAlignment: 'Center',
    },
  ],
}

const gameModalsTree: RobloxInstanceJson = {
  ClassName: 'Frame',
  Name: 'GameModalsContainer',
  Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
  BackgroundTransparency: 1,
  ZIndex: 50,
  Children: [
    // ----------------------------------------------------
    // Shop Panel Modal
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'ShopPanelModal',
      Size: { X: { Scale: 0, Offset: 460 }, Y: { Scale: 0, Offset: 310 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.48, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
      BackgroundTransparency: 0.15,
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Shop',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
        { ClassName: 'UIStroke', Color: { R: 0.2, G: 0.3, B: 0.48 }, Thickness: 1.5 },
        // Header
        {
          ClassName: 'Frame',
          Name: 'ShopHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 44 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
            {
              ClassName: 'TextLabel',
              Name: 'ShopTitle',
              Text: '🛒 SUN CITY WEAPONS & GEAR',
              TextSize: 13,
              TextColor3: { R: 0.98, G: 0.76, B: 0.18 },
              Size: { X: { Scale: 0, Offset: 260 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseShopButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -38 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.12, G: 0.16, B: 0.24 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Shop Item 1: Bat
        {
          ClassName: 'Frame',
          Name: 'ShopItem_Bat',
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 58 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 56 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.15 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
            {
              ClassName: 'TextLabel',
              Name: 'BatNameLabel',
              Text: '🏏 Wooden Baseball Bat (+15 ATK)',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 240 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'BuyButton',
              Text: 'Buy $50',
              TextSize: 12,
              TextColor3: { R: 0.05, G: 0.06, B: 0.08 },
              Size: { X: { Scale: 0, Offset: 90 }, Y: { Scale: 0, Offset: 34 } },
              Position: { X: { Scale: 1, Offset: -100 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.98, G: 0.76, B: 0.18 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Shop Item 2: Potion
        {
          ClassName: 'Frame',
          Name: 'ShopItem_Potion',
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 58 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 124 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.15 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
            {
              ClassName: 'TextLabel',
              Name: 'PotionNameLabel',
              Text: '🪴 Herbal Tonic (Heal 100%)',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 240 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'BuyPotionButton',
              Text: 'Buy $25',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 90 }, Y: { Scale: 0, Offset: 34 } },
              Position: { X: { Scale: 1, Offset: -100 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.13, G: 0.65, B: 0.38 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Shop Item 3: Shield
        {
          ClassName: 'Frame',
          Name: 'ShopItem_Shield',
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 58 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 192 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.15 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
            {
              ClassName: 'TextLabel',
              Name: 'ShieldNameLabel',
              Text: '🛡️ Riot Shield (+30 DEF)',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 240 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'BuyShieldButton',
              Text: 'Buy $100',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 90 }, Y: { Scale: 0, Offset: 34 } },
              Position: { X: { Scale: 1, Offset: -100 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.18, G: 0.44, B: 0.8 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Balance Footer
        {
          ClassName: 'TextLabel',
          Name: 'ShopBalanceFooter',
          Text: bind('Player.Money', {
            Format: (v) => `Available Balance: $${typeof v === 'number' ? v.toLocaleString() : 0}`,
          }),
          TextSize: 11,
          TextColor3: { R: 0.6, G: 0.68, B: 0.8 },
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 24 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 1, Offset: -30 } },
          TextXAlignment: 'Left',
        },
      ],
    },

    // ----------------------------------------------------
    // Inventory Panel Modal
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'InventoryPanelModal',
      Size: { X: { Scale: 0, Offset: 420 }, Y: { Scale: 0, Offset: 260 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.48, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
      BackgroundTransparency: 0.15,
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Inventory',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
        { ClassName: 'UIStroke', Color: { R: 0.2, G: 0.3, B: 0.48 }, Thickness: 1.5 },
        {
          ClassName: 'Frame',
          Name: 'InventoryHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 44 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
            {
              ClassName: 'TextLabel',
              Name: 'InventoryTitle',
              Text: '🎒 BACKPACK & ITEMS (5/20)',
              TextSize: 13,
              TextColor3: { R: 0.38, G: 0.74, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 220 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseInventoryButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -38 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.12, G: 0.16, B: 0.24 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Grid cards
        {
          ClassName: 'Frame',
          Name: 'InvSlot1',
          Size: { X: { Scale: 0, Offset: 88 }, Y: { Scale: 0, Offset: 88 } },
          Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 58 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
            {
              ClassName: 'TextLabel',
              Name: 'InvSlot1Text',
              Text: '🏏\nBat',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
              TextXAlignment: 'Center',
              TextYAlignment: 'Center',
            },
          ],
        },
        {
          ClassName: 'Frame',
          Name: 'InvSlot2',
          Size: { X: { Scale: 0, Offset: 88 }, Y: { Scale: 0, Offset: 88 } },
          Position: { X: { Scale: 0, Offset: 114 }, Y: { Scale: 0, Offset: 58 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
            {
              ClassName: 'TextLabel',
              Name: 'InvSlot2Text',
              Text: '🪴\nPot',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
              TextXAlignment: 'Center',
              TextYAlignment: 'Center',
            },
          ],
        },
        {
          ClassName: 'Frame',
          Name: 'InvSlot3',
          Size: { X: { Scale: 0, Offset: 88 }, Y: { Scale: 0, Offset: 88 } },
          Position: { X: { Scale: 0, Offset: 212 }, Y: { Scale: 0, Offset: 58 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
            {
              ClassName: 'TextLabel',
              Name: 'InvSlot3Text',
              Text: '🛡️\nDefend',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
              TextXAlignment: 'Center',
              TextYAlignment: 'Center',
            },
          ],
        },
        {
          ClassName: 'Frame',
          Name: 'InvSlot4',
          Size: { X: { Scale: 0, Offset: 88 }, Y: { Scale: 0, Offset: 88 } },
          Position: { X: { Scale: 0, Offset: 310 }, Y: { Scale: 0, Offset: 58 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
            {
              ClassName: 'TextLabel',
              Name: 'InvSlot4Text',
              Text: '🍔\nBurger',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
              TextXAlignment: 'Center',
              TextYAlignment: 'Center',
            },
          ],
        },
      ],
    },

    // ----------------------------------------------------
    // Quests Panel Modal
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'QuestsPanelModal',
      Size: { X: { Scale: 0, Offset: 420 }, Y: { Scale: 0, Offset: 250 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.48, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
      BackgroundTransparency: 0.15,
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Quests',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
        { ClassName: 'UIStroke', Color: { R: 0.2, G: 0.3, B: 0.48 }, Thickness: 1.5 },
        {
          ClassName: 'Frame',
          Name: 'QuestsHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 44 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
            {
              ClassName: 'TextLabel',
              Name: 'QuestsTitle',
              Text: '📄 ACTIVE QUESTS',
              TextSize: 13,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 180 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseQuestsButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -38 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.12, G: 0.16, B: 0.24 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        {
          ClassName: 'TextLabel',
          Name: 'QuestEntry1',
          Text: '✓ <b>Welcome to Sun City</b> · Reach San Andreas Ave [Complete]',
          RichText: true,
          TextSize: 12,
          TextColor3: { R: 0, G: 0.9, B: 0.46 },
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 38 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 58 } },
          TextXAlignment: 'Left',
        },
        {
          ClassName: 'TextLabel',
          Name: 'QuestEntry2',
          Text: '• <b>Equip Weapon</b> · Acquire a Bat from the Shop [In Progress]',
          RichText: true,
          TextSize: 12,
          TextColor3: { R: 0.9, G: 0.92, B: 0.96 },
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 38 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 104 } },
          TextXAlignment: 'Left',
        },
      ],
    },

    // ----------------------------------------------------
    // Stats Panel Modal
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'StatsPanelModal',
      Size: { X: { Scale: 0, Offset: 380 }, Y: { Scale: 0, Offset: 230 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.48, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
      BackgroundTransparency: 0.15,
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Stats',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
        { ClassName: 'UIStroke', Color: { R: 0.2, G: 0.3, B: 0.48 }, Thickness: 1.5 },
        {
          ClassName: 'Frame',
          Name: 'StatsHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 44 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
            {
              ClassName: 'TextLabel',
              Name: 'StatsTitle',
              Text: '📊 PLAYER STATISTICS',
              TextSize: 13,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 180 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseStatsButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -38 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.12, G: 0.16, B: 0.24 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        {
          ClassName: 'TextLabel',
          Name: 'StatRow1',
          Text: 'Level: <b>42</b> &nbsp;·&nbsp; Total EXP: <b>142,500</b>',
          RichText: true,
          TextSize: 12,
          TextColor3: { R: 0.9, G: 0.92, B: 0.96 },
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 32 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 58 } },
          TextXAlignment: 'Left',
        },
        {
          ClassName: 'TextLabel',
          Name: 'StatRow2',
          Text: 'Combat Rating: <b>Tier 4 Elite</b>',
          RichText: true,
          TextSize: 12,
          TextColor3: { R: 0.9, G: 0.92, B: 0.96 },
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 32 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 96 } },
          TextXAlignment: 'Left',
        },
        {
          ClassName: 'TextLabel',
          Name: 'StatRow3',
          Text: 'Location: <b>Sun City, San Andreas Ave</b>',
          RichText: true,
          TextSize: 12,
          TextColor3: { R: 0.9, G: 0.92, B: 0.96 },
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 32 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 134 } },
          TextXAlignment: 'Left',
        },
      ],
    },

    // ----------------------------------------------------
    // Settings Panel Modal
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'SettingsPanelModal',
      Size: { X: { Scale: 0, Offset: 380 }, Y: { Scale: 0, Offset: 220 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.48, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
      BackgroundTransparency: 0.15,
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Settings',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
        { ClassName: 'UIStroke', Color: { R: 0.2, G: 0.3, B: 0.48 }, Thickness: 1.5 },
        {
          ClassName: 'Frame',
          Name: 'SettingsHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 44 } },
          BackgroundColor3: { R: 0.07, G: 0.1, B: 0.16 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
            {
              ClassName: 'TextLabel',
              Name: 'SettingsTitle',
              Text: '⚙️ GAME OPTIONS',
              TextSize: 13,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 180 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseSettingsButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -38 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.12, G: 0.16, B: 0.24 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        {
          ClassName: 'TextLabel',
          Name: 'AudioSetting',
          Text: '🔊 Master Sound: ON (80%)',
          TextSize: 12,
          TextColor3: { R: 0.9, G: 0.92, B: 0.96 },
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 32 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 58 } },
          TextXAlignment: 'Left',
        },
        {
          ClassName: 'TextLabel',
          Name: 'GfxSetting',
          Text: '✨ Graphics Quality: High (Level 10)',
          TextSize: 12,
          TextColor3: { R: 0.9, G: 0.92, B: 0.96 },
          Size: { X: { Scale: 1, Offset: -28 }, Y: { Scale: 0, Offset: 32 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 96 } },
          TextXAlignment: 'Left',
        },
      ],
    },
  ],
}

export const previewTrees: RobloxInstanceJson[] = [
  loadingScreenTree,
  mainHudTree,
  gameModalsTree,
]

export const previewTree: RobloxInstanceJson = {
  ClassName: 'ScreenGui',
  Name: 'RendererPreviewGui',
  Children: previewTrees,
}
