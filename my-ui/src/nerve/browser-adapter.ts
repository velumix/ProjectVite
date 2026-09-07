import type { Disconnect } from '../shared/roblox-contracts.ts'
import type { NervePreviewAdapter, NervePreviewController, NervePreviewService } from './contracts.ts'
import type { NerveEndpointManifest, NerveNetworkManifest } from './manifest.ts'
import { Schema } from './schema.ts'

type Handler = (payload: unknown) => unknown | Promise<unknown>

export type NerveBrowserOptions = {
  manifest: NerveNetworkManifest
  handlers?: Record<string, Handler>
}

class PreviewSignal implements NerveSignalLike {
  private readonly listeners = new Set<(...args: unknown[]) => void>()
  connect(listener: (...args: unknown[]) => void): Disconnect {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }
  emit(...args: unknown[]): void {
    for (const listener of this.listeners) listener(...args)
  }
}

type NerveSignalLike = {
  connect(listener: (...args: unknown[]) => void): Disconnect
  emit(...args: unknown[]): void
}

export function createNerveBrowserAdapter(options: NerveBrowserOptions): NervePreviewAdapter {
  const services = new Map<string, NervePreviewService>()
  const controllers = new Map<string, NervePreviewController>()
  const handlers = new Map(Object.entries(options.handlers ?? {}))
  let started = false
  let startPromise: Promise<void> | undefined

  function createEndpoint(serviceName: string, endpointName: string, endpoint: NerveEndpointManifest): unknown {
    if (endpoint.kind === 'signal') return new PreviewSignal()
    return {
      request: async (payload: unknown) => {
        const handler = handlers.get(`${serviceName}.${endpointName}`)
        return handler ? handler(payload) : undefined
      },
    }
  }

  function getService<T extends NervePreviewService>(name: string): T {
    const existing = services.get(name)
    if (existing) return existing as T
    const definition = options.manifest.services[name]
    if (!definition) throw new Error(`Nerve service not found: ${name}`)
    const service = Object.fromEntries(Object.entries(definition).map(([endpointName, endpoint]) => [
      endpointName,
      createEndpoint(name, endpointName, endpoint),
    ])) as NervePreviewService
    services.set(name, service)
    return service as T
  }

  const adapter: NervePreviewAdapter = {
    Schema,
    manifest: options.manifest,
    CreateController(controller) {
      if (controllers.has(controller.Name)) throw new Error(`Nerve controller already exists: ${controller.Name}`)
      controllers.set(controller.Name, controller)
      return controller
    },
    GetService: getService,
    GetController(name) {
      const controller = controllers.get(name)
      if (!controller) throw new Error(`Nerve controller not found: ${name}`)
      return controller
    },
    setHandler(name, handler) {
      handlers.set(name, handler)
    },
    emitSignal(name, endpoint, ...args) {
      const service = getService(name)
      const signal = service[endpoint]
      if (!signal || !('emit' in signal) || typeof signal.emit !== 'function') throw new Error(`Nerve signal not found: ${name}.${endpoint}`)
      signal.emit(...args)
    },
    Start() {
      if (startPromise) return startPromise
      started = true
      startPromise = Promise.resolve().then(async () => {
        for (const controller of controllers.values()) await controller.NerveInit?.()
        for (const controller of controllers.values()) await controller.NerveStart?.()
      })
      return startPromise
    },
    OnStart() {
      if (!started) return adapter.Start()
      return startPromise ?? Promise.resolve()
    },
  }
  return adapter
}
