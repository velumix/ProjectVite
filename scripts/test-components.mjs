import assert from 'node:assert/strict'
import { previewComponentDocument } from '../my-ui/src/components/roblox-components.ts'

assert.equal(previewComponentDocument.Tree.ClassName, 'ScreenGui')
assert.equal(previewComponentDocument.Tree.Children.length, 4)
assert.equal(previewComponentDocument.ActionBindings[0].Action, 'BuyItem')
assert.equal(previewComponentDocument.EffectHooks[0].Effect, 'PurchaseSuccess')
assert.equal(previewComponentDocument.Tree.Children[0].Children[0].Text.Path, 'Player.Money')
console.log('Roblox component checks passed')
