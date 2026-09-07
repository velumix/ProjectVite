import assert from 'node:assert/strict'
import { promisify } from 'node:util'
import { execFile as execFileCallback } from 'node:child_process'
import { readFile } from 'node:fs/promises'

const execFile = promisify(execFileCallback)
const contract = JSON.parse(await readFile('../my-ui/src/nerve/project.contract.json', 'utf8'))
assert.equal(contract.Services[0].Name, 'InventoryService')
assert.equal(contract.Services[0].Methods.length, 2)
assert.equal(contract.Controllers[0].ServiceDependencies[0], 'InventoryService')

await execFile(process.execPath, ['../scripts/nerve-contract-codegen.mjs', 'generate', 'src/nerve/project.contract.json', '../.cache/nerve-generated'], { cwd: process.cwd() })
const generated = await readFile('../.cache/nerve-generated/InventoryService.luau', 'utf8')
assert.match(generated, /local InventoryService = Nerve\.CreateService/)
assert.match(generated, /function InventoryService\.Client:BuyItem/)

const luau = await readFile('../roblox/nerve/InventoryService.luau', 'utf8')
assert.match(luau, /Nerve\.CreateService/)
assert.match(luau, /Nerve\.Method/)
assert.match(luau, /Nerve\.Signal/)
assert.match(luau, /NerveInit/)
assert.match(luau, /NerveStart/)
console.log('Nerve codegen contract checks passed')
