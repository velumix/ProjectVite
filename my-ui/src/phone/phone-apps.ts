export type PhoneAppCategory = 'utilities' | 'social' | 'productivity' | 'games' | 'shopping'
export type PhoneAppDefinition = { id: string; label: string; category: PhoneAppCategory; icon: string; installed: boolean; dock: boolean }

// React catalog ported from phone/frontend/src/config/apps.ts.
const installed = new Set(['phone', 'messages', 'calculator', 'camera', 'clock', 'weather', 'banking', 'mail', 'notes', 'memos', 'photos', 'app-store', 'settings', 'map', 'music', 'garage', 'feather', 'calendar', 'health', 'citywarn', 'crypto', 'house', 'billing', 'darkchat', 'companies', 'crewlink', 'health', 'local-pages', 'weazel-news', 'flare', 'fliptok', 'picstagram', 'radio', 'calendar', 'memos'])
const dock = new Set(['phone', 'messages', 'camera', 'settings'])
const entries: Array<[string, string, PhoneAppCategory]> = [
  ['citywarn', 'CityWarn', 'utilities'], ['crypto', 'Crypto', 'utilities'], ['health', 'Health', 'utilities'], ['weazel-news', 'Weazel News', 'social'], ['companies', 'Companies', 'utilities'], ['music', 'Music', 'productivity'], ['picstagram', 'Picstagram', 'social'], ['feather', 'Feather', 'social'], ['fliptok', 'FlipTok', 'social'], ['flare', 'Flare', 'social'], ['calendar', 'Calendar', 'productivity'], ['radio', 'Radio', 'social'], ['local-pages', 'Local Pages', 'social'], ['crewlink', 'CrewLink', 'social'], ['phone', 'Phone', 'utilities'], ['messages', 'Messages', 'utilities'], ['darkchat', 'DarkChat', 'social'], ['garage', 'Garage', 'utilities'], ['house', 'House', 'utilities'], ['map', 'Map', 'utilities'], ['skyride', 'SkyRide', 'utilities'], ['banking', 'Banking', 'social'], ['billing', 'Billing', 'utilities'], ['mail', 'Mail', 'social'], ['notes', 'Notes', 'productivity'], ['memos', 'Memos', 'productivity'], ['calculator', 'Calculator', 'productivity'], ['camera', 'Camera', 'utilities'], ['clock', 'Clock', 'productivity'], ['weather', 'Weather', 'utilities'], ['photos', 'Photos', 'utilities'], ['app-store', 'App Store', 'utilities'], ['settings', 'Settings', 'utilities'], ['snake', 'Snake', 'games'], ['memory', 'Memory', 'games'], ['number-merge', 'Number Merge', 'games'], ['minesweeper', 'Minesweeper', 'games'], ['tower-stack', 'Tower Stack', 'games'], ['sky-flappy', 'Sky Flappy', 'games'], ['citymarkt', 'CityMarkt', 'shopping'], ['neon-drop', 'Neon Drop', 'games'],
]

export const PHONE_APPS: PhoneAppDefinition[] = entries.map(([id, label, category]) => ({
  id, label, category, installed: installed.has(id), dock: dock.has(id),
  icon: `${import.meta.env.BASE_URL}assets/phone/app-icons/${id === 'photos' ? 'gallery' : id}.webp`,
}))
export const INSTALLED_PHONE_APPS = PHONE_APPS.filter((app) => app.installed)
export const DOCK_PHONE_APPS = PHONE_APPS.filter((app) => app.dock)
