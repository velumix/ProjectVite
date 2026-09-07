import assert from 'node:assert/strict'
import { createRobloxRuntimeContext } from '../my-ui/src/runtime/roblox-runtime.ts'
import { parameterDeviceToViewportMode, resolveRobloxViewport } from '../my-ui/src/viewport/roblox-viewport.ts'

const runtime = createRobloxRuntimeContext()
runtime.reset({ Workspace: { CurrentCamera: { ViewportSize: { X: 390, Y: 844 } } }, GuiService: { GuiInset: { Min: { X: 0, Y: 44 }, Max: { X: 0, Y: 34 } } } })
assert.deepEqual(resolveRobloxViewport(runtime, 'Runtime', { X: 1, Y: 1 }).size, { X: 390, Y: 844 })
assert.deepEqual(resolveRobloxViewport(runtime, 'PhoneLandscape', { X: 1, Y: 1 }).size, { X: 844, Y: 390 })
assert.deepEqual(resolveRobloxViewport(runtime, 'Custom', { X: 1600, Y: 900 }).size, { X: 1600, Y: 900 })
assert.deepEqual(resolveRobloxViewport(runtime, 'Runtime', { X: 1, Y: 1 }).inset.Min, { X: 0, Y: 44 })
assert.equal(parameterDeviceToViewportMode('Mobile'), 'PhonePortrait')
assert.equal(parameterDeviceToViewportMode('Gamepad'), 'Desktop')
console.log('viewport checks passed')
