import type { RobloxColor3, RobloxInstanceJson, RobloxUDim2, RobloxVector2 } from '../renderer/RobloxRenderer.tsx'
import type { RobloxRuntimeContext, RobloxViewportSize } from '../runtime/roblox-runtime.ts'
import { resolveRobloxViewport, type RobloxViewportMode } from '../viewport/roblox-viewport.ts'

export type VisualSnapshotImage = { width: number; height: number; pixels: Uint8Array }

export function renderVisualSnapshot(tree: RobloxInstanceJson, runtime: RobloxRuntimeContext, mode: RobloxViewportMode, custom: RobloxViewportSize = { X: 1280, Y: 720 }): VisualSnapshotImage {
  const viewport = resolveRobloxViewport(runtime, mode, custom).size
  const pixels = new Uint8Array(viewport.X * viewport.Y * 4)
  fill(pixels, { R: 0.027, G: 0.035, B: 0.051 }, 1)
  const roots = tree.ClassName === 'ScreenGui' ? tree.Children ?? [] : [tree]
  for (const child of roots) drawInstance(child, pixels, viewport.X, viewport.Y, 0, 0, viewport.X, viewport.Y, 1)
  return { width: viewport.X, height: viewport.Y, pixels }
}

function drawInstance(instance: RobloxInstanceJson, pixels: Uint8Array, canvasWidth: number, canvasHeight: number, parentX: number, parentY: number, parentWidth: number, parentHeight: number, parentScale: number): void {
  const size = readUDim2(instance.Size, parentWidth, parentHeight)
  const position = readUDim2(instance.Position, parentWidth, parentHeight)
  const anchor = readVector2(instance.AnchorPoint)
  const scale = parentScale * (typeof instance.UIScale === 'number' ? instance.UIScale : 1)
  const width = Math.max(0, Math.round(size.X * scale))
  const height = Math.max(0, Math.round(size.Y * scale))
  const x = Math.round(parentX + position.X * scale - anchor.X * width)
  const y = Math.round(parentY + position.Y * scale - anchor.Y * height)
  if (instance.Visible === false) return
  const color = readColor(instance.BackgroundColor3) ?? (instance.ClassName.includes('Image') ? hashColor(String(instance.Image ?? instance.Name ?? 'image')) : undefined)
  if (color) fillRect(pixels, canvasWidth, canvasHeight, x, y, width, height, color, 1 - number(instance.BackgroundTransparency))
  const border = number(instance.BorderSizePixel)
  if (border > 0) strokeRect(pixels, canvasWidth, canvasHeight, x, y, width, height, border, readColor(instance.BorderColor3) ?? { R: 1, G: 1, B: 1 })
  if (typeof instance.Text === 'string' && instance.Text) drawTextBlocks(pixels, canvasWidth, canvasHeight, instance.Text, x, y, width, height, readColor(instance.TextColor3) ?? { R: 1, G: 1, B: 1 })
  const children = instance.Children ?? []
  const layout = children.find((child) => child.ClassName === 'UIListLayout')
  let flowX = 0
  let flowY = 0
  for (const child of children) {
    if (child.ClassName.startsWith('UI')) continue
    const childPosition = layout ? { X: flowX, Y: flowY } : { X: 0, Y: 0 }
    drawInstance(child, pixels, canvasWidth, canvasHeight, x + childPosition.X, y + childPosition.Y, width, height, scale)
    if (layout) {
      const childSize = readUDim2(child.Size, width, height)
      const padding = readUDim(layout.Padding, layout.FillDirection === 'Horizontal' ? width : height)
      if (layout.FillDirection === 'Horizontal') flowX += childSize.X + padding
      else flowY += childSize.Y + padding
    }
  }
}

function drawTextBlocks(pixels: Uint8Array, canvasWidth: number, canvasHeight: number, text: string, x: number, y: number, width: number, height: number, color: RobloxColor3): void {
  const size = Math.max(1, Math.min(4, Math.round(numberValue(text.length % 4 + 2))))
  const maxChars = Math.max(1, Math.floor(width / (size * 2)))
  for (let index = 0; index < Math.min(text.length, maxChars * Math.max(1, Math.floor(height / (size * 2)))); index++) {
    const charX = x + (index % maxChars) * size * 2
    const charY = y + Math.floor(index / maxChars) * size * 2
    fillRect(pixels, canvasWidth, canvasHeight, charX, charY, size, size, color, 0.9)
  }
}

function readUDim2(value: unknown, parentWidth: number, parentHeight: number): { X: number; Y: number } {
  const input = value as RobloxUDim2 | undefined
  return { X: input?.X ? input.X.Scale * parentWidth + input.X.Offset : parentWidth, Y: input?.Y ? input.Y.Scale * parentHeight + input.Y.Offset : parentHeight }
}
function readUDim(value: unknown, parentSize: number): number { const input = value as { Scale?: number; Offset?: number } | undefined; return input ? (input.Scale ?? 0) * parentSize + (input.Offset ?? 0) : 0 }
function readVector2(value: unknown): RobloxVector2 { const input = value as RobloxVector2 | undefined; return { X: input?.X ?? 0, Y: input?.Y ?? 0 } }
function readColor(value: unknown): RobloxColor3 | undefined { const input = value as RobloxColor3 | undefined; return input && typeof input.R === 'number' ? input : undefined }
function number(value: unknown): number { return typeof value === 'number' ? Math.min(1, Math.max(0, value)) : 0 }
function numberValue(value: number): number { return value }
function hashColor(value: string): RobloxColor3 { let hash = 0; for (const char of value) hash = (hash * 31 + char.charCodeAt(0)) >>> 0; return { R: 0.25 + (hash & 255) / 1020, G: 0.35 + ((hash >> 8) & 255) / 1020, B: 0.45 + ((hash >> 16) & 255) / 1020 } }
function fill(pixels: Uint8Array, color: RobloxColor3, alpha: number): void { for (let index = 0; index < pixels.length; index += 4) setPixel(pixels, index, color, alpha) }
function fillRect(pixels: Uint8Array, canvasWidth: number, canvasHeight: number, x: number, y: number, width: number, height: number, color: RobloxColor3, alpha: number): void { for (let row = Math.max(0, y); row < Math.min(canvasHeight, y + height); row++) for (let column = Math.max(0, x); column < Math.min(canvasWidth, x + width); column++) setPixel(pixels, (row * canvasWidth + column) * 4, color, alpha) }
function strokeRect(pixels: Uint8Array, canvasWidth: number, canvasHeight: number, x: number, y: number, width: number, height: number, border: number, color: RobloxColor3): void { fillRect(pixels, canvasWidth, canvasHeight, x, y, width, border, color, 1); fillRect(pixels, canvasWidth, canvasHeight, x, y + height - border, width, border, color, 1); fillRect(pixels, canvasWidth, canvasHeight, x, y, border, height, color, 1); fillRect(pixels, canvasWidth, canvasHeight, x + width - border, y, border, height, color, 1) }
function setPixel(pixels: Uint8Array, index: number, color: RobloxColor3, alpha: number): void { if (index < 0 || index + 3 >= pixels.length) return; pixels[index] = Math.round(color.R * 255 * alpha + pixels[index] * (1 - alpha)); pixels[index + 1] = Math.round(color.G * 255 * alpha + pixels[index + 1] * (1 - alpha)); pixels[index + 2] = Math.round(color.B * 255 * alpha + pixels[index + 2] * (1 - alpha)); pixels[index + 3] = 255 }
