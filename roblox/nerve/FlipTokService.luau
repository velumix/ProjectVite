--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type FlipTokReel = {
	id: string,
	creator: string,
	caption: string,
	musicTrack: string,
	likes: number,
	isLiked: boolean,
	commentsCount: number,
	shares: number,
	accentGradient: string,
}

type ReelComment = {
	id: string,
	reelId: string,
	author: string,
	text: string,
	timestamp: number,
}

local initialReels: { FlipTokReel } = {
	{
		id = "reel-1",
		creator = "@drift_king_ls",
		caption = "Tandem drifting through Vinewood sign hairpins in the Sultan RS 🏎️💨 #drift #lsstreet",
		musicTrack = "Midnight Tokyo Phonk - DJ Suki",
		likes = 18400,
		isLiked = false,
		commentsCount = 342,
		shares = 1200,
		accentGradient = "linear-gradient(180deg, #1e1b4b 0%, #09090b 100%)",
	},
	{
		id = "reel-2",
		creator = "@vinewood_glam",
		caption = "Get ready with me for the Diamond Casino Penthouse Gala ✨🥂 #grwm #luxury #vinewood",
		musicTrack = "Champagne Skyline - Velvet Room",
		likes = 9820,
		isLiked = true,
		commentsCount = 184,
		shares = 540,
		accentGradient = "linear-gradient(180deg, #4a044e 0%, #09090b 100%)",
	},
	{
		id = "reel-3",
		creator = "@tactical_pilot",
		caption = "Threading the needle under Del Perro Pier in a Buzzard helicopter 🚁🌊 #aviation #daredevil",
		musicTrack = "Danger Zone 2026 - Aerowave",
		likes = 24100,
		isLiked = false,
		commentsCount = 512,
		shares = 3100,
		accentGradient = "linear-gradient(180deg, #064e3b 0%, #09090b 100%)",
	},
}

local initialComments: { ReelComment } = {
	{
		id = "comm-1",
		reelId = "reel-1",
		author = "BennyJunior",
		text = "That reverse entry angle was insane bro! Clean lines.",
		timestamp = os.time() - 3600,
	},
}

local FlipTokService = {
	Name = "FlipTokService",
}

function FlipTokService:GetFeed(player: Player)
	return initialReels
end

function FlipTokService:LikeVideo(player: Player, payload: { reelId: string })
	for _, r in ipairs(initialReels) do
		if r.id == payload.reelId then
			if r.isLiked then
				r.isLiked = false
				r.likes = math.max(0, r.likes - 1)
			else
				r.isLiked = true
				r.likes += 1
			end
			Nerve.FireAllClients("FlipTokService", "VideoLiked", {
				reelId = r.id,
				likes = r.likes,
				isLiked = r.isLiked,
			})
			return true, nil, r.likes
		end
	end
	return false, "Reel not found", nil
end

function FlipTokService:GetComments(player: Player, payload: { reelId: string })
	local result: { ReelComment } = {}
	for _, c in ipairs(initialComments) do
		if c.reelId == payload.reelId then
			table.insert(result, c)
		end
	end
	return result
end

function FlipTokService:AddComment(player: Player, payload: { reelId: string, text: string })
	if not payload.text or #payload.text == 0 then return false, "Text required", nil end
	local comm: ReelComment = {
		id = "comm-" .. tostring(os.time()),
		reelId = payload.reelId,
		author = player.Name or "Alex Mercer",
		text = payload.text,
		timestamp = os.time(),
	}
	table.insert(initialComments, 1, comm)
	for _, r in ipairs(initialReels) do
		if r.id == payload.reelId then
			r.commentsCount += 1
			break
		end
	end
	Nerve.FireAllClients("FlipTokService", "NewCommentAdded", comm)
	return true, nil, comm
end

function FlipTokService:UploadReel(player: Player, payload: { caption: string, musicTrack: string })
	if not payload.caption or #payload.caption == 0 then return false, "Caption required", nil end
	local reel: FlipTokReel = {
		id = "reel-" .. tostring(os.time()),
		creator = "@" .. (player.Name or "alex_mercer"),
		caption = payload.caption,
		musicTrack = payload.musicTrack or "Original Sound - " .. (player.Name or "Alex Mercer"),
		likes = 1,
		isLiked = true,
		commentsCount = 0,
		shares = 0,
		accentGradient = "linear-gradient(180deg, #1e3a8a 0%, #09090b 100%)",
	}
	table.insert(initialReels, 1, reel)
	Nerve.FireAllClients("FlipTokService", "ReelUploaded", reel)
	return true, nil, reel
end

function FlipTokService:NerveInit()
end

function FlipTokService:NerveStart()
end

return FlipTokService
