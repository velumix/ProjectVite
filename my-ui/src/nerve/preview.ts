import { nerveManifest } from '../generated/nerve-manifest.ts'
import { createNerveBrowserAdapter } from './browser-adapter.ts'
import type { NerveMethod, NerveSignal } from './contracts.ts'

export type PreviewInventoryService = {
  BuyItem: NerveMethod<string, [boolean, string?, number?]>
  GetInventory: NerveMethod<undefined, [{ ItemId: string; Quantity: number }]>
  EquipItem: NerveSignal<[string]>
  MoneyChanged: NerveSignal<[number]>
  InventoryChanged: NerveSignal<[string, number]>
}

export const nervePreview = createNerveBrowserAdapter({
  manifest: nerveManifest,
  handlers: {
    'InventoryService.BuyItem': async (payload) => {
      if (typeof payload !== 'string') throw new Error('BuyItem expects an item id')
      return [payload.length > 0, payload.length > 0 ? undefined : 'Invalid item', 100]
    },
    'InventoryService.GetInventory': () => [{ ItemId: 'Bat', Quantity: 1 }],
  },
})

export const InventoryService = nervePreview.GetService<PreviewInventoryService>('InventoryService')
