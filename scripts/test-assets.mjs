import assert from 'node:assert/strict'
import { createRobloxAssetResolver } from '../my-ui/src/assets/roblox-asset-resolver.ts'

const resolver = createRobloxAssetResolver()
const image = resolver.resolve('rbxassetid://123456789', 'thumbnail')
assert.equal(image.canonical, 'rbxassetid://123456789')
assert.match(image.url, /asset-thumbnail\/image\?assetId=123456789/)
assert.equal(resolver.resolve('rbxassetid://123456789', 'thumbnail'), image)
assert.equal(resolver.resolve('https://example.com/image.png').state, 'error')
assert.equal(resolver.resolveFontFamily('SourceSans'), 'SourceSans')
console.log('Roblox asset resolver checks passed')
