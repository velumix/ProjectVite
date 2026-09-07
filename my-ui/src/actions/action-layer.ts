import type { EffectPlayer } from '../effects/roblox-effects.ts'
import type { ReactiveBindingStore } from '../bindings/reactive-bindings.ts'
import type { NervePreviewAdapter } from '../nerve/contracts.ts'
import type { BrowserNetworkAdapter } from '../shared/network-adapter.ts'
import type { RobloxPersistence } from '../persistence/roblox-persistence.ts'
import type { ScenarioTrace } from '../scenarios/scenario-trace.ts'

export type ActionContext = {
  bindings: ReactiveBindingStore
  effects: EffectPlayer
  nerve: NervePreviewAdapter
  network: BrowserNetworkAdapter
  persistence: RobloxPersistence
  timeMs: number
  signal: AbortSignal
  trace: ScenarioTrace
}

export type ActionDefinition<TPayload = unknown, TResult = unknown> = {
  run(payload: TPayload, context: ActionContext): Promise<TResult> | TResult
}

export type ActionExecution<TResult = unknown> = {
  promise: Promise<TResult>
  cancel(): void
}

export type ActionRegistry = {
  run<TPayload, TResult>(name: string, payload: TPayload): ActionExecution<TResult>
  cancel(name?: string): void
}

export function createActionRegistry(
  definitions: Record<string, ActionDefinition>,
  dependencies: Omit<ActionContext, 'signal' | 'timeMs' | 'trace'> & { getTimeMs: () => number; getTrace: () => ScenarioTrace },
): ActionRegistry {
  const active = new Map<string, AbortController>()
  return {
    run: <TPayload, TResult>(name: string, payload: TPayload): ActionExecution<TResult> => {
      const definition = definitions[name]
      if (!definition) throw new Error(`Unknown preview action: ${name}`)
      active.get(name)?.abort()
      const controller = new AbortController()
      active.set(name, controller)
      dependencies.getTrace().record('action', name, dependencies.getTimeMs(), payload)
      const promise = Promise.resolve().then(() => definition.run(payload, { ...dependencies, timeMs: dependencies.getTimeMs(), trace: dependencies.getTrace(), signal: controller.signal })).finally(() => {
        if (active.get(name) === controller) active.delete(name)
      })
      return { promise: promise as Promise<TResult>, cancel: () => controller.abort() }
    },
    cancel(name) {
      if (name) active.get(name)?.abort()
      else for (const controller of active.values()) controller.abort()
    },
  }
}
