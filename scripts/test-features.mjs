import assert from 'node:assert/strict'
import { ShopFeature } from '../my-ui/src/features/shop-feature.ts'
import { composeFeatures } from '../my-ui/src/features/feature.ts'

const project = composeFeatures([ShopFeature])
assert.equal(project.UI.length, 1)
assert.equal(project.UI[0].Tree.ClassName, 'ScreenGui')
assert.ok(project.Actions['ShopFeature.BuyItem'])
assert.ok(project.Effects['ShopFeature.PurchaseSuccess'])
assert.deepEqual(project.Nerve.Services, ['InventoryService'])
assert.ok(project.Network.InventoryService.BuyItem)
console.log('Feature composition checks passed')
