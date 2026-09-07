export interface SettingsCategory {
  id: string
  name: string
  subtitle: string
  icon: string
}

export const SETTINGS_CATEGORIES: SettingsCategory[] = [
  { id: 'general', name: 'General', subtitle: 'Game preferences', icon: 'gear' },
  { id: 'graphics', name: 'Graphics', subtitle: 'Display & visual quality', icon: 'monitor' },
  { id: 'audio', name: 'Audio', subtitle: 'Sound & voice chat', icon: 'speaker' },
  { id: 'controls', name: 'Controls', subtitle: 'Keyboard, mouse & controller', icon: 'gamepad' },
  { id: 'interface', name: 'Interface', subtitle: 'HUD & UI settings', icon: 'layout' },
  { id: 'accessibility', name: 'Accessibility', subtitle: 'Visual & gameplay assistance', icon: 'accessibility' },
  { id: 'keybinds', name: 'Keybinds', subtitle: 'Customize your keys', icon: 'keyboard' },
  { id: 'notifications', name: 'Notifications', subtitle: 'Alerts & in-game messages', icon: 'bell' },
]

export interface SettingsState {
  // Display
  displayMode: string
  resolution: string
  vsync: boolean
  fpsLimit: string

  // Graphics Quality
  graphicsQuality: number // 1: Low, 2: Medium, 3: High, 4: Ultra
  shadowQuality: string
  textureQuality: string
  postProcessing: boolean
  motionBlur: boolean
  ambientOcclusion: boolean
  fov: number

  // Audio
  masterVolume: number
  musicVolume: number
  sfxVolume: number
  voiceChat: boolean

  // Gameplay & Interface
  uiScale: number
  showMinimap: boolean
  showDamageNumbers: boolean
  colorblindMode: string
  interactionPrompts: boolean
  sprintMode: 'Hold' | 'Toggle'
  language: string

  // Existing core state
  showQuantities: boolean
  motion: boolean
  panelOpacity: number
}

export const DEFAULT_SETTINGS: SettingsState = {
  displayMode: 'Fullscreen',
  resolution: '1920 x 1080 (16:9)',
  vsync: false,
  fpsLimit: '144',

  graphicsQuality: 3,
  shadowQuality: 'High',
  textureQuality: 'High',
  postProcessing: true,
  motionBlur: false,
  ambientOcclusion: true,
  fov: 90,

  masterVolume: 80,
  musicVolume: 50,
  sfxVolume: 75,
  voiceChat: true,

  uiScale: 100,
  showMinimap: true,
  showDamageNumbers: true,
  colorblindMode: 'Off',
  interactionPrompts: true,
  sprintMode: 'Hold',
  language: 'English',

  showQuantities: true,
  motion: true,
  panelOpacity: 100,
}
