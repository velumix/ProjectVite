import type { RobloxInstanceJson, RobloxColor3, RobloxUDim, RobloxUDim2, RobloxVector2 } from './RobloxRenderer.tsx'
import type { CompiledRobloxProject } from '../features/project-compiler.ts'

type ExportContext = {
  usedIdentifiers: Set<string>
  lines: string[]
}

export type NormalizedRobloxInstance = {
  ClassName: string
  Properties: Record<string, unknown>
  Children: NormalizedRobloxInstance[]
}

const ENUM_TYPES: Record<string, string> = {
  AutomaticCanvasSize: 'AutomaticSize',
  FillDirection: 'FillDirection',
  HorizontalAlignment: 'HorizontalAlignment',
  VerticalAlignment: 'VerticalAlignment',
  SortOrder: 'SortOrder',
  TextXAlignment: 'TextXAlignment',
  TextYAlignment: 'TextYAlignment',
  Font: 'Font',
  ApplyStrokeMode: 'ApplyStrokeMode',
  AspectType: 'AspectType',
  DominantAxis: 'DominantAxis',
  BorderMode: 'BorderMode',
}

function indent(level: number): string {
  return '  '.repeat(level)
}

function luauString(value: string): string {
  return JSON.stringify(value)
}

function luauNumber(value: number): string {
  if (!Number.isFinite(value)) throw new Error(`Cannot export non-finite number: ${value}`)
  if (Object.is(value, -0)) return '0'
  return Number(value.toFixed(6)).toString()
}

function isColor3(value: unknown): value is RobloxColor3 {
  return isRecord(value) && typeof value.R === 'number' && typeof value.G === 'number' && typeof value.B === 'number'
}

function isUDim(value: unknown): value is RobloxUDim {
  return isRecord(value) && typeof value.Scale === 'number' && typeof value.Offset === 'number'
}

function isUDim2(value: unknown): value is RobloxUDim2 {
  return isRecord(value) && isUDim(value.X) && isUDim(value.Y)
}

function isVector2(value: unknown): value is RobloxVector2 {
  return isRecord(value) && typeof value.X === 'number' && typeof value.Y === 'number'
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toEnum(propertyName: string, value: string): string | undefined {
  const enumType = ENUM_TYPES[propertyName]
  return enumType ? `Enum.${enumType}.${value}` : undefined
}

function toFontFace(value: Record<string, unknown>): string | undefined {
  if (typeof value.Family !== 'string') return undefined
  const weight = typeof value.Weight === 'string' ? value.Weight : 'Regular'
  const style = typeof value.Style === 'string' ? value.Style : 'Normal'
  return `Font.new(${luauString(value.Family)}, Enum.FontWeight.${weight}, Enum.FontStyle.${style})`
}

function toSequence(propertyName: string, value: unknown[]): string | undefined {
  const keypointType = propertyName === 'Color' ? 'ColorSequenceKeypoint' : 'NumberSequenceKeypoint'
  const keypoints = value.map((keypoint) => {
    if (!isRecord(keypoint) || typeof keypoint.Time !== 'number') {
      throw new Error(`${propertyName} contains an invalid sequence keypoint`)
    }
    const keypointValue = propertyName === 'Color'
      ? toLuauValue(keypoint.Value, 'ColorSequenceValue')
      : toLuauValue(keypoint.Value, 'NumberSequenceValue')
    return `${keypointType}.new(${luauNumber(keypoint.Time)}, ${keypointValue})`
  })
  const sequenceType = propertyName === 'Color' ? 'ColorSequence' : 'NumberSequence'
  return `${sequenceType}.new({ ${keypoints.join(', ')} })`
}

function toLuauValue(value: unknown, propertyName: string): string {
  if (value === null || value === undefined) return 'nil'
  if (typeof value === 'string') return toEnum(propertyName, value) ?? luauString(value)
  if (typeof value === 'number') return luauNumber(value)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  if (isColor3(value)) return `Color3.new(${luauNumber(value.R)}, ${luauNumber(value.G)}, ${luauNumber(value.B)})`
  if (isUDim2(value)) {
    return `UDim2.new(${luauNumber(value.X.Scale)}, ${luauNumber(value.X.Offset)}, ${luauNumber(value.Y.Scale)}, ${luauNumber(value.Y.Offset)})`
  }
  if (isUDim(value)) return `UDim.new(${luauNumber(value.Scale)}, ${luauNumber(value.Offset)})`
  if (isVector2(value)) return `Vector2.new(${luauNumber(value.X)}, ${luauNumber(value.Y)})`
  if (Array.isArray(value)) {
    const sequence = toSequence(propertyName, value)
    if (sequence) return sequence
    return `{ ${value.map((item) => toLuauValue(item, propertyName)).join(', ')} }`
  }
  if (isRecord(value)) {
    if (propertyName === 'FontFace') {
      const fontFace = toFontFace(value)
      if (fontFace) return fontFace
    }
    const fields = Object.keys(value)
      .sort()
      .map((key) => `${key} = ${toLuauValue(value[key], key)}`)
    return `{ ${fields.join(', ')} }`
  }

  throw new Error(`Cannot export Roblox property ${propertyName}`)
}

function makeIdentifier(instance: RobloxInstanceJson, context: ExportContext): string {
  const source = instance.Name || instance.ClassName
  let identifier = source.replace(/[^A-Za-z0-9_]/g, '_')
  if (!/^[A-Za-z_]/.test(identifier)) identifier = `instance_${identifier}`
  if (!identifier) identifier = 'instance'

  const baseIdentifier = identifier
  let suffix = 2
  while (context.usedIdentifiers.has(identifier)) identifier = `${baseIdentifier}_${suffix++}`
  context.usedIdentifiers.add(identifier)
  return identifier
}

function emitInstance(
  instance: RobloxInstanceJson,
  parentIdentifier: string | undefined,
  context: ExportContext,
  level: number,
): string {
  const identifier = makeIdentifier(instance, context)
  context.lines.push(`${indent(level)}local ${identifier} = Instance.new(${luauString(instance.ClassName)})`)

  const propertyNames = Object.keys(instance)
    .filter((propertyName) => !['ClassName', 'Children', 'Parent'].includes(propertyName))
    .sort((left, right) => (left === 'Name' ? -1 : right === 'Name' ? 1 : left.localeCompare(right)))

  for (const propertyName of propertyNames) {
    context.lines.push(
      `${indent(level)}${identifier}.${propertyName} = ${toLuauValue(instance[propertyName], propertyName)}`,
    )
  }

  for (const child of instance.Children ?? []) emitInstance(child, identifier, context, level)
  if (parentIdentifier) context.lines.push(`${indent(level)}${identifier}.Parent = ${parentIdentifier}`)
  return identifier
}

export function normalizeRobloxInstanceTree(
  tree: RobloxInstanceJson | RobloxInstanceJson[],
): NormalizedRobloxInstance[] {
  const instances = Array.isArray(tree) ? tree : [tree]
  return instances.map((instance) => {
    const properties = Object.fromEntries(
      Object.keys(instance)
        .filter((propertyName) => !['ClassName', 'Children', 'Parent'].includes(propertyName))
        .sort()
        .map((propertyName) => [propertyName, instance[propertyName]]),
    )
    return {
      ClassName: instance.ClassName,
      Properties: properties,
      Children: normalizeRobloxInstanceTree(instance.Children ?? []),
    }
  })
}

export function exportRobloxTreeToLuau(tree: RobloxInstanceJson | RobloxInstanceJson[]): string {
  const context: ExportContext = {
    usedIdentifiers: new Set(),
    lines: [
      '-- Generated from a Roblox JSON instance tree.',
      '-- Visual properties only; networking and event bindings are intentionally excluded.',
      '',
    ],
  }
  const instances = Array.isArray(tree) ? tree : [tree]
  const rootIdentifiers = instances.map((instance) => emitInstance(instance, undefined, context, 0))

  context.lines.push('')
  context.lines.push('-- Root instances are returned in source order.')
  context.lines.push('return {')
  rootIdentifiers.forEach((rootIdentifier) => context.lines.push(`  ${rootIdentifier},`))
  context.lines.push('}')

  return `${context.lines.join('\n')}\n`
}

export function exportCompiledRobloxProjectToLuau(project: CompiledRobloxProject): string {
  return exportRobloxTreeToLuau(project.Tree)
}
