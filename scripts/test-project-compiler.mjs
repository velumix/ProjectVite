import assert from 'node:assert/strict'
import { compileRobloxProject } from '../my-ui/src/features/project-compiler.ts'
import { ShopFeature } from '../my-ui/src/features/shop-feature.ts'

assert.doesNotThrow(() => compileRobloxProject([ShopFeature]))
assert.throws(() => compileRobloxProject([ShopFeature, { ...ShopFeature }]), /Duplicate feature/)
const otherRoot = (feature) => ({ ...feature, Name: 'OtherFeature', UI: { ...feature.UI, Tree: { ...feature.UI.Tree, Name: 'OtherFeatureGui' } } })
assert.throws(() => compileRobloxProject([ShopFeature, otherRoot(ShopFeature)]), /Duplicate action/)
assert.throws(() => compileRobloxProject([ShopFeature, otherRoot({ ...ShopFeature, Actions: {}, Effects: {}, UI: { ...ShopFeature.UI, ActionBindings: [], EffectHooks: [] } })]), /Duplicate Nerve service/)
console.log('Project compiler conflict checks passed')
