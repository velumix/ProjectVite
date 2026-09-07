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

  motion: true,
  panelOpacity: 100,
}
