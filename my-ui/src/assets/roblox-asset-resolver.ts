export type RobloxAssetState = 'loading' | 'ready' | 'error'

export type RobloxAssetRecord = {
  canonical: string
  url?: string
  state: RobloxAssetState
  error?: string
}

export type RobloxAssetResolver = {
  resolve(reference: string, kind?: 'image' | 'thumbnail' | 'font'): RobloxAssetRecord
  load(reference: string, kind?: 'image' | 'thumbnail' | 'font'): Promise<RobloxAssetRecord>
  resolveFontFamily(family: string): string
  clear(): void
}

const ASSET_PATTERN = /^rbxassetid:\/\/(\d+)$/i

export function createRobloxAssetResolver(): RobloxAssetResolver {
  const cache = new Map<string, RobloxAssetRecord>()
  const fontPromises = new Map<string, Promise<RobloxAssetRecord>>()
  return {
    resolve(reference, kind = 'image') {
      const key = `${kind}:${reference}`
      const cached = cache.get(key)
      if (cached) return cached
      const match = ASSET_PATTERN.exec(reference)
      if (!match) {
        const record = { canonical: reference, state: 'error' as const, error: 'Unsupported Roblox asset reference' }
        cache.set(key, record)
        return record
      }
      const id = match[1]
      const url = kind === 'thumbnail'
        ? `https://www.roblox.com/asset-thumbnail/image?assetId=${id}&width=420&height=420&format=png`
        : `https://assetdelivery.roblox.com/v1/asset/?id=${id}`
      const record = { canonical: reference, url, state: 'loading' as const }
      cache.set(key, record)
      return record
    },
    async load(reference, kind = 'image') {
      const record = this.resolve(reference, kind)
      if (record.state === 'error' || !record.url) return record
      return record
    },
    resolveFontFamily(family) {
      const match = ASSET_PATTERN.exec(family)
      if (!match) return family.split('/').pop()?.replace(/\.json$/i, '') ?? family
      const fontName = `RobloxFont_${match[1]}`
      if (!fontPromises.has(family) && typeof FontFace !== 'undefined' && typeof document !== 'undefined') {
        const promise = new FontFace(fontName, `url(${this.resolve(family, 'font').url ?? ''})`).load().then((font) => {
          document.fonts.add(font)
          return { canonical: family, state: 'ready' as const, url: fontName }
        }).catch((error: unknown) => ({ canonical: family, state: 'error' as const, error: String(error) }))
        fontPromises.set(family, promise)
      }
      return fontName
    },
    clear() {
      cache.clear()
      fontPromises.clear()
    },
  }
}
