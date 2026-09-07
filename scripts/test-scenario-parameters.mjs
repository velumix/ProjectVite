import assert from 'node:assert/strict'
import { createReactiveBindingStore } from '../my-ui/src/bindings/reactive-bindings.ts'
import { createEffectPlayer } from '../my-ui/src/effects/roblox-effects.ts'
import { createRobloxPersistence } from '../my-ui/src/persistence/roblox-persistence.ts'
import { createRobloxRealm } from '../my-ui/src/realm/roblox-realm.ts'
import { createRobloxRuntimeContext } from '../my-ui/src/runtime/roblox-runtime.ts'
import { createScenarioRunner, number } from '../my-ui/src/scenarios/scenario-runner.ts'
import { previewNetworkAdapter } from '../my-ui/src/renderer/preview-network.ts'
import { nervePreview } from '../my-ui/src/nerve/preview.ts'

globalThis.window = { setInterval: () => 1, clearInterval: () => {} }
const tree = { ClassName: 'ScreenGui', Name: 'Preview', Children: [] }
const bindings = createReactiveBindingStore()
const persistence = createRobloxPersistence()
const runner = createScenarioRunner({ nerve: nervePreview, network: previewNetworkAdapter, effects: createEffectPlayer(tree, {}), bindings, runtime: createRobloxRuntimeContext(), persistence, realm: createRobloxRealm(persistence) })
let observed
const scenario = { id: 'parameters', name: 'Parameters', initialState: {}, parameters: { Money: number(500, { min: 0, max: 1000, step: 50 }) }, configure: (context) => { observed = context.parameters.Money }, steps: [] }
runner.start(scenario)
assert.equal(observed, 500)
runner.setParameter('Money', 750)
assert.equal(observed, 750)
assert.equal(runner.getParameters().Money, 750)
runner.stop()
console.log('scenario parameter checks passed')
