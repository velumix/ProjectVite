import type { RobloxColor3, RobloxInstanceJson, RobloxUDim2, RobloxVector2 } from '../renderer/RobloxRenderer.tsx'
import type { ScenarioTrace } from '../scenarios/scenario-trace.ts'

export type EasingStyle = 'Linear' | 'Quad' | 'Cubic' | 'Quart' | 'Quint' | 'Sine' | 'Back' | 'Elastic' | 'Bounce'
export type EasingDirection = 'In' | 'Out' | 'InOut'

export type TweenInfo = {
  Time: number
  EasingStyle?: EasingStyle
  EasingDirection?: EasingDirection
  RepeatCount?: number
  Reverses?: boolean
  DelayTime?: number
}

export type RobloxEffect =
  | { Type: 'Tween'; Target: string; Properties: Record<string, unknown>; TweenInfo: TweenInfo }
  | { Type: 'Delay'; Duration: number }
  | { Type: 'Sequence' | 'Parallel'; Effects: RobloxEffect[] }

export const tween = (Target: string, Properties: Record<string, unknown>, TweenInfo: TweenInfo): RobloxEffect => ({ Type: 'Tween', Target, Properties, TweenInfo })
export const delay = (Duration: number): RobloxEffect => ({ Type: 'Delay', Duration })
export const sequence = (...Effects: RobloxEffect[]): RobloxEffect => ({ Type: 'Sequence', Effects })
export const parallel = (...Effects: RobloxEffect[]): RobloxEffect => ({ Type: 'Parallel', Effects })

export type EffectPatch = { Target: string; Properties: Record<string, unknown> }

export type EffectPlayer = {
  play(name: string, atTimeMs: number): void
  cancel(name?: string): void
  reset(): void
  setTime(timeMs: number): void
  getPatches(): EffectPatch[]
  getTree(): RobloxInstanceJson
  setTrace(trace?: ScenarioTrace): void
}

export function createEffectPlayer(tree: RobloxInstanceJson, definitions: Record<string, RobloxEffect>): EffectPlayer {
  const active = new Map<string, { effect: RobloxEffect; startTime: number }>()
  let patches: EffectPatch[] = []
  let trace: ScenarioTrace | undefined
  return {
    play(name, atTimeMs) {
      const effect = definitions[name]
      if (!effect) throw new Error(`Unknown Roblox effect: ${name}`)
      active.set(name, { effect, startTime: atTimeMs })
      trace?.record('effect', name, atTimeMs)
      evaluate(atTimeMs)
    },
    cancel(name) {
      if (name) active.delete(name)
      else active.clear()
      patches = []
    },
    reset() {
      active.clear()
      patches = []
    },
    setTime(timeMs) {
      evaluate(timeMs)
    },
    getPatches: () => patches.map((patch) => ({ Target: patch.Target, Properties: { ...patch.Properties } })),
    getTree: () => applyEffectPatches(tree, patches),
    setTrace(nextTrace) { trace = nextTrace },
  }

  function evaluate(timeMs: number): void {
    const next: EffectPatch[] = []
    for (const [name, instance] of active) {
      const localTime = timeMs - instance.startTime
      const effectPatches = evaluateEffect(instance.effect, localTime, tree)
      next.push(...effectPatches)
      if (localTime >= effectDuration(instance.effect)) active.delete(name)
    }
    patches = mergePatches(next)
  }
}

export function effectDuration(effect: RobloxEffect): number {
  if (effect.Type === 'Delay') return effect.Duration
  if (effect.Type === 'Tween') {
    const info = effect.TweenInfo
    const cycles = Math.max(1, (info.RepeatCount ?? 0) + 1)
    return (info.DelayTime ?? 0) + info.Time * cycles
  }
  const durations = effect.Effects.map(effectDuration)
  return effect.Type === 'Sequence' ? durations.reduce((sum, value) => sum + value, 0) : Math.max(0, ...durations)
}

function evaluateEffect(effect: RobloxEffect, timeMs: number, tree: RobloxInstanceJson): EffectPatch[] {
  if (timeMs < 0) return []
  if (effect.Type === 'Delay') return []
  if (effect.Type === 'Sequence') {
    const patches: EffectPatch[] = []
    let offset = 0
    for (const child of effect.Effects) {
      patches.push(...evaluateEffect(child, timeMs - offset, tree))
      offset += effectDuration(child)
    }
    return mergePatches(patches)
  }
  if (effect.Type === 'Parallel') return mergePatches(effect.Effects.flatMap((child) => evaluateEffect(child, timeMs, tree)))
  if (effect.Type !== 'Tween') return []
  const info = effect.TweenInfo
  const delayedTime = timeMs - (info.DelayTime ?? 0)
  if (delayedTime < 0) return []
  const cycleDuration = Math.max(info.Time, 0.0001)
  const cycle = Math.floor(delayedTime / cycleDuration)
  if (info.RepeatCount !== undefined && info.RepeatCount >= 0 && cycle > info.RepeatCount) return []
  const cycleProgress = (delayedTime % cycleDuration) / cycleDuration
  const reverse = info.Reverses === true && cycle % 2 === 1
  const eased = ease(reverse ? 1 - cycleProgress : cycleProgress, info.EasingStyle ?? 'Quad', info.EasingDirection ?? 'Out')
  const target = findInstance(tree, effect.Target)
  const properties = Object.fromEntries(Object.entries(effect.Properties).map(([property, end]) => [property, interpolate(target?.[property], end, eased)]))
  return [{ Target: effect.Target, Properties: properties }]
}

function ease(value: number, style: EasingStyle, direction: EasingDirection): number {
  const base = style === 'Linear' ? value : style === 'Quad' ? value * value : style === 'Cubic' ? value ** 3 : style === 'Quart' ? value ** 4 : style === 'Quint' ? value ** 5 : style === 'Sine' ? 1 - Math.cos((value * Math.PI) / 2) : style === 'Back' ? value * value * (2.7 * value - 1.7) : style === 'Elastic' ? (value === 0 || value === 1 ? value : -(2 ** (10 * value - 10)) * Math.sin((value * 10 - 10.75) * ((2 * Math.PI) / 3))) : bounce(value)
  if (direction === 'In') return base
  if (direction === 'Out') return 1 - ease(1 - value, style, 'In')
  return value < 0.5 ? ease(value * 2, style, 'In') / 2 : 1 - ease((1 - value) * 2, style, 'In') / 2
}

function bounce(value: number): number {
  if (value < 1 / 2.75) return 7.5625 * value * value
  if (value < 2 / 2.75) { const adjusted = value - 1.5 / 2.75; return 7.5625 * adjusted * adjusted + 0.75 }
  if (value < 2.5 / 2.75) { const adjusted = value - 2.25 / 2.75; return 7.5625 * adjusted * adjusted + 0.9375 }
  const adjusted = value - 2.625 / 2.75
  return 7.5625 * adjusted * adjusted + 0.984375
}

function interpolate(start: unknown, end: unknown, amount: number): unknown {
  if (typeof start === 'number' && typeof end === 'number') return start + (end - start) * amount
  if (isColor(start) && isColor(end)) return { R: start.R + (end.R - start.R) * amount, G: start.G + (end.G - start.G) * amount, B: start.B + (end.B - start.B) * amount }
  if (isVector2(start) && isVector2(end)) return { X: start.X + (end.X - start.X) * amount, Y: start.Y + (end.Y - start.Y) * amount }
  if (isUDim2(start) && isUDim2(end)) return { X: { Scale: start.X.Scale + (end.X.Scale - start.X.Scale) * amount, Offset: start.X.Offset + (end.X.Offset - start.X.Offset) * amount }, Y: { Scale: start.Y.Scale + (end.Y.Scale - start.Y.Scale) * amount, Offset: start.Y.Offset + (end.Y.Offset - start.Y.Offset) * amount } }
  return amount < 1 ? start : end
}

function isColor(value: unknown): value is RobloxColor3 { return isRecord(value) && typeof value.R === 'number' && typeof value.G === 'number' && typeof value.B === 'number' }
function isVector2(value: unknown): value is RobloxVector2 { return isRecord(value) && typeof value.X === 'number' && typeof value.Y === 'number' }
function isUDim2(value: unknown): value is RobloxUDim2 { return isRecord(value) && isRecord(value.X) && isRecord(value.Y) && typeof value.X.Scale === 'number' && typeof value.Y.Scale === 'number' }
function isRecord(value: unknown): value is Record<string, any> { return typeof value === 'object' && value !== null && !Array.isArray(value) }

function findInstance(tree: RobloxInstanceJson, target: string): RobloxInstanceJson | undefined {
  const parts = target.split('/').filter(Boolean)
  if (parts.length === 0) return tree
  if ((tree.Name ?? tree.ClassName) !== parts[0]) return undefined
  let current: RobloxInstanceJson | undefined = tree
  for (const part of parts.slice(1)) current = current?.Children?.find((child) => (child.Name ?? child.ClassName) === part)
  return current
}

function mergePatches(input: EffectPatch[]): EffectPatch[] {
  const merged = new Map<string, Record<string, unknown>>()
  for (const patch of input) merged.set(patch.Target, { ...(merged.get(patch.Target) ?? {}), ...patch.Properties })
  return [...merged].map(([Target, Properties]) => ({ Target, Properties }))
}

export function applyEffectPatches(tree: RobloxInstanceJson, patches: EffectPatch[]): RobloxInstanceJson {
  const byTarget = new Map(patches.map((patch) => [patch.Target, patch.Properties]))
  function visit(instance: RobloxInstanceJson, path: string): RobloxInstanceJson {
    return { ...instance, ...(byTarget.has(path) ? byTarget.get(path) : {}), Children: instance.Children?.map((child) => visit(child, `${path}/${child.Name ?? child.ClassName}`)) }
  }
  return visit(tree, tree.Name ?? tree.ClassName)
}
