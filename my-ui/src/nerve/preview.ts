import { nerveManifest } from '../generated/nerve-manifest.ts'
import { createNerveBrowserAdapter } from './browser-adapter.ts'
import type { NerveMethod, NerveSignal } from './contracts.ts'
import type { RobloxPersistence } from '../persistence/roblox-persistence.ts'
import {
  INITIAL_SETTINGS_STATE,
  SETTINGS_DATASTORE_KEY,
  SETTINGS_DATASTORE_NAME,
  normalizeSettings,
  type StreamlinedSettingsState,
} from '../settings/settings-data.ts'

export type PreviewInventoryService = {
  BuyItem: NerveMethod<string, [boolean, string?, number?]>
  GetInventory: NerveMethod<undefined, [{ ItemId: string; Quantity: number }]>
  EquipItem: NerveSignal<[string]>
  MoneyChanged: NerveSignal<[number]>
  InventoryChanged: NerveSignal<[string, number]>
}

export type PreviewSettingsService = {
  GetSettings: NerveMethod<undefined, [StreamlinedSettingsState]>
  SaveSettings: NerveMethod<StreamlinedSettingsState, [boolean, string?]>
  SettingsChanged: NerveSignal<[StreamlinedSettingsState]>
}

export type NervePreviewOptions = {
  persistence?: RobloxPersistence
  playerKey?: string
}

export function createNervePreview(options: NervePreviewOptions = {}) {
  const playerKey = options.playerKey ?? SETTINGS_DATASTORE_KEY
  let cachedSettings = { ...INITIAL_SETTINGS_STATE }
  let adapter: ReturnType<typeof createNerveBrowserAdapter>

  const readSettings = async (): Promise<StreamlinedSettingsState> => {
    if (!options.persistence) return { ...cachedSettings }
    const stored = await options.persistence.DataStoreService
      .GetDataStore(SETTINGS_DATASTORE_NAME)
      .GetAsync(playerKey)
    if (!isRecord(stored)) return { ...INITIAL_SETTINGS_STATE }
    return normalizeSettings('Settings' in stored ? stored.Settings : stored)
  }

  adapter = createNerveBrowserAdapter({
    manifest: nerveManifest,
    handlers: {
      'InventoryService.BuyItem': async (payload) => {
        if (typeof payload !== 'string') throw new Error('BuyItem expects an item id')
        return [payload.length > 0, payload.length > 0 ? undefined : 'Invalid item', 100]
      },
      'InventoryService.GetInventory': () => [{ ItemId: 'Bat', Quantity: 1 }],
      'SettingsService.GetSettings': async () => {
        cachedSettings = await readSettings()
        return [cachedSettings]
      },
      'SettingsService.SaveSettings': async (payload) => {
        if (!isRecord(payload)) return [false, 'Invalid settings payload']
        const nextSettings = normalizeSettings(payload)
        if (options.persistence) {
          await options.persistence.DataStoreService
            .GetDataStore(SETTINGS_DATASTORE_NAME)
            .UpdateAsync(playerKey, (current) => ({
              ...(isRecord(current) ? current : {}),
              Settings: nextSettings,
            }))
        }
        cachedSettings = nextSettings
        adapter.emitSignal('SettingsService', 'SettingsChanged', nextSettings)
        return [true, undefined]
      },
    },
  })

  return adapter
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const nervePreview = createNervePreview()

export const InventoryService = nervePreview.GetService<PreviewInventoryService>('InventoryService')
