import type { BrowserNetworkHandlers } from '../shared/network-adapter.ts'
import { boolean, number, select, string } from './scenario-runner.ts'
import type { PreviewScenario } from './scenario-runner.ts'

const buy = (success: boolean): BrowserNetworkHandlers => ({
  BuyItem: async () => ({ Success: success, Reason: success ? undefined : 'Not enough money', RemainingMoney: success ? 450 : 500 }),
  GetInventory: async () => ({ Items: [{ ItemId: 'Bat', Quantity: 1 }] }),
})

export const previewScenarios: PreviewScenario[] = [
  {
    id: 'join-rich',
    name: 'Player joins with $500',
    initialState: {
      Loading: { Visible: true, Progress: 0.15, Status: 'Connecting to realm...' },
      UI: { HUDVisible: false, ActivePanel: 'None', LastError: null },
      Player: {
        Name: 'Player1',
        Level: 42,
        Money: 500,
        Inventory: [{ ItemId: 'Bat', Quantity: 1 }],
        HealthPercent: 1,
        SelectedSlot: 1,
      },
      EMS: { HasActiveCall: false },
    },
    parameters: {
      Money: number(500, { min: 0, max: 10000, step: 50 }),
      Health: number(1, { min: 0, max: 1, step: 0.05 }),
      InventoryItems: string('Bat'),
      PlayerCount: number(1, { min: 1, max: 8, step: 1 }),
      Device: select(['Desktop', 'Mobile', 'Gamepad'], 'Desktop'),
      NetworkLatency: number(0, { min: 0, max: 2000, step: 50 }),
      FailureChance: number(0, { min: 0, max: 1, step: 0.05 }),
      PurchaseSucceeds: boolean(true),
      EMSCall: boolean(false),
    },
    configure: (context) => {
      const { network, bindings, effects, nerve, onCleanup, log, parameters } = context
      const money = Number(parameters.Money ?? 500)
      network.setHandlers(buy(parameters.PurchaseSucceeds !== false))
      bindings.set('Loading.Visible', true)
      bindings.set('Loading.Progress', 0.15)
      bindings.set('Loading.Status', 'Connecting to realm...')
      bindings.set('UI.HUDVisible', false)
      bindings.set('UI.ActivePanel', 'None')
      bindings.set('Player.Name', 'Player1')
      bindings.set('Player.Level', 42)
      bindings.set('Player.SelectedSlot', 1)
      bindings.set('Player.Money', money)
      bindings.set('Player.HealthPercent', Number(parameters.Health ?? 1))
      bindings.set('Player.Inventory', parameters.InventoryItems ? [{ ItemId: String(parameters.InventoryItems), Quantity: 1 }] : [])
      bindings.set('EMS.HasActiveCall', parameters.EMSCall === true)
      onCleanup(bindings.connectSignal(nerve, 'InventoryService', 'MoneyChanged', 'Player.Money'))
      onCleanup(bindings.connectSignal(nerve, 'InventoryService', 'InventoryChanged', 'Player.Inventory', (itemId, quantity) => [{ ItemId: itemId, Quantity: quantity }]))
      onCleanup(bindings.subscribePath('Player.Money', (value, previous) => { if (typeof value === 'number' && typeof previous === 'number' && value > previous) effects.play('PurchaseSuccess', context.timeMs) }))
      log('player joined', bindings.getState())
    },
    steps: [
      {
        afterMs: 100,
        label: 'MoneyChanged',
        run: ({ nerve, network, bindings, emit }) => {
          bindings.set('Loading.Progress', 0.65)
          bindings.set('Loading.Status', 'Preloading assets & syncing profile...')
          nerve.emitSignal('InventoryService', 'MoneyChanged', 500)
          network.preview.emitMoneyChanged({ Amount: bindings.get('Player.Money') as number })
          emit('MoneyChanged', { Amount: bindings.get('Player.Money') })
        },
      },
      {
        afterMs: 250,
        label: 'InventoryChanged',
        run: ({ nerve, network, bindings, emit }) => {
          bindings.set('Loading.Progress', 1.0)
          bindings.set('Loading.Status', 'Entering realm...')
          bindings.set('Loading.Visible', false)
          bindings.set('UI.HUDVisible', true)
          nerve.emitSignal('InventoryService', 'InventoryChanged', 'Bat', 1)
          network.preview.emitInventoryChanged({ ItemId: 'Bat', Quantity: 1 })
          emit('InventoryChanged', { ItemId: 'Bat', Quantity: 1 })
        },
      },
    ],
    triggers: [
      {
        id: 'money-now',
        label: '🪙 Add $500',
        run: ({ network, bindings }) => {
          const current = (bindings.get('Player.Money') as number) ?? 0
          bindings.set('Player.Money', current + 500)
          network.preview.emitMoneyChanged({ Amount: current + 500 })
        },
      },
      {
        id: 'toggle-shop',
        label: '🛒 Toggle Shop',
        run: ({ bindings }) => {
          const cur = bindings.get('UI.ActivePanel')
          bindings.set('UI.ActivePanel', cur === 'Shop' ? 'None' : 'Shop')
        },
      },
      {
        id: 'toggle-bag',
        label: '🎒 Toggle Bag',
        run: ({ bindings }) => {
          const cur = bindings.get('UI.ActivePanel')
          bindings.set('UI.ActivePanel', cur === 'Inventory' ? 'None' : 'Inventory')
        },
      },
      {
        id: 'toggle-quests',
        label: '📜 Toggle Quests',
        run: ({ bindings }) => {
          const cur = bindings.get('UI.ActivePanel')
          bindings.set('UI.ActivePanel', cur === 'Quests' ? 'None' : 'Quests')
        },
      },
      {
        id: 'take-damage',
        label: '💥 Take Damage',
        run: ({ bindings, effects, timeMs }) => {
          bindings.set('Player.HealthPercent', 0.4)
          effects.play('DamageFlash', timeMs)
          effects.play('ScreenShake', timeMs)
        },
      },
      {
        id: 'heal-up',
        label: '💚 Heal 100%',
        run: ({ bindings }) => {
          bindings.set('Player.HealthPercent', 1.0)
        },
      },
      {
        id: 'replay-loading',
        label: '🔄 Replay Loading',
        run: ({ bindings }) => {
          bindings.set('Loading.Visible', true)
          bindings.set('Loading.Progress', 0.15)
          bindings.set('Loading.Status', 'Reconnecting to game realm...')
          bindings.set('UI.HUDVisible', false)
          bindings.set('UI.ActivePanel', 'None')
        },
      },
    ],
  },
  {
    id: 'purchase-fails',
    name: 'Purchase fails',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'Shop', LastError: null },
      Player: { Money: 20, Inventory: [], HealthPercent: 1, SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    configure: ({ network, log }) => { network.setHandlers(buy(false)); log('purchase configured to fail') },
    steps: [{ afterMs: 300, label: 'PurchaseFailed', run: ({ effects, timeMs, log }) => { effects.play('PurchaseSuccess', timeMs); log('server rejected purchase', { Reason: 'Not enough money' }) } }],
    triggers: [{ id: 'retry-purchase', label: 'Manual purchase retry', run: ({ log }) => log('manual purchase retry') }],
  },
  {
    id: 'ems-call',
    name: 'EMS call arrives',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 500, HealthPercent: 0.42, SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    steps: [
      { afterMs: 100, label: 'PlayerDamaged', run: ({ effects, timeMs, bindings, emit }) => { effects.play('DamageFlash', timeMs); effects.play('ScreenShake', timeMs); bindings.set('Player.HealthPercent', 0.12); emit('PlayerDamaged', { Health: 12 }) } },
      { afterMs: 700, label: 'EMSCallReceived', run: ({ bindings, emit }) => { bindings.set('EMS.HasActiveCall', true); emit('EMSCallReceived', { Location: 'Downtown' }) } },
    ],
  },
  {
    id: 'request-timeout',
    name: 'Network request times out',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 500, HealthPercent: 1, SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
      RequestPending: true,
    },
    configure: ({ network }) => network.setHandlers({ GetInventory: () => new Promise(() => undefined) }),
    steps: [{ afterMs: 1200, label: 'RequestTimeout', run: ({ state, emit }) => { state.RequestPending = false; emit('RequestTimeout', { Name: 'GetInventory' }) } }],
  },
  {
    id: 'mobile-player',
    name: 'Mobile player / safe area',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 500, HealthPercent: 1, SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    Runtime: {
      Players: { LocalPlayer: { Name: 'MobilePlayer', UserId: 2, DisplayName: 'Mobile Player' } },
      Workspace: { CurrentCamera: { ViewportSize: { X: 390, Y: 844 } } },
      UserInputService: { MouseEnabled: false, TouchEnabled: true, PreferredInput: 'Touch' },
      GuiService: { GuiInset: { Min: { X: 0, Y: 44 }, Max: { X: 0, Y: 78 } } },
    },
    steps: [],
  },
  {
    id: 'gamepad-player',
    name: 'Gamepad player',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 500, HealthPercent: 1, SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    Runtime: {
      UserInputService: { MouseEnabled: false, TouchEnabled: false, GamepadEnabled: true, PreferredInput: 'Gamepad' },
      Workspace: { CurrentCamera: { ViewportSize: { X: 1920, Y: 1080 } } },
      CollectionService: { Tags: { Interactable: ['ShopTerminal', 'EMSBeacon'] } },
    },
    steps: [],
  },
  {
    id: 'desktop-player',
    name: 'Desktop player',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 500, HealthPercent: 1, SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    Runtime: {
      Players: { LocalPlayer: { Name: 'DesktopPlayer', UserId: 3, DisplayName: 'Desktop Player' } },
      Workspace: { CurrentCamera: { ViewportSize: { X: 2560, Y: 1440 } } },
      CollectionService: { Tags: { Interactable: ['ShopTerminal'] } },
    },
    steps: [],
  },
  {
    id: 'returning-player',
    name: 'Returning player profile',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 0, HealthPercent: 1, Inventory: [], SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    Persistence: { Profiles: { player_1: { Money: 1250, Inventory: [{ ItemId: 'Bat', Quantity: 2 }] } } },
    steps: [{ afterMs: 100, label: 'ProfileLoaded', run: ({ bindings, persistence, log }) => { void persistence.ProfileStore.LoadProfileAsync('player_1').then((profile) => { if (profile) { bindings.set('Player.Money', profile.Money); bindings.set('Player.Inventory', profile.Inventory); log('returning profile loaded', profile) } }) } }],
  },
  {
    id: 'first-time-player',
    name: 'First-time player defaults',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 0, HealthPercent: 1, Inventory: [], SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    Persistence: { Profiles: {} },
    steps: [{ afterMs: 100, label: 'ProfileReconciled', run: ({ persistence, bindings, log }) => { void persistence.ProfileStore.LoadProfileAsync('player_1').then((profile) => { profile?.Reconcile({ Money: 500, Inventory: [] }); bindings.set('Player.Money', profile?.Money); bindings.set('Player.Inventory', profile?.Inventory); log('first-time defaults reconciled') }) } }],
  },
  {
    id: 'save-fails',
    name: 'Profile save fails',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 500, HealthPercent: 1, Inventory: [], SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    Persistence: { Fail: ['Set'] },
    steps: [{ afterMs: 100, label: 'SaveFailed', run: ({ persistence, log }) => { void persistence.DataStoreService.GetDataStore('PlayerData').SetAsync('player_1', { Money: 500 }).catch((error: unknown) => log('save failed', error)) } }],
  },
  {
    id: 'profile-locked',
    name: 'Profile is locked',
    initialState: {
      Loading: { Visible: false, Progress: 1, Status: 'Ready' },
      UI: { HUDVisible: true, ActivePanel: 'None', LastError: null },
      Player: { Money: 0, HealthPercent: 1, Inventory: [], SelectedSlot: 1 },
      EMS: { HasActiveCall: false },
    },
    Persistence: { Locked: ['player_1'] },
    steps: [{ afterMs: 100, label: 'ProfileLocked', run: ({ persistence, log }) => { void persistence.ProfileStore.LoadProfileAsync('player_1').then((profile) => log('profile lock result', profile)).catch((error: unknown) => log('profile lock error', error)) } }],
  },
]
