import type { ActionDefinition, ActionRegistry } from './action-layer.ts'
import { createActionRegistry } from './action-layer.ts'
import type { PreviewInventoryService } from '../nerve/preview.ts'
import type { EffectPlayer } from '../effects/roblox-effects.ts'
import type { ReactiveBindingStore } from '../bindings/reactive-bindings.ts'
import type { NervePreviewAdapter } from '../nerve/contracts.ts'
import type { BrowserNetworkAdapter } from '../shared/network-adapter.ts'
import type { RobloxPersistence } from '../persistence/roblox-persistence.ts'
import type { RobloxHandlerRegistry } from '../renderer/roblox-events.ts'
import type { ComponentActionBinding, ComponentEffectHook } from '../components/roblox-components.ts'

export const previewActionBindings = {
  BuyButton: {
    Activated: { Action: 'BuyItem', Payload: { ItemId: 'Bat' } },
  },
} as const

export function createPreviewActions(
  dependencies: {
    bindings: ReactiveBindingStore
    effects: EffectPlayer
    nerve: NervePreviewAdapter
    network: BrowserNetworkAdapter
    persistence: RobloxPersistence
    getTimeMs: () => number
    getTrace: () => import('../scenarios/scenario-trace.ts').ScenarioTrace
  },
  additionalDefinitions: Record<string, ActionDefinition> = {},
): ActionRegistry {
  return createActionRegistry(
    {
      BuyItem: {
        async run(payload: { ItemId: string }, context) {
          if (context.signal.aborted) return
          const service = context.nerve.GetService<PreviewInventoryService>('InventoryService')
          try {
            const response = await service.BuyItem.request(payload?.ItemId ?? 'Bat')
            if (context.signal.aborted) return
            const [success, reason, remainingMoney] = response
            context.trace.record('method', 'BuyItem', context.timeMs, { Success: success, reason })
            if (success) {
              const currentMoney = (context.bindings.get('Player.Money') as number) ?? 500
              const updatedMoney = remainingMoney ?? Math.max(0, currentMoney - 50)
              context.bindings.set('Player.Money', updatedMoney)
              context.nerve.GetService<PreviewInventoryService>('InventoryService').EquipItem.emit(payload?.ItemId ?? 'Bat')
              context.effects.play('PurchaseSuccess', context.timeMs)
            } else {
              context.effects.play('PurchaseFailed', context.timeMs)
              context.bindings.set('UI.LastError', reason ?? 'Purchase failed')
            }
          } catch (error) {
            context.trace.record('error', 'BuyItem', context.timeMs, error instanceof Error ? error.message : String(error))
            if (!context.signal.aborted) {
              context.effects.play('PurchaseFailed', context.timeMs)
              context.bindings.set('UI.LastError', error instanceof Error ? error.message : String(error))
            }
          }
        },
      },
      BuyPotion: {
        async run(_payload: unknown, context) {
          const money = (context.bindings.get('Player.Money') as number) ?? 500
          if (money >= 25) {
            context.bindings.set('Player.Money', money - 25)
            context.bindings.set('Player.HealthPercent', 1.0)
            context.effects.play('PurchaseSuccess', context.timeMs)
            context.trace.record('action', 'BuyPotion', context.timeMs, { RestoredHealth: true, Cost: 25 })
          } else {
            context.effects.play('PurchaseFailed', context.timeMs)
          }
        },
      },
      BuyShield: {
        async run(_payload: unknown, context) {
          const money = (context.bindings.get('Player.Money') as number) ?? 500
          if (money >= 100) {
            context.bindings.set('Player.Money', money - 100)
            context.effects.play('PurchaseSuccess', context.timeMs)
            context.trace.record('action', 'BuyShield', context.timeMs, { Cost: 100 })
          } else {
            context.effects.play('PurchaseFailed', context.timeMs)
          }
        },
      },
      TogglePanel: {
        run(payload: { Panel: string }, context) {
          const current = (context.bindings.get('UI.ActivePanel') as string) ?? 'None'
          const next = current === payload.Panel ? 'None' : payload.Panel
          context.bindings.set('UI.ActivePanel', next)
          context.trace.record('action', 'TogglePanel', context.timeMs, { Panel: next })
        },
      },
      TogglePhone: {
        run(_payload: unknown, context) {
          const isOpen = Boolean(context.bindings.get('UI.PhoneOpen'))
          context.bindings.set('UI.PhoneOpen', !isOpen)
          context.trace.record('action', 'TogglePhone', context.timeMs, { Open: !isOpen })
        },
      },
      ClosePanel: {
        run(_payload: unknown, context) {
          context.bindings.set('UI.ActivePanel', 'None')
          context.trace.record('action', 'ClosePanel', context.timeMs)
        },
      },
      SelectSlot: {
        run(payload: { Slot: number }, context) {
          context.bindings.set('Player.SelectedSlot', payload.Slot)
          context.trace.record('action', 'SelectSlot', context.timeMs, { Slot: payload.Slot })
        },
      },
      ...additionalDefinitions,
    },
    dependencies,
  )
}

export function createPreviewHandlers(
  actions: ActionRegistry,
  actionBindings: ComponentActionBinding[] = [],
  effectHooks: ComponentEffectHook[] = [],
  effects?: EffectPlayer,
  getTimeMs?: () => number,
): RobloxHandlerRegistry {
  const handlers: RobloxHandlerRegistry = {
    BuyButton: {
      Activated: () => {
        void actions.run('BuyItem', previewActionBindings.BuyButton.Activated.Payload).promise
      },
    },
    BuyPotionButton: {
      Activated: () => {
        void actions.run('BuyPotion', {}).promise
      },
    },
    BuyShieldButton: {
      Activated: () => {
        void actions.run('BuyShield', {}).promise
      },
    },
    SideShopButton: {
      Activated: () => {
        void actions.run('TogglePanel', { Panel: 'Shop' }).promise
      },
    },
    SideInventoryButton: {
      Activated: () => {
        void actions.run('TogglePanel', { Panel: 'Inventory' }).promise
      },
    },
    SidePhoneButton: {
      Activated: () => {
        void actions.run('TogglePhone', {}).promise
      },
    },
    SideQuestsButton: {
      Activated: () => {
        void actions.run('TogglePanel', { Panel: 'Quests' }).promise
      },
    },
    SideStatsButton: {
      Activated: () => {
        void actions.run('TogglePanel', { Panel: 'Stats' }).promise
      },
    },
    SideSettingsButton: {
      Activated: () => {
        void actions.run('TogglePanel', { Panel: 'Settings' }).promise
      },
    },
    TopButton_Settings: {
      Activated: () => {
        void actions.run('TogglePanel', { Panel: 'Settings' }).promise
      },
    },
    TopButton_Bell: {
      Activated: () => {
        void actions.run('TogglePanel', { Panel: 'Quests' }).promise
      },
    },
    TopButton_Party: {
      Activated: () => {
        void actions.run('TogglePanel', { Panel: 'Stats' }).promise
      },
    },
    CloseShopButton: {
      Activated: () => {
        void actions.run('ClosePanel', {}).promise
      },
    },
    CloseInventoryButton: {
      Activated: () => {
        void actions.run('ClosePanel', {}).promise
      },
    },
    CloseQuestsButton: {
      Activated: () => {
        void actions.run('ClosePanel', {}).promise
      },
    },
    CloseStatsButton: {
      Activated: () => {
        void actions.run('ClosePanel', {}).promise
      },
    },
    CloseSettingsButton: {
      Activated: () => {
        void actions.run('ClosePanel', {}).promise
      },
    },
    HotbarSlot_1: {
      Activated: () => {
        void actions.run('SelectSlot', { Slot: 1 }).promise
      },
    },
    HotbarSlot_2: {
      Activated: () => {
        void actions.run('SelectSlot', { Slot: 2 }).promise
      },
    },
    HotbarSlot_3: {
      Activated: () => {
        void actions.run('SelectSlot', { Slot: 3 }).promise
      },
    },
    HotbarSlot_4: {
      Activated: () => {
        void actions.run('SelectSlot', { Slot: 4 }).promise
      },
    },
    HotbarSlot_5: {
      Activated: () => {
        void actions.run('SelectSlot', { Slot: 5 }).promise
      },
    },
  }

  for (const binding of actionBindings) {
    const effectHook = effectHooks.find((hook) => hook.Instance === binding.Instance && hook.Event === binding.Event)
    const instanceHandlers = handlers[binding.Instance] ?? {}
    instanceHandlers[binding.Event as keyof typeof instanceHandlers] = (() => {
      if (effectHook && effects && getTimeMs) effects.play(effectHook.Effect, getTimeMs())
      void actions.run(binding.Action, binding.Payload).promise
    }) as never
    handlers[binding.Instance] = instanceHandlers
  }

  return handlers
}
