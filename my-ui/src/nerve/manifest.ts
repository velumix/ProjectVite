export type NerveSchemaDescriptor =
  | { kind: 'packed' | 'nothing' | 'unknown' | 'bool' | 'string' | 'buffer' | 'uint8' | 'uint16' | 'uint32' | 'int8' | 'int16' | 'int32' | 'float32' | 'float64' | 'vec2' | 'vec3' | 'cframe' | 'color3' | 'instance' }
  | { kind: 'optional' | 'array'; value: NerveSchemaDescriptor }
  | { kind: 'map'; key: NerveSchemaDescriptor; value: NerveSchemaDescriptor }
  | { kind: 'struct'; fields: Record<string, NerveSchemaDescriptor> }
  | { kind: 'tuple'; items: NerveSchemaDescriptor[] }

export type NerveRateLimit = {
  requests: number
  window: number
}

export type NerveMethodManifest = {
  kind: 'method'
  request: NerveSchemaDescriptor
  response: NerveSchemaDescriptor
  timeout?: number
  rateLimit?: NerveRateLimit
}

export type NerveSignalManifest = {
  kind: 'signal'
  arguments: NerveSchemaDescriptor
  reliability?: 'reliable' | 'unreliable'
  direction?: 'server' | 'client' | 'duplex'
  rateLimit?: NerveRateLimit
}

export type NerveEndpointManifest = NerveMethodManifest | NerveSignalManifest

export type NerveNetworkManifest = {
  version: number
  services: Record<string, Record<string, NerveEndpointManifest>>
}

export function parseNerveManifest(value: unknown): NerveNetworkManifest {
  if (!isRecord(value) || typeof value.version !== 'number' || !isRecord(value.services)) {
    throw new Error('Invalid NerveManifest: expected version and services')
  }

  for (const [serviceName, endpoints] of Object.entries(value.services)) {
    if (!isRecord(endpoints)) throw new Error(`Invalid NerveManifest service: ${serviceName}`)
    for (const [endpointName, endpoint] of Object.entries(endpoints)) {
      if (!isRecord(endpoint) || (endpoint.kind !== 'method' && endpoint.kind !== 'signal')) {
        throw new Error(`Invalid NerveManifest endpoint: ${serviceName}.${endpointName}`)
      }
      validateDescriptor(endpoint.kind === 'method' ? endpoint.request : endpoint.arguments, `${serviceName}.${endpointName}`)
    }
  }

  return value as unknown as NerveNetworkManifest
}

function validateDescriptor(value: unknown, path: string): void {
  if (!isRecord(value) || typeof value.kind !== 'string') throw new Error(`Invalid Nerve schema at ${path}`)
  if (value.kind === 'optional' || value.kind === 'array') validateDescriptor(value.value, `${path}.${value.kind}`)
  if (value.kind === 'map') {
    validateDescriptor(value.key, `${path}.key`)
    validateDescriptor(value.value, `${path}.value`)
  }
  if (value.kind === 'struct') {
    if (!isRecord(value.fields)) throw new Error(`Invalid Nerve struct at ${path}`)
    for (const [name, field] of Object.entries(value.fields)) validateDescriptor(field, `${path}.${name}`)
  }
  if (value.kind === 'tuple') {
    if (!Array.isArray(value.items)) throw new Error(`Invalid Nerve tuple at ${path}`)
    value.items.forEach((item, index) => validateDescriptor(item, `${path}[${index}]`))
  }
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}
