export interface SettingsCategory {
  id: string
  name: string
  subtitle: string
  icon: string
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  { id: 'general', name: 'General', subtitle: 'Language, UI, gameplay', icon: 'gear' },
  { id: 'graphics', name: 'Graphics', subtitle: 'Visuals, performance', icon: 'monitor' },
  { id: 'audio', name: 'Audio', subtitle: 'Volumes, radio, voice', icon: 'speaker' },
  { id: 'controls', name: 'Controls', subtitle: 'Keybinds, sensitivity', icon: 'gamepad' },
  { id: 'hud', name: 'HUD', subtitle: 'Interface, minimap, UI', icon: 'layout' },
  { id: 'notifications', name: 'Notifications', subtitle: 'In-game alerts, messages', icon: 'bell' },
  { id: 'accessibility', name: 'Accessibility', subtitle: 'Visual, audio, input', icon: 'accessibility' },
  { id: 'advanced', name: 'Advanced', subtitle: 'Experimental, developer', icon: 'wrench' },
]

export interface StreamlinedSettingsState {
  // General
  language: string
  uiScale: number // 1.00
  showTooltips: boolean // true
  streamerMode: boolean // false
  showQuantities: boolean // true

  // Graphics
  performancePreset: 'Quality' | 'Balanced' | 'Performance'
  disablePostProcessing: boolean // false
  reduceEffects: boolean // true
  lowerReflectionDetail: boolean // true
  shadowDetail: number // 0.70
  viewDistance: number // 0.80

  // Audio
  masterVolume: number // 0.80
  musicVolume: number // 0.50
  sfxVolume: number // 0.90
  radioVolume: number // 0.70
  voiceChatVolume: number // 0.80

  // Controls
  lookSensitivity: number // 0.50
  invertLook: boolean // false
  holdToSprint: boolean // true

  // HUD
  showMinimap: boolean // true
  showCompass: boolean // true
  damageNumbers: boolean // true

  // Notifications
  showNotifications: boolean // true
  missionAlerts: boolean // true
  chatNotifications: boolean // true

  // Accessibility
  colorblindMode: 'Off' | 'Deuteranopia' | 'Protanopia' | 'Tritanopia'
  subtitles: boolean // true
  highContrast: boolean // false

  // Advanced
  developerMode: boolean // false
  showNetworkStats: boolean // false

  // Motion & Opacity
  motion: boolean
  panelOpacity: number
}

export const INITIAL_SETTINGS_STATE: StreamlinedSettingsState = {
  language: 'English',
  uiScale: 1.0,
  showTooltips: true,
  streamerMode: false,
  showQuantities: true,

  performancePreset: 'Balanced',
  disablePostProcessing: false,
  reduceEffects: true,
  lowerReflectionDetail: true,
  shadowDetail: 0.7,
  viewDistance: 0.8,

  masterVolume: 0.8,
  musicVolume: 0.5,
  sfxVolume: 0.9,
  radioVolume: 0.7,
  voiceChatVolume: 0.8,

  lookSensitivity: 0.5,
  invertLook: false,
  holdToSprint: true,

  showMinimap: true,
  showCompass: true,
  damageNumbers: true,

  showNotifications: true,
  missionAlerts: true,
  chatNotifications: true,

  colorblindMode: 'Off',
  subtitles: true,
  highContrast: false,

  developerMode: false,
  showNetworkStats: false,

  motion: true,
  panelOpacity: 100,
}

export const SETTINGS_DATASTORE_NAME = 'PlayerData'
export const SETTINGS_DATASTORE_KEY = 'player_1'

const performancePresets = ['Quality', 'Balanced', 'Performance'] as const
const colorblindModes = ['Off', 'Deuteranopia', 'Protanopia', 'Tritanopia'] as const

/** Merge persisted data with defaults so adding a setting never breaks old profiles. */
export function normalizeSettings(value: unknown): StreamlinedSettingsState {
  const source = isRecord(value) ? value : {}
  const preset = valueIn(source.performancePreset, performancePresets)
  const colorblindMode = valueIn(source.colorblindMode, colorblindModes)
  return {
    ...INITIAL_SETTINGS_STATE,
    language: stringValue(source.language, INITIAL_SETTINGS_STATE.language),
    uiScale: numberValue(source.uiScale, INITIAL_SETTINGS_STATE.uiScale, 0.75, 1.25),
    showTooltips: booleanValue(source.showTooltips, INITIAL_SETTINGS_STATE.showTooltips),
    streamerMode: booleanValue(source.streamerMode, INITIAL_SETTINGS_STATE.streamerMode),
    showQuantities: booleanValue(source.showQuantities, INITIAL_SETTINGS_STATE.showQuantities),
    performancePreset: preset ?? INITIAL_SETTINGS_STATE.performancePreset,
    disablePostProcessing: booleanValue(source.disablePostProcessing, INITIAL_SETTINGS_STATE.disablePostProcessing),
    reduceEffects: booleanValue(source.reduceEffects, INITIAL_SETTINGS_STATE.reduceEffects),
    lowerReflectionDetail: booleanValue(source.lowerReflectionDetail, INITIAL_SETTINGS_STATE.lowerReflectionDetail),
    shadowDetail: numberValue(source.shadowDetail, INITIAL_SETTINGS_STATE.shadowDetail, 0.1, 1),
    viewDistance: numberValue(source.viewDistance, INITIAL_SETTINGS_STATE.viewDistance, 0.1, 1),
    masterVolume: numberValue(source.masterVolume, INITIAL_SETTINGS_STATE.masterVolume, 0, 1),
    musicVolume: numberValue(source.musicVolume, INITIAL_SETTINGS_STATE.musicVolume, 0, 1),
    sfxVolume: numberValue(source.sfxVolume, INITIAL_SETTINGS_STATE.sfxVolume, 0, 1),
    radioVolume: numberValue(source.radioVolume, INITIAL_SETTINGS_STATE.radioVolume, 0, 1),
    voiceChatVolume: numberValue(source.voiceChatVolume, INITIAL_SETTINGS_STATE.voiceChatVolume, 0, 1),
    lookSensitivity: numberValue(source.lookSensitivity, INITIAL_SETTINGS_STATE.lookSensitivity, 0.1, 1),
    invertLook: booleanValue(source.invertLook, INITIAL_SETTINGS_STATE.invertLook),
    holdToSprint: booleanValue(source.holdToSprint, INITIAL_SETTINGS_STATE.holdToSprint),
    showMinimap: booleanValue(source.showMinimap, INITIAL_SETTINGS_STATE.showMinimap),
    showCompass: booleanValue(source.showCompass, INITIAL_SETTINGS_STATE.showCompass),
    damageNumbers: booleanValue(source.damageNumbers, INITIAL_SETTINGS_STATE.damageNumbers),
    showNotifications: booleanValue(source.showNotifications, INITIAL_SETTINGS_STATE.showNotifications),
    missionAlerts: booleanValue(source.missionAlerts, INITIAL_SETTINGS_STATE.missionAlerts),
    chatNotifications: booleanValue(source.chatNotifications, INITIAL_SETTINGS_STATE.chatNotifications),
    colorblindMode: colorblindMode ?? INITIAL_SETTINGS_STATE.colorblindMode,
    subtitles: booleanValue(source.subtitles, INITIAL_SETTINGS_STATE.subtitles),
    highContrast: booleanValue(source.highContrast, INITIAL_SETTINGS_STATE.highContrast),
    developerMode: booleanValue(source.developerMode, INITIAL_SETTINGS_STATE.developerMode),
    showNetworkStats: booleanValue(source.showNetworkStats, INITIAL_SETTINGS_STATE.showNetworkStats),
    motion: booleanValue(source.motion, INITIAL_SETTINGS_STATE.motion),
    panelOpacity: numberValue(source.panelOpacity, INITIAL_SETTINGS_STATE.panelOpacity, 0, 100),
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value : fallback
}

function booleanValue(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

function numberValue(value: unknown, fallback: number, min: number, max: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
}

function valueIn<const T extends readonly string[]>(value: unknown, values: T): T[number] | undefined {
  return typeof value === 'string' && (values as readonly string[]).includes(value) ? value as T[number] : undefined
}
