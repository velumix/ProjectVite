/** Preview adapter backed by generated Roblox API metadata. */

import {
  ROBLOX_API_METADATA,
  type RobloxUiClassName,
  type RobloxUiPropertyName,
} from './generated/roblox-api-metadata.ts'

export type RobloxColor3 = {
  R: number
  G: number
  B: number
}

export type RobloxUDim = {
  Scale: number
  Offset: number
}

export type RobloxUDim2 = {
  X: RobloxUDim
  Y: RobloxUDim
}

export type RobloxFontFace = {
  Family: string
  Weight: string
  Style: string
}

export type RobloxColorSequenceKeypoint = {
  Time: number
  Value: RobloxColor3
}

export type RobloxNumberSequenceKeypoint = {
  Time: number
  Value: number
}

export type RobloxStyle = Partial<Record<RobloxUiPropertyName, unknown>> & Record<string, unknown>

type RobloxCornerStyle = { CornerRadius: RobloxUDim }
type RobloxStrokeStyle = {
  Color?: RobloxColor3
  Transparency?: number
  Thickness?: number
}
type RobloxPaddingStyle = {
  PaddingTop?: RobloxUDim
  PaddingRight?: RobloxUDim
  PaddingBottom?: RobloxUDim
  PaddingLeft?: RobloxUDim
}
type RobloxGradientStyle = {
  Color: RobloxColorSequenceKeypoint[]
  Transparency?: RobloxNumberSequenceKeypoint[]
  Rotation?: number
}
type RobloxListLayoutStyle = {
  FillDirection?: string
  HorizontalAlignment?: string
  VerticalAlignment?: string
  Padding?: RobloxUDim
}

export type WebStyle = Record<string, string | number>

export type RobloxStyleTranslation = {
  styles: WebStyle
  unsupportedProperties: string[]
}

/** Web semantics for properties supported by this preview renderer. */
export const ROBLOX_WEB_PROPERTY_TRANSLATIONS = {
  BackgroundColor3: 'background-color',
  BackgroundTransparency: 'background-alpha',
  TextColor3: 'color',
  TextTransparency: 'text-alpha',
  TextSize: 'font-size',
  FontFace: 'font-family/font-weight/font-style',
  Size: 'width/height',
  Position: 'left/top',
  'UICorner.CornerRadius': 'border-radius',
  'UIStroke.Color': 'border-color',
  'UIStroke.Transparency': 'border-alpha',
  'UIStroke.Thickness': 'border-width',
  'UIPadding.PaddingTop': 'padding-top',
  'UIPadding.PaddingRight': 'padding-right',
  'UIPadding.PaddingBottom': 'padding-bottom',
  'UIPadding.PaddingLeft': 'padding-left',
  'UIGradient.Color': 'background-image',
  'UIGradient.Transparency': 'background-image-alpha',
  'UIGradient.Rotation': 'background-image-angle',
  'UIListLayout.FillDirection': 'flex-direction',
  'UIListLayout.HorizontalAlignment': 'justify-content',
  'UIListLayout.VerticalAlignment': 'align-items',
  'UIListLayout.Padding': 'gap',
} as const

const API_PROPERTY_NAMES = new Set<string>(ROBLOX_API_METADATA.PropertyNames)
const API_PROPERTY_PATHS = new Set<string>(ROBLOX_API_METADATA.PropertyPaths)
const API_CLASS_NAMES = new Set<string>(ROBLOX_API_METADATA.PrioritizedClasses)

function clamp(value: number, minimum = 0, maximum = 1): number {
  return Math.min(maximum, Math.max(minimum, value))
}

function formatNumber(value: number): string {
  return Number(value.toFixed(4)).toString()
}

function color3ToRgb(color: RobloxColor3, alpha = 1): string {
  const red = Math.round(clamp(color.R) * 255)
  const green = Math.round(clamp(color.G) * 255)
  const blue = Math.round(clamp(color.B) * 255)
  return `rgba(${red}, ${green}, ${blue}, ${formatNumber(clamp(alpha))})`
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

function alignmentToCss(value: string | undefined, axis: 'horizontal' | 'vertical'): string | undefined {
  if (!value) return undefined
  if (value === 'Center') return 'center'

  if (axis === 'horizontal') {
    if (value === 'Left') return 'flex-start'
    if (value === 'Right') return 'flex-end'
  }

  if (axis === 'vertical') {
    if (value === 'Top') return 'flex-start'
    if (value === 'Bottom') return 'flex-end'
  }

  return undefined
}

function fontFamilyFromRobloxAsset(family: string): string {
  if (!family.includes('/')) return family
  const fileName = family.split('/').pop() ?? family
  return fileName.replace(/\.json$/i, '').replace(/[-_]/g, ' ')
}

function translateGradient(
  gradient: RobloxGradientStyle,
): string | undefined {
  if (gradient.Color.length === 0) return undefined

  const stops = gradient.Color.map((keypoint) => {
    const transparency = gradient.Transparency?.find(
      (transparencyPoint) => transparencyPoint.Time === keypoint.Time,
    )?.Value
    return `${color3ToRgb(keypoint.Value, inverseTransparency(transparency))} ${formatNumber(
      keypoint.Time * 100,
    )}%`
  })

  return `linear-gradient(${gradient.Rotation ?? 0}deg, ${stops.join(', ')})`
}

function recordUnsupportedProperties(
  style: RobloxStyle,
  unsupportedProperties: string[],
  className?: RobloxUiClassName,
): void {
  for (const propertyName of Object.keys(style)) {
    if (API_CLASS_NAMES.has(propertyName)) {
      const nestedStyle = style[propertyName]
      if (!nestedStyle || typeof nestedStyle !== 'object') continue

      for (const nestedPropertyName of Object.keys(nestedStyle)) {
        if (!API_PROPERTY_PATHS.has(`${propertyName}.${nestedPropertyName}`)) {
          unsupportedProperties.push(`${propertyName}.${nestedPropertyName}`)
        }
      }
      continue
    }

    const isSupported = className
      ? API_PROPERTY_PATHS.has(`${className}.${propertyName}`)
      : API_PROPERTY_NAMES.has(propertyName)
    if (!isSupported) {
      unsupportedProperties.push(propertyName)
    }
  }
}

function readStyleValue<T>(style: RobloxStyle, propertyName: string): T | undefined {
  return style[propertyName] as T | undefined
}

export function validateRobloxStyle(style: RobloxStyle, className?: RobloxUiClassName): string[] {
  const unsupportedProperties: string[] = []
  recordUnsupportedProperties(style, unsupportedProperties, className)
  return unsupportedProperties
}

export function translateRobloxStyle(style: RobloxStyle): RobloxStyleTranslation {
  const styles: WebStyle = {}
  const unsupportedProperties = validateRobloxStyle(style)
  const backgroundColor = readStyleValue<RobloxColor3>(style, 'BackgroundColor3')
  const backgroundTransparency = readStyleValue<number>(style, 'BackgroundTransparency')
  const textColor = readStyleValue<RobloxColor3>(style, 'TextColor3')
  const textTransparency = readStyleValue<number>(style, 'TextTransparency')
  const textSize = readStyleValue<number>(style, 'TextSize')
  const fontFace = readStyleValue<RobloxFontFace>(style, 'FontFace')
  const size = readStyleValue<RobloxUDim2>(style, 'Size')
  const position = readStyleValue<RobloxUDim2>(style, 'Position')
  const corner = readStyleValue<RobloxCornerStyle>(style, 'UICorner')
  const stroke = readStyleValue<RobloxStrokeStyle>(style, 'UIStroke')
  const padding = readStyleValue<RobloxPaddingStyle>(style, 'UIPadding')
  const gradient = readStyleValue<RobloxGradientStyle>(style, 'UIGradient')
  const listLayout = readStyleValue<RobloxListLayoutStyle>(style, 'UIListLayout')

  if (backgroundColor) {
    styles.backgroundColor = color3ToRgb(backgroundColor, inverseTransparency(backgroundTransparency))
  }

  if (textColor) {
    styles.color = color3ToRgb(textColor, inverseTransparency(textTransparency))
  } else if (textTransparency !== undefined) {
    styles.opacity = inverseTransparency(textTransparency)
  }

  if (textSize !== undefined) styles.fontSize = `${textSize}px`

  if (fontFace) {
    styles.fontFamily = fontFamilyFromRobloxAsset(fontFace.Family)
    styles.fontWeight = fontFace.Weight === 'Bold' ? 700 : 400
    styles.fontStyle = fontFace.Style === 'Italic' ? 'italic' : 'normal'
  }

  if (size) {
    styles.width = udimToCss(size.X)
    styles.height = udimToCss(size.Y)
  }

  if (position) {
    styles.left = udimToCss(position.X)
    styles.top = udimToCss(position.Y)
  }

  if (corner) styles.borderRadius = udimToCss(corner.CornerRadius)

  if (stroke) {
    const strokeColor = stroke.Color ?? { R: 1, G: 1, B: 1 }
    const strokeAlpha = inverseTransparency(stroke.Transparency)
    styles.border = `${stroke.Thickness ?? 1}px solid ${color3ToRgb(strokeColor, strokeAlpha)}`
  }

  if (padding) {
    if (padding.PaddingTop) styles.paddingTop = udimToCss(padding.PaddingTop)
    if (padding.PaddingRight) styles.paddingRight = udimToCss(padding.PaddingRight)
    if (padding.PaddingBottom) styles.paddingBottom = udimToCss(padding.PaddingBottom)
    if (padding.PaddingLeft) styles.paddingLeft = udimToCss(padding.PaddingLeft)
  }

  if (gradient) {
    const backgroundImage = translateGradient(gradient)
    if (backgroundImage) styles.backgroundImage = backgroundImage
  }

  if (listLayout) {
    const layout = listLayout
    styles.display = 'flex'
    const isHorizontal = layout.FillDirection === 'Horizontal'
    styles.flexDirection = isHorizontal ? 'row' : 'column'

    const justifyContent = alignmentToCss(
      isHorizontal ? layout.HorizontalAlignment : layout.VerticalAlignment,
      isHorizontal ? 'horizontal' : 'vertical',
    )
    const alignItems = alignmentToCss(
      isHorizontal ? layout.VerticalAlignment : layout.HorizontalAlignment,
      isHorizontal ? 'vertical' : 'horizontal',
    )
    if (justifyContent) styles.justifyContent = justifyContent
    if (alignItems) styles.alignItems = alignItems
    if (layout.Padding) styles.gap = udimToCss(layout.Padding)
  }

  return { styles, unsupportedProperties }
}
