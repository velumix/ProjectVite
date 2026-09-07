import type { NerveSchemaDescriptor } from './manifest.ts'

export type NerveMethodDefinition = {
  Name: string
  Request: NerveSchemaDescriptor
  Response: NerveSchemaDescriptor
  Timeout?: number
  RateLimit?: { Requests: number; Window: number } | false
}

export type NerveSignalDefinition = {
  Name: string
  Arguments: NerveSchemaDescriptor
  Direction?: 'server' | 'client' | 'duplex'
  Reliability?: 'reliable' | 'unreliable'
  RateLimit?: { Requests: number; Window: number } | false
}

export type NerveServiceDefinition = {
  Name: string
  Methods: NerveMethodDefinition[]
  Signals: NerveSignalDefinition[]
  Lifecycle?: { NerveInit?: boolean; NerveStart?: boolean }
}

export type NerveControllerDefinition = {
  Name: string
  ServiceDependencies?: string[]
  ControllerDependencies?: string[]
  Lifecycle?: { NerveInit?: boolean; NerveStart?: boolean }
}

export type NerveProjectDefinition = {
  Services: NerveServiceDefinition[]
  Controllers: NerveControllerDefinition[]
}
