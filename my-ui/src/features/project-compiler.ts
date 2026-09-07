import type { RobloxInstanceJson } from '../renderer/RobloxRenderer.tsx'
import type { ActionDefinition } from '../actions/action-layer.ts'
import type { RobloxEffect } from '../effects/roblox-effects.ts'
import type { PreviewScenario } from '../scenarios/scenario-runner.ts'
import type { ComponentActionBinding, ComponentEffectHook, ResolvedRobloxComponents } from '../components/roblox-components.ts'
import type { NerveNetworkManifest } from '../nerve/manifest.ts'
import type { RobloxFeature } from './feature.ts'

export type CompiledRobloxProject = {
  Features: string[]
  UI: ResolvedRobloxComponents[]
  State: Record<string, unknown>
  Bindings: string[]
  Actions: Record<string, ActionDefinition>
  Effects: Record<string, RobloxEffect>
  Scenarios: PreviewScenario[]
  Nerve: { Services: string[]; Controllers: string[] }
  Network: NerveNetworkManifest['services']
  SharedModules: Record<string, string>
  ActionBindings: ComponentActionBinding[]
  EffectHooks: ComponentEffectHook[]
  Tree: RobloxInstanceJson
}

export function compileRobloxProject(features: RobloxFeature[]): CompiledRobloxProject {
  const featureNames = new Set<string>()
  const compiled: CompiledRobloxProject = { Features: [], UI: [], State: {}, Bindings: [], Actions: {}, Effects: {}, Scenarios: [], Nerve: { Services: [], Controllers: [] }, Network: {}, SharedModules: {}, ActionBindings: [], EffectHooks: [], Tree: { ClassName: 'ScreenGui', Name: 'CompiledProjectGui', Children: [] } }
  for (const feature of features) {
    if (featureNames.has(feature.Name)) throw new Error(`Duplicate feature: ${feature.Name}`)
    featureNames.add(feature.Name)
    compiled.Features.push(feature.Name)
  }
  for (const feature of features) {
    validateDependencies(feature, featureNames, compiled)
    validateTree(feature.Name, feature.UI.Tree, compiled)
    validateReferences(feature, compiled)
    compiled.UI.push(feature.UI)
    compiled.ActionBindings.push(...feature.UI.ActionBindings)
    compiled.EffectHooks.push(...feature.UI.EffectHooks)
    compiled.State = mergeState(compiled.State, feature.State)
    for (const [name, action] of Object.entries(feature.Actions)) addUnique(compiled.Actions, name, action, 'action')
    for (const [name, effect] of Object.entries(feature.Effects)) addUnique(compiled.Effects, name, effect, 'effect')
    compiled.Scenarios.push(...feature.Scenarios)
    for (const service of feature.Nerve.Services) addUniqueName(compiled.Nerve.Services, service, 'Nerve service')
    for (const controller of feature.Nerve.Controllers) addUniqueName(compiled.Nerve.Controllers, controller, 'Nerve controller')
    for (const [serviceName, endpoints] of Object.entries(feature.Network)) {
      const existing = compiled.Network[serviceName]
      if (!existing) compiled.Network[serviceName] = endpoints
      else for (const [endpointName, endpoint] of Object.entries(endpoints)) {
        if (existing[endpointName] && stable(existing[endpointName]) !== stable(endpoint)) throw new Error(`Conflicting network endpoint: ${serviceName}.${endpointName}`)
        existing[endpointName] = endpoint
      }
    }
    for (const [path, source] of Object.entries(feature.SharedModules ?? {})) {
      if (compiled.SharedModules[path] !== undefined && compiled.SharedModules[path] !== source) throw new Error(`Conflicting shared module: ${path}`)
      compiled.SharedModules[path] = source
    }
  }
  compiled.Bindings = collectBindingPaths(compiled.UI.map((document) => document.Tree))
  compiled.Tree.Children = compiled.UI.flatMap((document) => document.Tree.Children ?? [])
  for (const bindingPath of compiled.Bindings) if (bindingPath && readPath(compiled.State, bindingPath) === undefined) throw new Error(`Invalid binding reference: ${bindingPath}`)
  return compiled
}

function validateDependencies(feature: RobloxFeature, featureNames: Set<string>, compiled: CompiledRobloxProject): void {
  for (const dependency of feature.Dependencies?.Features ?? []) if (!featureNames.has(dependency)) throw new Error(`Missing feature dependency: ${feature.Name} -> ${dependency}`)
  for (const dependency of feature.Dependencies?.Services ?? []) if (!compiled.Nerve.Services.includes(dependency) && !feature.Nerve.Services.includes(dependency)) throw new Error(`Missing service dependency: ${feature.Name} -> ${dependency}`)
  for (const dependency of feature.Dependencies?.Controllers ?? []) if (!compiled.Nerve.Controllers.includes(dependency) && !feature.Nerve.Controllers.includes(dependency)) throw new Error(`Missing controller dependency: ${feature.Name} -> ${dependency}`)
  for (const dependency of feature.Dependencies?.Actions ?? []) if (!compiled.Actions[dependency] && !feature.Actions[dependency]) throw new Error(`Missing action dependency: ${feature.Name} -> ${dependency}`)
  for (const dependency of feature.Dependencies?.Effects ?? []) if (!compiled.Effects[dependency] && !feature.Effects[dependency]) throw new Error(`Missing effect dependency: ${feature.Name} -> ${dependency}`)
}

function validateReferences(feature: RobloxFeature, compiled: CompiledRobloxProject): void {
  for (const binding of feature.UI.ActionBindings) if (!feature.Actions[binding.Action] && !compiled.Actions[binding.Action]) throw new Error(`Invalid action reference: ${feature.Name} -> ${binding.Action}`)
  for (const hook of feature.UI.EffectHooks) if (!feature.Effects[hook.Effect] && !compiled.Effects[hook.Effect]) throw new Error(`Invalid effect reference: ${feature.Name} -> ${hook.Effect}`)
}

function validateTree(featureName: string, tree: RobloxInstanceJson, compiled: CompiledRobloxProject): void {
  const seen = new Set<string>()
  function visit(instance: RobloxInstanceJson, path: string): void {
    const name = instance.Name ?? instance.ClassName
    const fullPath = `${path}/${name}`
    if (seen.has(fullPath)) throw new Error(`Duplicate instance path: ${featureName}${fullPath}`)
    seen.add(fullPath)
    const siblingNames = new Set<string>()
    for (const child of instance.Children ?? []) {
      const childName = child.Name ?? child.ClassName
      if (siblingNames.has(childName)) throw new Error(`Duplicate instance name: ${featureName}${fullPath}/${childName}`)
      siblingNames.add(childName)
      visit(child, fullPath)
    }
  }
  visit(tree, '')
  const rootName = tree.Name ?? tree.ClassName
  if (compiled.UI.some((document) => (document.Tree.Name ?? document.Tree.ClassName) === rootName)) throw new Error(`Duplicate root instance path: ${rootName}`)
}

function collectBindingPaths(trees: RobloxInstanceJson[]): string[] {
  const paths = new Set<string>()
  const visit = (value: unknown): void => {
    if (value && typeof value === 'object') {
      if ((value as { __kind?: unknown }).__kind === 'RobloxBinding') {
        const binding = value as { Path?: string; Dependencies?: string[] }
        if (binding.Path) paths.add(binding.Path)
        for (const dependency of binding.Dependencies ?? []) paths.add(dependency)
      }
      for (const child of Object.values(value)) visit(child)
    }
  }
  trees.forEach(visit)
  return [...paths].sort()
}

function addUnique<T>(target: Record<string, T>, name: string, value: T, kind: string): void {
  if (target[name]) throw new Error(`Duplicate ${kind}: ${name}`)
  target[name] = value
}
function addUniqueName(target: string[], name: string, kind: string): void { if (target.includes(name)) throw new Error(`Duplicate ${kind}: ${name}`); target.push(name) }
function stable(value: unknown): string { return JSON.stringify(value, Object.keys(value as object).sort()) }
function mergeState(left: Record<string, unknown>, right: Record<string, unknown>): Record<string, unknown> {
  const output = structuredClone(left)
  for (const [key, value] of Object.entries(right)) output[key] = value && typeof value === 'object' && !Array.isArray(value) && output[key] && typeof output[key] === 'object' ? mergeState(output[key] as Record<string, unknown>, value as Record<string, unknown>) : structuredClone(value)
  return output
}
function readPath(state: Record<string, unknown>, path: string): unknown { return path.split('.').reduce<unknown>((value, key) => value && typeof value === 'object' ? (value as Record<string, unknown>)[key] : undefined, state) }
