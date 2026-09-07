import assert from 'node:assert/strict'
import { previewActionBindings } from '../my-ui/src/actions/preview-actions.ts'

assert.equal(previewActionBindings.BuyButton.Activated.Action, 'BuyItem')
assert.deepEqual(previewActionBindings.BuyButton.Activated.Payload, { ItemId: 'Bat' })
console.log('Action binding checks passed')
