import assert from 'node:assert/strict'
import { getAuthoringEvents, instance, toRobloxTree, validateRobloxAuthoringTree } from '../my-ui/src/authoring/roblox-authoring.ts'

const button = instance('TextButton', {
  Name: 'BuyButton',
  Text: 'Buy',
  Events: { MouseButton1Click: () => undefined },
  Children: [instance('UICorner', { CornerRadius: { Scale: 0, Offset: 8 } })],
})

assert.equal(button.ClassName, 'TextButton')
assert.equal(button.Children?.[0].ClassName, 'UICorner')
assert.equal(getAuthoringEvents(button)[0].path, 'BuyButton[0]')
assert.equal(Object.hasOwn(button, 'Events'), true)
assert.equal(Object.keys(button).includes('Events'), false)

const canonical = toRobloxTree(button)
assert.equal(Object.hasOwn(canonical, 'Events'), false)
assert.equal(validateRobloxAuthoringTree(canonical).length, 0)

const invalid = { ClassName: 'Frame', Text: 'not valid' }
const issues = validateRobloxAuthoringTree(invalid)
assert.equal(issues[0]?.kind, 'invalid-property')
assert.equal(issues[0]?.path, 'Frame[0].Text')

console.log('Roblox authoring types/runtime validation passed.')
