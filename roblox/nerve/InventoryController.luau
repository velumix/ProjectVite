--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

local InventoryController = Nerve.CreateController({
	Name = "InventoryController",
})

function InventoryController:NerveInit()
	-- Controllers may resolve services after Nerve has initialized them.
end

function InventoryController:NerveStart()
	local InventoryService = Nerve.GetService("InventoryService")
	InventoryService.MoneyChanged:Connect(function(amount: number)
		print(`Money changed: {amount}`)
	end)
end

return InventoryController
