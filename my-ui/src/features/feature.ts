import type { ActionDefinition } from '../actions/action-layer.ts'
import type { RobloxEffect } from '../effects/roblox-effects.ts'
import type { PreviewScenario } from '../scenarios/scenario-runner.ts'
import type { ResolvedRobloxComponents } from '../components/roblox-components.ts'
import type { NerveNetworkManifest } from '../nerve/manifest.ts'

export type RobloxFeature = {
  Name: string
  UI: ResolvedRobloxComponents
  State: Record<string, unknown>
  Actions: Record<string, ActionDefinition>
  Effects: Record<string, RobloxEffect>
  Scenarios: PreviewScenario[]
  Nerve: { Services: string[]; Controllers: string[] }
  Network: NerveNetworkManifest['services']
  SharedModules?: Record<string, string>
  Dependencies?: { Features?: string[]; Services?: string[]; Controllers?: string[]; Actions?: string[]; Effects?: string[] }
}

export type ComposedRobloxFeatures = {
  UI: ResolvedRobloxComponents[]
  State: Record<string, unknown>
  Actions: Record<string, ActionDefinition>
  Effects: Record<string, RobloxEffect>
  Scenarios: PreviewScenario[]
  Nerve: { Services: string[]; Controllers: string[] }
  Network: NerveNetworkManifest['services']
}

export function composeFeatures(features: RobloxFeature[]): ComposedRobloxFeatures {
  const composed: ComposedRobloxFeatures = { UI: [], State: {}, Actions: {}, Effects: {}, Scenarios: [], Nerve: { Services: [], Controllers: [] }, Network: {} }
  for (const feature of features) {
    if (composed.Actions[feature.Name] || composed.Effects[feature.Name]) throw new Error(`Feature namespace collision: ${feature.Name}`)
    composed.UI.push(feature.UI)
    composed.State = mergeState(composed.State, feature.State)
    for (const [name, action] of Object.entries(feature.Actions)) {
      addUnique(composed.Actions, `${feature.Name}.${name}`, action)
      addUnique(composed.Actions, name, action)
    }
    for (const [name, effect] of Object.entries(feature.Effects)) addUnique(composed.Effects, `${feature.Name}.${name}`, effect)
    composed.Scenarios.push(...feature.Scenarios)
    composed.Nerve.Services.push(...feature.Nerve.Services)
    composed.Nerve.Controllers.push(...feature.Nerve.Controllers)
    for (const [service, endpoints] of Object.entries(feature.Network)) composed.Network[service] = { ...(composed.Network[service] ?? {}), ...endpoints }
  }
  composed.Nerve.Services = [...new Set(composed.Nerve.Services)]
  composed.Nerve.Controllers = [...new Set(composed.Nerve.Controllers)]
  return composed
}

function addUnique<T>(target: Record<string, T>, key: string, value: T): void {
  if (target[key]) throw new Error(`Feature export collision: ${key}`)
  target[key] = value
}

function mergeState(left: Record<string, unknown>, right: Record<string, unknown>): Record<string, unknown> {
  const output = structuredClone(left)
  for (const [key, value] of Object.entries(right)) output[key] = value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' ? mergeState(output[key] as Record<string, unknown>, value as Record<string, unknown>) : structuredClone(value)
  return output
}
