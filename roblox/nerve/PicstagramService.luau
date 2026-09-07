--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type PicStory = {
	id: string,
	username: string,
	hasUnread: boolean,
}

type PicPost = {
	id: string,
	author: string,
	location: string,
	caption: string,
	likes: number,
	isLiked: boolean,
	commentsCount: number,
	timestamp: number,
	gradient: string,
	filterName: string,
}

type PicComment = {
	id: string,
	postId: string,
	author: string,
	text: string,
	timestamp: number,
}

local initialStories: { PicStory } = {
	{ id = "story-1", username = "Your Story", hasUnread = false },
	{ id = "story-2", username = "samantha.ls", hasUnread = true },
	{ id = "story-3", username = "tony_tuner", hasUnread = true },
	{ id = "story-4", username = "bahama_mamas", hasUnread = true },
}

local initialPosts: { PicPost } = {
	{
		id = "post-1",
		author = "samantha.ls",
		location = "Del Perro Pier, Los Santos",
		caption = "Golden hour hitting the Ferris wheel just right 🎡🌅 Always good vibes by the ocean.",
		likes = 428,
		isLiked = false,
		commentsCount = 29,
		timestamp = os.time() - 3600,
		gradient = "linear-gradient(135deg, #f97316 0%, #ec4899 100%)",
		filterName = "Valencia",
	},
	{
		id = "post-2",
		author = "tony_tuner",
		location = "Hao's Special Works",
		caption = "Fresh turbo install and dyno tune on this Bravado Gauntlet Hellfire. 850whp ready for the strip 🏎️💨",
		likes = 1250,
		isLiked = true,
		commentsCount = 88,
		timestamp = os.time() - 14400,
		gradient = "linear-gradient(135deg, #0284c7 0%, #1e1b4b 100%)",
		filterName = "Clarendon",
	},
}

local initialComments: { PicComment } = {
	{
		id = "comm-1",
		postId = "post-1",
		author = "alex_mercer",
		text = "Stunning sunset shots! Del Perro never gets old.",
		timestamp = os.time() - 1800,
	},
}

local PicstagramService = {
	Name = "PicstagramService",
}

function PicstagramService:GetFeed(player: Player)
	return {
		stories = initialStories,
		posts = initialPosts,
	}
end

function PicstagramService:LikePost(player: Player, payload: { postId: string })
	for _, p in ipairs(initialPosts) do
		if p.id == payload.postId then
			if p.isLiked then
				p.isLiked = false
				p.likes = math.max(0, p.likes - 1)
			else
				p.isLiked = true
				p.likes += 1
			end
			Nerve.FireAllClients("PicstagramService", "PostLiked", {
				postId = p.id,
				likes = p.likes,
				isLiked = p.isLiked,
			})
			return true, nil, p.likes
		end
	end
	return false, "Post not found", nil
end

function PicstagramService:GetComments(player: Player, payload: { postId: string })
	local result: { PicComment } = {}
	for _, c in ipairs(initialComments) do
		if c.postId == payload.postId then
			table.insert(result, c)
		end
	end
	return result
end

function PicstagramService:AddComment(player: Player, payload: { postId: string, text: string })
	if not payload.text or #payload.text == 0 then return false, "Text required", nil end
	local comm: PicComment = {
		id = "comm-" .. tostring(os.time()),
		postId = payload.postId,
		author = player.Name or "alex_mercer",
		text = payload.text,
		timestamp = os.time(),
	}
	table.insert(initialComments, 1, comm)
	for _, p in ipairs(initialPosts) do
		if p.id == payload.postId then
			p.commentsCount += 1
			break
		end
	end
	Nerve.FireAllClients("PicstagramService", "PostCommentAdded", comm)
	return true, nil, comm
end

function PicstagramService:CreatePost(player: Player, payload: { caption: string, location: string, filterName: string })
	if not payload.caption or #payload.caption == 0 then return false, "Caption required", nil end
	local post: PicPost = {
		id = "post-" .. tostring(os.time()),
		author = (player.Name or "alex_mercer"):lower(),
		location = payload.location or "Los Santos, SA",
		caption = payload.caption,
		likes = 1,
		isLiked = true,
		commentsCount = 0,
		timestamp = os.time(),
		gradient = "linear-gradient(135deg, #10b981 0%, #064e3b 100%)",
		filterName = payload.filterName or "Normal",
	}
	table.insert(initialPosts, 1, post)
	Nerve.FireAllClients("PicstagramService", "PostCreated", post)
	return true, nil, post
end

function PicstagramService:NerveInit()
end

function PicstagramService:NerveStart()
end

return PicstagramService
