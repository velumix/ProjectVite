import assert from 'node:assert/strict'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { deflateSync, inflateSync } from 'node:zlib'
import { compileRobloxProject } from '../my-ui/src/features/project-compiler.ts'
import { PreviewFeature } from '../my-ui/src/features/preview-feature.ts'
import { ShopFeature } from '../my-ui/src/features/shop-feature.ts'
import { createEffectPlayer, applyEffectPatches } from '../my-ui/src/effects/roblox-effects.ts'
import { applyBindings, createReactiveBindingStore } from '../my-ui/src/bindings/reactive-bindings.ts'
import { nervePreview } from '../my-ui/src/nerve/preview.ts'
import { previewNetworkAdapter } from '../my-ui/src/renderer/preview-network.ts'
import { createRobloxPersistence } from '../my-ui/src/persistence/roblox-persistence.ts'
import { createRobloxRealm } from '../my-ui/src/realm/roblox-realm.ts'
import { createRobloxRuntimeContext } from '../my-ui/src/runtime/roblox-runtime.ts'
import { createScenarioRunner } from '../my-ui/src/scenarios/scenario-runner.ts'
import { renderVisualSnapshot } from '../my-ui/src/visual/roblox-visual-snapshot.ts'

globalThis.window = { setInterval: () => 1, clearInterval: () => {} }
const root = new URL('../', import.meta.url)
const config = JSON.parse(await readFile(new URL('visual/snapshots.json', root), 'utf8'))
const update = process.argv.includes('--update')
const project = compileRobloxProject([PreviewFeature, ShopFeature])
const baselines = new URL('visual/baselines/', root)
const diffs = new URL('visual/diffs/', root)
await mkdir(baselines, { recursive: true }); await mkdir(diffs, { recursive: true })
let failures = 0

for (const definition of config) {
  const bindings = createReactiveBindingStore()
  const runtime = createRobloxRuntimeContext()
  const persistence = createRobloxPersistence()
  const effectPlayer = createEffectPlayer(project.Tree, project.Effects)
  const runner = createScenarioRunner({ nerve: nervePreview, network: previewNetworkAdapter, effects: effectPlayer, bindings, runtime, persistence, realm: createRobloxRealm(persistence) })
  const scenario = project.Scenarios.find((candidate) => candidate.id === definition.scenarioId)
  assert(scenario, `Unknown scenario: ${definition.scenarioId}`)
  runner.start(scenario)
  for (const [name, value] of Object.entries(definition.parameters ?? {})) runner.setParameter(name, value)
  runner.scrub(definition.timeMs)
  const tree = applyEffectPatches(applyBindings(project.Tree, bindings), effectPlayer.getPatches())
  const image = renderVisualSnapshot(tree, runtime, definition.viewport, definition.customResolution)
  const fileName = `${definition.name}.png`
  const baselinePath = new URL(fileName, baselines)
  const diffPath = new URL(fileName, diffs)
  if (update) { await writeFile(baselinePath, encodePng(image.width, image.height, image.pixels)); console.log(`updated ${fileName}`); runner.stop(); continue }
  try {
    const baseline = decodePng(await readFile(baselinePath))
    const result = compare(image, baseline, definition.tolerance ?? 0)
    if (!result.pass) { await writeFile(diffPath, encodePng(image.width, image.height, result.diff)); throw new Error(`${result.differentPixels} pixels differ; diff written to ${diffPath.pathname}`) }
    console.log(`passed ${fileName}`)
  } catch (error) { failures += 1; console.error(`failed ${fileName}: ${error instanceof Error ? error.message : String(error)}`) }
  runner.stop()
}
if (failures) process.exitCode = 1

function compare(actual, expected, tolerance) {
  if (actual.width !== expected.width || actual.height !== expected.height) return { pass: false, differentPixels: actual.width * actual.height, diff: actual.pixels }
  const diff = new Uint8Array(actual.pixels.length); let differentPixels = 0
  for (let index = 0; index < actual.pixels.length; index += 4) {
    const different = Math.abs(actual.pixels[index] - expected.pixels[index]) > tolerance || Math.abs(actual.pixels[index + 1] - expected.pixels[index + 1]) > tolerance || Math.abs(actual.pixels[index + 2] - expected.pixels[index + 2]) > tolerance
    if (different) { differentPixels += 1; diff[index] = 255; diff[index + 1] = 32; diff[index + 2] = 32; diff[index + 3] = 255 }
  }
  return { pass: differentPixels === 0, differentPixels, diff }
}

function encodePng(width, height, pixels) {
  const scanlines = Buffer.alloc((width * 4 + 1) * height)
  for (let row = 0; row < height; row++) { scanlines[row * (width * 4 + 1)] = 0; Buffer.from(pixels.buffer, pixels.byteOffset + row * width * 4, width * 4).copy(scanlines, row * (width * 4 + 1) + 1) }
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([signature, chunk('IHDR', Buffer.from([width >> 24, width >> 16, width >> 8, width, height >> 24, height >> 16, height >> 8, height, 8, 6, 0, 0, 0])), chunk('IDAT', deflateSync(scanlines)), chunk('IEND', Buffer.alloc(0))])
}

function decodePng(buffer) {
  let offset = 8; let width = 0; let height = 0; const data = []
  while (offset < buffer.length) { const length = buffer.readUInt32BE(offset); const type = buffer.toString('ascii', offset + 4, offset + 8); const body = buffer.subarray(offset + 8, offset + 8 + length); if (type === 'IHDR') { width = body.readUInt32BE(0); height = body.readUInt32BE(4) } if (type === 'IDAT') data.push(body); offset += length + 12 }
  const raw = inflateSync(Buffer.concat(data)); const stride = width * 4; const pixels = new Uint8Array(width * height * 4); let source = 0
  for (let row = 0; row < height; row++) { const filter = raw[source++]; for (let column = 0; column < stride; column++) { const left = column >= 4 ? pixels[row * stride + column - 4] : 0; const up = row ? pixels[(row - 1) * stride + column] : 0; const upperLeft = row && column >= 4 ? pixels[(row - 1) * stride + column - 4] : 0; const value = raw[source++]; pixels[row * stride + column] = filter === 1 ? value + left : filter === 2 ? value + up : filter === 3 ? value + Math.floor((left + up) / 2) : filter === 4 ? value + paeth(left, up, upperLeft) : value } }
  return { width, height, pixels }
}
function paeth(a, b, c) { const p = a + b - c; const pa = Math.abs(p - a); const pb = Math.abs(p - b); const pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c }
function chunk(type, data) { const header = Buffer.from(type); const body = Buffer.concat([header, data]); const output = Buffer.alloc(12 + data.length); output.writeUInt32BE(data.length, 0); body.copy(output, 4); output.writeUInt32BE(crc32(body), 8 + data.length); return output }
function crc32(buffer) { let crc = 0xffffffff; for (const value of buffer) { crc ^= value; for (let bit = 0; bit < 8; bit++) crc = crc & 1 ? 0xedb88320 ^ (crc >>> 1) : crc >>> 1 } return (crc ^ 0xffffffff) >>> 0 }
