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

export function createPreviewActions(dependencies: { bindings: ReactiveBindingStore; effects: EffectPlayer; nerve: NervePreviewAdapter; network: BrowserNetworkAdapter; persistence: RobloxPersistence; getTimeMs: () => number; getTrace: () => import('../scenarios/scenario-trace.ts').ScenarioTrace }, additionalDefinitions: Record<string, ActionDefinition> = {}): ActionRegistry {
  return createActionRegistry({
    BuyItem: {
      async run(payload: { ItemId: string }, context) {
        if (context.signal.aborted) return
        const service = context.nerve.GetService<PreviewInventoryService>('InventoryService')
        try {
          const response = await service.BuyItem.request(payload.ItemId)
          if (context.signal.aborted) return
          const [success, reason, remainingMoney] = response
          context.trace.record('method', 'BuyItem', context.timeMs, { Success: success, reason })
          if (success) {
            context.bindings.set('Player.Money', remainingMoney ?? context.bindings.get('Player.Money'))
            context.nerve.GetService<PreviewInventoryService>('InventoryService').EquipItem.emit(payload.ItemId)
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
    ...additionalDefinitions,
  }, dependencies)
}

export function createPreviewHandlers(actions: ActionRegistry, actionBindings: ComponentActionBinding[] = [], effectHooks: ComponentEffectHook[] = [], effects?: EffectPlayer, getTimeMs?: () => number): RobloxHandlerRegistry {
  const handlers: RobloxHandlerRegistry = {
    BuyButton: {
      Activated: () => { void actions.run('BuyItem', previewActionBindings.BuyButton.Activated.Payload).promise },
      MouseButton1Click: () => console.info('BuyButton.MouseButton1Click'),
      MouseButton1Down: (input) => console.info('BuyButton.MouseButton1Down', input.UserInputType),
      MouseButton1Up: (input) => console.info('BuyButton.MouseButton1Up', input.UserInputType),
      InputBegan: (input) => console.info('BuyButton.InputBegan', input.UserInputType),
      InputEnded: (input) => console.info('BuyButton.InputEnded', input.UserInputType),
    },
    Inventory: {
      Changed: (propertyName) => console.info('Inventory.Changed', propertyName),
      MouseEnter: () => console.info('Inventory.MouseEnter'),
      MouseLeave: () => console.info('Inventory.MouseLeave'),
      InputChanged: (input) => console.info('Inventory.InputChanged', input.Position),
      GetPropertyChangedSignal: { Text: () => console.info('Inventory.GetPropertyChangedSignal("Text")') },
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
