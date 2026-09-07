--!strict
-- Authoritative App Store service for Roblox Nerve architecture.
-- Manages phone application installations, downloads, updates, and store catalogs.

local Players = game:GetService("Players")

local Nerve = require(script.Parent.Nerve)

export type StoreAppItem = {
	id: string,
	name: string,
	category: string,
	developer: string,
	rating: number,
	reviewsCount: number,
	sizeMb: number,
	description: string,
	version: string,
	isSystem: boolean,
}

local AppStoreService = Nerve.CreateService({
	Name = "AppStoreService",
	Client = {
		InstalledAppsChanged = Nerve.CreateSignal(),
	},
})

local SYSTEM_APP_IDS: { [string]: boolean } = {
	["phone"] = true,
	["messages"] = true,
	["settings"] = true,
	["app-store"] = true,
	["camera"] = true,
}

local DEFAULT_INSTALLED_APPS: { string } = {
	"phone",
	"messages",
	"calculator",
	"camera",
	"clock",
	"weather",
	"banking",
	"mail",
	"notes",
	"memos",
	"photos",
	"app-store",
	"settings",
	"map",
	"music",
	"garage",
	"feather",
	"calendar",
	"health",
	"citywarn",
}

local STORE_CATALOG: { StoreAppItem } = {
	{
		id = "fliptok",
		name = "FlipTok",
		category = "social",
		developer = "BytePulse Media",
		rating = 4.8,
		reviewsCount = 14200,
		sizeMb = 48,
		description = "Watch, create, and share trending short-form videos across Sun City. Join viral dance challenges and comedy clips.",
		version = "3.2.0",
		isSystem = false,
	},
	{
		id = "crypto",
		name = "Crypto",
		category = "utilities",
		developer = "Satoshi Financial",
		rating = 4.6,
		reviewsCount = 8900,
		sizeMb = 22,
		description = "Live cryptocurrency ticker, decentralized wallet, and instant coin swap for BTC, ETH, and SunCoin.",
		version = "2.1.4",
		isSystem = false,
	},
	{
		id = "snake",
		name = "Snake",
		category = "games",
		developer = "RetroByte Studios",
		rating = 4.9,
		reviewsCount = 31500,
		sizeMb = 8,
		description = "Classic arcade retro snake game with neon themes, high score leaderboards, and speed multipliers.",
		version = "1.0.8",
		isSystem = false,
	},
	{
		id = "darkchat",
		name = "DarkChat",
		category = "social",
		developer = "CipherWorks",
		rating = 4.7,
		reviewsCount = 5400,
		sizeMb = 14,
		description = "End-to-end encrypted anonymous messenger with burner channels, self-destructing notes, and VPN masking.",
		version = "4.0.1",
		isSystem = false,
	},
	{
		id = "house",
		name = "House",
		category = "utilities",
		developer = "Dynasty8 Real Estate",
		rating = 4.5,
		reviewsCount = 6700,
		sizeMb = 31,
		description = "Manage your owned luxury apartments, villas, and lockups. Remote door locks, stash security, and valet parking.",
		version = "2.5.0",
		isSystem = false,
	},
	{
		id = "skyride",
		name = "SkyRide",
		category = "utilities",
		developer = "SkyRide Mobility",
		rating = 4.4,
		reviewsCount = 11200,
		sizeMb = 18,
		description = "On-demand city cab and luxury chauffeur hailer. Track your driver in real-time with automatic Fleeca Bank billing.",
		version = "1.9.3",
		isSystem = false,
	},
	{
		id = "picstagram",
		name = "Picstagram",
		category = "social",
		developer = "PixelMedia Inc.",
		rating = 4.7,
		reviewsCount = 18400,
		sizeMb = 42,
		description = "Share stunning photo filters, reels, and stories with friends and followers across San Andreas.",
		version = "5.1.2",
		isSystem = false,
	},
	{
		id = "number-merge",
		name = "Number Merge",
		category = "games",
		developer = "BrainBox Puzzles",
		rating = 4.8,
		reviewsCount = 9400,
		sizeMb = 6,
		description = "Addictive swipe-and-merge numbers puzzle. Reach the 2048 tile and challenge global records.",
		version = "1.2.0",
		isSystem = false,
	},
	{
		id = "citymarkt",
		name = "CityMarkt",
		category = "shopping",
		developer = "Sun City Commerce",
		rating = 4.3,
		reviewsCount = 7600,
		sizeMb = 26,
		description = "Peer-to-peer classifieds and marketplace. Buy, sell, or trade vehicles, rare weapons, and collector items.",
		version = "2.0.4",
		isSystem = false,
	},
	{
		id = "minesweeper",
		name = "Minesweeper",
		category = "games",
		developer = "RetroByte Studios",
		rating = 4.6,
		reviewsCount = 12800,
		sizeMb = 5,
		description = "Classic tactical grid puzzle. Flag dangerous mines and clear the minefield against the clock.",
		version = "1.1.0",
		isSystem = false,
	},
	{
		id = "weazel-news",
		name = "Weazel News",
		category = "social",
		developer = "Weazel Broadcasting",
		rating = 4.2,
		reviewsCount = 8200,
		sizeMb = 19,
		description = "Breaking news, high-speed chase alerts, weather warnings, and investigative journalism live.",
		version = "3.0.1",
		isSystem = false,
	},
	{
		id = "tower-stack",
		name = "Tower Stack",
		category = "games",
		developer = "NeonArcade",
		rating = 4.7,
		reviewsCount = 15300,
		sizeMb = 9,
		description = "Test your reflexes by stacking skyscraper blocks as high as you can into the Sun City clouds.",
		version = "1.4.2",
		isSystem = false,
	},
}

-- Per-player installed apps table
local playerApps: { [Player]: { string } } = {}

local function getPlayerInstalled(player: Player): { string }
	if not playerApps[player] then
		playerApps[player] = table.clone(DEFAULT_INSTALLED_APPS)
	end
	return playerApps[player]
end

function AppStoreService.Client:GetStoreCatalog(player: Player): { StoreAppItem }
	return STORE_CATALOG
end

function AppStoreService.Client:GetInstalledApps(player: Player): { string }
	return getPlayerInstalled(player)
end

function AppStoreService.Client:InstallApp(player: Player, payload: { appId: string }): (boolean, { string }?, string?)
	if type(payload) ~= "table" or type(payload.appId) ~= "string" then
		return false, nil, "Invalid app ID"
	end

	local installed = getPlayerInstalled(player)
	for _, id in ipairs(installed) do
		if id == payload.appId then
			return true, installed, nil -- already installed
		end
	end

	-- Verify app exists in catalog
	local exists = false
	for _, item in ipairs(STORE_CATALOG) do
		if item.id == payload.appId then
			exists = true
			break
		end
	end
	if not exists then
		return false, nil, "App not found in store"
	end

	table.insert(installed, payload.appId)
	self.InstalledAppsChanged:Fire(player, installed)
	return true, installed, nil
end

function AppStoreService.Client:UninstallApp(player: Player, payload: { appId: string }): (boolean, { string }?, string?)
	if type(payload) ~= "table" or type(payload.appId) ~= "string" then
		return false, nil, "Invalid app ID"
	end

	if SYSTEM_APP_IDS[payload.appId] then
		return false, nil, "System apps cannot be uninstalled"
	end

	local installed = getPlayerInstalled(player)
	local targetIndex = nil
	for i, id in ipairs(installed) do
		if id == payload.appId then
			targetIndex = i
			break
		end
	end

	if not targetIndex then
		return false, nil, "App is not installed"
	end

	table.remove(installed, targetIndex)
	self.InstalledAppsChanged:Fire(player, installed)
	return true, installed, nil
end

Players.PlayerRemoving:Connect(function(player)
	playerApps[player] = nil
end)

return AppStoreService
