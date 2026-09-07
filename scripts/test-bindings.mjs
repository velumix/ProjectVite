import assert from 'node:assert/strict'
import { bind, computed, createReactiveBindingStore } from '../my-ui/src/bindings/reactive-bindings.ts'

const store = createReactiveBindingStore({ Player: { Money: 500 } })
let changes = 0
const disconnect = store.subscribePath('Player.Money', (value) => { changes += value === 450 ? 1 : 0 })
store.set('Player.Money', 450)
assert.equal(store.get('Player.Money'), 450)
assert.equal(changes, 1)
assert.equal(store.getState().Player.Money, 450)
assert.equal(bind('Player.Money').Path, 'Player.Money')
assert.equal(computed(['Player.Money'], (state) => state.Player).Dependencies[0], 'Player.Money')
disconnect()
store.reset({ Player: { Money: 500 } })
assert.equal(store.get('Player.Money'), 500)
console.log('Reactive binding checks passed')
