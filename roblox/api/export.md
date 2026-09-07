# Roblox Luau export

`my-ui/src/renderer/roblox-luau-export.ts` converts the same JSON instance tree used by the Vite renderer into a deterministic Luau ModuleScript shape.

The output uses:

- `Instance.new("ClassName")`
- Roblox property assignments with the original property names
- `UDim.new`, `UDim2.new`, `Color3.new`, and `Vector2.new`
- `Enum.*` values selected from the Roblox property name
- `Font.new` for `FontFace`
- `ColorSequence` and `NumberSequence` keypoints
- Recursive child creation and explicit `.Parent` assignments

Networking and event handlers are intentionally excluded. `normalizeRobloxInstanceTree` provides a deterministic structural comparison target for a future Luau parser or Studio round-trip test.
