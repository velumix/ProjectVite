--!strict

local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

Nerve.AddControllers(script.Parent.Controllers)
Nerve.Start():catch(warn)
