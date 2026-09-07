--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")
local Nerve = require(ReplicatedStorage.Nerve)

Nerve.AddServices(ServerScriptService.Services)
Nerve.Start():catch(warn)
