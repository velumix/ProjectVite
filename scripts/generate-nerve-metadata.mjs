import { readFile, writeFile } from 'node:fs/promises'

const inputPath = process.argv[2]
const outputPath = process.argv[3]
if (!inputPath || !outputPath) throw new Error('Usage: node generate-nerve-metadata.mjs <NerveManifest.json> <output.ts>')

const manifest = JSON.parse(await readFile(inputPath, 'utf8'))
if (!manifest || typeof manifest.version !== 'number' || !manifest.services) {
  throw new Error('Input is not a Nerve manifest')
}

const source = `// Generated from NerveManifest. Do not edit by hand.\nimport type { NerveNetworkManifest } from '../nerve/manifest.ts'\n\nexport const nerveManifest = ${JSON.stringify(manifest, null, 2)} as const satisfies NerveNetworkManifest\n`
await writeFile(outputPath, source)
