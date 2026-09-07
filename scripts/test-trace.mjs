import assert from 'node:assert/strict'
import { createScenarioTrace, expectMethod, expectProfile, expectSignal, expectState } from '../my-ui/src/scenarios/scenario-trace.ts'

const trace = createScenarioTrace()
trace.record('signal', 'InventoryChanged', 100)
trace.record('method', 'BuyItem', 120, { Success: true })
const context = { state: { Player: { Money: 400 } }, trace, persistence: { snapshot: () => ({ '123': { Money: 400, Inventory: ['Bat'] } }) } }
expectState('Player.Money', 400, 100).check(context)
expectSignal('InventoryChanged', 100).check(context)
expectMethod('BuyItem', 120).toSucceed().check(context)
expectProfile('123', 120).toContain({ Money: 400, Inventory: ['Bat'] }).check(context)
assert.equal(trace.events().length, 2)
console.log('scenario trace tests passed')
