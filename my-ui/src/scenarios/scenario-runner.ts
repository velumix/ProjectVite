import type { BrowserNetworkAdapter } from '../shared/network-adapter.ts'
import type { NervePreviewAdapter } from '../nerve/contracts.ts'
import type { EffectPlayer } from '../effects/roblox-effects.ts'
import type { ReactiveBindingStore } from '../bindings/reactive-bindings.ts'
import type { RobloxRuntimeContext, RobloxRuntimeOverrides } from '../runtime/roblox-runtime.ts'
import type { RobloxPersistence, PersistenceOverrides } from '../persistence/roblox-persistence.ts'
import type { RobloxRealm } from '../realm/roblox-realm.ts'
import { createScenarioTrace } from './scenario-trace.ts'
import type { ScenarioAssertion, ScenarioTrace } from './scenario-trace.ts'

export type ScenarioContext = {
  state: Record<string, unknown>
  nerve: NervePreviewAdapter
  network: BrowserNetworkAdapter
  effects: EffectPlayer
  bindings: ReactiveBindingStore
  timeMs: number
  onCleanup(cleanup: () => void): void
  runtime: RobloxRuntimeContext
  persistence: RobloxPersistence
  realm: RobloxRealm
  emit(name: string, payload?: unknown): void
  log(message: string, payload?: unknown): void
  trace: ScenarioTrace
  parameters: Record<string, unknown>
}

export type ScenarioStep = {
  afterMs: number
  label?: string
  run(context: ScenarioContext): void
}

export type ScenarioParameter =
  | { type: 'number'; default: number; min?: number; max?: number; step?: number }
  | { type: 'boolean'; default: boolean }
  | { type: 'string'; default: string }
  | { type: 'select'; default: string; options: string[] }

export const number = (defaultValue: number, options: Omit<Extract<ScenarioParameter, { type: 'number' }>, 'type' | 'default'> = {}): ScenarioParameter => ({ type: 'number', default: defaultValue, ...options })
export const boolean = (defaultValue: boolean): ScenarioParameter => ({ type: 'boolean', default: defaultValue })
export const string = (defaultValue: string): ScenarioParameter => ({ type: 'string', default: defaultValue })
export const select = (options: string[], defaultValue = options[0] ?? ''): ScenarioParameter => ({ type: 'select', options, default: defaultValue })

export type ScenarioTrigger = {
  id: string
  label: string
  run(context: ScenarioContext): void
}

export type PreviewScenario = {
  id: string
  name: string
  initialState: Record<string, unknown>
  configure?(context: ScenarioContext): void
  steps: ScenarioStep[]
  triggers?: ScenarioTrigger[]
  Runtime?: RobloxRuntimeOverrides
  Persistence?: PersistenceOverrides
  Assertions?: ScenarioAssertion[]
  parameters?: Record<string, ScenarioParameter>
}

export type PlaybackSpeed = 0.25 | 0.5 | 1 | 2

export type ScenarioPlaybackState = {
  scenarioId?: string
  timeMs: number
  durationMs: number
  currentStep?: string
  playing: boolean
  speed: PlaybackSpeed
}

export type ScenarioRunner = {
  start(scenario: PreviewScenario): void
  stop(): void
  play(): void
  pause(): void
  restart(): void
  stepForward(): void
  scrub(timeMs: number): void
  setSpeed(speed: PlaybackSpeed): void
  trigger(triggerId: string): void
  getState(): ScenarioPlaybackState
  subscribe(listener: (state: ScenarioPlaybackState) => void): () => void
  getTrace(): ScenarioTrace
  getParameters(): Record<string, unknown>
  setParameter(name: string, value: unknown): void
}

export function createScenarioRunner(dependencies: { nerve: NervePreviewAdapter; network: BrowserNetworkAdapter; effects: EffectPlayer; bindings: ReactiveBindingStore; runtime: RobloxRuntimeContext; persistence: RobloxPersistence; realm: RobloxRealm }): ScenarioRunner {
  let scenario: PreviewScenario | undefined
  let context: ScenarioContext | undefined
  let executedSteps = 0
  let tickHandle: number | undefined
  let lastTick = 0
  let playback: ScenarioPlaybackState = { timeMs: 0, durationMs: 0, playing: false, speed: 1 }
  let cleanups: (() => void)[] = []
  const trace = createScenarioTrace()
  const evaluatedAssertions = new Set<string>()
  const listeners = new Set<(state: ScenarioPlaybackState) => void>()
  let parameterValues: Record<string, unknown> = {}

  function notify(): void {
    const snapshot = { ...playback }
    for (const listener of listeners) listener(snapshot)
  }

  function resetRuntime(targetTimeMs = 0): void {
    if (!scenario) return
    for (const cleanup of cleanups) cleanup()
    cleanups = []
    trace.reset()
    evaluatedAssertions.clear()
    dependencies.network.setHandlers({})
    dependencies.bindings.reset(scenario.initialState)
    dependencies.runtime.reset(scenario.Runtime)
    dependencies.persistence.reset({ ...scenario.Persistence, PreserveBetweenRuns: scenario.Persistence?.PreserveBetweenRuns })
    dependencies.realm.reset()
    context = {
      state: dependencies.bindings.getState(),
      nerve: dependencies.nerve,
      network: dependencies.network,
      effects: dependencies.effects,
      bindings: dependencies.bindings,
      timeMs: 0,
      onCleanup: (cleanup) => cleanups.push(cleanup),
      runtime: dependencies.runtime,
      persistence: dependencies.persistence,
      realm: dependencies.realm,
      emit: (name, payload) => trace.record('signal', name, playback.timeMs, payload),
      log: (message, payload) => console.info(`[Scenario:${scenario?.id}] ${message}`, payload),
      trace,
      parameters: parameterValues,
    }
    cleanups.push(dependencies.bindings.subscribe((change) => trace.record('state', change.Path, playback.timeMs, change)))
    cleanups.push(dependencies.persistence.subscribe((operation, key, payload) => trace.record('persistence', operation, playback.timeMs, { key, payload })))
    dependencies.effects.setTrace(trace)
    dependencies.realm.setTrace(trace, () => playback.timeMs)
    scenario.configure?.(context)
    dependencies.effects.reset()
    executedSteps = 0
    playback = { ...playback, timeMs: 0, currentStep: undefined }
    advanceTo(targetTimeMs)
  }

  function advanceTo(targetTimeMs: number): void {
    if (!scenario || !context) return
    playback.timeMs = Math.max(0, Math.min(targetTimeMs, playback.durationMs))
    context.timeMs = playback.timeMs
    dependencies.runtime.setTime(playback.timeMs)
    while (executedSteps < scenario.steps.length && scenario.steps[executedSteps].afterMs <= playback.timeMs) {
      const step = scenario.steps[executedSteps]
      context.timeMs = playback.timeMs
      step.run(context)
      playback.currentStep = step.label ?? `Step ${executedSteps + 1}`
      executedSteps += 1
    }
    dependencies.effects.setTime(playback.timeMs)
    for (const assertion of scenario.Assertions ?? []) {
      const key = `${assertion.atMs}:${assertion.name}`
      if (assertion.atMs <= playback.timeMs && !evaluatedAssertions.has(key)) {
        try { assertion.check({ state: context.state, trace, persistence: dependencies.persistence }); trace.record('assertion', assertion.name, assertion.atMs, { passed: true }) }
        catch (error) { trace.record('error', assertion.name, assertion.atMs, { error: error instanceof Error ? error.message : String(error) }) }
        evaluatedAssertions.add(key)
      }
    }
    if (playback.timeMs >= playback.durationMs) playback.playing = false
    notify()
  }

  function tick(): void {
    if (!playback.playing) return
    const now = performance.now()
    const elapsed = Math.max(0, now - lastTick)
    lastTick = now
    advanceTo(playback.timeMs + elapsed * playback.speed)
  }

  function startTicker(): void {
    if (tickHandle !== undefined) return
    lastTick = performance.now()
    tickHandle = window.setInterval(tick, 16)
  }

  function stopTicker(): void {
    if (tickHandle === undefined) return
    window.clearInterval(tickHandle)
    tickHandle = undefined
  }

  const runner: ScenarioRunner = {
    start(nextScenario) {
      runner.stop()
      scenario = nextScenario
      parameterValues = Object.fromEntries(Object.entries(scenario.parameters ?? {}).map(([name, definition]) => [name, definition.default]))
    playback = { scenarioId: scenario.id, timeMs: 0, durationMs: Math.max(1000, ...scenario.steps.map((step) => step.afterMs)), playing: true, speed: playback.speed }
      resetRuntime()
      startTicker()
      notify()
    },
    stop() {
      stopTicker()
      scenario = undefined
      context = undefined
      executedSteps = 0
      dependencies.network.setHandlers({})
      dependencies.effects.reset()
      dependencies.bindings.reset({})
      dependencies.runtime.reset()
      dependencies.persistence.reset()
      dependencies.realm.reset()
      dependencies.effects.setTrace(undefined)
      dependencies.realm.setTrace(undefined)
      for (const cleanup of cleanups) cleanup()
      cleanups = []
      playback = { timeMs: 0, durationMs: 0, playing: false, speed: playback.speed }
      notify()
    },
    play() {
      if (!scenario || playback.timeMs >= playback.durationMs) return
      playback.playing = true
      startTicker()
      notify()
    },
    pause() {
      playback.playing = false
      notify()
    },
    restart() {
      if (!scenario) return
      playback.playing = true
      resetRuntime()
      startTicker()
      notify()
    },
    stepForward() {
      if (!scenario) return
      playback.playing = false
      const nextTime = scenario.steps[executedSteps]?.afterMs ?? Math.min(playback.durationMs, playback.timeMs + 100)
      advanceTo(nextTime)
    },
    scrub(timeMs) {
      if (!scenario) return
      playback.playing = false
      resetRuntime(Math.round(timeMs))
      notify()
    },
    setSpeed(speed) {
      playback.speed = speed
      notify()
    },
    trigger(triggerId) {
      const trigger = scenario?.triggers?.find((candidate) => candidate.id === triggerId)
      if (!trigger || !context) return
      trigger.run(context)
      playback.currentStep = trigger.label
      notify()
    },
    getState: () => ({ ...playback }),
    subscribe(listener) {
      listeners.add(listener)
      listener({ ...playback })
      return () => listeners.delete(listener)
    },
    getTrace: () => trace,
    getParameters: () => ({ ...parameterValues }),
    setParameter(name, value) {
      if (!scenario || !(name in (scenario.parameters ?? {}))) return
      const definition = scenario.parameters?.[name]
      if (definition?.type === 'number' && typeof value === 'number') parameterValues[name] = Math.min(definition.max ?? value, Math.max(definition.min ?? value, value))
      else if (definition?.type === 'boolean' && typeof value === 'boolean') parameterValues[name] = value
      else if ((definition?.type === 'string' || definition?.type === 'select') && typeof value === 'string') parameterValues[name] = definition.type === 'select' && !definition.options.includes(value) ? definition.default : value
      else return
      playback.playing = true
      resetRuntime()
      startTicker()
      notify()
    },
  }
  return runner
}
