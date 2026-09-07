import type { NerveSchemaDescriptor } from './manifest.ts'

export const Schema = {
  Packed: { kind: 'packed' },
  Nothing: { kind: 'nothing' },
  Boolean: { kind: 'bool' },
  String: { kind: 'string' },
  Float64: { kind: 'float64' },
  Int32: { kind: 'int32' },
  Optional: (value: NerveSchemaDescriptor) => ({ kind: 'optional', value }),
  Array: (value: NerveSchemaDescriptor) => ({ kind: 'array', value }),
  Struct: (fields: Record<string, NerveSchemaDescriptor>) => ({ kind: 'struct', fields }),
  Tuple: (items: NerveSchemaDescriptor[]) => ({ kind: 'tuple', items }),
} satisfies Record<string, unknown>
