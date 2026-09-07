import assert from 'node:assert/strict'
import { createRobloxRuntimeContext } from '../my-ui/src/runtime/roblox-runtime.ts'

const runtime = createRobloxRuntimeContext()
runtime.reset({ Workspace: { CurrentCamera: { ViewportSize: { X: 390, Y: 844 } } }, UserInputService: { TouchEnabled: true, MouseEnabled: false, PreferredInput: 'Touch' }, CollectionService: { Tags: { Interactable: ['ShopTerminal'] } } })
assert.equal(runtime.Workspace.CurrentCamera.ViewportSize.X, 390)
assert.equal(runtime.UserInputService.PreferredInput, 'Touch')
assert.deepEqual(runtime.CollectionService.GetTagged('Interactable'), ['ShopTerminal'])
runtime.CollectionService.AddTag('EMSBeacon', 'Interactable')
assert.equal(runtime.CollectionService.HasTag('EMSBeacon', 'Interactable'), true)
runtime.setTime(1250)
assert.equal(runtime.RunService.GetTime(), 1.25)
runtime.reset()
assert.equal(runtime.Workspace.CurrentCamera.ViewportSize.X, 1280)
console.log('Roblox runtime context checks passed')
