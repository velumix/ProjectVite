import { useEffect, type CSSProperties, type ReactNode, type PointerEvent as ReactPointerEvent } from 'react'
import {
  ROBLOX_API_METADATA,
  type RobloxUiClassName,
} from '../generated/roblox-api-metadata.ts'
import {
  createRobloxEventAdapter,
  type RobloxEventAdapter,
  type RobloxEventName,
  type RobloxHandlerRegistry,
  type RobloxInputEvent,
} from './roblox-events.ts'

export type RobloxColor3 = { R: number; G: number; B: number }
export type RobloxUDim = { Scale: number; Offset: number }
export type RobloxUDim2 = { X: RobloxUDim; Y: RobloxUDim }
export type RobloxVector2 = { X: number; Y: number }
export type RobloxColorSequenceKeypoint = { Time: number; Value: RobloxColor3 }
export type RobloxNumberSequenceKeypoint = { Time: number; Value: number }

export type RobloxInstanceJson = {
  ClassName: string
  Name?: string
  Children?: RobloxInstanceJson[]
  [propertyName: string]: unknown
}

export type RobloxRendererProps = {
  tree: RobloxInstanceJson | RobloxInstanceJson[]
  Handlers?: RobloxHandlerRegistry
  eventAdapter?: RobloxEventAdapter
  onWarning?: (message: string) => void
  onInstanceActivated?: (instance: RobloxInstanceJson) => void
}

type ListLayoutInfo = {
  FillDirection: 'Horizontal' | 'Vertical'
  SortOrder: 'LayoutOrder' | 'Name'
}

type RenderContext = {
  parentLayout?: ListLayoutInfo
  eventAdapter: RobloxEventAdapter
  onWarning: (message: string) => void
  onInstanceActivated?: (instance: RobloxInstanceJson) => void
}

type RobloxClassMetadata = (typeof ROBLOX_API_METADATA.Classes)[RobloxUiClassName]
type CustomCSSProperties = CSSProperties & Record<`--${string}`, string>

const RENDERABLE_CLASSES = new Set([
  'ScreenGui',
  'Frame',
  'TextLabel',
  'TextButton',
  'ImageLabel',
  'ScrollingFrame',
])

const UI_COMPONENT_CLASS_NAMES = new Set([
  'UICorner',
  'UIPadding',
  'UIStroke',
  'UIGradient',
  'UIListLayout',
  'UIAspectRatioConstraint',
  'UISizeConstraint',
  'UITextSizeConstraint',
  'UIScale',
])

const ROBLOX_EVENT_NAMES: RobloxEventName[] = [
  'Activated',
  'MouseButton1Click',
  'MouseButton1Down',
  'MouseButton1Up',
  'MouseEnter',
  'MouseLeave',
  'InputBegan',
  'InputChanged',
  'InputEnded',
  'Changed',
]

const defaultEventAdapter = createRobloxEventAdapter()

function read<T>(instance: RobloxInstanceJson, propertyName: string): T | undefined {
  return instance[propertyName] as T | undefined
}

function toInputEvent(event: ReactPointerEvent<HTMLElement>): RobloxInputEvent {
  return {
    UserInputType: event.pointerType || 'Mouse',
    Position: { X: event.clientX, Y: event.clientY },
    OriginalEvent: event.nativeEvent,
  }
}

type RobloxDomEventProps = {
  onClick?: () => void
  onPointerDown?: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerUp?: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerMove?: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerEnter?: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerLeave?: (event: ReactPointerEvent<HTMLElement>) => void
}

function createDomEventProps(
  instance: RobloxInstanceJson,
  eventAdapter: RobloxEventAdapter,
): RobloxDomEventProps {
  if (!instance.Name) return {}

  return {
    onClick: () => {
      eventAdapter.emit(instance.Name!, 'Activated')
      eventAdapter.emit(instance.Name!, 'MouseButton1Click')
    },
    onPointerDown: (event) => {
      const input = toInputEvent(event)
      eventAdapter.emit(instance.Name!, 'MouseButton1Down', input)
      eventAdapter.emit(instance.Name!, 'InputBegan', input)
    },
    onPointerUp: (event) => {
      const input = toInputEvent(event)
      eventAdapter.emit(instance.Name!, 'MouseButton1Up', input)
      eventAdapter.emit(instance.Name!, 'InputEnded', input)
    },
    onPointerMove: (event) => eventAdapter.emit(instance.Name!, 'InputChanged', toInputEvent(event)),
    onPointerEnter: (event) => eventAdapter.emit(instance.Name!, 'MouseEnter', toInputEvent(event)),
    onPointerLeave: (event) => eventAdapter.emit(instance.Name!, 'MouseLeave', toInputEvent(event)),
  }
}

function bindHandlers(
  tree: RobloxInstanceJson | RobloxInstanceJson[],
  handlers: RobloxHandlerRegistry | undefined,
  eventAdapter: RobloxEventAdapter,
): () => void {
  if (!handlers) return () => undefined

  const instances = Array.isArray(tree) ? tree : [tree]
  const disconnects: Array<() => void> = []
  const visit = (instance: RobloxInstanceJson) => {
    if (instance.Name && handlers[instance.Name]) {
      const instanceHandlers = handlers[instance.Name]
      for (const eventName of ROBLOX_EVENT_NAMES) {
        const handler = instanceHandlers[eventName]
        if (handler) {
          disconnects.push(
            eventAdapter.signal(instance.Name, eventName).connect(handler as (...arguments_: unknown[]) => void),
          )
        }
      }
      for (const [propertyName, handler] of Object.entries(instanceHandlers.GetPropertyChangedSignal ?? {})) {
        disconnects.push(eventAdapter.getPropertyChangedSignal(instance.Name, propertyName).connect(handler))
      }
    }
    for (const child of instance.Children ?? []) visit(child)
  }

  for (const instance of instances) visit(instance)
  return () => disconnects.forEach((disconnect) => disconnect())
}

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function formatNumber(value: number): string {
  return Number(value.toFixed(4)).toString()
}

function color3ToCss(color: RobloxColor3, alpha = 1): string {
  return `rgba(${Math.round(clamp(color.R) * 255)}, ${Math.round(clamp(color.G) * 255)}, ${Math.round(
    clamp(color.B) * 255,
  )}, ${formatNumber(clamp(alpha))})`
}

function inverseTransparency(transparency: number | undefined): number {
  return 1 - clamp(transparency ?? 0)
}

function udimToCss(value: RobloxUDim): string {
  const scale = value.Scale * 100
  const offset = value.Offset

  if (scale === 0) return `${offset}px`
  if (offset === 0) return `${formatNumber(scale)}%`
  return `calc(${formatNumber(scale)}% + ${offset}px)`
}

function vector2ToPx(value: RobloxVector2): string {
  return `${value.X}px ${value.Y}px`
}

function alignmentToCss(value: string | undefined, axis: 'horizontal' | 'vertical'): string | undefined {
  if (!value) return undefined
  if (value === 'Center') return 'center'
  if (axis === 'horizontal' && value === 'Left') return 'flex-start'
  if (axis === 'horizontal' && value === 'Right') return 'flex-end'
  if (axis === 'vertical' && value === 'Top') return 'flex-start'
  if (axis === 'vertical' && value === 'Bottom') return 'flex-end'
  return undefined
}

function getClassMetadata(className: string): RobloxClassMetadata | undefined {
  if (!Object.prototype.hasOwnProperty.call(ROBLOX_API_METADATA.Classes, className)) return undefined
  return ROBLOX_API_METADATA.Classes[className as RobloxUiClassName]
}

function hasProperty(className: string, propertyName: string): boolean {
  const metadata = getClassMetadata(className)
  return metadata ? (metadata.Properties as readonly string[]).includes(propertyName) : false
}

function warnUnsupportedProperties(instance: RobloxInstanceJson, context: RenderContext): void {
  const metadata = getClassMetadata(instance.ClassName)
  if (!metadata) {
    context.onWarning(`Roblox API metadata does not contain class ${instance.ClassName}.`)
    return
  }

  for (const propertyName of Object.keys(instance)) {
    if (propertyName === 'ClassName' || propertyName === 'Name' || propertyName === 'Children') continue
    if (!hasProperty(instance.ClassName, propertyName)) {
      context.onWarning(`${instance.ClassName}.${propertyName} is not in the generated Roblox API metadata.`)
    }
  }
}

function translateGradient(gradient: RobloxInstanceJson): string | undefined {
  const colorKeypoints = read<RobloxColorSequenceKeypoint[]>(gradient, 'Color')
  if (!colorKeypoints?.length) return undefined

  const transparencyKeypoints = read<RobloxNumberSequenceKeypoint[]>(gradient, 'Transparency')
  const stops = colorKeypoints.map((keypoint) => {
    const transparency = transparencyKeypoints?.find((item) => item.Time === keypoint.Time)?.Value
    return `${color3ToCss(keypoint.Value, inverseTransparency(transparency))} ${formatNumber(
      keypoint.Time * 100,
    )}%`
  })

  return `linear-gradient(${read<number>(gradient, 'Rotation') ?? 0}deg, ${stops.join(', ')})`
}

function appendTransform(style: CSSProperties, transform: string): void {
  style.transform = style.transform ? `${style.transform} ${transform}` : transform
}

function applyComponentStyles(children: RobloxInstanceJson[], style: CSSProperties): ListLayoutInfo | undefined {
  let listLayout: ListLayoutInfo | undefined

  for (const child of children) {
    if (!UI_COMPONENT_CLASS_NAMES.has(child.ClassName)) continue

    if (child.ClassName === 'UICorner') {
      const cornerRadius = read<RobloxUDim>(child, 'CornerRadius')
      if (cornerRadius) style.borderRadius = udimToCss(cornerRadius)
    }

    if (child.ClassName === 'UIPadding') {
      const paddingProperties = [
        ['PaddingTop', 'paddingTop'],
        ['PaddingRight', 'paddingRight'],
        ['PaddingBottom', 'paddingBottom'],
        ['PaddingLeft', 'paddingLeft'],
      ] as const
      for (const [robloxProperty, cssProperty] of paddingProperties) {
        const padding = read<RobloxUDim>(child, robloxProperty)
        if (padding) style[cssProperty] = udimToCss(padding)
      }
    }

    if (child.ClassName === 'UIStroke') {
      const color = read<RobloxColor3>(child, 'Color') ?? { R: 1, G: 1, B: 1 }
      const transparency = inverseTransparency(read<number>(child, 'Transparency'))
      const thickness = read<number>(child, 'Thickness') ?? 1
      style.border = `${thickness}px solid ${color3ToCss(color, transparency)}`
    }

    if (child.ClassName === 'UIGradient') {
      const backgroundImage = translateGradient(child)
      if (backgroundImage) style.backgroundImage = backgroundImage
    }

    if (child.ClassName === 'UIAspectRatioConstraint') {
      const aspectRatio = read<number>(child, 'AspectRatio')
      if (aspectRatio !== undefined) style.aspectRatio = aspectRatio
    }

    if (child.ClassName === 'UISizeConstraint') {
      const minSize = read<RobloxVector2>(child, 'MinSize')
      const maxSize = read<RobloxVector2>(child, 'MaxSize')
      if (minSize) {
        const [minWidth, minHeight] = vector2ToPx(minSize).split(' ')
        style.minWidth = minWidth
        style.minHeight = minHeight
      }
      if (maxSize) {
        const [maxWidth, maxHeight] = vector2ToPx(maxSize).split(' ')
        style.maxWidth = maxWidth
        style.maxHeight = maxHeight
      }
    }

    if (child.ClassName === 'UITextSizeConstraint') {
      const minTextSize = read<number>(child, 'MinTextSize')
      const maxTextSize = read<number>(child, 'MaxTextSize')
      if (minTextSize !== undefined || maxTextSize !== undefined) {
        const minimum = minTextSize ?? 0
        const maximum = maxTextSize ?? 999
        style.fontSize = `clamp(${minimum}px, ${style.fontSize ?? '1em'}, ${maximum}px)`
      }
    }

    if (child.ClassName === 'UIScale') {
      const scale = read<number>(child, 'Scale')
      if (scale !== undefined) appendTransform(style, `scale(${scale})`)
    }

    if (child.ClassName === 'UIListLayout') {
      const fillDirection = read<string>(child, 'FillDirection') === 'Horizontal' ? 'Horizontal' : 'Vertical'
      const horizontalAlignment = read<string>(child, 'HorizontalAlignment')
      const verticalAlignment = read<string>(child, 'VerticalAlignment')
      const isHorizontal = fillDirection === 'Horizontal'
      listLayout = {
        FillDirection: fillDirection,
        SortOrder: read<string>(child, 'SortOrder') === 'LayoutOrder' ? 'LayoutOrder' : 'Name',
      }
      style.display = 'flex'
      style.flexDirection = isHorizontal ? 'row' : 'column'
      style.justifyContent = alignmentToCss(
        isHorizontal ? horizontalAlignment : verticalAlignment,
        isHorizontal ? 'horizontal' : 'vertical',
      )
      style.alignItems = alignmentToCss(
        isHorizontal ? verticalAlignment : horizontalAlignment,
        isHorizontal ? 'vertical' : 'horizontal',
      )
      const padding = read<RobloxUDim>(child, 'Padding')
      if (padding) style.gap = udimToCss(padding)
    }
  }

  return listLayout
}

function buildStyle(instance: RobloxInstanceJson, parentLayout?: ListLayoutInfo): CSSProperties {
  const style: CSSProperties = {
    boxSizing: 'border-box',
    position: parentLayout ? 'relative' : 'absolute',
  }

  if (parentLayout?.SortOrder === 'LayoutOrder') {
    style.order = read<number>(instance, 'LayoutOrder') ?? 0
  }

  const backgroundColor = read<RobloxColor3>(instance, 'BackgroundColor3')
  if (backgroundColor) {
    style.backgroundColor = color3ToCss(
      backgroundColor,
      inverseTransparency(read<number>(instance, 'BackgroundTransparency')),
    )
  }

  const borderSize = read<number>(instance, 'BorderSizePixel')
  if (borderSize !== undefined && borderSize > 0) {
    style.borderWidth = `${borderSize}px`
    style.borderStyle = 'solid'
    style.borderColor = color3ToCss(read<RobloxColor3>(instance, 'BorderColor3') ?? { R: 1, G: 1, B: 1 })
  }

  const size = read<RobloxUDim2>(instance, 'Size')
  if (size) {
    style.width = udimToCss(size.X)
    style.height = udimToCss(size.Y)
  }

  const position = read<RobloxUDim2>(instance, 'Position')
  if (position) {
    style.left = udimToCss(position.X)
    style.top = udimToCss(position.Y)
  }

  const anchorPoint = read<RobloxVector2>(instance, 'AnchorPoint')
  if (anchorPoint) appendTransform(style, `translate(${-anchorPoint.X * 100}%, ${-anchorPoint.Y * 100}%)`)
  const rotation = read<number>(instance, 'Rotation')
  if (rotation) appendTransform(style, `rotate(${rotation}deg)`)

  if (read<boolean>(instance, 'Visible') === false) style.display = 'none'
  const clipsDescendants = read<boolean>(instance, 'ClipsDescendants')
  if (clipsDescendants) style.overflow = 'hidden'

  const zIndex = read<number>(instance, 'ZIndex')
  if (zIndex !== undefined) style.zIndex = zIndex

  const textColor = read<RobloxColor3>(instance, 'TextColor3')
  if (textColor) {
    style.color = color3ToCss(textColor, inverseTransparency(read<number>(instance, 'TextTransparency')))
  }

  const textSize = read<number>(instance, 'TextSize')
  if (textSize !== undefined) style.fontSize = `${textSize}px`
  const fontFace = read<{ Family: string; Weight: string; Style: string }>(instance, 'FontFace')
  const font = read<string>(instance, 'Font')
  if (fontFace?.Family) style.fontFamily = fontFace.Family.split('/').pop()?.replace(/\.json$/i, '') ?? fontFace.Family
  else if (font) style.fontFamily = font
  if (fontFace?.Weight) style.fontWeight = fontFace.Weight === 'Bold' ? 700 : 400
  if (fontFace?.Style) style.fontStyle = fontFace.Style === 'Italic' ? 'italic' : 'normal'

  const textWrapped = read<boolean>(instance, 'TextWrapped')
  style.whiteSpace = textWrapped ? 'normal' : 'nowrap'
  const textXAlignment = read<string>(instance, 'TextXAlignment')
  const textYAlignment = read<string>(instance, 'TextYAlignment')
  if (textXAlignment || textYAlignment) {
    style.display = 'flex'
    style.flexDirection = 'column'
    style.textAlign = textXAlignment === 'Right' ? 'right' : textXAlignment === 'Center' ? 'center' : 'left'
    style.alignItems = alignmentToCss(textXAlignment, 'horizontal')
    style.justifyContent = alignmentToCss(textYAlignment, 'vertical')
  }

  if (instance.ClassName === 'ScreenGui') {
    style.position = 'relative'
    style.width = '100%'
    style.height = '100%'
    style.overflow = 'hidden'
  }

  if (instance.ClassName === 'ScrollingFrame') {
    style.overflow = 'auto'
    const scrollbarThickness = read<number>(instance, 'ScrollBarThickness')
    if (scrollbarThickness !== undefined) {
      const customStyle = style as CustomCSSProperties
      customStyle['--roblox-scrollbar-thickness'] = `${scrollbarThickness}px`
      style.scrollbarWidth = scrollbarThickness === 0 ? 'none' : 'auto'
    }
  }

  return style
}

function sortChildren(children: RobloxInstanceJson[], layout?: ListLayoutInfo): RobloxInstanceJson[] {
  if (!layout) return children
  return [...children].sort((left, right) => {
    if (layout.SortOrder === 'LayoutOrder') {
      return (read<number>(left, 'LayoutOrder') ?? 0) - (read<number>(right, 'LayoutOrder') ?? 0)
    }
    return (left.Name ?? '').localeCompare(right.Name ?? '')
  })
}

function renderText(instance: RobloxInstanceJson): ReactNode {
  const text = read<string>(instance, 'Text') ?? ''
  if (!read<boolean>(instance, 'RichText')) return text
  return <span dangerouslySetInnerHTML={{ __html: text }} />
}

function renderInstance(instance: RobloxInstanceJson, context: RenderContext, key: string): ReactNode {
  warnUnsupportedProperties(instance, context)

  const children = instance.Children ?? []
  const componentChildren = children.filter((child) => UI_COMPONENT_CLASS_NAMES.has(child.ClassName))
  const visualChildren = children.filter((child) => !UI_COMPONENT_CLASS_NAMES.has(child.ClassName))
  const style = buildStyle(instance, context.parentLayout)
  const listLayout = applyComponentStyles(componentChildren, style)
  const sortedChildren = sortChildren(visualChildren, listLayout)
  const childContext: RenderContext = { ...context, parentLayout: listLayout }
  const renderedChildren = sortedChildren.map((child, index) =>
    renderInstance(child, childContext, `${key}-${child.Name ?? child.ClassName}-${index}`),
  )
  const className = instance.ClassName
  const commonProps = {
    'data-roblox-class': className,
    'data-roblox-name': instance.Name,
    style,
    ...createDomEventProps(instance, context.eventAdapter),
  }

  if (!RENDERABLE_CLASSES.has(className)) {
    context.onWarning(`Roblox renderer does not render class ${className}.`)
    return null
  }

  if (className === 'ScrollingFrame') {
    const canvasSize = read<RobloxUDim2>(instance, 'CanvasSize')
    const automaticCanvasSize = read<string>(instance, 'AutomaticCanvasSize')
    const canvasStyle: CSSProperties = {
      position: 'relative',
      minWidth: '100%',
      minHeight: '100%',
      display: style.display,
      flexDirection: style.flexDirection,
      justifyContent: style.justifyContent,
      alignItems: style.alignItems,
      gap: style.gap,
    }
    if (canvasSize) {
      canvasStyle.width = udimToCss(canvasSize.X)
      canvasStyle.height = udimToCss(canvasSize.Y)
    }
    if (automaticCanvasSize === 'X' || automaticCanvasSize === 'XY') canvasStyle.width = 'max-content'
    if (automaticCanvasSize === 'Y' || automaticCanvasSize === 'XY') canvasStyle.height = 'max-content'

    return (
      <div {...commonProps} key={key}>
        <div style={canvasStyle}>{renderedChildren}</div>
      </div>
    )
  }

  if (className === 'TextButton') {
    return (
      <button
        {...commonProps}
        key={key}
        type="button"
        onClick={() => context.onInstanceActivated?.(instance)}
      >
        {renderText(instance)}
        {renderedChildren}
      </button>
    )
  }

  if (className === 'ImageLabel') {
    const image = read<string>(instance, 'Image')
    return (
      <div {...commonProps} key={key}>
        {image ? <img src={image} alt={instance.Name ?? ''} style={{ width: '100%', height: '100%' }} /> : null}
        {renderedChildren}
      </div>
    )
  }

  return (
    <div {...commonProps} key={key}>
      {className === 'TextLabel' ? renderText(instance) : null}
      {renderedChildren}
    </div>
  )
}

export function RobloxRenderer({
  tree,
  Handlers,
  eventAdapter = defaultEventAdapter,
  onWarning,
  onInstanceActivated,
}: RobloxRendererProps) {
  const warnings: string[] = []
  const reportWarning = onWarning ?? ((message: string) => warnings.push(message))
  useEffect(() => bindHandlers(tree, Handlers, eventAdapter), [tree, Handlers, eventAdapter])
  const instances = Array.isArray(tree) ? tree : [tree]
  const context: RenderContext = {
    eventAdapter,
    onWarning: reportWarning,
    onInstanceActivated,
  }

  return <>{instances.map((instance, index) => renderInstance(instance, context, `${instance.ClassName}-${index}`))}</>
}
