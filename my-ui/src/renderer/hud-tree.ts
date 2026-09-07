import type { RobloxInstanceJson as Node } from './RobloxRenderer.tsx'
import { bind, computed } from '../bindings/reactive-bindings.ts'
import { hudIcon, type HudIcon } from './hud-icons.ts'

const color = (R: number, G: number, B: number) => ({ R, G, B })
const white = color(.86, .9, .97)
const muted = color(.62, .69, .8)
const stroke = color(.14, .19, .27)
const cyan = color(0, .7, 1)
const size = (x: number, y: number) => ({ X: { Scale: 0, Offset: x }, Y: { Scale: 0, Offset: y } })
const position = (x: number, y: number, sx = 0, sy = 0) => ({ X: { Scale: sx, Offset: x }, Y: { Scale: sy, Offset: y } })
const corner = (radius = 10): Node => ({ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: radius } })
const border = (): Node => ({ ClassName: 'UIStroke', Color: stroke, Thickness: 1 })
const frame = (Name: string, width: number, height: number, x: number, y: number, Children: Node[], extra: Partial<Node> = {}): Node => ({
  ClassName: 'Frame', Name, Size: size(width, height), Position: position(x, y),
  BackgroundTransparency: 1, Children, ...extra,
})
const panel = (Name: string, width: number, height: number, x: number, y: number, Children: Node[], extra: Partial<Node> = {}): Node =>
  frame(Name, width, height, x, y, [corner(), border(), ...Children], {
    BackgroundColor3: color(.035, .05, .075), BackgroundTransparency: .22, ...extra,
  })
const label = (Name: string, Text: unknown, width: number, height: number, x: number, y: number, TextSize = 12, extra: Partial<Node> = {}): Node => ({
  ClassName: 'TextLabel', Name, Text, TextSize, TextColor3: white,
  BackgroundTransparency: 1, Size: size(width, height), Position: position(x, y),
  TextXAlignment: 'Left', TextYAlignment: 'Center', ...extra,
})
const icon = (Name: string, artwork: HudIcon, width: number, height: number, x: number, y: number, glyphSize = 26): Node =>
  label(Name, hudIcon(artwork, glyphSize), width, height, x, y, 12, { RichText: true })
const button = (Name: string, artwork: HudIcon, width: number, height: number, x: number, y: number, Children: Node[] = [], extra: Partial<Node> = {}): Node =>
  panel(Name, width, height, x, y, [icon(`${Name}Icon`, artwork, width, height, 0, 0, 22), ...Children], {
    ClassName: 'TextButton', Text: '', ...extra,
  })

export const mainHudTree: Node = {
  ClassName: 'Frame', Name: 'MainGameHud',
  Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
  BackgroundTransparency: 1, Visible: bind('UI.HUDVisible'), ZIndex: 10,
  Children: [
    panel('PlayerStatsCard', 356, 70, 18, 22, [
      panel('AvatarCircle', 58, 58, 12, 6, [
        icon('AvatarSilhouette', 'avatar', 56, 56, 0, 2, 56),
      ], { BackgroundColor3: color(.09, .13, .19), ClipsDescendants: true }),
      label('PlayerNameLabel', bind('Player.Name'), 74, 23, 90, 10, 18, { FontFace: { Family: 'Arial', Weight: 'Bold', Style: 'Normal' } }),
      label('PlayerLevelLabel', bind('Player.Level', { Format: value => `Lv. ${value}` }), 74, 23, 165, 11, 14, { TextColor3: cyan }),
      icon('HealthHeartIcon', 'heart', 16, 18, 89, 41, 16),
      frame('HealthBarTrack', 227, 16, 113, 42, [
        corner(8),
        frame('HealthBarFill', 227, 16, 0, 0, [corner(8)], {
          BackgroundColor3: color(0, .81, .32), BackgroundTransparency: 0,
          Size: computed(['Player.HealthPercent'], state => ({ X: { Scale: Math.max(0, Math.min(1, Number((state.Player as { HealthPercent?: number })?.HealthPercent ?? 1))), Offset: 0 }, Y: { Scale: 1, Offset: 0 } })),
        }),
        label('HealthLabel', bind('Player.HealthPercent', { Format: value => `${Math.round(Number(value ?? 1) * 100)} / 100 HP` }), 219, 16, 0, 0, 12, { TextXAlignment: 'Right' }),
      ], { BackgroundColor3: color(.02, .16, .08), BackgroundTransparency: 0, ClipsDescendants: true }),
    ]),
    frame('CompassContainer', 386, 44, 0, 20, [
      frame('CompassRule', 386, 1, 0, 15, [], { BackgroundColor3: stroke, BackgroundTransparency: 0 }),
      ...Array.from({ length: 13 }, (_, index) => frame(`CompassTick${index}`, index % 3 === 0 ? 2 : 1, index % 3 === 0 ? 9 : 5, index * 32.16, index % 3 === 0 ? 7 : 11, [], { BackgroundColor3: muted, BackgroundTransparency: .4 })),
      ...['W', 'NW', 'N', 'NE', 'E'].map((direction, index) => label(`Compass_${direction}`, direction, 36, 22, index * 96.5 - 18, 21, direction === 'N' ? 16 : 13, { TextXAlignment: 'Center', TextColor3: direction === 'N' ? white : color(.43, .5, .61) })),
      label('CompassHeading', '▼', 20, 14, 183, -5, 13, { TextXAlignment: 'Center' }),
    ], { Position: position(0, 20, .5), AnchorPoint: { X: .5, Y: 0 } }),
    panel('TopRightDock', 328, 50, 0, 0, [
      icon('CurrencyIcon', 'coin', 25, 25, 16, 12, 22),
      label('MoneyCounter', bind('Player.Money', { Format: value => `$${Number(value ?? 0).toLocaleString()}` }), 87, 28, 46, 11, 17, { TextColor3: color(1, .79, .2) }),
      frame('TopHeaderDivider', 1, 27, 137, 11, [], { BackgroundColor3: stroke, BackgroundTransparency: 0 }),
      button('TopButton_Bell', 'bell', 39, 36, 158, 7),
      button('TopButton_Party', 'party', 39, 36, 217, 7),
      button('TopButton_Settings', 'settings', 39, 36, 276, 7),
    ], { Position: position(-18, 27, 1), AnchorPoint: { X: 1, Y: 0 } }),
    panel('LocationWeatherCard', 269, 64, 0, 0, [
      icon('LocationPinIcon', 'pin', 27, 32, 13, 17, 27),
      label('LocationName', 'Sun City', 96, 22, 49, 12, 15, { FontFace: { Family: 'Arial', Weight: 'Bold', Style: 'Normal' } }),
      label('LocationAddressText', 'San Andreas Ave', 103, 20, 49, 34, 11, { TextColor3: muted }),
      frame('LocationDivider', 1, 33, 151, 15, [], { BackgroundColor3: stroke, BackgroundTransparency: 0 }),
      icon('WeatherIcon', 'cloud', 25, 23, 169, 14, 23),
      label('WeatherText', '18°C', 48, 20, 201, 14, 14, { TextColor3: muted }),
      label('WeatherTimeText', '12:24 PM', 58, 19, 201, 34, 11, { TextColor3: muted }),
    ], { Position: position(18, -48, 0, 1), AnchorPoint: { X: 0, Y: 1 } }),
    panel('HotbarDock', 460, 92, 0, 0, [
      ...(['Bat', 'Pot', 'Defend', 'Run', 'Eat'] as const).map((name, index) => {
        const selected = (state: Record<string, unknown>) => (state.Player as { SelectedSlot?: number })?.SelectedSlot === index + 1
        return frame(`HotbarSlot_${index + 1}`, 82, 78, 8 + index * 90, 7, [
          corner(7), { ClassName: 'UIStroke', Color: computed(['Player.SelectedSlot'], state => selected(state) ? cyan : stroke), Thickness: 1.5 },
          icon(`HotbarIcon_${index + 1}`, (['bat', 'pot', 'shield', 'run', 'burger'] as const)[index], 80, 46, 0, 8, index === 0 ? 39 : index === 2 ? 22 : 29),
          panel(`HotbarKey_${index + 1}`, 18, 19, 5, 4, [label(`HotbarKeyText_${index + 1}`, String(index + 1), 16, 17, 0, 0, 12, { TextXAlignment: 'Center' })]),
          label(`HotbarName_${index + 1}`, name, 80, 20, 0, 50, 12, { TextXAlignment: 'Center' }),
        ], { ClassName: 'TextButton', Text: '', BackgroundColor3: color(.04, .055, .085), BackgroundTransparency: .25 })
      }),
    ], { Position: position(0, -50, .5, 1), AnchorPoint: { X: .5, Y: 1 } }),
    panel('KeybindTooltip', 205, 44, 0, 0, [
      label('KeybindText', 'Press', 36, 24, 17, 10, 12, { TextColor3: muted }),
      panel('TabKey', 37, 22, 59, 10, [label('TabKeyText', 'TAB', 35, 20, 0, 0, 12, { TextXAlignment: 'Center' })]),
      label('CursorHint', 'to open cursor', 89, 24, 109, 10, 12, { TextColor3: muted }),
    ], { Position: position(-18, -50, 1, 1), AnchorPoint: { X: 1, Y: 1 } }),
    frame('SideActionDock', 64, 418, 0, 0, [
      { ClassName: 'UIListLayout', FillDirection: 'Vertical', SortOrder: 'LayoutOrder', Padding: { Scale: 0, Offset: 9 } },
      ...(['Items', 'Quests', 'Stats', 'Shop', 'Options'] as const).map((name, index) => panel(
        ['SideInventoryButton', 'SideQuestsButton', 'SideStatsButton', 'SideShopButton', 'SideSettingsButton'][index], 64, 76, 0, 0,
        [icon(`SideIcon_${index}`, (['backpack', 'quests', 'stats', 'shop', 'settings'] as const)[index], 62, 41, 0, 8, 25),
          label(`SideLabel_${index}`, name, 62, 23, 0, 47, 12, { TextXAlignment: 'Center' })],
        { ClassName: 'TextButton', Text: '', LayoutOrder: index },
      )),
    ], { Position: position(-18, 0, 1, .475), AnchorPoint: { X: 1, Y: .5 } }),
  ],
}
