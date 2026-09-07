import assert from 'node:assert/strict'
import { previewScenarios } from '../my-ui/src/scenarios/examples.ts'

assert.deepEqual(previewScenarios.find((scenario) => scenario.id === 'join-rich').steps.map((step) => step.afterMs), [100, 250])
assert.equal(previewScenarios.find((scenario) => scenario.id === 'join-rich').triggers[0].id, 'money-now')
assert.equal(new Set(previewScenarios.map((scenario) => scenario.id)).size, previewScenarios.length)
console.log('Scenario playback definition checks passed')
