import {
  getRobloxClassMembers,
  type RobloxUiClassName,
} from '../generated/roblox-api-metadata.ts'
import type {
  RobloxAuthoringInstance,
  RobloxAuthoringProperties,
  RobloxAuthoringTree,
  RobloxCanonicalInstance,
  RobloxCanonicalTree,
  RobloxGeneratedClassName,
} from '../generated/roblox-api-types.ts'

export type RobloxAuthoringInput<ClassName extends RobloxGeneratedClassName> = Omit<RobloxAuthoringInstance<ClassName>, 'ClassName'>

export type RobloxValidationIssue = {
  path: string
  kind: 'invalid-class' | 'invalid-property' | 'deprecated-property' | 'read-only-property'
  message: string
}

export function instance<ClassName extends RobloxGeneratedClassName>(
  ClassName: ClassName,
  properties: RobloxAuthoringInput<ClassName> = {} as RobloxAuthoringInput<ClassName>,
): RobloxAuthoringInstance<ClassName> {
  const { Children, Events, ...robloxProperties } = properties
  const node = { ClassName, ...robloxProperties, Children: Children?.map((child) => child) } as RobloxAuthoringInstance<ClassName>
  if (!Children) delete node.Children
  if (Events) Object.defineProperty(node, 'Events', { value: Events, enumerable: false, configurable: true })
  return node
}

export function toRobloxTree(tree: RobloxAuthoringTree): RobloxCanonicalTree {
  const visit = (node: RobloxAuthoringInstance): RobloxCanonicalInstance => {
    const { Events: _events, ...serializable } = node
    void _events
    return {
      ...serializable,
      Children: node.Children?.map(visit),
    }
  }
  return Array.isArray(tree) ? tree.map(visit) : visit(tree)
}

export function getAuthoringEvents(tree: RobloxAuthoringTree): Array<{ path: string; Events: unknown }> {
  const events: Array<{ path: string; Events: unknown }> = []
  const visit = (node: RobloxAuthoringInstance, path: string): void => {
    const handlers = (node as RobloxAuthoringInstance & { Events?: unknown }).Events
    if (handlers) events.push({ path, Events: handlers })
    for (const [index, child] of (node.Children ?? []).entries()) visit(child, `${path}/${child.Name ?? child.ClassName}[${index}]`)
  }
  for (const [index, node] of (Array.isArray(tree) ? tree : [tree]).entries()) visit(node, `${node.Name ?? node.ClassName}[${index}]`)
  return events
}

export function validateRobloxAuthoringTree(tree: RobloxAuthoringTree): RobloxValidationIssue[] {
  const issues: RobloxValidationIssue[] = []
  const visit = (node: RobloxAuthoringInstance, path: string): void => {
    const className = node.ClassName as RobloxUiClassName
    let members: ReturnType<typeof getRobloxClassMembers> = []
    try {
      members = getRobloxClassMembers(className)
    } catch {
      issues.push({ path, kind: 'invalid-class', message: `Unknown Roblox ClassName ${node.ClassName}.` })
    }
    const properties = new Map<string, (typeof members)[number]>(members.filter((member) => member.MemberType === 'Property').map((member) => [member.Name, member]))
    for (const propertyName of Object.keys(node)) {
      if (propertyName === 'ClassName' || propertyName === 'Children' || propertyName === 'Events') continue
      const member = properties.get(propertyName)
      if (!member) {
        issues.push({ path: `${path}.${propertyName}`, kind: 'invalid-property', message: `${node.ClassName}.${propertyName} is not a generated Roblox property.` })
      } else if ((member as { Tags?: readonly string[] }).Tags?.includes('ReadOnly')) {
        issues.push({ path: `${path}.${propertyName}`, kind: 'read-only-property', message: `${node.ClassName}.${propertyName} is read-only.` })
      } else if ((member as { Tags?: readonly string[] }).Tags?.includes('Deprecated')) {
        issues.push({ path: `${path}.${propertyName}`, kind: 'deprecated-property', message: `${node.ClassName}.${propertyName} is deprecated.` })
      }
    }
    for (const [index, child] of (node.Children ?? []).entries()) visit(child, `${path}/${child.Name ?? child.ClassName}[${index}]`)
  }
  for (const [index, node] of (Array.isArray(tree) ? tree : [tree]).entries()) visit(node, `${node.Name ?? node.ClassName}[${index}]`)
  return issues
}

export type RobloxAuthoringClassProperties<ClassName extends RobloxGeneratedClassName> = RobloxAuthoringProperties[ClassName]
