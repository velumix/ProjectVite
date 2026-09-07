-- Canonical signal names and payload contracts shared by Roblox and UI code.

export type MoneyChangedPayload = {
	Amount: number,
}

export type InventoryChangedPayload = {
	ItemId: string,
	Quantity: number,
}

local Signals = {
	MoneyChanged = {
	Name = "MoneyChanged",
	Payload = "MoneyChangedPayload",
	Direction = "ServerToClient",
	},
	InventoryChanged = {
		Name = "InventoryChanged",
		Payload = "InventoryChangedPayload",
		Direction = "ServerToClient",
	},
}

return Signals
