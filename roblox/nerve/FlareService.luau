--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type FlareProfile = {
	id: string,
	name: string,
	age: number,
	bio: string,
	distanceKm: number,
	interests: { string },
	isMatch: boolean,
}

type FlareMessage = {
	id: string,
	matchId: string,
	sender: string,
	text: string,
	timestamp: number,
}

local initialProfiles: { FlareProfile } = {
	{
		id = "flare-1",
		name = "Valentina Ross",
		age = 24,
		bio = "Architecture student & cafe hopper. Looking for someone to explore Vinewood Hills with.",
		distanceKm = 2.4,
		interests = { "Coffee", "Architecture", "Sunset Drives" },
		isMatch = false,
	},
	{
		id = "flare-2",
		name = "Sierra Quinn",
		age = 26,
		bio = "Helicopter pilot and skydiving enthusiast. Swipe right if you don't get dizzy easily.",
		distanceKm = 4.8,
		interests = { "Aviation", "Adrenaline", "Fitness" },
		isMatch = false,
	},
	{
		id = "flare-3",
		name = "Camila Cruz",
		age = 23,
		bio = "DJ & synthwave producer. Playing Del Perro Pier this weekend. Let's catch a set!",
		distanceKm = 1.2,
		interests = { "Electronic Music", "Beach", "Nightlife" },
		isMatch = true,
	},
}

local initialMessages: { FlareMessage } = {
	{
		id = "msg-1",
		matchId = "flare-3",
		sender = "Camila Cruz",
		text = "Hey Alex! Loved your profile. You going to the beach festival tomorrow?",
		timestamp = os.time() - 3600,
	},
}

local FlareService = {
	Name = "FlareService",
}

function FlareService:GetProfiles(player: Player)
	return initialProfiles
end

function FlareService:SwipeProfile(player: Player, payload: { profileId: string, direction: string })
	for _, p in ipairs(initialProfiles) do
		if p.id == payload.profileId then
			if payload.direction == "like" then
				p.isMatch = true
				Nerve.FireClient(player, "FlareService", "NewMatch", p)
				return true, nil, true
			else
				return true, nil, false
			end
		end
	end
	return false, "Profile not found", false
end

function FlareService:GetMessages(player: Player, payload: { matchId: string })
	local result: { FlareMessage } = {}
	for _, m in ipairs(initialMessages) do
		if m.matchId == payload.matchId then
			table.insert(result, m)
		end
	end
	return result
end

function FlareService:SendMessage(player: Player, payload: { matchId: string, text: string })
	if not payload.text or #payload.text == 0 then return false, "Text required", nil end
	local msg: FlareMessage = {
		id = "msg-" .. tostring(os.time()),
		matchId = payload.matchId,
		sender = player.Name or "Alex Mercer",
		text = payload.text,
		timestamp = os.time(),
	}
	table.insert(initialMessages, msg)
	Nerve.FireAllClients("FlareService", "NewFlareMessage", msg)
	return true, nil, msg
end

function FlareService:NerveInit()
end

function FlareService:NerveStart()
end

return FlareService
