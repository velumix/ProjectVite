import type { RobloxRuntimeContext, RobloxViewportSize } from '../runtime/roblox-runtime.ts'

export type RobloxViewportMode = 'Runtime' | 'Desktop' | 'Tablet' | 'PhonePortrait' | 'PhoneLandscape' | 'Custom'
export type RobloxViewportConfig = { size: RobloxViewportSize; inset: { Min: RobloxViewportSize; Max: RobloxViewportSize } }

const presets: Record<Exclude<RobloxViewportMode, 'Runtime' | 'Custom'>, RobloxViewportSize> = {
  Desktop: { X: 1280, Y: 720 },
  Tablet: { X: 1024, Y: 768 },
  PhonePortrait: { X: 390, Y: 844 },
  PhoneLandscape: { X: 844, Y: 390 },
}

export function resolveRobloxViewport(runtime: RobloxRuntimeContext, mode: RobloxViewportMode, custom: RobloxViewportSize): RobloxViewportConfig {
  const size = mode === 'Runtime' ? runtime.Workspace.CurrentCamera.ViewportSize : mode === 'Custom' ? custom : presets[mode]
  const inset = runtime.GuiService.GetGuiInset()
  return { size: { X: Math.max(1, Math.round(size.X)), Y: Math.max(1, Math.round(size.Y)) }, inset: { Min: { ...inset.Min }, Max: { ...inset.Max } } }
}

export function parameterDeviceToViewportMode(value: unknown): RobloxViewportMode | undefined {
  if (value === 'Mobile') return 'PhonePortrait'
  if (value === 'Gamepad') return 'Desktop'
  if (value === 'Desktop') return 'Runtime'
  return undefined
}
