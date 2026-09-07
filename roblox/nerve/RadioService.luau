--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type RadioPreset = {
	name: string,
	freq: number,
}

type RadioState = {
	connected: boolean,
	frequency: number,
	volume: number,
	micMuted: boolean,
	isTalking: boolean,
	channelMembers: { string },
	activeSpeakers: { string },
	presets: { RadioPreset },
}

local initialRadioState: RadioState = {
	connected = true,
	frequency = 101.5,
	volume = 75,
	micMuted = false,
	isTalking = false,
	channelMembers = { "Alex Mercer", "Marcus Vance", "Officer Davis" },
	activeSpeakers = { "Officer Davis" },
	presets = {
		{ name = "Dispatch 1", freq = 1.0 },
		{ name = "Tactical TAC-2", freq = 2.5 },
		{ name = "EMS / Fire", freq = 9.0 },
		{ name = "Los Santos FM", freq = 101.5 },
		{ name = "Radio Mirror Park", freq = 88.3 },
	},
}

local RadioService = {
	Name = "RadioService",
}

function RadioService:GetRadioState(player: Player)
	return initialRadioState
end

function RadioService:ConnectFrequency(player: Player, payload: { frequency: number })
	initialRadioState.connected = true
	initialRadioState.frequency = payload.frequency
	Nerve.FireAllClients("RadioService", "RadioStateChanged", initialRadioState)
	return true, nil, initialRadioState
end

function RadioService:DisconnectRadio(player: Player)
	initialRadioState.connected = false
	initialRadioState.isTalking = false
	initialRadioState.activeSpeakers = {}
	Nerve.FireAllClients("RadioService", "RadioStateChanged", initialRadioState)
	return true, nil, initialRadioState
end

function RadioService:SetVolume(player: Player, payload: { volume: number })
	initialRadioState.volume = math.clamp(payload.volume, 0, 100)
	Nerve.FireClient(player, "RadioService", "RadioStateChanged", initialRadioState)
	return true, nil, initialRadioState.volume
end

function RadioService:ToggleMute(player: Player)
	initialRadioState.micMuted = not initialRadioState.micMuted
	Nerve.FireClient(player, "RadioService", "RadioStateChanged", initialRadioState)
	return true, nil, initialRadioState.micMuted
end

function RadioService:PushToTalk(player: Player, payload: { isTalking: boolean })
	initialRadioState.isTalking = payload.isTalking
	local name = player.Name or "Alex Mercer"
	if payload.isTalking then
		local found = false
		for _, s in ipairs(initialRadioState.activeSpeakers) do
			if s == name then found = true break end
		end
		if not found then table.insert(initialRadioState.activeSpeakers, name) end
	else
		for i, s in ipairs(initialRadioState.activeSpeakers) do
			if s == name then
				table.remove(initialRadioState.activeSpeakers, i)
				break
			end
		end
	end
	Nerve.FireAllClients("RadioService", "SpeakerTalkingChanged", {
		speaker = name,
		isTalking = payload.isTalking,
		activeSpeakers = initialRadioState.activeSpeakers,
	})
	return true, nil, payload.isTalking
end

function RadioService:NerveInit()
end

function RadioService:NerveStart()
end

return RadioService
