--!strict

-- Authoritative Roblox implementation for the React phone surface.
-- The generated contract in generated/PhoneService.luau must stay in sync with
-- my-ui/src/nerve/project.contract.json; this file contains the game behavior.
local DataStoreService = game:GetService("DataStoreService")
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)
local S = Nerve.Schema

local PhoneStore = DataStoreService:GetDataStore("PlayerData")
local PHONE_SETTINGS_KEY = "PhoneSettings"

type PhoneSettings = {
	airplaneMode: boolean,
	wifiEnabled: boolean,
	bluetoothEnabled: boolean,
	darkMode: boolean,
	ringtone: string,
}

type PhoneMessage = {
	id: string,
	body: string,
	fromPlayer: boolean,
	time: string,
}

type PhoneContact = {
	id: string,
	name: string,
	number: string,
}

local DEFAULT_SETTINGS: PhoneSettings = {
	airplaneMode = false,
	wifiEnabled = true,
	bluetoothEnabled = true,
	darkMode = true,
	ringtone = "Aurora",
}

local CONTACTS: {PhoneContact} = {
	{id = "alex", name = "Alex Morgan", number = "555-0142"},
	{id = "bank", name = "Sun City Bank", number = "555-0100"},
	{id = "services", name = "City Services", number = "555-0111"},
}

local PhoneSettingsSchema = S.Struct({
	airplaneMode = S.Boolean,
	wifiEnabled = S.Boolean,
	bluetoothEnabled = S.Boolean,
	darkMode = S.Boolean,
	ringtone = S.String,
})

local PhoneService = Nerve.CreateService({
	Name = "PhoneService",
	Client = {
		MessageReceived = Nerve.Signal(S.Tuple({S.String, S.String}), {Direction = "server"}),
		CallStateChanged = Nerve.Signal(S.Tuple({S.String, S.String}), {Direction = "server"}),
		PhoneSettingsChanged = Nerve.Signal(S.Tuple({PhoneSettingsSchema}), {Direction = "server"}),
	},
	Network = {
		GetPhoneState = Nerve.Method({
			Request = S.Tuple({}),
			Response = S.Tuple({S.Struct({
				phoneNumber = S.String,
				battery = S.Float64,
				contacts = S.Array(S.Struct({id = S.String, name = S.String, number = S.String})),
				conversations = S.Array(S.Struct({contactId = S.String, lastMessage = S.String, time = S.String, unread = S.Int32})),
				settings = PhoneSettingsSchema,
			})}),
		}),
		GetMessages = Nerve.Method({
			Request = S.Tuple({S.String}),
			Response = S.Tuple({S.Array(S.Struct({id = S.String, body = S.String, fromPlayer = S.Boolean, time = S.String}))}),
		}),
		SendMessage = Nerve.Method({
			Request = S.Struct({number = S.String, body = S.String}),
			Response = S.Tuple({S.Boolean, S.Optional(S.String)}),
			RateLimit = {Requests = 12, Window = 1},
		}),
		StartCall = Nerve.Method({
			Request = S.Tuple({S.String}),
			Response = S.Tuple({S.Boolean, S.Optional(S.String)}),
			RateLimit = {Requests = 6, Window = 1},
		}),
		EndCall = Nerve.Method({
			Request = S.Tuple({}),
			Response = S.Tuple({S.Boolean, S.Optional(S.String)}),
		}),
		SavePhoneSettings = Nerve.Method({
			Request = PhoneSettingsSchema,
			Response = S.Tuple({S.Boolean, S.Optional(S.String)}),
			RateLimit = {Requests = 10, Window = 1},
		}),
	},
})

local messagesByPlayer: {[Player]: {[string]: {PhoneMessage}}} = {}
local conversationsByPlayer: {[Player]: {[string]: {lastMessage: string, time: string, unread: number}}} = {}
local activeCalls: {[Player]: string} = {}

local function copySettings(value: PhoneSettings?): PhoneSettings
	local result = table.clone(DEFAULT_SETTINGS)
	if value then
		result.airplaneMode = value.airplaneMode
		result.wifiEnabled = value.wifiEnabled
		result.bluetoothEnabled = value.bluetoothEnabled
		result.darkMode = value.darkMode
		if value.ringtone == "Aurora" or value.ringtone == "Pulse" or value.ringtone == "Classic" then
			result.ringtone = value.ringtone
		end
	end
	return result
end

local function playerData(player: Player): {[string]: any}
	local success, value = pcall(function()
		return PhoneStore:GetAsync(tostring(player.UserId))
	end)
	if success and type(value) == "table" then
		return value
	end
	return {}
end

local function phoneSettings(player: Player): PhoneSettings
	local data = playerData(player)
	if type(data[PHONE_SETTINGS_KEY]) == "table" then
		return copySettings(data[PHONE_SETTINGS_KEY])
	end
	return table.clone(DEFAULT_SETTINGS)
end

local function ensurePlayerState(player: Player)
	if messagesByPlayer[player] then return end
	messagesByPlayer[player] = {
		alex = {
			{id = "alex-1", body = "I left the car at the central garage. Meet you there?", fromPlayer = false, time = "12:18"},
			{id = "alex-2", body = "Sure, I will be there in five.", fromPlayer = true, time = "12:20"},
		},
		bank = {{id = "bank-1", body = "Welcome back. Your account is ready to use.", fromPlayer = false, time = "11:52"}},
		services = {{id = "services-1", body = "New in town? Stop by City Hall to learn about local jobs.", fromPlayer = false, time = "09:30"}},
	}
	conversationsByPlayer[player] = {
		alex = {lastMessage = "Meet at the central garage?", time = "12:18", unread = 1},
		bank = {lastMessage = "Your account is ready to use.", time = "11:52", unread = 0},
		services = {lastMessage = "Stop by City Hall to learn about local jobs.", time = "09:30", unread = 0},
	}
end

local function findContact(numberOrId: string): PhoneContact?
	for _, contact in CONTACTS do
		if contact.number == numberOrId or contact.id == numberOrId then return contact end
	end
	return nil
end

function PhoneService.Client:GetPhoneState(player: Player)
	ensurePlayerState(player)
	local conversations = {}
	for _, contact in CONTACTS do
		local conversation = conversationsByPlayer[player][contact.id]
		table.insert(conversations, {
			contactId = contact.id,
			lastMessage = conversation.lastMessage,
			time = conversation.time,
			unread = conversation.unread,
		})
	end
	return {
		phoneNumber = "555-" .. string.format("%04d", player.UserId % 10000),
		battery = 87,
		contacts = CONTACTS,
		conversations = conversations,
		settings = phoneSettings(player),
	}
end

function PhoneService.Client:GetMessages(player: Player, numberOrId: string)
	ensurePlayerState(player)
	local contact = findContact(numberOrId)
	if not contact then return {} end
	local conversation = conversationsByPlayer[player][contact.id]
	conversation.unread = 0
	return messagesByPlayer[player][contact.id] or {}
end

function PhoneService.Client:SendMessage(player: Player, value: {number: string, body: string})
	ensurePlayerState(player)
	if type(value.body) ~= "string" or #value.body == 0 or #value.body > 500 then return false, "Message must be between 1 and 500 characters" end
	local contact = findContact(value.number)
	if not contact then return false, "Contact not found" end
	local body = string.gsub(value.body, "[%c]", "")
	local time = os.date("!%H:%M")
	table.insert(messagesByPlayer[player][contact.id], {id = HttpService:GenerateGUID(false), body = body, fromPlayer = true, time = time})
	local conversation = conversationsByPlayer[player][contact.id]
	conversation.lastMessage = body
	conversation.time = time
	conversation.unread = 0
	PhoneService.Client.MessageReceived:Fire(player, contact.number, body)
	return true, nil
end

function PhoneService.Client:StartCall(player: Player, number: string)
	if not findContact(number) then return false, "Contact not found" end
	activeCalls[player] = number
	PhoneService.Client.CallStateChanged:Fire(player, "connected", number)
	return true, nil
end

function PhoneService.Client:EndCall(player: Player)
	local number = activeCalls[player]
	if not number then return false, "No active call" end
	activeCalls[player] = nil
	PhoneService.Client.CallStateChanged:Fire(player, "ended", number)
	return true, nil
end

function PhoneService.Client:SavePhoneSettings(player: Player, value: PhoneSettings)
	local settings = copySettings(value)
	local success = pcall(function()
		PhoneStore:UpdateAsync(tostring(player.UserId), function(current)
			local data = if type(current) == "table" then table.clone(current) else {}
			data[PHONE_SETTINGS_KEY] = settings
			return data
		end)
	end)
	if not success then return false, "Unable to save phone settings" end
	PhoneService.Client.PhoneSettingsChanged:Fire(player, settings)
	return true, nil
end

Players.PlayerRemoving:Connect(function(player)
	messagesByPlayer[player] = nil
	conversationsByPlayer[player] = nil
	activeCalls[player] = nil
end)

function PhoneService:NerveInit() end
function PhoneService:NerveStart() end

return PhoneService
