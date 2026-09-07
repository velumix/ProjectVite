# Roblox API metadata

Run the generator from the Vite project directory:

```powershell
cd my-ui
npm run generate:roblox-api
```

The generator:

1. Fetches `https://setup.rbxcdn.com/versionQTStudio`.
2. Fetches the matching `${version}-API-Dump.json`.
3. Caches both responses under the ignored root `.cache/roblox/` directory.
4. Resolves superclass inheritance for the prioritized UI classes.
5. Generates `my-ui/src/generated/roblox-api-metadata.ts`.

The generated registry includes class inheritance, effective properties, events, functions, callbacks, value types, parameters, return types, tags, security, thread safety, and serialization metadata. If rbxcdn is unavailable, generation falls back to the most recent local cache.

The browser does not fetch rbxcdn directly, so CORS cannot make the preview dependent on a live browser request. The generated TypeScript metadata is the build-time artifact used by the renderer and validator, while the raw API dump remains refreshable from the official endpoint.
