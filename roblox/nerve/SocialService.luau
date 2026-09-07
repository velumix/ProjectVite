--!strict
-- Authoritative Social / Feather microblogging service for Roblox Nerve architecture.
-- Manages public posts, timeline feeds, likes, retweets, replies, hashtags, and author profiles.

local Players = game:GetService("Players")

local Nerve = require(script.Parent.Nerve)

export type SocialAuthor = {
	id: string,
	name: string,
	handle: string,
	avatar: string,
	verified: boolean,
}

export type SocialPost = {
	id: string,
	author: SocialAuthor,
	content: string,
	timestamp: number,
	likes: number,
	retweets: number,
	replies: number,
	liked: boolean,
	retweeted: boolean,
	hashtags: { string },
}

local SocialService = Nerve.CreateService({
	Name = "SocialService",
	Client = {
		PostCreated = Nerve.CreateSignal(),
		PostUpdated = Nerve.CreateSignal(),
	},
})

local SEED_POSTS: { SocialPost } = {
	{
		id = "post-1",
		author = {
			id = "auth-weazel",
			name = "Weazel News",
			handle = "weazelnews",
			avatar = "📰",
			verified = true,
		},
		content = "BREAKING: Traffic alert on Del Perro Freeway eastbound due to high-speed pursuit. Avoid the area! #SunCity #TrafficAlert",
		timestamp = 1715000000000,
		likes = 142,
		retweets = 38,
		replies = 15,
		liked = false,
		retweeted = false,
		hashtags = { "SunCity", "TrafficAlert" },
	},
	{
		id = "post-2",
		author = {
			id = "auth-bennys",
			name = "Benny's Original Motor Works",
			handle = "bennyscustoms",
			avatar = "🔧",
			verified = true,
		},
		content = "Fresh batch of widebody kits just arrived for the Karin Sultan RS! Stop by Strawberry today. #Bennys #CarCulture",
		timestamp = 1714995000000,
		likes = 89,
		retweets = 24,
		replies = 8,
		liked = false,
		retweeted = false,
		hashtags = { "Bennys", "CarCulture" },
	},
	{
		id = "post-3",
		author = {
			id = "auth-casino",
			name = "Diamond Casino & Resort",
			handle = "diamondcasino",
			avatar = "💎",
			verified = true,
		},
		content = "Tonight only: Triple payouts on High Stakes Blackjack at the penthouse lounge. Dress to impress. #DiamondCasino #Nightlife",
		timestamp = 1714990000000,
		likes = 210,
		retweets = 56,
		replies = 32,
		liked = true,
		retweeted = false,
		hashtags = { "DiamondCasino", "Nightlife" },
	},
	{
		id = "post-4",
		author = {
			id = "auth-scpd",
			name = "Sun City Police Dept",
			handle = "scpd_official",
			avatar = "🚓",
			verified = true,
		},
		content = "Community safety reminder: Always lock your vehicle doors when parked downtown. Stay alert Sun City! #PublicSafety #SCPD",
		timestamp = 1714982000000,
		likes = 64,
		retweets = 12,
		replies = 4,
		liked = false,
		retweeted = false,
		hashtags = { "PublicSafety", "SCPD" },
	},
}

-- Global post storage
local feedPosts: { SocialPost } = {}
for _, p in ipairs(SEED_POSTS) do
	table.insert(feedPosts, table.clone(p))
end

function SocialService.Client:GetFeed(player: Player, payload: { tag: string?, query: string? }?): { SocialPost }
	local filterTag = payload and payload.tag
	local filterQuery = payload and payload.query and string.lower(payload.query)

	if not filterTag and not filterQuery then
		return feedPosts
	end

	local results: { SocialPost } = {}
	for _, post in ipairs(feedPosts) do
		local matchTag = true
		if filterTag and filterTag ~= "all" then
			matchTag = false
			for _, tag in ipairs(post.hashtags) do
				if string.lower(tag) == string.lower(filterTag) then
					matchTag = true
					break
				end
			end
		end

		local matchQuery = true
		if filterQuery and #filterQuery > 0 then
			matchQuery = string.find(string.lower(post.content), filterQuery, 1, true) ~= nil
				or string.find(string.lower(post.author.name), filterQuery, 1, true) ~= nil
				or string.find(string.lower(post.author.handle), filterQuery, 1, true) ~= nil
		end

		if matchTag and matchQuery then
			table.insert(results, post)
		end
	end

	return results
end

function SocialService.Client:CreatePost(player: Player, payload: { content: string, hashtags: { string }? }): (boolean, SocialPost?, string?)
	if type(payload) ~= "table" or type(payload.content) ~= "string" then
		return false, nil, "Invalid post payload"
	end

	local trimmed = string.match(payload.content, "^%s*(.-)%s*$") or ""
	if #trimmed == 0 then
		return false, nil, "Post cannot be empty"
	end
	if #trimmed > 280 then
		return false, nil, "Post exceeds 280 characters"
	end

	local tags: { string } = {}
	if type(payload.hashtags) == "table" then
		for _, t in ipairs(payload.hashtags) do
			if type(t) == "string" and #t > 0 then
				table.insert(tags, t)
			end
		end
	end

	-- Extract any #tags from content if not explicitly provided
	for word in string.gmatch(trimmed, "#(%w+)") do
		local alreadyHas = false
		for _, existing in ipairs(tags) do
			if string.lower(existing) == string.lower(word) then
				alreadyHas = true
				break
			end
		end
		if not alreadyHas then
			table.insert(tags, word)
		end
	end

	local newPost: SocialPost = {
		id = "post-" .. tostring(os.time()) .. "-" .. tostring(math.random(100, 999)),
		author = {
			id = "user-" .. tostring(player.UserId),
			name = player.DisplayName or player.Name,
			handle = string.lower(player.Name),
			avatar = "👤",
			verified = false,
		},
		content = trimmed,
		timestamp = DateTime.now().UnixTimestampMillis,
		likes = 0,
		retweets = 0,
		replies = 0,
		liked = false,
		retweeted = false,
		hashtags = tags,
	}

	table.insert(feedPosts, 1, newPost)
	self.PostCreated:Fire(player, newPost)
	return true, newPost, nil
end

function SocialService.Client:ToggleLike(player: Player, payload: { postId: string }): (boolean, boolean?, number?, string?)
	if type(payload) ~= "table" or type(payload.postId) ~= "string" then
		return false, nil, nil, "Invalid post id"
	end

	for _, post in ipairs(feedPosts) do
		if post.id == payload.postId then
			post.liked = not post.liked
			post.likes = post.likes + (if post.liked then 1 else -1)
			self.PostUpdated:Fire(player, post)
			return true, post.liked, post.likes, nil
		end
	end

	return false, nil, nil, "Post not found"
end

function SocialService.Client:ToggleRetweet(player: Player, payload: { postId: string }): (boolean, boolean?, number?, string?)
	if type(payload) ~= "table" or type(payload.postId) ~= "string" then
		return false, nil, nil, "Invalid post id"
	end

	for _, post in ipairs(feedPosts) do
		if post.id == payload.postId then
			post.retweeted = not post.retweeted
			post.retweets = post.retweets + (if post.retweeted then 1 else -1)
			self.PostUpdated:Fire(player, post)
			return true, post.retweeted, post.retweets, nil
		end
	end

	return false, nil, nil, "Post not found"
end

function SocialService.Client:DeletePost(player: Player, payload: { postId: string }): (boolean, string?)
	if type(payload) ~= "table" or type(payload.postId) ~= "string" then
		return false, "Invalid post id"
	end

	for i, post in ipairs(feedPosts) do
		if post.id == payload.postId then
			table.remove(feedPosts, i)
			return true, nil
		end
	end

	return false, "Post not found"
end

return SocialService
