--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

local PhoneController = Nerve.CreateController({Name = "PhoneController"})

function PhoneController:NerveInit()
	self.PhoneService = Nerve.GetService("PhoneService")
end

function PhoneController:NerveStart() end

return PhoneController
