import type { RobloxInstanceJson } from '../renderer/RobloxRenderer.tsx'
import type { RobloxBinding } from '../bindings/reactive-bindings.ts'

export type RobloxComponentChild = RobloxComponent | RobloxInstanceJson
export type RobloxComponent = {
  Component: string
  Props?: Record<string, unknown>
  Children?: RobloxComponentChild[]
  Slots?: Record<string, RobloxComponentChild[]>
}

export type ComponentActionBinding = {
  Instance: string
  Event: string
  Action: string
  Payload?: unknown
}

export type ComponentEffectHook = {
  Instance: string
  Event: string
  Effect: string
}

export type ResolvedRobloxComponents = {
  Tree: RobloxInstanceJson
  ActionBindings: ComponentActionBinding[]
  EffectHooks: ComponentEffectHook[]
}

type ComponentResolver = (component: RobloxComponent, resolve: (child: RobloxComponentChild) => RobloxInstanceJson) => RobloxInstanceJson

const registry: Record<string, ComponentResolver> = {
  ScreenGui: (component, resolve) => ({
    ClassName: 'ScreenGui',
    Name: String(component.Props?.Name ?? 'ComponentPreviewGui'),
    Children: (component.Children ?? []).map(resolve),
  }),
  MoneyDisplay: (component, resolve) => {
    const props = component.Props ?? {}
    return {
      ClassName: 'Frame',
      Name: String(props.Name ?? 'MoneyDisplay'),
      Size: props.Size ?? { X: { Scale: 0, Offset: 180 }, Y: { Scale: 0, Offset: 48 } },
      Position: props.Position,
      Visible: props.Visible as boolean | RobloxBinding | undefined,
      BackgroundTransparency: 1,
      Children: [
        {
          ClassName: 'TextLabel',
          Name: 'MoneyText',
          Text: props.Text ?? ({ __kind: 'RobloxBinding', Path: 'Player.Money', Format: (value: unknown) => `$${typeof value === 'number' ? value : 0}` } satisfies RobloxBinding),
          TextSize: props.TextSize ?? 20,
          TextColor3: props.TextColor3 ?? { R: 0.96, G: 0.65, B: 0.14 },
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
          Children: (component.Slots?.content ?? component.Children ?? []).map(resolve),
        },
      ],
    }
  },
  InventoryCard: (component, resolve) => {
    const props = component.Props ?? {}
    return {
      ClassName: 'Frame',
      Name: String(props.Name ?? 'InventoryCard'),
      Size: props.Size ?? { X: { Scale: 0, Offset: 240 }, Y: { Scale: 0, Offset: 120 } },
      Position: props.Position,
      Visible: props.Visible as boolean | RobloxBinding | undefined,
      BackgroundColor3: props.BackgroundColor3 ?? { R: 0.067, G: 0.078, B: 0.102 },
      Children: [
        {
          ClassName: 'TextLabel',
          Name: 'InventoryText',
          Text: props.Text ?? 'Inventory',
          TextColor3: props.TextColor3 ?? { R: 0.96, G: 0.97, B: 0.98 },
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 32 } },
        },
        ...(component.Slots?.body ?? component.Children ?? []).map(resolve),
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
      ],
    }
  },
  PurchaseButton: (component) => {
    const props = component.Props ?? {}
    const variant = props.variant === 'danger' ? { R: 0.85, G: 0.18, B: 0.18 } : { R: 0.96, G: 0.65, B: 0.14 }
    return {
      ClassName: 'TextButton',
      Name: String(props.Name ?? 'PurchaseButton'),
      Text: props.Text ?? 'Buy Bat',
      TextSize: props.TextSize ?? 16,
      TextColor3: props.TextColor3 ?? { R: 0.07, G: 0.09, B: 0.13 },
      BackgroundColor3: props.BackgroundColor3 ?? variant,
      Position: props.Position,
      Visible: props.Visible as boolean | RobloxBinding | undefined,
      Size: props.Size ?? { X: { Scale: 0, Offset: 180 }, Y: { Scale: 0, Offset: 42 } },
      Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } }],
    }
  },
  EMSAlert: (component, resolve) => {
    const props = component.Props ?? {}
    return {
      ClassName: 'Frame',
      Name: String(props.Name ?? 'EMSAlert'),
      Visible: props.Visible ?? ({ __kind: 'RobloxBinding', Path: 'EMS.HasActiveCall' } satisfies RobloxBinding),
      BackgroundColor3: props.BackgroundColor3 ?? { R: 0.85, G: 0.18, B: 0.18 },
      Position: props.Position,
      Size: props.Size ?? { X: { Scale: 0, Offset: 260 }, Y: { Scale: 0, Offset: 52 } },
      Children: [
        {
          ClassName: 'TextLabel',
          Name: 'EMSAlertText',
          Text: props.Text ?? 'EMS call received',
          TextColor3: { R: 0.96, G: 0.97, B: 0.98 },
          Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } },
          Children: (component.Slots?.content ?? component.Children ?? []).map(resolve),
        },
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } },
      ],
    }
  },
}

export function component(Component: string, Props?: Record<string, unknown>, Children?: RobloxComponentChild[]): RobloxComponent {
  return { Component, Props, Children }
}

export function resolveRobloxComponents(root: RobloxComponent): ResolvedRobloxComponents {
  const actionBindings: ComponentActionBinding[] = []
  const effectHooks: ComponentEffectHook[] = []
  function resolve(child: RobloxComponentChild): RobloxInstanceJson {
    if (!('Component' in child)) return { ...child, Children: child.Children?.map(resolve) }
    const component = child as RobloxComponent
    const resolver = registry[component.Component]
    if (!resolver) throw new Error(`Unknown Roblox component: ${component.Component}`)
    const instance = resolver(component, resolve)
    const props = component.Props ?? {}
    if (props.Action) actionBindings.push({ Instance: String(instance.Name), Event: 'Activated', Action: String(props.Action), Payload: props.Payload })
    if (props.Effect) effectHooks.push({ Instance: String(instance.Name), Event: 'Activated', Effect: String(props.Effect) })
    return instance
  }
  return { Tree: resolve(root), ActionBindings: actionBindings, EffectHooks: effectHooks }
}

export const previewComponentDocument = resolveRobloxComponents({
  Component: 'ScreenGui',
  Props: { Name: 'ComponentPreviewGui' },
  Children: [
    component('MoneyDisplay', { Name: 'ComponentMoneyDisplay', Position: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 0, Offset: 24 } } }),
    component('InventoryCard', { Name: 'ComponentInventoryCard', Position: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 0, Offset: 88 } } }),
    component('PurchaseButton', { Name: 'ComponentPurchaseButton', Action: 'BuyItem', Payload: { ItemId: 'Bat' }, Effect: 'PurchaseSuccess', Position: { X: { Scale: 0, Offset: 24 }, Y: { Scale: 0, Offset: 224 } } }),
    component('EMSAlert', { Name: 'ComponentEMSAlert', Position: { X: { Scale: 0, Offset: 224 }, Y: { Scale: 0, Offset: 24 } } }),
  ],
} as RobloxComponent)
