--!strict
-- Authoritative Music & Radio service for Roblox Nerve architecture.
-- Manages in-game music tracks, radio stations, player audio playback state, and synchronization
-- with the Phone OS Dynamic Island, Control Center, and Lockscreen media widgets.

local Players = game:GetService("Players")

local Nerve = require(script.Parent.Nerve)

export type MusicTrack = {
	id: string,
	title: string,
	artist: string,
	album: string,
	duration: number, -- in seconds
	coverColor: string,
	station: string?,
}

export type PlaybackState = {
	track: MusicTrack?,
	isPlaying: boolean,
	position: number,
	volume: number,
	loop: boolean,
	shuffle: boolean,
}

local MusicService = Nerve.CreateService({
	Name = "MusicService",
	Client = {
		PlaybackChanged = Nerve.CreateSignal(),
	},
})

local CURATED_TRACKS: { MusicTrack } = {
	{
		id = "track-1",
		title = "Midnight City",
		artist = "M83",
		album = "Hurry Up, We're Dreaming",
		duration = 244,
		coverColor = "#38bdf8",
		station = "Non-Stop-Pop FM",
	},
	{
		id = "track-2",
		title = "Sleepwalking",
		artist = "The Chain Gang of 1974",
		album = "Daydream",
		duration = 218,
		coverColor = "#a855f7",
		station = "Radio Mirror Park",
	},
	{
		id = "track-3",
		title = "Blinding Lights",
		artist = "The Weeknd",
		album = "After Hours",
		duration = 200,
		coverColor = "#ef4444",
		station = "Los Santos Underground",
	},
	{
		id = "track-4",
		title = "Lady (Hear Me Tonight)",
		artist = "Modjo",
		album = "Modjo",
		duration = 306,
		coverColor = "#f59e0b",
		station = "Non-Stop-Pop FM",
	},
	{
		id = "track-5",
		title = "Still D.R.E.",
		artist = "Dr. Dre ft. Snoop Dogg",
		album = "2001",
		duration = 270,
		coverColor = "#10b981",
		station = "West Coast Classics",
	},
	{
		id = "track-6",
		title = "Nightcall",
		artist = "Kavinsky",
		album = "OutRun",
		duration = 259,
		coverColor = "#ec4899",
		station = "Synthwave Sun City",
	},
}

-- Per-player playback state
local playerStates: { [Player]: PlaybackState } = {}

local function getOrCreateState(player: Player): PlaybackState
	local state = playerStates[player]
	if not state then
		state = {
			track = CURATED_TRACKS[1],
			isPlaying = false,
			position = 0,
			volume = 75,
			loop = false,
			shuffle = false,
		}
		playerStates[player] = state
	end
	return state
end

function MusicService.Client:GetMusicLibrary(player: Player): ({ MusicTrack }, PlaybackState)
	local state = getOrCreateState(player)
	return CURATED_TRACKS, state
end

function MusicService.Client:PlayTrack(player: Player, payload: { trackId: string }): (boolean, PlaybackState?, string?)
	if type(payload) ~= "table" or type(payload.trackId) ~= "string" then
		return false, nil, "Invalid track payload"
	end

	local targetTrack: MusicTrack? = nil
	for _, track in ipairs(CURATED_TRACKS) do
		if track.id == payload.trackId then
			targetTrack = track
			break
		end
	end

	if not targetTrack then
		return false, nil, "Track not found"
	end

	local state = getOrCreateState(player)
	state.track = targetTrack
	state.isPlaying = true
	state.position = 0

	self.PlaybackChanged:Fire(player, state)
	return true, state, nil
end

function MusicService.Client:TogglePlayback(player: Player): (boolean, PlaybackState?, string?)
	local state = getOrCreateState(player)
	state.isPlaying = not state.isPlaying
	self.PlaybackChanged:Fire(player, state)
	return true, state, nil
end

function MusicService.Client:NextTrack(player: Player): (boolean, PlaybackState?, string?)
	local state = getOrCreateState(player)
	local currentIndex = 1
	for i, track in ipairs(CURATED_TRACKS) do
		if state.track and track.id == state.track.id then
			currentIndex = i
			break
		end
	end

	local nextIndex = (currentIndex % #CURATED_TRACKS) + 1
	state.track = CURATED_TRACKS[nextIndex]
	state.position = 0
	state.isPlaying = true

	self.PlaybackChanged:Fire(player, state)
	return true, state, nil
end

function MusicService.Client:PreviousTrack(player: Player): (boolean, PlaybackState?, string?)
	local state = getOrCreateState(player)
	local currentIndex = 1
	for i, track in ipairs(CURATED_TRACKS) do
		if state.track and track.id == state.track.id then
			currentIndex = i
			break
		end
	end

	local prevIndex = currentIndex - 1
	if prevIndex < 1 then
		prevIndex = #CURATED_TRACKS
	end
	state.track = CURATED_TRACKS[prevIndex]
	state.position = 0
	state.isPlaying = true

	self.PlaybackChanged:Fire(player, state)
	return true, state, nil
end

function MusicService.Client:SetVolume(player: Player, payload: { volume: number }): (boolean, string?)
	if type(payload) ~= "table" or type(payload.volume) ~= "number" then
		return false, "Invalid volume"
	end
	local state = getOrCreateState(player)
	state.volume = math.clamp(payload.volume, 0, 100)
	self.PlaybackChanged:Fire(player, state)
	return true, nil
end

function MusicService.Client:SeekTrack(player: Player, payload: { position: number }): (boolean, string?)
	if type(payload) ~= "table" or type(payload.position) ~= "number" then
		return false, "Invalid position"
	end
	local state = getOrCreateState(player)
	state.position = math.max(0, payload.position)
	self.PlaybackChanged:Fire(player, state)
	return true, nil
end

Players.PlayerRemoving:Connect(function(player)
	playerStates[player] = nil
end)

return MusicService
