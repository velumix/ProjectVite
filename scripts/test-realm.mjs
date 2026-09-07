import assert from 'node:assert/strict'
import { createRobloxRealm } from '../my-ui/src/realm/roblox-realm.ts'
import { createRobloxPersistence } from '../my-ui/src/persistence/roblox-persistence.ts'

const realm = createRobloxRealm(createRobloxPersistence())
const one = realm.connectPlayer({ Name: 'One', UserId: 1 })
const two = realm.connectPlayer({ Name: 'Two', UserId: 2 })
const calls = []
realm.Server.registerMethod('InventoryService', 'BuyItem', (player, payload) => { calls.push([player.Name, payload]); return { Success: true } })
assert.deepEqual(await one.request('InventoryService', 'BuyItem', { ItemId: 'Bat' }), { Success: true })
assert.deepEqual(calls, [['One', { ItemId: 'Bat' }]])
let received = 0
one.connect('WorldService', 'Changed', () => { received += 1 })
two.connect('WorldService', 'Changed', () => { received += 1 })
realm.Server.FireExcept('WorldService', 'Changed', one.LocalPlayer, { Id: 1 })
assert.equal(received, 1)
realm.disconnectPlayer(2)
assert.equal(realm.Server.Players.GetPlayers().length, 1)
console.log('Roblox realm checks passed')
