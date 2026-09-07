import assert from 'node:assert/strict'
import { previewScenarios } from '../my-ui/src/scenarios/examples.ts'

assert.equal(previewScenarios.length, 11)
assert.ok(previewScenarios.every((scenario) => scenario.id && scenario.name && Array.isArray(scenario.steps)))
assert.equal(previewScenarios.find((scenario) => scenario.id === 'join-rich').initialState.Player.Money, 500)
assert.equal(previewScenarios.find((scenario) => scenario.id === 'ems-call').steps.length, 2)
console.log('Scenario definition checks passed')
