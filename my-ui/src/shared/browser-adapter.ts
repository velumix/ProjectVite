import {
  createBrowserNetworkAdapter,
  type BrowserNetworkAdapterOptions,
} from './network-adapter.ts'
import type { RobloxUiApi } from './roblox-contracts.ts'

export * from './network-adapter.ts'

export type BrowserAdapterOptions = BrowserNetworkAdapterOptions

/** Backwards-compatible facade; new code should use Network directly. */
export function createBrowserAdapter(options: BrowserAdapterOptions = {}): RobloxUiApi & {
  preview: ReturnType<typeof createBrowserNetworkAdapter>['preview']
} {
  const adapter = createBrowserNetworkAdapter(options)

  return {
    Network: adapter.Network,
    Signals: {
      MoneyChanged: adapter.Network.MoneyChanged,
      InventoryChanged: adapter.Network.InventoryChanged,
    },
    preview: adapter.preview,
  }
}
