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
  BackgroundColor3: { R: 0.05, G: 0.06, B: 0.09 },
  Visible: bind('Loading.Visible'),
  ZIndex: 100,
  Children: [
    // Game Title / Logo
    {
      ClassName: 'TextLabel',
      Name: 'GameTitle',
      Text: '⚡ PROJECT VITE ⚡',
      TextSize: 26,
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
      Text: 'Roblox Studio Experience · Realtime Preview',
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
      Size: { X: { Scale: 0, Offset: 380 }, Y: { Scale: 0, Offset: 12 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.54, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.1, G: 0.12, B: 0.17 },
      ClipsDescendants: true,
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
        { ClassName: 'UIStroke', Color: { R: 0.22, G: 0.26, B: 0.36 }, Thickness: 1 },
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
          BackgroundColor3: { R: 0.23, G: 0.51, B: 0.96 },
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

/**
 * Main Game HUD (Heads-Up Display)
 * Shown after loading screen completes.
 */
const mainHudTree: RobloxInstanceJson = {
  ClassName: 'Frame',
  Name: 'MainGameHud',
  Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
  BackgroundTransparency: 1,
  Visible: bind('UI.HUDVisible'),
  ZIndex: 10,
  Children: [
    // Top-Left Player Profile & Health Bar Card
    {
      ClassName: 'Frame',
      Name: 'PlayerStatsCard',
      Size: { X: { Scale: 0, Offset: 250 }, Y: { Scale: 0, Offset: 62 } },
      Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 16 } },
      BackgroundColor3: { R: 0.07, G: 0.08, B: 0.12 },
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
        { ClassName: 'UIStroke', Color: { R: 0.18, G: 0.22, B: 0.32 }, Thickness: 1 },
        {
          ClassName: 'UIPadding',
          PaddingTop: { Scale: 0, Offset: 8 },
          PaddingBottom: { Scale: 0, Offset: 8 },
          PaddingLeft: { Scale: 0, Offset: 10 },
          PaddingRight: { Scale: 0, Offset: 10 },
        },
        // Player Name & Level
        {
          ClassName: 'TextLabel',
          Name: 'PlayerNameLabel',
          Text: computed(['Player.Name', 'Player.Level'], (state) =>
            `<b>${(state.Player as { Name?: string })?.Name ?? 'Player1'}</b>  <font color="#38bdf8">Lv.${(state.Player as { Level?: number })?.Level ?? 42}</font>`,
          ),
          RichText: true,
          TextSize: 13,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 20 } },
          Position: { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 0 } },
          TextXAlignment: 'Left',
        },
        // Health Bar Track
        {
          ClassName: 'Frame',
          Name: 'HealthBarTrack',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 18 } },
          Position: { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 26 } },
          BackgroundColor3: { R: 0.16, G: 0.05, B: 0.05 },
          ClipsDescendants: true,
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 5 } },
            // Dynamic Health Fill
            {
              ClassName: 'Frame',
              Name: 'HealthBarFill',
              Size: computed(['Player.HealthPercent'], (state) => ({
                X: {
                  Scale: Math.max(0, Math.min(1, Number((state.Player as { HealthPercent?: number })?.HealthPercent ?? 1))),
                  Offset: 0,
                },
                Y: { Scale: 1, Offset: 0 },
              })),
              BackgroundColor3: { R: 0.13, G: 0.77, B: 0.35 },
              Children: [
                { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 5 } },
              ],
            },
            // Health Text Overlay
            {
              ClassName: 'TextLabel',
              Name: 'HealthTextOverlay',
              Text: computed(['Player.HealthPercent'], (state) =>
                `${Math.round(Math.max(0, Math.min(1, Number((state.Player as { HealthPercent?: number })?.HealthPercent ?? 1))) * 100)} / 100 HP`,
              ),
              TextSize: 10,
              TextColor3: { R: 1, G: 1, B: 1 },
              Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
              TextXAlignment: 'Center',
              TextYAlignment: 'Center',
            },
          ],
        },
      ],
    },

    // Top-Right Currency Display
    {
      ClassName: 'Frame',
      Name: 'CurrencyCard',
      Size: { X: { Scale: 0, Offset: 160 }, Y: { Scale: 0, Offset: 40 } },
      Position: { X: { Scale: 1, Offset: -176 }, Y: { Scale: 0, Offset: 16 } },
      BackgroundColor3: { R: 0.07, G: 0.08, B: 0.12 },
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
        { ClassName: 'UIStroke', Color: { R: 0.22, G: 0.26, B: 0.34 }, Thickness: 1 },
        {
          ClassName: 'TextLabel',
          Name: 'MoneyCounter',
          Text: bind('Player.Money', {
            Format: (v) => `🪙 $${typeof v === 'number' ? v.toLocaleString() : 0}`,
          }),
          TextSize: 14,
          TextColor3: { R: 0.96, G: 0.75, B: 0.14 },
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
          TextXAlignment: 'Center',
          TextYAlignment: 'Center',
        },
      ],
    },

    // Right-Side Action Dock (Buttons to open panels)
    {
      ClassName: 'Frame',
      Name: 'SideActionDock',
      Size: { X: { Scale: 0, Offset: 56 }, Y: { Scale: 0, Offset: 248 } },
      Position: { X: { Scale: 1, Offset: -70 }, Y: { Scale: 0.5, Offset: 0 } },
      AnchorPoint: { X: 0, Y: 0.5 },
      BackgroundTransparency: 1,
      Children: [
        {
          ClassName: 'UIListLayout',
          FillDirection: 'Vertical',
          Padding: { Scale: 0, Offset: 8 },
          HorizontalAlignment: 'Center',
          VerticalAlignment: 'Center',
        },
        // Side Shop Button
        {
          ClassName: 'TextButton',
          Name: 'SideShopButton',
          Text: '🛒\nShop',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 52 }, Y: { Scale: 0, Offset: 52 } },
          BackgroundColor3: { R: 0.1, G: 0.12, B: 0.18 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.25, G: 0.3, B: 0.42 }, Thickness: 1 },
          ],
        },
        // Side Inventory Button
        {
          ClassName: 'TextButton',
          Name: 'SideInventoryButton',
          Text: '🎒\nItems',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 52 }, Y: { Scale: 0, Offset: 52 } },
          BackgroundColor3: { R: 0.1, G: 0.12, B: 0.18 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.25, G: 0.3, B: 0.42 }, Thickness: 1 },
          ],
        },
        // Side Quests Button
        {
          ClassName: 'TextButton',
          Name: 'SideQuestsButton',
          Text: '📜\nQuests',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 52 }, Y: { Scale: 0, Offset: 52 } },
          BackgroundColor3: { R: 0.1, G: 0.12, B: 0.18 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.25, G: 0.3, B: 0.42 }, Thickness: 1 },
          ],
        },
        // Side Settings Button
        {
          ClassName: 'TextButton',
          Name: 'SideSettingsButton',
          Text: '⚙️\nOpt',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 52 }, Y: { Scale: 0, Offset: 52 } },
          BackgroundColor3: { R: 0.1, G: 0.12, B: 0.18 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            { ClassName: 'UIStroke', Color: { R: 0.25, G: 0.3, B: 0.42 }, Thickness: 1 },
          ],
        },
      ],
    },

    // Bottom Hotbar (Game inventory slots)
    {
      ClassName: 'Frame',
      Name: 'HotbarDock',
      Size: { X: { Scale: 0, Offset: 340 }, Y: { Scale: 0, Offset: 66 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 1, Offset: -14 } },
      AnchorPoint: { X: 0.5, Y: 1 },
      BackgroundColor3: { R: 0.07, G: 0.08, B: 0.12 },
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
        { ClassName: 'UIStroke', Color: { R: 0.18, G: 0.22, B: 0.32 }, Thickness: 1 },
        {
          ClassName: 'UIListLayout',
          FillDirection: 'Horizontal',
          Padding: { Scale: 0, Offset: 8 },
          HorizontalAlignment: 'Center',
          VerticalAlignment: 'Center',
        },
        // Slot 1
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_1',
          Text: '1: ⚔️ Bat',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 56 }, Y: { Scale: 0, Offset: 50 } },
          BackgroundColor3: { R: 0.12, G: 0.15, B: 0.22 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 1
                  ? { R: 0.96, G: 0.75, B: 0.14 }
                  : { R: 0.2, G: 0.24, B: 0.34 },
              ),
              Thickness: 2,
            },
          ],
        },
        // Slot 2
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_2',
          Text: '2: 🧪 Pot',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 56 }, Y: { Scale: 0, Offset: 50 } },
          BackgroundColor3: { R: 0.1, G: 0.12, B: 0.17 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 2
                  ? { R: 0.96, G: 0.75, B: 0.14 }
                  : { R: 0.2, G: 0.24, B: 0.34 },
              ),
              Thickness: 2,
            },
          ],
        },
        // Slot 3
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_3',
          Text: '3: 🛡️ Def',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 56 }, Y: { Scale: 0, Offset: 50 } },
          BackgroundColor3: { R: 0.1, G: 0.12, B: 0.17 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 3
                  ? { R: 0.96, G: 0.75, B: 0.14 }
                  : { R: 0.2, G: 0.24, B: 0.34 },
              ),
              Thickness: 2,
            },
          ],
        },
        // Slot 4
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_4',
          Text: '4: ⚡ Run',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 56 }, Y: { Scale: 0, Offset: 50 } },
          BackgroundColor3: { R: 0.1, G: 0.12, B: 0.17 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 4
                  ? { R: 0.96, G: 0.75, B: 0.14 }
                  : { R: 0.2, G: 0.24, B: 0.34 },
              ),
              Thickness: 2,
            },
          ],
        },
        // Slot 5
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_5',
          Text: '5: 🍖 Eat',
          TextSize: 11,
          TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
          Size: { X: { Scale: 0, Offset: 56 }, Y: { Scale: 0, Offset: 50 } },
          BackgroundColor3: { R: 0.1, G: 0.12, B: 0.17 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 5
                  ? { R: 0.96, G: 0.75, B: 0.14 }
                  : { R: 0.2, G: 0.24, B: 0.34 },
              ),
              Thickness: 2,
            },
          ],
        },
      ],
    },
  ],
}

/**
 * Interactive Game Modals & Panels
 * Clickable panels opened via HUD buttons or scenario actions.
 */
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
      Size: { X: { Scale: 0, Offset: 440 }, Y: { Scale: 0, Offset: 290 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.48, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.08, G: 0.09, B: 0.14 },
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Shop',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
        { ClassName: 'UIStroke', Color: { R: 0.25, G: 0.3, B: 0.45 }, Thickness: 1 },
        // Header
        {
          ClassName: 'Frame',
          Name: 'ShopHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 40 } },
          BackgroundColor3: { R: 0.11, G: 0.13, B: 0.19 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            {
              ClassName: 'TextLabel',
              Name: 'ShopTitle',
              Text: '🛒 REALM SHOP',
              TextSize: 14,
              TextColor3: { R: 0.96, G: 0.75, B: 0.14 },
              Size: { X: { Scale: 0, Offset: 180 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseShopButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -36 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.15, G: 0.18, B: 0.25 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Shop Item 1: Wooden Bat
        {
          ClassName: 'Frame',
          Name: 'ShopItem_Bat',
          Size: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 56 } },
          Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 52 } },
          BackgroundColor3: { R: 0.11, G: 0.13, B: 0.18 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
            {
              ClassName: 'TextLabel',
              Name: 'BatNameLabel',
              Text: '⚔️ Wooden Bat (+15 ATK)',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 200 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'BuyButton',
              Text: 'Buy $50',
              TextSize: 12,
              TextColor3: { R: 0.05, G: 0.06, B: 0.08 },
              Size: { X: { Scale: 0, Offset: 88 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -98 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.96, G: 0.75, B: 0.14 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Shop Item 2: Health Potion
        {
          ClassName: 'Frame',
          Name: 'ShopItem_Potion',
          Size: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 56 } },
          Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 116 } },
          BackgroundColor3: { R: 0.11, G: 0.13, B: 0.18 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
            {
              ClassName: 'TextLabel',
              Name: 'PotionNameLabel',
              Text: '🧪 Health Potion (Heal 100%)',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 200 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'BuyPotionButton',
              Text: 'Buy $25',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 88 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -98 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.16, G: 0.55, B: 0.35 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Shop Item 3: Iron Shield
        {
          ClassName: 'Frame',
          Name: 'ShopItem_Shield',
          Size: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 56 } },
          Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 180 } },
          BackgroundColor3: { R: 0.11, G: 0.13, B: 0.18 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } },
            {
              ClassName: 'TextLabel',
              Name: 'ShieldNameLabel',
              Text: '🛡️ Iron Shield (+30 DEF)',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 200 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'BuyShieldButton',
              Text: 'Buy $100',
              TextSize: 12,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 88 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -98 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.23, G: 0.45, B: 0.85 },
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
          Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 1, Offset: -30 } },
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
      BackgroundColor3: { R: 0.08, G: 0.09, B: 0.14 },
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Inventory',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
        { ClassName: 'UIStroke', Color: { R: 0.25, G: 0.3, B: 0.45 }, Thickness: 1 },
        {
          ClassName: 'Frame',
          Name: 'InventoryHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 40 } },
          BackgroundColor3: { R: 0.11, G: 0.13, B: 0.19 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            {
              ClassName: 'TextLabel',
              Name: 'InventoryTitle',
              Text: '🎒 BACKPACK (4/20)',
              TextSize: 14,
              TextColor3: { R: 0.38, G: 0.74, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 180 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseInventoryButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -36 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.15, G: 0.18, B: 0.25 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        // Grid cards
        {
          ClassName: 'Frame',
          Name: 'InvSlot1',
          Size: { X: { Scale: 0, Offset: 90 }, Y: { Scale: 0, Offset: 90 } },
          Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 54 } },
          BackgroundColor3: { R: 0.12, G: 0.15, B: 0.22 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'TextLabel',
              Name: 'InvSlot1Text',
              Text: '⚔️\nWooden Bat',
              TextSize: 11,
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
          Size: { X: { Scale: 0, Offset: 90 }, Y: { Scale: 0, Offset: 90 } },
          Position: { X: { Scale: 0, Offset: 116 }, Y: { Scale: 0, Offset: 54 } },
          BackgroundColor3: { R: 0.12, G: 0.15, B: 0.22 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'TextLabel',
              Name: 'InvSlot2Text',
              Text: '🧪\nHealth Pot',
              TextSize: 11,
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
          Size: { X: { Scale: 0, Offset: 90 }, Y: { Scale: 0, Offset: 90 } },
          Position: { X: { Scale: 0, Offset: 216 }, Y: { Scale: 0, Offset: 54 } },
          BackgroundColor3: { R: 0.12, G: 0.15, B: 0.22 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'TextLabel',
              Name: 'InvSlot3Text',
              Text: '🛡️\nIron Shield',
              TextSize: 11,
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
          Size: { X: { Scale: 0, Offset: 90 }, Y: { Scale: 0, Offset: 90 } },
          Position: { X: { Scale: 0, Offset: 316 }, Y: { Scale: 0, Offset: 54 } },
          BackgroundColor3: { R: 0.12, G: 0.15, B: 0.22 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'TextLabel',
              Name: 'InvSlot4Text',
              Text: '⚡\nBoots',
              TextSize: 11,
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
      Size: { X: { Scale: 0, Offset: 400 }, Y: { Scale: 0, Offset: 240 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.48, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.08, G: 0.09, B: 0.14 },
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Quests',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
        { ClassName: 'UIStroke', Color: { R: 0.25, G: 0.3, B: 0.45 }, Thickness: 1 },
        {
          ClassName: 'Frame',
          Name: 'QuestsHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 40 } },
          BackgroundColor3: { R: 0.11, G: 0.13, B: 0.19 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            {
              ClassName: 'TextLabel',
              Name: 'QuestsTitle',
              Text: '📜 QUEST LOG',
              TextSize: 14,
              TextColor3: { R: 0.94, G: 0.72, B: 0.25 },
              Size: { X: { Scale: 0, Offset: 180 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseQuestsButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -36 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.15, G: 0.18, B: 0.25 },
              Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 6 } }],
            },
          ],
        },
        {
          ClassName: 'TextLabel',
          Name: 'QuestEntry1',
          Text: '✓ <b>Welcome Adventurer</b> · Explore Realm [Completed]',
          RichText: true,
          TextSize: 12,
          TextColor3: { R: 0.4, G: 0.85, B: 0.45 },
          Size: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 36 } },
          Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 52 } },
          TextXAlignment: 'Left',
        },
        {
          ClassName: 'TextLabel',
          Name: 'QuestEntry2',
          Text: '• <b>Arm Yourself</b> · Purchase an item from the Shop [In Progress]',
          RichText: true,
          TextSize: 12,
          TextColor3: { R: 0.9, G: 0.92, B: 0.96 },
          Size: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 36 } },
          Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 94 } },
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
      Size: { X: { Scale: 0, Offset: 360 }, Y: { Scale: 0, Offset: 200 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.48, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      BackgroundColor3: { R: 0.08, G: 0.09, B: 0.14 },
      Visible: computed(['UI.ActivePanel'], (state) =>
        (state.UI as { ActivePanel?: string })?.ActivePanel === 'Settings',
      ),
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
        { ClassName: 'UIStroke', Color: { R: 0.25, G: 0.3, B: 0.45 }, Thickness: 1 },
        {
          ClassName: 'Frame',
          Name: 'SettingsHeader',
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 40 } },
          BackgroundColor3: { R: 0.11, G: 0.13, B: 0.19 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            {
              ClassName: 'TextLabel',
              Name: 'SettingsTitle',
              Text: '⚙️ SETTINGS',
              TextSize: 14,
              TextColor3: { R: 0.95, G: 0.96, B: 0.98 },
              Size: { X: { Scale: 0, Offset: 180 }, Y: { Scale: 1, Offset: 0 } },
              Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0, Offset: 0 } },
              TextXAlignment: 'Left',
            },
            {
              ClassName: 'TextButton',
              Name: 'CloseSettingsButton',
              Text: '✕',
              TextSize: 14,
              TextColor3: { R: 0.7, G: 0.75, B: 0.85 },
              Size: { X: { Scale: 0, Offset: 32 }, Y: { Scale: 0, Offset: 32 } },
              Position: { X: { Scale: 1, Offset: -36 }, Y: { Scale: 0.5, Offset: 0 } },
              AnchorPoint: { X: 0, Y: 0.5 },
              BackgroundColor3: { R: 0.15, G: 0.18, B: 0.25 },
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
          Size: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 30 } },
          Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 52 } },
          TextXAlignment: 'Left',
        },
        {
          ClassName: 'TextLabel',
          Name: 'GfxSetting',
          Text: '✨ Graphics Quality: Auto (Level 10)',
          TextSize: 12,
          TextColor3: { R: 0.9, G: 0.92, B: 0.96 },
          Size: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 30 } },
          Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 90 } },
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
