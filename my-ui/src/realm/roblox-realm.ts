import type { RobloxPersistence } from '../persistence/roblox-persistence.ts'
import type { RobloxPlayer } from '../runtime/roblox-runtime.ts'
import type { ScenarioTrace } from '../scenarios/scenario-trace.ts'

export type RealmDisconnect = () => void
type Listener<T extends unknown[]> = (...args: T) => void

export type RobloxRealm = {
  Server: RobloxRealmServer
  clients: Map<number, RobloxRealmClient>
  reset(): void
  connectPlayer(player?: Partial<RobloxPlayer>): RobloxRealmClient
  disconnectPlayer(userId: number): void
  setTrace(trace?: ScenarioTrace, getTimeMs?: () => number): void
}

export type RobloxRealmServer = {
  Players: { GetPlayers(): RobloxPlayer[]; PlayerAdded: { connect(listener: Listener<[RobloxPlayer]>): RealmDisconnect }; PlayerRemoving: { connect(listener: Listener<[RobloxPlayer]>): RealmDisconnect } }
  registerMethod(service: string, method: string, handler: (player: RobloxPlayer, payload: unknown) => unknown | Promise<unknown>): void
  registerClientSignal(service: string, signal: string, handler: (player: RobloxPlayer, payload: unknown) => void): void
  Fire(service: string, signal: string, player: RobloxPlayer, payload?: unknown): void
  FireAll(service: string, signal: string, payload?: unknown): void
  FireExcept(service: string, signal: string, excluded: RobloxPlayer, payload?: unknown): void
  FireList(service: string, signal: string, players: RobloxPlayer[], payload?: unknown): void
}

export type RobloxRealmClient = {
  LocalPlayer: RobloxPlayer
  request(service: string, method: string, payload: unknown): Promise<unknown>
  sendSignal(service: string, signal: string, payload: unknown): void
  connect(service: string, signal: string, listener: (payload: unknown) => void): RealmDisconnect
}

export function createRobloxRealm(persistence: RobloxPersistence): RobloxRealm {
  const clients = new Map<number, RobloxRealmClient>()
  const methods = new Map<string, (player: RobloxPlayer, payload: unknown) => unknown | Promise<unknown>>()
  const clientSignals = new Map<string, (player: RobloxPlayer, payload: unknown) => void>()
  const serverSignals = new Map<string, Set<(payload: unknown) => void>>()
  const added = new Set<Listener<[RobloxPlayer]>>(); const removing = new Set<Listener<[RobloxPlayer]>>()
  let nextUserId = 100
  let trace: ScenarioTrace | undefined
  let getTimeMs = () => 0
  const key = (service: string, endpoint: string) => `${service}.${endpoint}`
  const server: RobloxRealmServer = {
    Players: { GetPlayers: () => [...clients.values()].map((client) => client.LocalPlayer), PlayerAdded: { connect: (listener) => { added.add(listener); return () => added.delete(listener) } }, PlayerRemoving: { connect: (listener) => { removing.add(listener); return () => removing.delete(listener) } } },
    registerMethod: (service, method, handler) => { methods.set(key(service, method), handler) },
    registerClientSignal: (service, signal, handler) => { clientSignals.set(key(service, signal), handler) },
    Fire: (service, signal, player, payload) => { trace?.record('signal', `${service}.${signal}.Fire`, getTimeMs(), { player: player.UserId, payload }); emit(clients.get(player.UserId), service, signal, payload) },
    FireAll: (service, signal, payload) => { trace?.record('signal', `${service}.${signal}.FireAll`, getTimeMs(), payload); for (const client of clients.values()) emit(client, service, signal, payload) },
    FireExcept: (service, signal, excluded, payload) => { trace?.record('signal', `${service}.${signal}.FireExcept`, getTimeMs(), { player: excluded.UserId, payload }); for (const client of clients.values()) if (client.LocalPlayer.UserId !== excluded.UserId) emit(client, service, signal, payload) },
    FireList: (service, signal, players, payload) => { trace?.record('signal', `${service}.${signal}.FireList`, getTimeMs(), { players: players.map((player) => player.UserId), payload }); for (const player of players) emit(clients.get(player.UserId), service, signal, payload) },
  }
  const realm: RobloxRealm = {
    Server: server,
    clients,
    reset() { clients.clear(); methods.clear(); clientSignals.clear(); serverSignals.clear() },
    connectPlayer(overrides = {}) {
      const player = { Name: overrides.Name ?? `Player${nextUserId}`, UserId: overrides.UserId ?? nextUserId++, DisplayName: overrides.DisplayName ?? overrides.Name, ...overrides }
      const client: RobloxRealmClient = { LocalPlayer: player, request: async (service, method, payload) => { const handler = methods.get(key(service, method)); if (!handler) throw new Error(`Realm method not found: ${service}.${method}`); return handler(player, payload) }, sendSignal: (service, signal, payload) => clientSignals.get(key(service, signal))?.(player, payload), connect: (service, signal, listener) => { const eventKey = `${player.UserId}:${key(service, signal)}`; const set = serverSignals.get(eventKey) ?? new Set(); set.add(listener); serverSignals.set(eventKey, set); return () => set.delete(listener) } }
      clients.set(player.UserId, client); trace?.record('player', 'PlayerAdded', getTimeMs(), player); for (const listener of added) listener(player); return client
    },
    disconnectPlayer(userId) { const client = clients.get(userId); if (!client) return; clients.delete(userId); trace?.record('player', 'PlayerRemoving', getTimeMs(), client.LocalPlayer); for (const listener of removing) listener(client.LocalPlayer) },
    setTrace(nextTrace, clock) { trace = nextTrace; getTimeMs = clock ?? (() => 0) },
  }
  function emit(client: RobloxRealmClient | undefined, service: string, signal: string, payload: unknown): void { if (!client) return; trace?.record('signal', `${service}.${signal}.Received`, getTimeMs(), { player: client.LocalPlayer.UserId, payload }); for (const listener of serverSignals.get(`${client.LocalPlayer.UserId}:${key(service, signal)}`) ?? []) listener(payload) }
  void persistence
  return realm
}
