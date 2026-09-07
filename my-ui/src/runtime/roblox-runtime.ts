export type RobloxViewportSize = { X: number; Y: number }
export type RobloxPlayer = { Name: string; UserId: number; DisplayName?: string; [key: string]: unknown }
export type RobloxRuntimeOverrides = {
  Players?: { LocalPlayer?: RobloxPlayer }
  Workspace?: { CurrentCamera?: { ViewportSize?: RobloxViewportSize } }
  UserInputService?: { MouseEnabled?: boolean; TouchEnabled?: boolean; GamepadEnabled?: boolean; PreferredInput?: 'KeyboardAndMouse' | 'Touch' | 'Gamepad' }
  GuiService?: { GuiInset?: { Min: RobloxViewportSize; Max: RobloxViewportSize }; TopbarEnabled?: boolean }
  CollectionService?: { Tags?: Record<string, string[]> }
}

export type RobloxRuntimeContext = {
  Players: { LocalPlayer: RobloxPlayer }
  Workspace: { CurrentCamera: { ViewportSize: RobloxViewportSize } }
  UserInputService: { MouseEnabled: boolean; TouchEnabled: boolean; GamepadEnabled: boolean; PreferredInput: string }
  GuiService: { GetGuiInset(): { Min: RobloxViewportSize; Max: RobloxViewportSize }; TopbarEnabled: boolean }
  RunService: { GetTime(): number; IsStudio(): boolean }
  CollectionService: { GetTagged(tag: string): string[]; HasTag(instance: string, tag: string): boolean; AddTag(instance: string, tag: string): void; RemoveTag(instance: string, tag: string): void }
  reset(overrides?: RobloxRuntimeOverrides): void
  setTime(timeMs: number): void
  getTimeMs(): number
}

const defaults: Required<RobloxRuntimeOverrides> = {
  Players: { LocalPlayer: { Name: 'Player', UserId: 1, DisplayName: 'Player' } },
  Workspace: { CurrentCamera: { ViewportSize: { X: 1280, Y: 720 } } },
  UserInputService: { MouseEnabled: true, TouchEnabled: false, GamepadEnabled: false, PreferredInput: 'KeyboardAndMouse' },
  GuiService: { GuiInset: { Min: { X: 0, Y: 0 }, Max: { X: 0, Y: 0 } }, TopbarEnabled: true },
  CollectionService: { Tags: {} },
}

export function createRobloxRuntimeContext(): RobloxRuntimeContext {
  let timeMs = 0
  let state = structuredClone(defaults)
  return {
    get Players() { return state.Players as { LocalPlayer: RobloxPlayer } },
    get Workspace() { return state.Workspace as { CurrentCamera: { ViewportSize: RobloxViewportSize } } },
    get UserInputService() { return state.UserInputService as { MouseEnabled: boolean; TouchEnabled: boolean; GamepadEnabled: boolean; PreferredInput: string } },
    get GuiService() { return { ...state.GuiService, GetGuiInset: () => state.GuiService.GuiInset } as RobloxRuntimeContext['GuiService'] },
    RunService: { GetTime: () => timeMs / 1000, IsStudio: () => true },
    CollectionService: {
      GetTagged: (tag) => [...(state.CollectionService.Tags ?? {})[tag] ?? []],
      HasTag: (instance, tag) => ((state.CollectionService.Tags ?? {})[tag] ?? []).includes(instance),
      AddTag: (instance, tag) => { const entries = (state.CollectionService.Tags ?? {})[tag] ?? []; if (!entries.includes(instance)) entries.push(instance); (state.CollectionService.Tags ??= {})[tag] = entries },
      RemoveTag: (instance, tag) => { (state.CollectionService.Tags ??= {})[tag] = ((state.CollectionService.Tags ?? {})[tag] ?? []).filter((entry) => entry !== instance) },
    },
    reset(overrides = {}) {
      state = merge(defaults, overrides)
      timeMs = 0
    },
    setTime: (nextTimeMs) => { timeMs = nextTimeMs },
    getTimeMs: () => timeMs,
  }
}

function merge<T extends Record<string, any>>(left: T, right: Partial<T>): T {
  const output: Record<string, any> = structuredClone(left)
  for (const [key, value] of Object.entries(right)) output[key] = value && typeof value === 'object' && !Array.isArray(value) ? merge(output[key] ?? {}, value) : value
  return output as T
}
