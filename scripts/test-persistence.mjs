import assert from 'node:assert/strict'
import { createRobloxPersistence } from '../my-ui/src/persistence/roblox-persistence.ts'

const persistence = createRobloxPersistence()
const store = persistence.DataStoreService.GetDataStore('PlayerData')
await store.SetAsync('1', { Money: 500 })
assert.deepEqual(await store.GetAsync('1'), { Money: 500 })
assert.deepEqual(await store.UpdateAsync('1', (value) => ({ ...value, Money: 450 })), { Money: 450 })
await store.RemoveAsync('1')
assert.equal(await store.GetAsync('1'), undefined)
const profile = await persistence.ProfileStore.LoadProfileAsync('player_1')
profile.Reconcile({ Money: 500, Inventory: [] })
assert.equal(profile.Money, 500)
assert.equal((await persistence.ProfileStore.LoadProfileAsync('player_1')), undefined)
await profile.Release()
assert.ok(await persistence.ProfileStore.LoadProfileAsync('player_1'))
console.log('Roblox persistence checks passed')
