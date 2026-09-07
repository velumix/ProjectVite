import { parallel, sequence, tween, type RobloxEffect } from './roblox-effects.ts'

export const previewEffects: Record<string, RobloxEffect> = {
  PurchaseSuccess: sequence(
    tween(
      'RendererPreviewGui/GameModalsContainer/ShopPanelModal/ShopItem_Bat/BuyButton',
      { BackgroundColor3: { R: 0.13, G: 0.77, B: 0.35 }, Rotation: 2 },
      { Time: 120, EasingStyle: 'Quad', EasingDirection: 'Out' },
    ),
    parallel(
      tween(
        'RendererPreviewGui/GameModalsContainer/ShopPanelModal/ShopItem_Bat/BuyButton',
        { BackgroundTransparency: 0.15, Rotation: 0 },
        { Time: 280, EasingStyle: 'Back', EasingDirection: 'Out' },
      ),
      tween(
        'RendererPreviewGui/MainGameHud/CurrencyCard/MoneyCounter',
        { TextColor3: { R: 0.2, G: 0.9, B: 0.4 } },
        { Time: 200, EasingStyle: 'Sine', EasingDirection: 'Out' },
      ),
    ),
    tween(
      'RendererPreviewGui/MainGameHud/CurrencyCard/MoneyCounter',
      { TextColor3: { R: 0.96, G: 0.75, B: 0.14 } },
      { Time: 300, EasingStyle: 'Sine', EasingDirection: 'Out' },
    ),
  ),
  PurchaseFailed: sequence(
    tween(
      'RendererPreviewGui/GameModalsContainer/ShopPanelModal/ShopItem_Bat/BuyButton',
      { BackgroundColor3: { R: 0.85, G: 0.18, B: 0.18 }, Rotation: -2 },
      { Time: 100, EasingStyle: 'Quad', EasingDirection: 'Out' },
    ),
    tween(
      'RendererPreviewGui/GameModalsContainer/ShopPanelModal/ShopItem_Bat/BuyButton',
      { BackgroundColor3: { R: 0.96, G: 0.75, B: 0.14 }, Rotation: 0 },
      { Time: 300, EasingStyle: 'Sine', EasingDirection: 'Out' },
    ),
  ),
  DamageFlash: sequence(
    tween(
      'RendererPreviewGui/MainGameHud/PlayerStatsCard/HealthBarTrack/HealthBarFill',
      { BackgroundColor3: { R: 0.94, G: 0.2, B: 0.2 } },
      { Time: 80, EasingStyle: 'Quad', EasingDirection: 'Out' },
    ),
    tween(
      'RendererPreviewGui/MainGameHud/PlayerStatsCard/HealthBarTrack/HealthBarFill',
      { BackgroundColor3: { R: 0.13, G: 0.77, B: 0.35 } },
      { Time: 420, EasingStyle: 'Sine', EasingDirection: 'Out' },
    ),
  ),
  ScreenShake: parallel(
    tween(
      'RendererPreviewGui/MainGameHud/PlayerStatsCard',
      { Position: { X: { Scale: 0, Offset: 20 }, Y: { Scale: 0, Offset: 16 } } },
      { Time: 45, EasingStyle: 'Quad', EasingDirection: 'Out' },
    ),
    tween(
      'RendererPreviewGui/MainGameHud/PlayerStatsCard',
      { Rotation: -1 },
      { Time: 45, EasingStyle: 'Quad', EasingDirection: 'Out' },
    ),
  ),
}
