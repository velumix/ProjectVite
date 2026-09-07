import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { buildRobloxProject } from './build-roblox.mjs'

const first = await buildRobloxProject()
assert.equal(first.status, 'passed')
assert.ok(first.files.includes('UI/CompiledProject.rbxmx'))
assert.ok(first.files.includes('Services/InventoryService.luau'))
assert.ok(first.files.includes('Controllers/InventoryController.luau'))
assert.ok(first.files.includes('Network/manifest.json'))
await mkdir(new URL('../dist/roblox/Stale/', import.meta.url), { recursive: true })
await writeFile(new URL('../dist/roblox/Stale/old.luau', import.meta.url), 'stale')
const second = await buildRobloxProject()
assert.equal(second.status, 'passed')
await assert.rejects(readFile(new URL('../dist/roblox/Stale/old.luau', import.meta.url)))
const report = JSON.parse(await readFile(new URL('../dist/roblox/build-report.json', import.meta.url), 'utf8'))
assert.deepEqual(report.files, [...report.files].sort())
console.log('Roblox build checks passed')
