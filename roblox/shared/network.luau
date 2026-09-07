-- Canonical network message names and payload contracts.

export type BuyItemRequest = {
	ItemId: string,
}

export type BuyItemResponse = {
	Success: boolean,
	Reason: string?,
	RemainingMoney: number?,
}

export type GetInventoryRequest = {}

export type InventoryItem = {
	ItemId: string,
	Quantity: number,
}

export type GetInventoryResponse = {
	Items: { InventoryItem },
}

export type EquipItemRequest = {
	ItemId: string,
}

local Network = {
	BuyItem = {
		Name = "BuyItem",
		Kind = "RequestResponse",
		Request = "BuyItemRequest",
		Response = "BuyItemResponse",
		Direction = "ClientToServer",
	},
	GetInventory = {
		Name = "GetInventory",
		Kind = "RequestResponse",
		Request = "GetInventoryRequest",
		Response = "GetInventoryResponse",
		Direction = "ClientToServer",
	},
	EquipItem = {
		Name = "EquipItem",
		Kind = "OneWay",
		Payload = "EquipItemRequest",
		Direction = "ClientToServer",
	},
	MoneyChanged = {
		Name = "MoneyChanged",
		Kind = "Event",
		Payload = "MoneyChangedPayload",
		Direction = "ServerToClient",
	},
	InventoryChanged = {
		Name = "InventoryChanged",
		Kind = "Event",
		Payload = "InventoryChangedPayload",
		Direction = "ServerToClient",
	},
}

return Network
