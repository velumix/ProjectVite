import type { RobloxInstanceJson } from '../renderer/RobloxRenderer.tsx'
import type { NerveNetworkManifest } from '../nerve/manifest.ts'

export const STUDIO_SYNC_PROTOCOL = 'projectvite.studio-sync.v1'

export type SyncArtifact = {
  path: string
  kind: 'service' | 'controller' | 'shared' | 'network' | 'ui'
  source: string
  hash: string
}

export type SyncInstanceOperation = {
  path: string
  hash: string
  tree?: RobloxInstanceJson
  type: 'upsert' | 'delete'
}

export type SyncBundle = {
  protocol: typeof STUDIO_SYNC_PROTOCOL
  projectId: string
  revision: number
  rootName: string
  manifest: NerveNetworkManifest
  operations: SyncInstanceOperation[]
  artifacts: SyncArtifact[]
}

export type SyncStatus =
  | { state: 'idle' }
  | { state: 'syncing'; revision: number }
  | { state: 'synced'; revision: number; operationCount: number }
  | { state: 'error'; message: string }

export type SyncResponse = {
  protocol: typeof STUDIO_SYNC_PROTOCOL
  accepted: boolean
  revision: number
  operationCount: number
  error?: string
}

export function flattenInstanceTree(tree: RobloxInstanceJson, rootPath = ''): Map<string, RobloxInstanceJson> {
  const result = new Map<string, RobloxInstanceJson>()
  visit(tree, rootPath, result)
  return result
}

function visit(instance: RobloxInstanceJson, parentPath: string, result: Map<string, RobloxInstanceJson>): void {
  const siblings = instance.Children ?? []
  const index = siblings.length === 0 ? 0 : 0
  const path = `${parentPath}/${pathSegment(instance, index)}`
  result.set(path, { ...instance, Children: [] })
  const counts = new Map<string, number>()
  for (const child of siblings) {
    const key = child.Name ?? child.ClassName
    const childIndex = counts.get(key) ?? 0
    counts.set(key, childIndex + 1)
    visitAt(child, path, childIndex, result)
  }
}

function visitAt(instance: RobloxInstanceJson, parentPath: string, index: number, result: Map<string, RobloxInstanceJson>): void {
  const path = `${parentPath}/${pathSegment(instance, index)}`
  result.set(path, { ...instance, Children: [] })
  const counts = new Map<string, number>()
  for (const child of instance.Children ?? []) {
    const key = child.Name ?? child.ClassName
    const childIndex = counts.get(key) ?? 0
    counts.set(key, childIndex + 1)
    visitAt(child, path, childIndex, result)
  }
}

export function pathSegment(instance: RobloxInstanceJson, index: number): string {
  const name = instance.Name ?? instance.ClassName
  return `${encodeURIComponent(name)}~${index}`
}

export function diffInstanceTrees(previous: RobloxInstanceJson | undefined, next: RobloxInstanceJson): SyncInstanceOperation[] {
  const before = previous ? flattenInstanceTree(previous) : new Map<string, RobloxInstanceJson>()
  const after = flattenInstanceTree(next)
  const operations: SyncInstanceOperation[] = []
  for (const [path, tree] of after) {
    const oldTree = before.get(path)
    const hash = stableHash(tree)
    if (!oldTree || stableHash(oldTree) !== hash) operations.push({ type: 'upsert', path, hash, tree })
  }
  for (const path of before.keys()) {
    if (!after.has(path)) operations.push({ type: 'delete', path, hash: stableHash({ path }) })
  }
  return operations.sort((left, right) => left.path.localeCompare(right.path) || left.type.localeCompare(right.type))
}

export function stableHash(value: unknown): string {
  let hash = 2166136261
  for (const character of stableStringify(value)) {
    hash ^= character.charCodeAt(0)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

function stableStringify(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`
  if (value && typeof value === 'object') {
    return `{${Object.entries(value).sort(([left], [right]) => left.localeCompare(right)).map(([key, entry]) => `${JSON.stringify(key)}:${stableStringify(entry)}`).join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}
