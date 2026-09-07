export type ProfileData = Record<string, unknown>
export type PersistenceFailure = 'Get' | 'Set' | 'Update' | 'Remove' | 'LoadProfile' | 'Release'
export type PersistenceOverrides = { Fail?: PersistenceFailure[]; Timeout?: PersistenceFailure[]; PreserveBetweenRuns?: boolean; Profiles?: Record<string, ProfileData>; Locked?: string[] }

export type RobloxPersistence = {
  DataStoreService: { GetDataStore(name: string): RobloxDataStore }
  ProfileStore: { LoadProfileAsync(key: string): Promise<RobloxProfile | undefined> }
  reset(overrides?: PersistenceOverrides): void
  snapshot(): Record<string, ProfileData>
  subscribe(listener: (operation: string, key: string, payload?: unknown) => void): () => void
}

export type RobloxDataStore = {
  GetAsync(key: string): Promise<unknown>
  SetAsync(key: string, value: unknown): Promise<void>
  UpdateAsync(key: string, transform: (value: unknown) => unknown): Promise<unknown>
  RemoveAsync(key: string): Promise<void>
}

export type RobloxProfile = ProfileData & {
  Key: string
  IsActive: boolean
  Release(): Promise<void>
  Reconcile(defaults: ProfileData): void
}

export function createRobloxPersistence(): RobloxPersistence {
  let stores = new Map<string, Map<string, unknown>>()
  let profiles: Record<string, ProfileData> = {}
  let locks = new Set<string>()
  let overrides: PersistenceOverrides = {}
  const listeners = new Set<(operation: string, key: string, payload?: unknown) => void>()
  const shouldFail = (operation: PersistenceFailure) => overrides.Fail?.includes(operation)
  const shouldTimeout = (operation: PersistenceFailure) => overrides.Timeout?.includes(operation)
  const operation = async <T>(name: PersistenceFailure, run: () => T, key = ''): Promise<T> => {
    for (const listener of listeners) listener(name, key)
    if (shouldTimeout(name)) return new Promise<T>(() => undefined)
    try {
      if (shouldFail(name)) throw new Error(`Mock ${name} failure`)
      const result = structuredClone(run())
      for (const listener of listeners) listener(`${name}Completed`, key, result)
      return result
    } catch (error) {
      for (const listener of listeners) listener(`${name}Failed`, key, error instanceof Error ? error.message : String(error))
      throw error
    }
  }
  const getStore = (name: string): RobloxDataStore => {
    const values = stores.get(name) ?? new Map<string, unknown>()
    stores.set(name, values)
    return {
      GetAsync: (key) => operation('Get', () => values.get(key), key),
      SetAsync: (key, value) => operation('Set', () => { values.set(key, structuredClone(value)) }, key),
      UpdateAsync: (key, transform) => operation('Update', () => { const next = transform(values.get(key)); values.set(key, structuredClone(next)); return next }, key),
      RemoveAsync: (key) => operation('Remove', () => { values.delete(key) }, key),
    }
  }
  return {
    DataStoreService: { GetDataStore: getStore },
    ProfileStore: {
      async LoadProfileAsync(key) {
        for (const listener of listeners) listener('LoadProfile', key)
        if (locks.has(key)) { if (shouldFail('LoadProfile')) throw new Error(`Profile locked: ${key}`); return undefined }
        if (shouldTimeout('LoadProfile')) return new Promise<RobloxProfile | undefined>(() => undefined)
        locks.add(key)
        const data = profiles[key] ?? {}
        const profile = { ...structuredClone(data), Key: key, IsActive: true } as RobloxProfile
        profile.Release = async () => { for (const listener of listeners) listener('Release', key); if (shouldFail('Release')) throw new Error('Mock Release failure'); locks.delete(key); profiles[key] = profileData(profile); profile.IsActive = false; for (const listener of listeners) listener('ReleaseCompleted', key) }
        profile.Reconcile = (defaults: ProfileData) => { for (const [field, value] of Object.entries(defaults)) if (profile[field] === undefined) profile[field] = structuredClone(value) }
        return profile
      },
    },
    reset(nextOverrides = {}) { if (!nextOverrides.PreserveBetweenRuns) { stores = new Map(); profiles = structuredClone(nextOverrides.Profiles ?? {}) } overrides = nextOverrides; locks = new Set(nextOverrides.Locked ?? []) },
    snapshot: () => structuredClone(profiles),
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
  }
}

function profileData(profile: RobloxProfile): ProfileData {
  return Object.fromEntries(Object.entries(profile).filter(([key, value]) => key !== 'Key' && key !== 'IsActive' && typeof value !== 'function').map(([key, value]) => [key, structuredClone(value)]))
}
