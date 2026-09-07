// Generated from roblox/nerve/NerveManifest.example.json.
import type { NerveNetworkManifest } from '../nerve/manifest.ts'

export const nerveManifest = {
  version: 1,
  services: {
    InventoryService: {
      BuyItem: {
        kind: 'method',
        request: { kind: 'tuple', items: [{ kind: 'string' }] },
        response: {
          kind: 'tuple',
          items: [
            { kind: 'bool' },
            { kind: 'optional', value: { kind: 'string' } },
            { kind: 'optional', value: { kind: 'float64' } },
          ],
        },
        rateLimit: { requests: 12, window: 1 },
      },
      GetInventory: {
        kind: 'method',
        request: { kind: 'tuple', items: [] },
        response: {
          kind: 'tuple',
          items: [{ kind: 'array', value: { kind: 'struct', fields: { ItemId: { kind: 'string' }, Quantity: { kind: 'int32' } } } }],
        },
      },
      EquipItem: {
        kind: 'signal',
        arguments: { kind: 'tuple', items: [{ kind: 'string' }] },
        direction: 'client',
        reliability: 'reliable',
      },
      MoneyChanged: {
        kind: 'signal',
        arguments: { kind: 'tuple', items: [{ kind: 'float64' }] },
        direction: 'server',
        reliability: 'reliable',
      },
      InventoryChanged: {
        kind: 'signal',
        arguments: { kind: 'tuple', items: [{ kind: 'string' }, { kind: 'int32' }] },
        direction: 'server',
        reliability: 'reliable',
      },
    },
  },
} as const satisfies NerveNetworkManifest
