--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

local SettingsController = Nerve.CreateController({
	Name = "SettingsController",
})

function SettingsController:NerveInit()
	self.SettingsService = Nerve.GetService("SettingsService")
end

function SettingsController:NerveStart()
	-- The client requests the initial snapshot and listens to SettingsChanged.
end

return SettingsController
