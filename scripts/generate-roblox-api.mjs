import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'

const projectRoot = resolve(import.meta.dirname, '..')
const cacheDirectory = join(projectRoot, '.cache', 'roblox')
const cacheVersionPath = join(cacheDirectory, 'versionQTStudio')
const cacheDumpPath = join(cacheDirectory, 'API-Dump.json')
const generatedPath = join(projectRoot, 'my-ui', 'src', 'generated', 'roblox-api-metadata.ts')
const generatedTypesPath = join(projectRoot, 'my-ui', 'src', 'generated', 'roblox-api-types.ts')

const prioritizedClassNames = [
  'BasePlayerGui', 'CoreGui', 'PlayerGui', 'StarterGui',
  'GuiBase', 'GuiBase2d', 'GuiObject', 'CanvasGroup', 'Frame', 'GuiButton',
  'ImageButton', 'TextButton', 'GuiLabel', 'ImageLabel', 'TextLabel',
  'RelativeGui', 'ScrollingFrame', 'TextBox', 'VideoDisplay', 'VideoFrame',
  'ViewportFrame', 'LayerCollector', 'BillboardGui', 'PluginGui',
  'DockWidgetPluginGui', 'QWidgetPluginGui', 'ScreenGui', 'GuiMain',
  'SurfaceGuiBase', 'AdGui', 'SurfaceGui', 'Path2D', 'UIBase', 'UIComponent',
  'UIConstraint', 'UIAspectRatioConstraint', 'UISizeConstraint',
  'UITextSizeConstraint', 'UICorner', 'UIDragDetector', 'UIFlexItem',
  'UIGradient', 'UILayout', 'UIGridStyleLayout', 'UIGridLayout',
  'UIListLayout', 'UIPageLayout', 'UITableLayout', 'UIPadding', 'UIScale',
  'UIShadow', 'UIStroke', 'StyleBase', 'StyleRule', 'StyleSheet',
  'StyleDerive', 'StyleLink', 'StyleQuery', 'StylingService',
]

async function fetchText(url) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}: ${url}`)
  return response.text()
}

async function loadDump() {
  let version

  try {
    version = (await fetchText('https://setup.rbxcdn.com/versionQTStudio')).trim()
    const dumpUrl = `https://setup.rbxcdn.com/${version}-API-Dump.json`
    const dumpText = await fetchText(dumpUrl)
    await mkdir(cacheDirectory, { recursive: true })
    await writeFile(cacheVersionPath, version)
    await writeFile(cacheDumpPath, dumpText)
    return { version, dumpUrl, dump: JSON.parse(dumpText), source: 'network' }
  } catch (error) {
    try {
      version = (await readFile(cacheVersionPath, 'utf8')).trim()
      const dumpText = await readFile(cacheDumpPath, 'utf8')
      return {
        version,
        dumpUrl: `https://setup.rbxcdn.com/${version}-API-Dump.json`,
        dump: JSON.parse(dumpText),
        source: 'cache',
      }
    } catch {
      throw new Error(`Could not fetch the Roblox API dump and no cache is available. ${error}`)
    }
  }
}

function normalizeMember(member, declaringClass) {
  const normalized = {
    Name: member.Name,
    MemberType: member.MemberType,
    DeclaringClass: declaringClass,
  }

  for (const key of [
    'Category',
    'ValueType',
    'ReturnType',
    'Parameters',
    'Security',
    'ThreadSafety',
    'Tags',
    'Serialization',
  ]) {
    if (member[key] !== undefined) normalized[key] = member[key]
  }

  return normalized
}

function createMetadata(rawDump, version, dumpUrl, source) {
  const classesByName = new Map(rawDump.Classes.map((item) => [item.Name, item]))

  const allClasses = rawDump.Classes
    .map((item) => ({
      Name: item.Name,
      Superclass: item.Superclass ?? null,
      Tags: item.Tags ?? [],
    }))
    .sort((left, right) => left.Name.localeCompare(right.Name))

  function lineage(className) {
    const result = []
    const seen = new Set()
    let current = className

    while (current && !seen.has(current)) {
      seen.add(current)
      const classItem = classesByName.get(current)
      if (!classItem) break
      result.unshift(classItem)
      current = classItem.Superclass
    }

    return result
  }

  function resolveMembers(className) {
    const members = new Map()
    for (const classItem of lineage(className)) {
      for (const member of classItem.Members ?? []) {
        const key = `${member.MemberType}:${member.Name}`
        members.set(key, normalizeMember(member, classItem.Name, classItem.Name !== className))
      }
    }
    return [...members.values()].sort((left, right) => {
      const typeOrder = left.MemberType.localeCompare(right.MemberType)
      return typeOrder || left.Name.localeCompare(right.Name)
    })
  }

  const classes = {}
  const memberRecords = {}
  const memberIdsByKey = new Map()

  function getMemberId(member) {
    const key = JSON.stringify(member)
    const existingId = memberIdsByKey.get(key)
    if (existingId) return existingId

    const id = `m${memberIdsByKey.size}`
    memberIdsByKey.set(key, id)
    memberRecords[id] = member
    return id
  }

  for (const className of prioritizedClassNames) {
    if (!classesByName.has(className)) continue
    const classItem = classesByName.get(className)
    const members = resolveMembers(className)
    const memberIds = members.map((member) => getMemberId(member))
    classes[className] = {
      Name: classItem.Name,
      Superclass: classItem.Superclass ?? null,
      Tags: classItem.Tags ?? [],
      Members: memberIds,
      Properties: members.filter((member) => member.MemberType === 'Property').map((member) => member.Name),
      Events: members.filter((member) => member.MemberType === 'Event').map((member) => member.Name),
      Functions: members.filter((member) => member.MemberType === 'Function').map((member) => member.Name),
      Callbacks: members.filter((member) => member.MemberType === 'Callback').map((member) => member.Name),
    }
  }

  const valueTypes = new Set()
  function collectValueType(valueType) {
    if (!valueType) return
    if (valueType.Name) valueTypes.add(`${valueType.Category}:${valueType.Name}`)
  }

  for (const classItem of Object.values(classes)) {
    for (const memberId of classItem.Members) {
      const member = memberRecords[memberId]
      collectValueType(member.ValueType)
      collectValueType(member.ReturnType)
      for (const parameter of member.Parameters ?? []) collectValueType(parameter.Type)
    }
  }

  const propertyPaths = new Set()
  const propertyNames = new Set()
  for (const classItem of Object.values(classes)) {
    for (const propertyName of classItem.Properties) {
      propertyNames.add(propertyName)
      propertyPaths.add(`${classItem.Name}.${propertyName}`)
    }
  }

  return {
    Source: {
      Version: version,
      DumpUrl: dumpUrl,
      GeneratedAt: new Date().toISOString(),
      Source: source,
    },
    PrioritizedClasses: prioritizedClassNames.filter((name) => classes[name]),
    AllClasses: allClasses,
    ValueTypes: [...valueTypes].sort(),
    Members: memberRecords,
    Classes: classes,
    PropertyNames: [...propertyNames].sort(),
    PropertyPaths: [...propertyPaths].sort(),
  }
}

function typeIdentifier(name) {
  return name.replaceAll(/[^A-Za-z0-9_$]/g, '_')
}

function enumTypeName(name) {
  return `RobloxEnum_${typeIdentifier(name)}`
}

function renderValueTypes() {
  return `export type RobloxColor3 = { R: number; G: number; B: number }\n` +
    `export type RobloxVector2 = { X: number; Y: number }\n` +
    `export type RobloxVector3 = { X: number; Y: number; Z: number }\n` +
    `export type RobloxUDim = { Scale: number; Offset: number }\n` +
    `export type RobloxUDim2 = { X: RobloxUDim; Y: RobloxUDim }\n` +
    `export type RobloxRect = { Min: RobloxVector2; Max: RobloxVector2 }\n` +
    `export type RobloxFontFace = { Family: string; Weight?: string; Style?: string }\n` +
    `export type RobloxColorSequenceKeypoint = { Time: number; Value: RobloxColor3 }\n` +
    `export type RobloxNumberSequenceKeypoint = { Time: number; Value: number }\n` +
    `export type RobloxInstanceReference<ClassName extends string = string> = { ClassName: ClassName; Name?: string }\n` +
    `export type RobloxBindingValue<T> = T | { readonly __kind: 'RobloxBinding'; readonly Path: string; readonly Format?: (...arguments_: unknown[]) => unknown; readonly Compute?: (state: Record<string, unknown>) => unknown; readonly Dependencies?: string[] }\n` +
    `\n`
}

function propertyType(valueType, enumsByName) {
  if (!valueType) return 'unknown'
  if (valueType.Category === 'Primitive') {
    if (valueType.Name === 'bool') return 'boolean'
    if (['float', 'double', 'int', 'int64', 'int32', 'int16', 'int8', 'uint64', 'uint32', 'uint16', 'uint8'].includes(valueType.Name)) return 'number'
    if (valueType.Name === 'string' || valueType.Name === 'ProtectedString') return 'string'
    return 'unknown'
  }
  if (valueType.Category === 'Enum') return enumsByName.has(valueType.Name) ? enumTypeName(valueType.Name) : 'string'
  if (valueType.Category === 'Class') return `RobloxInstanceReference<'${valueType.Name}'>`
  if (valueType.Category !== 'DataType') return 'unknown'

  const dataTypes = {
    Color3: 'RobloxColor3',
    Vector2: 'RobloxVector2',
    Vector3: 'RobloxVector3',
    UDim: 'RobloxUDim',
    UDim2: 'RobloxUDim2',
    Rect: 'RobloxRect',
    Font: 'RobloxFontFace',
    ColorSequence: 'RobloxColorSequenceKeypoint[]',
    NumberSequence: 'RobloxNumberSequenceKeypoint[]',
  }
  return dataTypes[valueType.Name] ?? 'unknown'
}

function renderAuthoringTypes(metadata, rawEnums) {
  const classes = metadata.Classes
  const enumNames = new Set()
  for (const member of Object.values(metadata.Members)) {
    for (const valueType of [member.ValueType, member.ReturnType, ...(member.Parameters ?? []).map((parameter) => parameter.Type)]) {
      if (valueType?.Category === 'Enum') enumNames.add(valueType.Name)
    }
  }
  const enumsByName = new Map((rawEnums ?? []).map((item) => [item.Name, { Name: item.Name, Items: (item.Items ?? []).map((entry) => entry.Name).sort() }]))
  const output = [
    '// Generated by scripts/generate-roblox-api.mjs. Do not edit manually.',
    '// These declarations are type-only authoring contracts derived from the Roblox API dump.',
    '',
    renderValueTypes().trimEnd(),
    `export type RobloxGeneratedClassName = ${metadata.PrioritizedClasses.map((name) => JSON.stringify(name)).join(' | ')}`,
    '',
  ]

  for (const enumName of [...enumNames].sort()) {
    const values = enumsByName.get(enumName)?.Items ?? []
    output.push(`export type ${enumTypeName(enumName)} = ${values.length ? values.map((value) => JSON.stringify(value)).join(' | ') : 'string'}`)
  }
  output.push('')

  for (const className of metadata.PrioritizedClasses) {
    const classMetadata = classes[className]
    if (!classMetadata) continue
    const memberRecords = classMetadata.Members.map((memberId) => metadata.Members[memberId])
    output.push(`export type Roblox${typeIdentifier(className)}EventMap = {`)
    for (const member of memberRecords.filter((item) => item.MemberType === 'Event')) {
      const parameters = (member.Parameters ?? []).map((parameter) => propertyType(parameter.Type, enumsByName))
      output.push(`  ${JSON.stringify(member.Name)}: [${parameters.join(', ')}]`)
    }
    output.push('}')
    output.push('')
  }

  output.push('export type RobloxAuthoringEventMap = {')
  for (const className of metadata.PrioritizedClasses) output.push(`  ${JSON.stringify(className)}: Roblox${typeIdentifier(className)}EventMap`)
  output.push('}')
  output.push('export type RobloxEventHandlers<ClassName extends RobloxGeneratedClassName> = { [EventName in keyof RobloxAuthoringEventMap[ClassName]]?: (...arguments_: RobloxAuthoringEventMap[ClassName][EventName] extends unknown[] ? RobloxAuthoringEventMap[ClassName][EventName] : never) => void }')
  output.push('')

  for (const className of metadata.PrioritizedClasses) {
    const classMetadata = classes[className]
    if (!classMetadata) continue
    const properties = classMetadata.Members
      .map((memberId) => metadata.Members[memberId])
      .filter((member) => member.MemberType === 'Property' && !member.Tags?.includes('ReadOnly') && !member.Tags?.includes('Hidden') && member.Name !== 'ClassName' && member.Name !== 'Parent')
    output.push(`export type Roblox${typeIdentifier(className)}Properties = {`)
    for (const property of properties) {
      if (property.Tags?.includes('Deprecated')) output.push('  /** @deprecated This Roblox API member is deprecated. */')
      output.push(`  ${JSON.stringify(property.Name)}?: RobloxBindingValue<${propertyType(property.ValueType, enumsByName)}>`)
    }
    output.push('}')
    output.push('')
  }

  output.push('export type RobloxAuthoringProperties = {')
  for (const className of metadata.PrioritizedClasses) output.push(`  ${JSON.stringify(className)}: Roblox${typeIdentifier(className)}Properties`)
  output.push('}')
  output.push('export type RobloxAuthoringInstance<ClassName extends RobloxGeneratedClassName = RobloxGeneratedClassName> = { ClassName: ClassName; Name?: string; Children?: RobloxAuthoringInstance[]; Events?: RobloxEventHandlers<ClassName> } & RobloxAuthoringProperties[ClassName]')
  output.push('export type RobloxAuthoringTree = RobloxAuthoringInstance | RobloxAuthoringInstance[]')
  output.push('export type RobloxCanonicalInstance<ClassName extends RobloxGeneratedClassName = RobloxGeneratedClassName> = Omit<RobloxAuthoringInstance<ClassName>, \'Events\'>')
  output.push('export type RobloxCanonicalTree = RobloxCanonicalInstance | RobloxCanonicalInstance[]')
  output.push('')
  return output.join('\n') + '\n'
}

function renderTypeUnion(name, values) {
  if (values.length === 0) return `export type ${name} = never\n`
  return `export type ${name} = ${values.map((value) => JSON.stringify(value)).join(' | ')}\n`
}

function renderGeneratedFile(metadata) {
  const propertyNames = metadata.PropertyNames
  const classNames = metadata.PrioritizedClasses
  const propertyPaths = metadata.PropertyPaths

  return `// Generated by scripts/generate-roblox-api.mjs. Do not edit manually.\n\n` +
    `export const ROBLOX_API_METADATA = ${JSON.stringify(metadata, null, 2)} as const\n\n` +
    `export const ROBLOX_API_VERSION = ROBLOX_API_METADATA.Source.Version\n` +
    `export const ROBLOX_API_DUMP_URL = ROBLOX_API_METADATA.Source.DumpUrl\n` +
    `export const ROBLOX_UI_CLASS_NAMES = ROBLOX_API_METADATA.PrioritizedClasses\n\n` +
    `export function getRobloxClassMembers(className: RobloxUiClassName) {\n` +
    `  return ROBLOX_API_METADATA.Classes[className].Members.map((memberId) => ROBLOX_API_METADATA.Members[memberId])\n` +
    `}\n\n` +
    renderTypeUnion('RobloxUiClassName', classNames) +
    renderTypeUnion('RobloxUiPropertyName', propertyNames) +
    renderTypeUnion('RobloxUiPropertyPath', propertyPaths)
}

const { version, dumpUrl, dump, source } = await loadDump()
const metadata = createMetadata(dump, version, dumpUrl, source)
const missingClassNames = prioritizedClassNames.filter((name) => !metadata.PrioritizedClasses.includes(name))
await mkdir(dirname(generatedPath), { recursive: true })
await writeFile(generatedPath, renderGeneratedFile(metadata))
await writeFile(generatedTypesPath, renderAuthoringTypes(metadata, dump.Enums))

console.log(`Generated ${metadata.PrioritizedClasses.length} UI classes from ${version} (${source}).`)
console.log(`Stored ${metadata.PropertyNames.length} effective property names and ${metadata.PropertyPaths.length} class property paths.`)
if (missingClassNames.length > 0) {
  console.warn(`Classes absent from this API dump: ${missingClassNames.join(', ')}`)
}
