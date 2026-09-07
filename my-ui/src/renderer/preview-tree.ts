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

/**
 * Main Game HUD (Heads-Up Display)
 * Matches the reference design with dark tactical glass aesthetic.
 */
const mainHudTree: RobloxInstanceJson = {
  ClassName: 'Frame',
  Name: 'MainGameHud',
  Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
  BackgroundTransparency: 1,
  Visible: bind('UI.HUDVisible'),
  ZIndex: 10,
  Children: [
    // ----------------------------------------------------
    // 1. TOP-LEFT: Player Profile & Health Bar Card
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'PlayerStatsCard',
      Size: { X: { Scale: 0, Offset: 350 }, Y: { Scale: 0, Offset: 82 } },
      Position: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 0, Offset: 24 } },
      BackgroundColor3: { R: 0.03, G: 0.05, B: 0.09 },
      BackgroundTransparency: 0.25,
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 16 } },
        { ClassName: 'UIStroke', Color: { R: 0.12, G: 0.22, B: 0.36 }, Thickness: 1.5 },
        // Circular Avatar Silhouette
        {
          ClassName: 'Frame',
          Name: 'AvatarCircle',
          Size: { X: { Scale: 0, Offset: 54 }, Y: { Scale: 0, Offset: 54 } },
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0.5, Offset: 0 } },
          AnchorPoint: { X: 0, Y: 0.5 },
          BackgroundColor3: { R: 0.07, G: 0.11, B: 0.18 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0.5, Offset: 0 } },
            { ClassName: 'UIStroke', Color: { R: 0.16, G: 0.38, B: 0.6 }, Thickness: 1.5 },
            {
              ClassName: 'TextLabel',
              Name: 'AvatarSilhouette',
              Text: '👤',
              TextSize: 26,
              Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
              TextXAlignment: 'Center',
              TextYAlignment: 'Center',
            },
          ],
        },
        // Player Name & Level
        {
          ClassName: 'TextLabel',
          Name: 'PlayerNameLabel',
          Position: { X: { Scale: 0, Offset: 80 }, Y: { Scale: 0, Offset: 15 } },
          Size: { X: { Scale: 1, Offset: -90 }, Y: { Scale: 0, Offset: 22 } },
          RichText: true,
          Text: computed(['Player.Name', 'Player.Level'], (state) =>
            `<b style="color:#ffffff;font-size:15px;">${(state.Player as { Name?: string })?.Name ?? 'Player1'}</b> &nbsp; <font color="#38bdf8"><b>Lv. ${(state.Player as { Level?: number })?.Level ?? 42}</b></font>`,
          ),
          TextSize: 14,
          TextColor3: { R: 1, G: 1, B: 1 },
          TextXAlignment: 'Left',
        },
        // Health Bar Track & Heart Icon
        {
          ClassName: 'TextLabel',
          Name: 'HealthHeartIcon',
          Position: { X: { Scale: 0, Offset: 80 }, Y: { Scale: 0, Offset: 44 } },
          Size: { X: { Scale: 0, Offset: 20 }, Y: { Scale: 0, Offset: 20 } },
          Text: '💚',
          TextSize: 13,
          TextXAlignment: 'Center',
          TextYAlignment: 'Center',
        },
        {
          ClassName: 'Frame',
          Name: 'HealthBarTrack',
          Size: { X: { Scale: 0, Offset: 232 }, Y: { Scale: 0, Offset: 20 } },
          Position: { X: { Scale: 0, Offset: 104 }, Y: { Scale: 0, Offset: 44 } },
          BackgroundColor3: { R: 0.02, G: 0.16, B: 0.08 },
          ClipsDescendants: true,
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            // Neon Lime Green Health Fill
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
              BackgroundColor3: { R: 0, G: 0.9, B: 0.46 },
              Children: [
                { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
              ],
            },
            // Health Text Overlay (100 / 100 HP)
            {
              ClassName: 'TextLabel',
              Name: 'HealthTextOverlay',
              Text: computed(['Player.HealthPercent'], (state) =>
                `${Math.round(Math.max(0, Math.min(1, Number((state.Player as { HealthPercent?: number })?.HealthPercent ?? 1))) * 100)} / 100 HP`,
              ),
              TextSize: 11,
              TextColor3: { R: 1, G: 1, B: 1 },
              Size: { X: { Scale: 1, Offset: -10 }, Y: { Scale: 1, Offset: 0 } },
              TextXAlignment: 'Right',
              TextYAlignment: 'Center',
            },
          ],
        },
      ],
    },

    // ----------------------------------------------------
    // 2. TOP-CENTER: Tactical Compass Bar
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'CompassBar',
      Size: { X: { Scale: 0, Offset: 420 }, Y: { Scale: 0, Offset: 40 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0, Offset: 16 } },
      AnchorPoint: { X: 0.5, Y: 0 },
      BackgroundTransparency: 1,
      Children: [
        {
          ClassName: 'TextLabel',
          Name: 'CompassHeading',
          RichText: true,
          Text: 'W &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; NW &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <b style="color:#ffffff;">▼<br/>N</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; NE &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; E',
          TextSize: 12,
          TextColor3: { R: 0.55, G: 0.62, B: 0.74 },
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
          TextXAlignment: 'Center',
          TextYAlignment: 'Center',
        },
      ],
    },

    // ----------------------------------------------------
    // 3. TOP-RIGHT: Currency Display + Quick Header Buttons
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'TopRightDock',
      Size: { X: { Scale: 0, Offset: 310 }, Y: { Scale: 0, Offset: 46 } },
      Position: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 24 } },
      AnchorPoint: { X: 1, Y: 0 },
      BackgroundTransparency: 1,
      Children: [
        // Currency Card
        {
          ClassName: 'Frame',
          Name: 'CurrencyCard',
          Size: { X: { Scale: 0, Offset: 130 }, Y: { Scale: 1, Offset: 0 } },
          Position: { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 0 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
            {
              ClassName: 'TextLabel',
              Name: 'MoneyCounter',
              RichText: true,
              Text: bind('Player.Money', {
                Format: (v) => `🟡 <span style="color:#fbbf24;font-weight:700;">$${typeof v === 'number' ? v.toLocaleString() : 0}</span>`,
              }),
              TextSize: 15,
              TextColor3: { R: 0.98, G: 0.75, B: 0.14 },
              Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
              TextXAlignment: 'Center',
              TextYAlignment: 'Center',
            },
          ],
        },
        // Vertical Divider
        {
          ClassName: 'Frame',
          Name: 'TopHeaderDivider',
          Size: { X: { Scale: 0, Offset: 1 }, Y: { Scale: 0, Offset: 26 } },
          Position: { X: { Scale: 0, Offset: 142 }, Y: { Scale: 0.5, Offset: 0 } },
          AnchorPoint: { X: 0, Y: 0.5 },
          BackgroundColor3: { R: 0.18, G: 0.22, B: 0.32 },
        },
        // Bell Button
        {
          ClassName: 'TextButton',
          Name: 'TopButton_Bell',
          Size: { X: { Scale: 0, Offset: 46 }, Y: { Scale: 1, Offset: 0 } },
          Position: { X: { Scale: 0, Offset: 156 }, Y: { Scale: 0, Offset: 0 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          Text: '🔔',
          TextSize: 14,
          TextColor3: { R: 0.85, G: 0.88, B: 0.95 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
          ],
        },
        // Party/Group Button
        {
          ClassName: 'TextButton',
          Name: 'TopButton_Party',
          Size: { X: { Scale: 0, Offset: 46 }, Y: { Scale: 1, Offset: 0 } },
          Position: { X: { Scale: 0, Offset: 208 }, Y: { Scale: 0, Offset: 0 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          Text: '👥',
          TextSize: 14,
          TextColor3: { R: 0.85, G: 0.88, B: 0.95 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
          ],
        },
        // Settings Button
        {
          ClassName: 'TextButton',
          Name: 'TopButton_Settings',
          Size: { X: { Scale: 0, Offset: 46 }, Y: { Scale: 1, Offset: 0 } },
          Position: { X: { Scale: 0, Offset: 260 }, Y: { Scale: 0, Offset: 0 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          Text: '⚙️',
          TextSize: 14,
          TextColor3: { R: 0.85, G: 0.88, B: 0.95 },
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
          ],
        },
      ],
    },

    // ----------------------------------------------------
    // 4. BOTTOM-LEFT: Location & Weather Card
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'LocationWeatherCard',
      Size: { X: { Scale: 0, Offset: 260 }, Y: { Scale: 0, Offset: 74 } },
      Position: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 1, Offset: -24 } },
      AnchorPoint: { X: 0, Y: 1 },
      BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
      BackgroundTransparency: 0.35,
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
        { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
        // Location Pin Icon
        {
          ClassName: 'TextLabel',
          Name: 'LocationPinIcon',
          Position: { X: { Scale: 0, Offset: 14 }, Y: { Scale: 0.5, Offset: 0 } },
          AnchorPoint: { X: 0, Y: 0.5 },
          Size: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 0, Offset: 24 } },
          Text: '📍',
          TextSize: 22,
          TextColor3: { R: 1, G: 1, B: 1 },
          TextXAlignment: 'Center',
          TextYAlignment: 'Center',
        },
        // Location text
        {
          ClassName: 'TextLabel',
          Name: 'LocationAddressText',
          Position: { X: { Scale: 0, Offset: 44 }, Y: { Scale: 0, Offset: 18 } },
          Size: { X: { Scale: 0, Offset: 110 }, Y: { Scale: 0, Offset: 38 } },
          RichText: true,
          Text: '<b style="color:#ffffff;font-size:13px;">Sun City</b><br/><span style="color:#78869c;font-size:10px;">San Andreas Ave</span>',
          TextSize: 12,
          TextColor3: { R: 1, G: 1, B: 1 },
          TextXAlignment: 'Left',
        },
        // Weather and Time
        {
          ClassName: 'TextLabel',
          Name: 'WeatherTimeText',
          Position: { X: { Scale: 1, Offset: -94 }, Y: { Scale: 0, Offset: 18 } },
          Size: { X: { Scale: 0, Offset: 84 }, Y: { Scale: 0, Offset: 38 } },
          RichText: true,
          Text: '<span style="color:#ffffff;font-size:12px;">☁️ 18°C</span><br/><span style="color:#78869c;font-size:10px;">12:24 PM</span>',
          TextSize: 12,
          TextColor3: { R: 1, G: 1, B: 1 },
          TextXAlignment: 'Left',
        },
      ],
    },

    // ----------------------------------------------------
    // 5. BOTTOM-CENTER: 5-Slot Hotbar Dock
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'HotbarDock',
      Size: { X: { Scale: 0, Offset: 420 }, Y: { Scale: 0, Offset: 88 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 1, Offset: -24 } },
      AnchorPoint: { X: 0.5, Y: 1 },
      BackgroundColor3: { R: 0.03, G: 0.05, B: 0.09 },
      BackgroundTransparency: 0.35,
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 14 } },
        { ClassName: 'UIStroke', Color: { R: 0.12, G: 0.18, B: 0.28 }, Thickness: 1 },
        // Slot 1: Bat (Default Selected)
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_1',
          Size: { X: { Scale: 0, Offset: 74 }, Y: { Scale: 0, Offset: 74 } },
          Position: { X: { Scale: 0, Offset: 8 }, Y: { Scale: 0.5, Offset: 0 } },
          AnchorPoint: { X: 0, Y: 0.5 },
          BackgroundColor3: { R: 0.05, G: 0.08, B: 0.13 },
          RichText: true,
          Text: '<div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="position:absolute;top:3px;left:5px;font-size:10px;font-weight:700;color:#94a3b8;border:1px solid #1e293b;border-radius:3px;padding:0 3px;background:#0b111e;">1</span><span style="font-size:26px;transform:rotate(-20deg);display:inline-block;margin-top:2px;">🏏</span><span style="font-size:10px;color:#e2e8f0;margin-top:2px;font-weight:500;">Bat</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 1
                  ? { R: 0, G: 0.7, B: 1 }
                  : { R: 0.14, G: 0.18, B: 0.26 },
              ),
              Thickness: 2,
            },
          ],
        },
        // Slot 2: Pot
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_2',
          Size: { X: { Scale: 0, Offset: 74 }, Y: { Scale: 0, Offset: 74 } },
          Position: { X: { Scale: 0, Offset: 90 }, Y: { Scale: 0.5, Offset: 0 } },
          AnchorPoint: { X: 0, Y: 0.5 },
          BackgroundColor3: { R: 0.05, G: 0.08, B: 0.13 },
          RichText: true,
          Text: '<div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="position:absolute;top:3px;left:5px;font-size:10px;font-weight:700;color:#94a3b8;border:1px solid #1e293b;border-radius:3px;padding:0 3px;background:#0b111e;">2</span><span style="font-size:24px;margin-top:2px;">🪴</span><span style="font-size:10px;color:#e2e8f0;margin-top:2px;font-weight:500;">Pot</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 2
                  ? { R: 0, G: 0.7, B: 1 }
                  : { R: 0.14, G: 0.18, B: 0.26 },
              ),
              Thickness: 2,
            },
          ],
        },
        // Slot 3: Defend
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_3',
          Size: { X: { Scale: 0, Offset: 74 }, Y: { Scale: 0, Offset: 74 } },
          Position: { X: { Scale: 0, Offset: 172 }, Y: { Scale: 0.5, Offset: 0 } },
          AnchorPoint: { X: 0, Y: 0.5 },
          BackgroundColor3: { R: 0.05, G: 0.08, B: 0.13 },
          RichText: true,
          Text: '<div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="position:absolute;top:3px;left:5px;font-size:10px;font-weight:700;color:#94a3b8;border:1px solid #1e293b;border-radius:3px;padding:0 3px;background:#0b111e;">3</span><span style="font-size:24px;margin-top:2px;">🛡️</span><span style="font-size:10px;color:#e2e8f0;margin-top:2px;font-weight:500;">Defend</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 3
                  ? { R: 0, G: 0.7, B: 1 }
                  : { R: 0.14, G: 0.18, B: 0.26 },
              ),
              Thickness: 2,
            },
          ],
        },
        // Slot 4: Run
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_4',
          Size: { X: { Scale: 0, Offset: 74 }, Y: { Scale: 0, Offset: 74 } },
          Position: { X: { Scale: 0, Offset: 254 }, Y: { Scale: 0.5, Offset: 0 } },
          AnchorPoint: { X: 0, Y: 0.5 },
          BackgroundColor3: { R: 0.05, G: 0.08, B: 0.13 },
          RichText: true,
          Text: '<div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="position:absolute;top:3px;left:5px;font-size:10px;font-weight:700;color:#94a3b8;border:1px solid #1e293b;border-radius:3px;padding:0 3px;background:#0b111e;">4</span><span style="font-size:24px;margin-top:2px;">🏃</span><span style="font-size:10px;color:#e2e8f0;margin-top:2px;font-weight:500;">Run</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 4
                  ? { R: 0, G: 0.7, B: 1 }
                  : { R: 0.14, G: 0.18, B: 0.26 },
              ),
              Thickness: 2,
            },
          ],
        },
        // Slot 5: Eat
        {
          ClassName: 'TextButton',
          Name: 'HotbarSlot_5',
          Size: { X: { Scale: 0, Offset: 74 }, Y: { Scale: 0, Offset: 74 } },
          Position: { X: { Scale: 0, Offset: 336 }, Y: { Scale: 0.5, Offset: 0 } },
          AnchorPoint: { X: 0, Y: 0.5 },
          BackgroundColor3: { R: 0.05, G: 0.08, B: 0.13 },
          RichText: true,
          Text: '<div style="position:relative;width:100%;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;"><span style="position:absolute;top:3px;left:5px;font-size:10px;font-weight:700;color:#94a3b8;border:1px solid #1e293b;border-radius:3px;padding:0 3px;background:#0b111e;">5</span><span style="font-size:24px;margin-top:2px;">🍔</span><span style="font-size:10px;color:#e2e8f0;margin-top:2px;font-weight:500;">Eat</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
            {
              ClassName: 'UIStroke',
              Color: computed(['Player.SelectedSlot'], (s) =>
                (s.Player as { SelectedSlot?: number })?.SelectedSlot === 5
                  ? { R: 0, G: 0.7, B: 1 }
                  : { R: 0.14, G: 0.18, B: 0.26 },
              ),
              Thickness: 2,
            },
          ],
        },
      ],
    },

    // ----------------------------------------------------
    // 6. BOTTOM-RIGHT: Keybind Tooltip
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'KeybindTooltip',
      Size: { X: { Scale: 0, Offset: 195 }, Y: { Scale: 0, Offset: 42 } },
      Position: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 1, Offset: -24 } },
      AnchorPoint: { X: 1, Y: 1 },
      BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
      BackgroundTransparency: 0.35,
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
        { ClassName: 'UIStroke', Color: { R: 0.12, G: 0.18, B: 0.28 }, Thickness: 1 },
        {
          ClassName: 'TextLabel',
          Name: 'KeybindText',
          RichText: true,
          Text: 'Press <span style="display:inline-block;padding:1px 6px;margin:0 4px;background:#0d1522;border:1px solid #23344d;border-radius:4px;font-family:monospace;font-size:10px;color:#ffffff;font-weight:bold;">TAB</span> to open cursor',
          TextSize: 11,
          TextColor3: { R: 0.65, G: 0.72, B: 0.84 },
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
          TextXAlignment: 'Center',
          TextYAlignment: 'Center',
        },
      ],
    },

    // ----------------------------------------------------
    // 7. RIGHT-SIDE: Vertical Action Dock (Items, Quests, Stats, Shop, Options)
    // ----------------------------------------------------
    {
      ClassName: 'Frame',
      Name: 'SideActionDock',
      Size: { X: { Scale: 0, Offset: 62 }, Y: { Scale: 0, Offset: 370 } },
      Position: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0.5, Offset: 0 } },
      AnchorPoint: { X: 1, Y: 0.5 },
      BackgroundTransparency: 1,
      Children: [
        {
          ClassName: 'UIListLayout',
          FillDirection: 'Vertical',
          Padding: { Scale: 0, Offset: 10 },
          HorizontalAlignment: 'Center',
          VerticalAlignment: 'Center',
        },
        // 1: Items / Backpack
        {
          ClassName: 'TextButton',
          Name: 'SideInventoryButton',
          Size: { X: { Scale: 0, Offset: 58 }, Y: { Scale: 0, Offset: 62 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          RichText: true,
          Text: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;"><span style="font-size:22px;color:#38bdf8;">🎒</span><span style="font-size:10px;color:#f8fafc;font-weight:500;">Items</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.16, G: 0.3, B: 0.48 }, Thickness: 1 },
          ],
        },
        // 2: Quests
        {
          ClassName: 'TextButton',
          Name: 'SideQuestsButton',
          Size: { X: { Scale: 0, Offset: 58 }, Y: { Scale: 0, Offset: 62 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          RichText: true,
          Text: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;"><span style="font-size:20px;color:#e2e8f0;">📄</span><span style="font-size:10px;color:#f8fafc;font-weight:500;">Quests</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
          ],
        },
        // 3: Stats
        {
          ClassName: 'TextButton',
          Name: 'SideStatsButton',
          Size: { X: { Scale: 0, Offset: 58 }, Y: { Scale: 0, Offset: 62 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          RichText: true,
          Text: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;"><span style="font-size:20px;color:#e2e8f0;">📊</span><span style="font-size:10px;color:#f8fafc;font-weight:500;">Stats</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
          ],
        },
        // 4: Shop
        {
          ClassName: 'TextButton',
          Name: 'SideShopButton',
          Size: { X: { Scale: 0, Offset: 58 }, Y: { Scale: 0, Offset: 62 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          RichText: true,
          Text: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;"><span style="font-size:20px;color:#e2e8f0;">🛒</span><span style="font-size:10px;color:#f8fafc;font-weight:500;">Shop</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
          ],
        },
        // 5: Options / Settings
        {
          ClassName: 'TextButton',
          Name: 'SideSettingsButton',
          Size: { X: { Scale: 0, Offset: 58 }, Y: { Scale: 0, Offset: 62 } },
          BackgroundColor3: { R: 0.04, G: 0.06, B: 0.1 },
          BackgroundTransparency: 0.35,
          RichText: true,
          Text: '<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;gap:3px;"><span style="font-size:20px;color:#e2e8f0;">⚙️</span><span style="font-size:10px;color:#f8fafc;font-weight:500;">Options</span></div>',
          Children: [
            { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
            { ClassName: 'UIStroke', Color: { R: 0.14, G: 0.2, B: 0.3 }, Thickness: 1 },
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
