--!strict

-- Canonical authoritative settings service. The browser preview mirrors this
-- contract in my-ui/src/nerve/preview.ts.
local DataStoreService = game:GetService("DataStoreService")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)
local S = Nerve.Schema

local SettingsStore = DataStoreService:GetDataStore("PlayerData")

local DEFAULT_SETTINGS = {
	language = "English",
	uiScale = 1,
	showTooltips = true,
	streamerMode = false,
	showQuantities = true,
	performancePreset = "Balanced",
	disablePostProcessing = false,
	reduceEffects = true,
	lowerReflectionDetail = true,
	shadowDetail = 0.7,
	viewDistance = 0.8,
	masterVolume = 0.8,
	musicVolume = 0.5,
	sfxVolume = 0.9,
	radioVolume = 0.7,
	voiceChatVolume = 0.8,
	lookSensitivity = 0.5,
	invertLook = false,
	holdToSprint = true,
	showMinimap = true,
	showCompass = true,
	damageNumbers = true,
	showNotifications = true,
	missionAlerts = true,
	chatNotifications = true,
	colorblindMode = "Off",
	subtitles = true,
	highContrast = false,
	developerMode = false,
	showNetworkStats = false,
	motion = true,
	panelOpacity = 100,
}

local SettingsSchema = S.Struct({
	language = S.String,
	uiScale = S.Float64,
	showTooltips = S.Boolean,
	streamerMode = S.Boolean,
	showQuantities = S.Boolean,
	performancePreset = S.String,
	disablePostProcessing = S.Boolean,
	reduceEffects = S.Boolean,
	lowerReflectionDetail = S.Boolean,
	shadowDetail = S.Float64,
	viewDistance = S.Float64,
	masterVolume = S.Float64,
	musicVolume = S.Float64,
	sfxVolume = S.Float64,
	radioVolume = S.Float64,
	voiceChatVolume = S.Float64,
	lookSensitivity = S.Float64,
	invertLook = S.Boolean,
	holdToSprint = S.Boolean,
	showMinimap = S.Boolean,
	showCompass = S.Boolean,
	damageNumbers = S.Boolean,
	showNotifications = S.Boolean,
	missionAlerts = S.Boolean,
	chatNotifications = S.Boolean,
	colorblindMode = S.String,
	subtitles = S.Boolean,
	highContrast = S.Boolean,
	developerMode = S.Boolean,
	showNetworkStats = S.Boolean,
	motion = S.Boolean,
	panelOpacity = S.Float64,
})

local SettingsService = Nerve.CreateService({
	Name = "SettingsService",
	Client = {
		SettingsChanged = Nerve.Signal(S.Tuple({ SettingsSchema })),
	},
	Network = {
		GetSettings = Nerve.Method({
			Request = S.Tuple({}),
			Response = S.Tuple({ SettingsSchema }),
		}),
		SaveSettings = Nerve.Method({
			Request = SettingsSchema,
			Response = S.Tuple({ S.Boolean, S.Optional(S.String) }),
			RateLimit = { Requests = 10, Window = 1 },
		}),
	},
})

local function copyDefaults(): {[string]: any}
	local copy = {}
	for key, value in pairs(DEFAULT_SETTINGS) do
		copy[key] = value
	end
	return copy
end

local function normalizeSettings(value: any): {[string]: any}
	local nextSettings = copyDefaults()
	if type(value) ~= "table" then
		return nextSettings
	end
	for key, defaultValue in pairs(DEFAULT_SETTINGS) do
		if type(value[key]) == type(defaultValue) then
			nextSettings[key] = value[key]
		end
	end
	return nextSettings
end

function SettingsService.Client:GetSettings(player: Player)
	local success, value = pcall(function()
		return SettingsStore:GetAsync(tostring(player.UserId))
	end)
	if not success then
		warn(`Settings load failed for {player.UserId}`)
		return copyDefaults()
	end
	return normalizeSettings(value)
end

function SettingsService.Client:SaveSettings(player: Player, value: {[string]: any})
	local nextSettings = normalizeSettings(value)
	local success = pcall(function()
		SettingsStore:UpdateAsync(tostring(player.UserId), function(current)
			if type(current) == "table" and type(current.Settings) == "table" then
				local playerData = table.clone(current)
				playerData.Settings = nextSettings
				return playerData
			end
			return { Settings = nextSettings }
		end)
	end)
	if not success then
		return false, "Unable to save settings"
	end
	SettingsService.Client.SettingsChanged:Fire(player, nextSettings)
	return true, nil
end

function SettingsService:NerveInit()
	-- DataStore access is intentionally deferred until a player calls the service.
end

function SettingsService:NerveStart()
	-- SettingsChanged is fired only after UpdateAsync succeeds.
end

return SettingsService
