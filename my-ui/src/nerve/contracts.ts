import type { Disconnect } from '../shared/roblox-contracts.ts'
import type { NerveNetworkManifest } from './manifest.ts'

export type NervePromise<T> = Promise<T> & { cancel?: () => void }

export type NerveSignal<TArgs extends unknown[] = unknown[]> = {
  connect(listener: (...args: TArgs) => void): Disconnect
  emit(...args: TArgs): void
}

export type NerveMethod<TRequest, TResponse> = {
  request(payload: TRequest): NervePromise<TResponse>
}

export type NervePreviewService = Record<string, NerveMethod<unknown, unknown> | NerveSignal>

export type NervePreviewController = {
  Name: string
  NerveInit?: () => void | Promise<void>
  NerveStart?: () => void | Promise<void>
}

export type NervePreviewAdapter = {
  Schema: typeof import('./schema.ts').Schema
  manifest: NerveNetworkManifest
  CreateController(controller: NervePreviewController): NervePreviewController
  GetService<T extends NervePreviewService = NervePreviewService>(name: string): T
  GetController(name: string): NervePreviewController
  setHandler(name: string, handler: (payload: unknown) => unknown | Promise<unknown>): void
  emitSignal(name: string, endpoint: string, ...args: unknown[]): void
  Start(): Promise<void>
  OnStart(): Promise<void>
}
