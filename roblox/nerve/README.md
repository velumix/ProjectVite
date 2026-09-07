# Nerve bridge

The Luau modules in this directory are the canonical runtime contracts. They
use the installed Nerve package directly (`CreateService`, `CreateController`,
`Schema`, `Method`, `Signal`, `Start`, and `GetService`).

Nerve publishes the runtime network manifest as the `ReplicatedStorage`
`StringValue` named `NerveManifest`. The Vite adapter consumes that JSON shape;
the generator script can turn a captured manifest into checked TypeScript
metadata:

```powershell
node scripts/generate-nerve-metadata.mjs NerveManifest.json my-ui/src/generated/nerve-manifest.ts
```

The browser implementation is a preview proxy. It supplies local handlers and
signals while leaving the Roblox transport and ByteNet packet generation to
Nerve itself.
