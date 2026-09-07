import type { RobloxInstanceJson } from '../renderer/RobloxRenderer.tsx'
import type { CompiledRobloxProject } from '../features/project-compiler.ts'

export function exportRobloxTreeToRbxmx(tree: RobloxInstanceJson): string {
  const items = emitItem(tree, 1)
  return `<?xml version="1.0" encoding="utf-8"?>\n<roblox version="4">\n${items}</roblox>\n`
}

export function exportCompiledProjectToRbxmx(project: CompiledRobloxProject): string {
  return exportRobloxTreeToRbxmx(project.Tree)
}

function emitItem(instance: RobloxInstanceJson, level: number): string {
  const indent = '  '.repeat(level)
  const properties = Object.entries(instance)
    .filter(([name]) => !['Children', 'ClassName'].includes(name))
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([name, value]) => `${indent}  <string name="${escapeXml(name)}">${escapeXml(valueToText(value))}</string>`)
    .join('\n')
  const children = (instance.Children ?? []).map((child) => emitItem(child, level + 1)).join('')
  return `${indent}<Item class="${escapeXml(instance.ClassName)}" referent="${escapeXml(instance.Name ?? instance.ClassName)}">\n${indent}  <Properties>\n${properties}${properties ? '\n' : ''}${indent}  </Properties>\n${children}${indent}</Item>\n`
}

function valueToText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return String(value)
  return JSON.stringify(value) ?? ''
}

function escapeXml(value: string): string {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;')
}
