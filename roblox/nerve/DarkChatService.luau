--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type DarkMessage = {
	id: string,
	channelId: string,
	senderBurner: string,
	body: string,
	timestamp: number,
	isSelf: boolean,
}

type DarkChannel = {
	id: string,
	name: string,
	topic: string,
	memberCount: number,
	hasPasscode: boolean,
	passcode: string?,
}

local INITIAL_CHANNELS: { DarkChannel } = {
	{
		id = "chan-drop",
		name = "ghost-drop",
		topic = "Anonymous dead drop coordination. 256-bit ephemeral.",
		memberCount = 14,
		hasPasscode = false,
	},
	{
		id = "chan-market",
		name = "night-market",
		topic = "Unregulated goods, clean crypto swaps & hardware.",
		memberCount = 28,
		hasPasscode = true,
		passcode = "7701",
	},
	{
		id = "chan-intel",
		name = "zero-trace",
		topic = "Surveillance scans, scanner frequencies & wiretaps.",
		memberCount = 9,
		hasPasscode = false,
	},
}

local channelMessages: { [string]: { DarkMessage } } = {
	["chan-drop"] = {
		{
			id = "msg-1",
			channelId = "chan-drop",
			senderBurner = "Phantom_X",
			body = "Drop package secured at North Docks container 44B.",
			timestamp = os.time() - 600,
			isSelf = false,
		},
		{
			id = "msg-2",
			channelId = "chan-drop",
			senderBurner = "ZeroK",
			body = "Confirming visual. Area is clear of state troopers.",
			timestamp = os.time() - 300,
			isSelf = false,
		},
	},
	["chan-market"] = {
		{
			id = "msg-3",
			channelId = "chan-market",
			senderBurner = "SilkBroker",
			body = "Bulk thermal drill kits available. Inquire via burner PGP.",
			timestamp = os.time() - 1200,
			isSelf = false,
		},
	},
	["chan-intel"] = {
		{
			id = "msg-4",
			channelId = "chan-intel",
			senderBurner = "ByteWraith",
			body = "State Police TAC-1 patched through to 154.400 MHz.",
			timestamp = os.time() - 1800,
			isSelf = false,
		},
	},
}

local DarkChatService = {
	Name = "DarkChatService",
}

function DarkChatService:GetChannels(player: Player)
	local list: { DarkChannel } = {}
	for _, c in ipairs(INITIAL_CHANNELS) do
		table.insert(list, {
			id = c.id,
			name = c.name,
			topic = c.topic,
			memberCount = c.memberCount,
			hasPasscode = c.hasPasscode,
		})
	end
	return list
end

function DarkChatService:GetMessages(player: Player, payload: { channelId: string, passcode: string? })
	local targetChan: DarkChannel? = nil
	for _, c in ipairs(INITIAL_CHANNELS) do
		if c.id == payload.channelId then
			targetChan = c
			break
		end
	end
	if not targetChan then return false, "Channel not found", {} end
	if targetChan.hasPasscode and targetChan.passcode ~= payload.passcode then
		return false, "Incorrect channel passcode", {}
	end

	local msgs = channelMessages[payload.channelId] or {}
	return true, nil, msgs
end

function DarkChatService:SendMessage(player: Player, payload: { channelId: string, body: string, burnerName: string })
	if not payload.body or #payload.body == 0 then return false, "Message body cannot be empty" end

	local msg: DarkMessage = {
		id = "msg-" .. tostring(os.time()) .. "-" .. tostring(math.random(10, 99)),
		channelId = payload.channelId,
		senderBurner = payload.burnerName or "Anonymous",
		body = payload.body,
		timestamp = os.time(),
		isSelf = true,
	}

	if not channelMessages[payload.channelId] then
		channelMessages[payload.channelId] = {}
	end
	table.insert(channelMessages[payload.channelId], msg)

	Nerve.FireAllClients("DarkChatService", "DarkMessageReceived", msg)
	return true, nil, msg
end

function DarkChatService:NerveInit()
end

function DarkChatService:NerveStart()
end

return DarkChatService
