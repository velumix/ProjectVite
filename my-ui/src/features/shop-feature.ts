import { previewEffects } from '../effects/preview-effects.ts'
import { previewScenarios } from '../scenarios/examples.ts'
import { component, resolveRobloxComponents } from '../components/roblox-components.ts'
import { nerveManifest } from '../generated/nerve-manifest.ts'
import type { ActionDefinition } from '../actions/action-layer.ts'
import type { RobloxFeature } from './feature.ts'
import type { PreviewInventoryService } from '../nerve/preview.ts'

const BuyItem: ActionDefinition<{ ItemId: string }> = {
  async run(payload, context) {
    const service = context.nerve.GetService<PreviewInventoryService>('InventoryService')
    const [success, reason, remainingMoney] = await service.BuyItem.request(payload.ItemId)
    if (context.signal.aborted) return
    if (success) {
      context.bindings.set('Player.Money', remainingMoney ?? context.bindings.get('Player.Money'))
      await context.persistence.DataStoreService.GetDataStore('PlayerData').SetAsync('player_1', { Money: context.bindings.get('Player.Money'), Inventory: context.bindings.get('Player.Inventory') })
      service.EquipItem.emit(payload.ItemId)
      context.effects.play('PurchaseSuccess', context.timeMs)
    } else {
      context.bindings.set('UI.LastError', reason ?? 'Purchase failed')
      context.effects.play('PurchaseFailed', context.timeMs)
    }
  },
}

export const ShopFeature: RobloxFeature = {
  Name: 'ShopFeature',
  UI: resolveRobloxComponents(component('ScreenGui', { Name: 'ShopFeatureGui' }, [
    component('MoneyDisplay', { Name: 'ShopMoneyDisplay', Position: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 0, Offset: 24 } } }),
    component('InventoryCard', { Name: 'ShopInventoryCard', Position: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 0, Offset: 88 } } }),
    component('PurchaseButton', { Name: 'ShopPurchaseButton', Action: 'BuyItem', Payload: { ItemId: 'Bat' }, Effect: 'PurchaseSuccess', Position: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 0, Offset: 224 } } }),
    component('EMSAlert', { Name: 'ShopEMSAlert', Position: { X: { Scale: 0, Offset: 224 }, Y: { Scale: 0, Offset: 24 } } }),
  ])),
  State: { Player: { Money: 500, Inventory: [], HealthPercent: 1 }, EMS: { HasActiveCall: false } },
  Actions: { BuyItem },
  Effects: previewEffects,
  Scenarios: previewScenarios,
  Nerve: { Services: ['InventoryService'], Controllers: ['InventoryController'] },
  Network: { InventoryService: nerveManifest.services.InventoryService },
  Dependencies: { Services: ['InventoryService'] },
  SharedModules: { 'shared/network.luau': '-- Canonical shared network contract is exported from roblox/shared/network.luau.' },
}
