import assert from 'node:assert/strict'
import { previewEffects } from '../my-ui/src/effects/preview-effects.ts'
import { effectDuration, tween } from '../my-ui/src/effects/roblox-effects.ts'

assert.ok(previewEffects.PurchaseSuccess)
assert.ok(previewEffects.DamageFlash)
assert.equal(effectDuration(tween('Root', { Rotation: 2 }, { Time: 100 })), 100)
console.log('Roblox effect definition checks passed')
