import { nerveManifest } from '../generated/nerve-manifest.ts'
import { component, resolveRobloxComponents } from '../components/roblox-components.ts'
import type { RobloxFeature } from './feature.ts'

/** Network and lifecycle declaration for the player settings backend. */
export const SettingsFeature: RobloxFeature = {
  Name: 'SettingsFeature',
  UI: resolveRobloxComponents(
    component('ScreenGui', { Name: 'SettingsFeatureGui' }, []),
  ),
  State: {},
  Actions: {},
  Effects: {},
  Scenarios: [],
  Nerve: { Services: ['SettingsService'], Controllers: ['SettingsController'] },
  Network: { SettingsService: nerveManifest.services.SettingsService },
  SharedModules: {
    'shared/settings.luau': '-- Settings payloads are persisted by SettingsService on the server.\n',
  },
}
