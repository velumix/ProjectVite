-- Transport-neutral Roblox adapter.
-- Connect this to Nerve, ByteNet, RemoteEvents, or RemoteFunctions by
-- implementing the Transport methods below.

export type Connection = {
	Disconnect: (self: Connection) -> (),
}

export type Transport = {
	Send: (self: Transport, messageName: string, payload: unknown) -> (),
	Request: (self: Transport, messageName: string, payload: unknown) -> unknown,
	Connect: (self: Transport, signalName: string, callback: (payload: unknown) -> ()) -> Connection,
}

local function createSignal(transport: Transport, signalName: string)
	return {
		connect = function(callback: (payload: unknown) -> ()): Connection
			return transport:Connect(signalName, callback)
		end,
	}
end

local function createNetworkMessage(transport: Transport, messageName: string)
	return {
		send = function(payload: unknown): unknown
			return transport:Request(messageName, payload)
		end,
	}
end

local function createOneWayMessage(transport: Transport, messageName: string)
	return {
		send = function(payload: unknown)
			transport:Send(messageName, payload)
		end,
	}
end

export type RobloxUiApi = {
	Signals: {
		MoneyChanged: { connect: (callback: (payload: unknown) -> ()) -> Connection },
		InventoryChanged: { connect: (callback: (payload: unknown) -> ()) -> Connection },
	},
	Network: {
		BuyItem: { send: (payload: unknown) -> unknown },
		GetInventory: { request: (payload: unknown) -> unknown },
		EquipItem: { send: (payload: unknown) -> () },
		MoneyChanged: { connect: (callback: (payload: unknown) -> ()) -> Connection },
		InventoryChanged: { connect: (callback: (payload: unknown) -> ()) -> Connection },
	},
}

local function createAdapter(transport: Transport): RobloxUiApi
	return {
		Signals = {
			MoneyChanged = createSignal(transport, "MoneyChanged"),
			InventoryChanged = createSignal(transport, "InventoryChanged"),
		},
		Network = {
			BuyItem = createNetworkMessage(transport, "BuyItem"),
			GetInventory = {
				request = function(payload: unknown): unknown
					return transport:Request("GetInventory", payload)
				end,
			},
			EquipItem = createOneWayMessage(transport, "EquipItem"),
			MoneyChanged = createSignal(transport, "MoneyChanged"),
			InventoryChanged = createSignal(transport, "InventoryChanged"),
		},
	}
end

return {
	createAdapter = createAdapter,
}
