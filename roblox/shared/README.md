# Shared Roblox UI contracts

Roblox/Luau is the source of truth for signal and network names, directions, and payload contracts:

- `signals.luau` preserves the payload types for server-to-client events.
- `network.luau` defines request/response messages, one-way messages, and server-to-client events.
- `adapter.luau` exposes the transport-neutral Roblox API.

The intended logical API is the same on both sides:

```luau
local connection = Api.Network.MoneyChanged.connect(function(payload)
	print(payload.Amount)
end)

local result = Api.Network.BuyItem.send({ ItemId = "Bat" })
local inventory = Api.Network.GetInventory.request({})
Api.Network.EquipItem.send({ ItemId = "Bat" })
```

Implement `Transport` with the existing networking layer later. Nerve, ByteNet, and RemoteEvents can each provide `Send`, `Request`, and `Connect` without changing UI code or the shared contracts.

The Vite adapter mirrors this API in `my-ui/src/shared/browser-adapter.ts` and uses local signals plus mock handlers for preview.
