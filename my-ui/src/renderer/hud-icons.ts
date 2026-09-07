// Inline vector artwork keeps the browser HUD consistent across operating systems.
// These are presentation assets for the preview's existing rich-text renderer.
const paths = {
  avatar: '<defs><linearGradient id="hud-avatar" x2="0" y2="1"><stop stop-color="#536071"/><stop offset="1" stop-color="#141c28"/></linearGradient></defs><circle cx="16" cy="11" r="7" fill="url(#hud-avatar)"/><path d="M4 32v-5c0-7 5-10 12-10s12 3 12 10v5" fill="#101722"/>',
  heart: '<path d="M16 28 4 16C-5 6 10-2 16 8c6-10 21-2 12 8Z" fill="#00d465"/>',
  coin: '<circle cx="16" cy="16" r="14" fill="#ffab26" stroke="#ffe784" stroke-width="2"/><circle cx="16" cy="16" r="10" fill="none" stroke="#ffcc57"/><path d="M21 10c-9-5-14 6-5 6s4 11-5 6m5-16v20" fill="none" stroke="#fff0a1" stroke-width="2.5"/>',
  bell: '<path d="M6 23h20l-3-5v-6a7 7 0 0 0-6-7V3h-2v2a7 7 0 0 0-6 7v6Zm6 2a4 4 0 0 0 8 0"/>',
  party: '<circle cx="16" cy="9" r="4"/><circle cx="6" cy="12" r="3"/><circle cx="26" cy="12" r="3"/><path d="M9 26v-6c0-8 14-8 14 0v6ZM1 25v-5c0-4 4-5 7-3l-1 8Zm24 0-1-8c3-2 7-1 7 3v5Z"/>',
  settings: '<path d="m13 2-1 4-3 1-4-1-3 5 3 3v4l-3 3 3 5 4-1 3 1 1 4h6l1-4 3-1 4 1 3-5-3-3v-4l3-3-3-5-4 1-3-1-1-4Zm3 8a6 6 0 1 1 0 12 6 6 0 0 1 0-12" fill-rule="evenodd"/>',
  backpack: '<path d="M12 7V5c0-4 8-4 8 0v2" fill="none" stroke="#a2e7ff" stroke-width="2"/><rect x="5" y="7" width="22" height="23" rx="4" fill="#3bc6ff"/><rect x="8" y="9" width="16" height="10" rx="2" fill="#96e5ff"/><path d="M3 18v10m26-10v10M9 21v4m14-4v4" stroke="#079ded" stroke-width="3"/>',
  quests: '<rect x="5" y="2" width="22" height="28" rx="3"/><path d="M10 9h12M10 15h12M10 21h8" stroke="#29364b" stroke-width="2.5"/>',
  stats: '<rect x="3" y="18" width="6" height="12" rx="3"/><rect x="13" y="3" width="6" height="27" rx="3"/><rect x="23" y="11" width="6" height="19" rx="3"/>',
  shop: '<path d="M2 3h5l6 20h15M9 7h22l-4 12H12" stroke="#d7e1f4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="15" cy="28" r="2.5"/><circle cx="26" cy="28" r="2.5"/>',
  pin: '<path d="M16 1C3 1 2 13 7 21l9 11 9-11C30 13 29 1 16 1Zm0 7a6 6 0 1 1 0 12 6 6 0 0 1 0-12" fill-rule="evenodd"/>',
  cloud: '<path d="M8 27a8 8 0 0 1-2-16 10 10 0 0 1 19-1 8 8 0 0 1 0 17Z"/>',
  bat: '<path d="m7 25 5-7L25 3c4-4 8 0 4 4L14 20l-7 6Z" fill="#e9a257"/><path d="m9 22 5-5L25 3c2-2 4-1 4 0L14 19Z" fill="#ffd58b"/><path d="m5 26 3 3M6 26l5-5" stroke="#dca15d" stroke-width="2.5" stroke-linecap="round"/>',
  pot: '<path d="M16 16C4 16 4 5 4 3c10 1 12 7 12 13M17 17C17 7 23 3 29 3c-1 9-5 13-12 14" fill="#56c837"/><path d="M16 10v13" stroke="#39952b" stroke-width="2"/><path d="m8 19 3 12h12l3-12" fill="#d3ddec"/><path d="M7 18h20v4H7Z" fill="#96a5b9"/>',
  shield: '<path d="M16 2c-4 4-8 4-12 4v9c0 8 8 13 12 16 4-3 12-8 12-16V6c-4 0-8 0-12-4Z" fill="#a8b9d1" stroke="#e0eaff" stroke-width="2"/><path d="M16 5v22c5-4 9-8 9-13V9Z" fill="#8297b5"/>',
  run: '<circle cx="22" cy="5" r="3"/><path d="m12 12 6-3 4 6 6 1M18 11l-5 9 7 3-3 7m-4-10-5 9H3" fill="none" stroke="#d7e1f4" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>',
  burger: '<path d="M2 15C2 0 30 0 30 15ZM3 24h26c0 7-26 7-26 0" fill="#ffb34f"/><path d="M2 19h28v5H2" fill="#934720"/><path d="m1 17 6-2 6 3 6-3 7 3 5-1" fill="none" stroke="#6bdc3c" stroke-width="3"/><path d="m10 20 7 5 5-5" fill="#ffdc43"/><path d="m10 8 2 1m5-3 2 1m4 3 2 1" stroke="#ffe9b5" stroke-width="1.5"/>',
} as const

export type HudIcon = keyof typeof paths
export function hudIcon(name: HudIcon, size = 26): string {
  return `<svg aria-hidden="true" width="${size}" height="${size}" viewBox="0 0 32 32" fill="#d7e1f4" xmlns="http://www.w3.org/2000/svg" style="display:block;margin:auto;overflow:visible">${paths[name]}</svg>`
}
