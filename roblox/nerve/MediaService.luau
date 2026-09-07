--!strict
-- Authoritative Media & Gallery service for Roblox Nerve architecture.
-- Manages in-game player photos, video captures, favorites, and storage.

local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

local Nerve = require(script.Parent.Nerve)

export type MediaType = "photo" | "video"

export type MediaItem = {
	id: string,
	mediaType: MediaType,
	url: string,
	thumbnailUrl: string?,
	favorite: boolean,
	createdAt: number,
	title: string,
	location: string?,
}

export type MediaCounts = {
	all: number,
	photos: number,
	videos: number,
	favorites: number,
}

local MediaService = Nerve.CreateService({
	Name = "MediaService",
	Client = {
		MediaChanged = Nerve.CreateSignal(),
	},
})

-- Server-authoritative in-memory media storage per player
local playerMedia: { [Player]: { MediaItem } } = {}

local function generateDefaultPhotos(): { MediaItem }
	local now = os.time() * 1000
	return {
		{
			id = "photo-1",
			mediaType = "photo",
			url = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20900%201200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23172554%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%237c3aed%22%2F%3E%3C%2FlinearGradient%3E%3ClinearGradient%20id%3D%22land%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%221%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23111827%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23101114%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22900%22%20height%3D%221200%22%20fill%3D%22url(%23sky)%22%2F%3E%3Ccircle%20cx%3D%22690%22%20cy%3D%22260%22%20r%3D%22105%22%20fill%3D%22%23fff%22%20opacity%3D%22.72%22%2F%3E%3Cpath%20d%3D%22M0%20690%20210%20440%20390%20650%20585%20360%20900%20720V1200H0Z%22%20fill%3D%22%23111827%22%20opacity%3D%22.84%22%2F%3E%3Cpath%20d%3D%22M0%20790%20230%20620%20410%20765%20650%20525%20900%20770V1200H0Z%22%20fill%3D%22url(%23land)%22%2F%3E%3Ctext%20x%3D%2254%22%20y%3D%221100%22%20fill%3D%22%23fff%22%20font-family%3D%22system-ui%22%20font-size%3D%2258%22%20font-weight%3D%22bold%22%3ECity%20Skyline%3C%2Ftext%3E%3C%2Fsvg%3E",
			favorite = true,
			createdAt = now - 7200000,
			title = "City Skyline",
			location = "Downtown Sun City",
		},
		{
			id = "photo-2",
			mediaType = "photo",
			url = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20900%201200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%230369a1%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23fbbf24%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22900%22%20height%3D%221200%22%20fill%3D%22url(%23sky)%22%2F%3E%3Ccircle%20cx%3D%22690%22%20cy%3D%22260%22%20r%3D%22105%22%20fill%3D%22%23fef08a%22%20opacity%3D%22.9%22%2F%3E%3Cpath%20d%3D%22M0%20690%20210%20440%20390%20650%20585%20360%20900%20720V1200H0Z%22%20fill%3D%22%23164e63%22%20opacity%3D%22.84%22%2F%3E%3Ctext%20x%3D%2254%22%20y%3D%221100%22%20fill%3D%22%23fff%22%20font-family%3D%22system-ui%22%20font-size%3D%2258%22%20font-weight%3D%22bold%22%3EDel%20Perro%20Beach%3C%2Ftext%3E%3C%2Fsvg%3E",
			favorite = false,
			createdAt = now - 18000000,
			title = "Del Perro Beach",
			location = "Del Perro Pier",
		},
		{
			id = "photo-3",
			mediaType = "photo",
			url = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20900%201200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23c2410c%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%23facc15%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22900%22%20height%3D%221200%22%20fill%3D%22url(%23sky)%22%2F%3E%3Cpath%20d%3D%22M0%20750%20280%20500%20500%20680%20900%20420V1200H0Z%22%20fill%3D%22%23422006%22%2F%3E%3Ctext%20x%3D%2254%22%20y%3D%221100%22%20fill%3D%22%23fff%22%20font-family%3D%22system-ui%22%20font-size%3D%2258%22%20font-weight%3D%22bold%22%3EChiliad%20Sunset%3C%2Ftext%3E%3C%2Fsvg%3E",
			favorite = true,
			createdAt = now - 43200000,
			title = "Chiliad Sunset",
			location = "Mount Chiliad Lookout",
		},
		{
			id = "photo-4",
			mediaType = "photo",
			url = "data:image/svg+xml;charset=UTF-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20900%201200%22%3E%3Cdefs%3E%3ClinearGradient%20id%3D%22sky%22%20x1%3D%220%22%20y1%3D%220%22%20x2%3D%220%22%20y2%3D%221%22%3E%3Cstop%20stop-color%3D%22%23166534%22%2F%3E%3Cstop%20offset%3D%221%22%20stop-color%3D%22%2386efac%22%2F%3E%3C%2FlinearGradient%3E%3C%2Fdefs%3E%3Crect%20width%3D%22900%22%20height%3D%221200%22%20fill%3D%22url(%23sky)%22%2F%3E%3Cpath%20d%3D%22M0%20800%20320%20580%20640%20720%20900%20540V1200H0Z%22%20fill%3D%22%2314532d%22%2F%3E%3Ctext%20x%3D%2254%22%20y%3D%221100%22%20fill%3D%22%23fff%22%20font-family%3D%22system-ui%22%20font-size%3D%2258%22%20font-weight%3D%22bold%22%3EVineyard%20Hills%3C%2Ftext%3E%3C%2Fsvg%3E",
			favorite = false,
			createdAt = now - 86400000,
			title = "Vineyard Hills",
			location = "Marlowe Vineyards",
		},
	}
end

local function getPlayerMedia(player: Player): { MediaItem }
	if not playerMedia[player] then
		playerMedia[player] = generateDefaultPhotos()
	end
	return playerMedia[player]
end

-- Network Methods
function MediaService.Client:GetMediaList(player: Player, options: { filter: string?, favoritesOnly: boolean? }?): ({ MediaItem }, MediaCounts)
	local all = getPlayerMedia(player)
	local filter = options and options.filter or "all"
	local favOnly = options and options.favoritesOnly == true

	local photosCount = 0
	local videosCount = 0
	local favCount = 0

	for _, item in ipairs(all) do
		if item.mediaType == "photo" then photosCount += 1 end
		if item.mediaType == "video" then videosCount += 1 end
		if item.favorite then favCount += 1 end
	end

	local filtered: { MediaItem } = {}
	for _, item in ipairs(all) do
		local matchesType = (filter == "all") or (item.mediaType == filter)
		local matchesFav = not favOnly or item.favorite
		if matchesType and matchesFav then
			table.insert(filtered, item)
		end
	end

	local counts: MediaCounts = {
		all = #all,
		photos = photosCount,
		videos = videosCount,
		favorites = favCount,
	}

	return filtered, counts
end

function MediaService.Client:CaptureMedia(player: Player, payload: { mediaType: string, url: string, title: string?, location: string? }): (boolean, MediaItem?, string?)
	local all = getPlayerMedia(player)
	local mediaType: MediaType = if payload.mediaType == "video" then "video" else "photo"
	local id = "media-" .. HttpService:GenerateGUID(false)
	local title = payload.title or ("Capture " .. os.date("%X"))
	local location = payload.location or "Sun City"

	local item: MediaItem = {
		id = id,
		mediaType = mediaType,
		url = payload.url,
		favorite = false,
		createdAt = os.time() * 1000,
		title = title,
		location = location,
	}

	table.insert(all, 1, item)
	MediaService.Client.MediaChanged:Fire(player, "capture", item)
	return true, item, nil
end

function MediaService.Client:ToggleFavorite(player: Player, payload: { id: string }): (boolean, boolean, string?)
	local all = getPlayerMedia(player)
	for _, item in ipairs(all) do
		if item.id == payload.id then
			item.favorite = not item.favorite
			MediaService.Client.MediaChanged:Fire(player, "favorite", item)
			return true, item.favorite, nil
		end
	end
	return false, false, "Media item not found"
end

function MediaService.Client:DeleteMedia(player: Player, payload: { ids: { string } }): (boolean, string?)
	local all = getPlayerMedia(player)
	local toDelete = {}
	for _, id in ipairs(payload.ids) do
		toDelete[id] = true
	end

	local kept: { MediaItem } = {}
	for _, item in ipairs(all) do
		if not toDelete[item.id] then
			table.insert(kept, item)
		end
	end

	playerMedia[player] = kept
	MediaService.Client.MediaChanged:Fire(player, "delete", { ids = payload.ids })
	return true, nil
end

function MediaService:NerveInit()
	Players.PlayerRemoving:Connect(function(player)
		playerMedia[player] = nil
	end)
end

function MediaService:NerveStart() end

return MediaService
