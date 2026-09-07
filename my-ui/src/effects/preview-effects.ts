import { parallel, sequence, tween, type RobloxEffect } from './roblox-effects.ts'

export const previewEffects: Record<string, RobloxEffect> = {
  PurchaseSuccess: sequence(
    tween('RendererPreviewGui/Inventory/BuyButton', { BackgroundColor3: { R: 0.13, G: 0.77, B: 0.35 }, Rotation: 2 }, { Time: 120, EasingStyle: 'Quad', EasingDirection: 'Out' }),
    parallel(
      tween('RendererPreviewGui/Inventory/BuyButton', { BackgroundTransparency: 0.15, Rotation: 0 }, { Time: 280, EasingStyle: 'Back', EasingDirection: 'Out' }),
      tween('RendererPreviewGui/Inventory/BuyButton/UIStroke', { Transparency: 0 }, { Time: 180, EasingStyle: 'Sine', EasingDirection: 'Out' }),
    ),
  ),
  PurchaseFailed: sequence(
    tween('RendererPreviewGui/Inventory/BuyButton', { BackgroundColor3: { R: 0.85, G: 0.18, B: 0.18 }, Rotation: -2 }, { Time: 100, EasingStyle: 'Quad', EasingDirection: 'Out' }),
    tween('RendererPreviewGui/Inventory/BuyButton', { BackgroundColor3: { R: 0.09, G: 0.106, B: 0.133 }, Rotation: 0 }, { Time: 300, EasingStyle: 'Sine', EasingDirection: 'Out' }),
  ),
  DamageFlash: sequence(
    tween('RendererPreviewGui/Constraints/ConstraintLabel', { TextColor3: { R: 0.94, G: 0.2, B: 0.2 }, TextTransparency: 0 }, { Time: 80, EasingStyle: 'Quad', EasingDirection: 'Out' }),
    tween('RendererPreviewGui/Constraints/ConstraintLabel', { TextColor3: { R: 0.96, G: 0.97, B: 0.98 }, TextTransparency: 0 }, { Time: 420, EasingStyle: 'Sine', EasingDirection: 'Out' }),
  ),
  ScreenShake: parallel(
    tween('RendererPreviewGui/Inventory', { Position: { X: { Scale: 0, Offset: 308 }, Y: { Scale: 0, Offset: 16 } } }, { Time: 45, EasingStyle: 'Quad', EasingDirection: 'Out' }),
    tween('RendererPreviewGui/Inventory', { Rotation: -1 }, { Time: 45, EasingStyle: 'Quad', EasingDirection: 'Out' }),
  ),
}
