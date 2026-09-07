# ProjectVite Studio sync

1. Start the local bridge from `my-ui`:

   ```powershell
   npm run studio:bridge
   ```

2. Install or run `ProjectViteSync.plugin.luau` as a Studio plugin and enable
   HTTP requests for Studio plugins.
3. Call `createStudioSyncClient().push(...)` from the Vite side with the
   rendered tree, Nerve manifest, and generated Luau artifacts.

The bridge stores the latest manual bundle at `/v1/updates`. Studio polls that
endpoint and applies only incremental operations. Every managed instance is
marked with the `ProjectViteManaged` attribute and tag, its deterministic path,
and its content hash. The plugin refuses to reuse an unmarked root or module.

The protocol is intentionally manual push first. Live file watching and
automatic pushes can be added on top of the same versioned protocol later.
