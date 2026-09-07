--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type LocalPost = {
	id: string,
	title: string,
	category: string,
	author: string,
	phone: string,
	district: string,
	body: string,
	likes: number,
	isLiked: boolean,
	timestamp: number,
	x: number,
	y: number,
}

local initialPosts: { LocalPost } = {
	{
		id = "post-1",
		title = "24/7 Mobile Locksmith & Key Duplication",
		category = "Services",
		author = "LockMaster_Dan",
		phone = "555-0141",
		district = "Pillbox Hill",
		body = "Locked out of your penthouse or supercar? Rapid mobile response across Los Santos.",
		likes = 18,
		isLiked = false,
		timestamp = os.time() - 3600,
		x = -200,
		y = -700,
	},
	{
		id = "post-2",
		title = "Custom Lowrider Hydraulics & Neon Kit Tuning",
		category = "Automotive",
		author = "BennyJunior",
		phone = "555-0177",
		district = "Strawberry",
		body = "Airbags, bouncing hydraulics, candy pearl paint coats and custom sound systems.",
		likes = 34,
		isLiked = false,
		timestamp = os.time() - 7200,
		x = 120,
		y = -1350,
	},
	{
		id = "post-3",
		title = "Executive Armored Chauffeur & VIP Escort",
		category = "Services",
		author = "ApexShield_LS",
		phone = "555-0188",
		district = "Rockford Hills",
		body = "Discreet bullet-resistant transport for high net worth clients and syndicates.",
		likes = 12,
		isLiked = false,
		timestamp = os.time() - 14400,
		x = -750,
		y = -220,
	},
}

local LocalPagesService = {
	Name = "LocalPagesService",
}

function LocalPagesService:GetPosts(player: Player)
	return initialPosts
end

function LocalPagesService:CreatePost(player: Player, payload: {
	title: string,
	category: string,
	district: string,
	body: string,
	phone: string,
})
	if not payload.title or #payload.title == 0 then return false, "Title required", nil end
	local post: LocalPost = {
		id = "post-" .. tostring(os.time()),
		title = payload.title,
		category = payload.category,
		author = player.Name or "Alex Mercer",
		phone = payload.phone or "555-0199",
		district = payload.district or "Los Santos",
		body = payload.body or "",
		likes = 0,
		isLiked = false,
		timestamp = os.time(),
		x = 0,
		y = 0,
	}
	table.insert(initialPosts, 1, post)
	Nerve.FireAllClients("LocalPagesService", "PostPublished", post)
	return true, nil, post
end

function LocalPagesService:LikePost(player: Player, payload: { postId: string })
	for _, p in ipairs(initialPosts) do
		if p.id == payload.postId then
			if p.isLiked then
				p.isLiked = false
				p.likes = math.max(0, p.likes - 1)
			else
				p.isLiked = true
				p.likes += 1
			end
			Nerve.FireAllClients("LocalPagesService", "PostLiked", {
				postId = p.id,
				likes = p.likes,
				isLiked = p.isLiked,
			})
			return true, nil, p.likes
		end
	end
	return false, "Post not found", nil
end

function LocalPagesService:NerveInit()
end

function LocalPagesService:NerveStart()
end

return LocalPagesService
