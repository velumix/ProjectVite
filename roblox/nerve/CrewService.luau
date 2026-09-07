--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type CrewMember = {
	id: string,
	name: string,
	rank: string, -- "leader" | "officer" | "enforcer" | "recruit"
	online: boolean,
	lastActive: number,
}

type TurfZone = {
	id: string,
	name: string,
	controlPct: number,
	status: string, -- "secure" | "contested"
	incomePerHour: number,
	x: number,
	y: number,
}

type CrewBroadcast = {
	id: string,
	author: string,
	message: string,
	timestamp: number,
}

type CrewInfo = {
	crewId: string,
	name: string,
	tag: string,
	reputation: number,
	bankBalance: number,
	members: { CrewMember },
	turfs: { TurfZone },
	broadcasts: { CrewBroadcast },
}

local defaultCrew: CrewInfo = {
	crewId = "crew-syndicate",
	name = "Midnight Syndicate",
	tag = "[SYND]",
	reputation = 4850,
	bankBalance = 145200,
	members = {
		{ id = "mem-1", name = "Alex Mercer", rank = "leader", online = true, lastActive = os.time() },
		{ id = "mem-2", name = "Dante Vance", rank = "officer", online = true, lastActive = os.time() - 300 },
		{ id = "mem-3", name = "Elena Rostova", rank = "enforcer", online = true, lastActive = os.time() - 900 },
		{ id = "mem-4", name = "Marcus Kane", rank = "recruit", online = false, lastActive = os.time() - 86400 },
	},
	turfs = {
		{ id = "turf-1", name = "Cypress Flats Industrial", controlPct = 85, status = "secure", incomePerHour = 2400, x = 850, y = -1900 },
		{ id = "turf-2", name = "Rancho Rail Yards", controlPct = 62, status = "contested", incomePerHour = 1800, x = 420, y = -1550 },
		{ id = "turf-3", name = "Strawberry Hub", controlPct = 94, status = "secure", incomePerHour = 3100, x = 120, y = -1200 },
	},
	broadcasts = {
		{ id = "bc-1", author = "Dante Vance", message = "Convoy arriving at Cypress Flats at 22:00. Need 2 escorts.", timestamp = os.time() - 1800 },
	},
}

local CrewService = {
	Name = "CrewService",
}

function CrewService:GetCrew(player: Player)
	return defaultCrew
end

function CrewService:DepositBank(player: Player, payload: { amount: number })
	if payload.amount <= 0 then return false, "Deposit amount must be positive" end
	defaultCrew.bankBalance += payload.amount
	Nerve.FireAllClients("CrewService", "CrewBankUpdated", defaultCrew.bankBalance)
	return true, nil, defaultCrew.bankBalance
end

function CrewService:PromoteMember(player: Player, payload: { memberId: string, newRank: string })
	for _, m in ipairs(defaultCrew.members) do
		if m.id == payload.memberId then
			m.rank = payload.newRank
			return true, nil
		end
	end
	return false, "Member not found"
end

function CrewService:BroadcastAlert(player: Player, payload: { message: string })
	if not payload.message or #payload.message == 0 then return false, "Message cannot be empty", nil end
	local bc: CrewBroadcast = {
		id = "bc-" .. tostring(os.time()),
		author = player.Name or "Alex Mercer",
		message = payload.message,
		timestamp = os.time(),
	}
	table.insert(defaultCrew.broadcasts, 1, bc)
	Nerve.FireAllClients("CrewService", "CrewBroadcastSent", bc)
	return true, nil, bc
end

function CrewService:NerveInit()
end

function CrewService:NerveStart()
end

return CrewService
