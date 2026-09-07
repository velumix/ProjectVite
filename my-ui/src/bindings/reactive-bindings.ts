import type { RobloxInstanceJson } from '../renderer/RobloxRenderer.tsx'
import type { NervePreviewAdapter } from '../nerve/contracts.ts'

export type BindingFormatter = (value: unknown, state: Record<string, unknown>) => unknown
export type RobloxBinding = {
  __kind: 'RobloxBinding'
  Path: string
  Format?: BindingFormatter
  Compute?: (state: Record<string, unknown>) => unknown
  Dependencies?: string[]
}

export function bind(Path: string, options: { Format?: BindingFormatter } = {}): RobloxBinding {
  return { __kind: 'RobloxBinding', Path, Format: options.Format }
}

export function computed(Dependencies: string[], Compute: (state: Record<string, unknown>) => unknown): RobloxBinding {
  return { __kind: 'RobloxBinding', Path: '', Dependencies, Compute }
}

export type BindingChange = { Path: string; Value: unknown; PreviousValue: unknown }

export type ReactiveBindingStore = {
  reset(state: Record<string, unknown>): void
  set(Path: string, value: unknown): void
  get(Path: string): unknown
  getState(): Record<string, unknown>
  subscribe(listener: (change: BindingChange) => void): () => void
  subscribePath(Path: string, listener: (value: unknown, previousValue: unknown) => void): () => void
  connectSignal(adapter: NervePreviewAdapter, Service: string, Signal: string, Path: string, map?: (...args: unknown[]) => unknown): () => void
}

export function createReactiveBindingStore(initialState: Record<string, unknown> = {}): ReactiveBindingStore {
  let state = structuredClone(initialState)
  const listeners = new Set<(change: BindingChange) => void>()
  const pathListeners = new Map<string, Set<(value: unknown, previousValue: unknown) => void>>()
  return {
    reset(nextState) {
      state = structuredClone(nextState)
      for (const listener of listeners) listener({ Path: '', Value: state, PreviousValue: undefined })
    },
    set(Path, value) {
      const previousValue = readPath(state, Path)
      writePath(state, Path, value)
      const change = { Path, Value: value, PreviousValue: previousValue }
      for (const listener of listeners) listener(change)
      for (const listener of pathListeners.get(Path) ?? []) listener(value, previousValue)
    },
    get: (Path) => readPath(state, Path),
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
    subscribePath(Path, listener) {
      const entries = pathListeners.get(Path) ?? new Set()
      entries.add(listener)
      pathListeners.set(Path, entries)
      return () => entries.delete(listener)
    },
    connectSignal(adapter, Service, Signal, Path, map = (value) => value) {
      const service = adapter.GetService(Service)
      const endpoint = service[Signal]
      if (!endpoint || !('connect' in endpoint) || typeof endpoint.connect !== 'function') throw new Error(`Nerve signal not found: ${Service}.${Signal}`)
      return endpoint.connect((...args: unknown[]) => this.set(Path, map(...args)))
    },
  }
}

export function applyBindings(tree: RobloxInstanceJson, store: ReactiveBindingStore): RobloxInstanceJson {
  function visit(instance: RobloxInstanceJson): RobloxInstanceJson {
    const properties = Object.fromEntries(Object.entries(instance).map(([property, value]) => [property, resolveValue(value, store)]))
    return { ...properties, Children: instance.Children?.map(visit) } as RobloxInstanceJson
  }
  return visit(tree)
}

function resolveValue(value: unknown, store: ReactiveBindingStore): unknown {
  if (isBinding(value)) {
    const raw = value.Compute ? value.Compute(store.getState()) : store.get(value.Path)
    return value.Format ? value.Format(raw, store.getState()) : raw
  }
  if (Array.isArray(value)) return value.map((entry) => resolveValue(entry, store))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, resolveValue(entry, store)]))
  return value
}

function isBinding(value: unknown): value is RobloxBinding {
  return typeof value === 'object' && value !== null && (value as { __kind?: unknown }).__kind === 'RobloxBinding'
}

function readPath(state: Record<string, unknown>, Path: string): unknown {
  if (!Path) return state
  return Path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, state)
}

function writePath(state: Record<string, unknown>, Path: string, value: unknown): void {
  const keys = Path.split('.')
  const finalKey = keys.pop()
  if (!finalKey) return
  let target = state
  for (const key of keys) {
    if (!target[key] || typeof target[key] !== 'object') target[key] = {}
    target = target[key] as Record<string, unknown>
  }
  target[finalKey] = value
}
