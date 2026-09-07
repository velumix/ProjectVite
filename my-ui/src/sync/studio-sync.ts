import type { RobloxInstanceJson } from '../renderer/RobloxRenderer.tsx'
import type { NerveNetworkManifest } from '../nerve/manifest.ts'
import { diffInstanceTrees, stableHash, type SyncBundle, type SyncResponse, type SyncStatus } from './protocol.ts'
import { exportRobloxTreeToRbxmx } from './rbxmx.ts'
import type { CompiledRobloxProject } from '../features/project-compiler.ts'

export type StudioSyncClient = {
  push(tree: RobloxInstanceJson, options: { manifest: NerveNetworkManifest; artifacts?: SyncBundle['artifacts']; projectId?: string; rootName?: string }): Promise<SyncResponse>
  pushCompiled(project: CompiledRobloxProject, options?: { projectId?: string; rootName?: string }): Promise<SyncResponse>
  getStatus(): SyncStatus
  getRbxmx(tree: RobloxInstanceJson): string
}

export function createStudioSyncClient(baseUrl = 'http://127.0.0.1:3210'): StudioSyncClient {
  let previousTree: RobloxInstanceJson | undefined
  let revision = 0
  let status: SyncStatus = { state: 'idle' }
  return {
    async push(tree, options) {
      revision += 1
      status = { state: 'syncing', revision }
      const operations = diffInstanceTrees(previousTree, tree)
      const bundle: SyncBundle = {
        protocol: 'projectvite.studio-sync.v1',
        projectId: options.projectId ?? 'ProjectVite',
        revision,
        rootName: options.rootName ?? 'ProjectViteSync',
        manifest: options.manifest,
        operations,
        artifacts: options.artifacts ?? [],
      }
      try {
        const response = await fetch(`${baseUrl}/v1/sync`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(bundle) })
        const result = (await response.json()) as SyncResponse
        if (!response.ok || !result.accepted) throw new Error(result.error ?? `Studio sync failed (${response.status})`)
        previousTree = tree
        status = { state: 'synced', revision, operationCount: operations.length }
        return result
      } catch (error) {
        status = { state: 'error', message: error instanceof Error ? error.message : String(error) }
        throw error
      }
    },
    pushCompiled(project, options = {}) {
      const artifacts = Object.entries(project.SharedModules).map(([path, source]) => makeSyncArtifact(path, 'shared', source))
      return this.push(project.Tree, { manifest: { version: 1, services: project.Network }, artifacts, projectId: options.projectId, rootName: options.rootName })
    },
    getStatus: () => status,
    getRbxmx: (tree) => exportRobloxTreeToRbxmx(tree),
  }
}

export function makeSyncArtifact(path: string, kind: SyncBundle['artifacts'][number]['kind'], source: string) {
  return { path, kind, source, hash: stableHash(source) }
}
