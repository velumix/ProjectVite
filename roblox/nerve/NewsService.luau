--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type NewsArticle = {
	id: string,
	headline: string,
	category: string,
	author: string,
	content: string,
	timestamp: number,
	views: number,
	isBreaking: boolean,
}

local initialArticles: { NewsArticle } = {
	{
		id = "art-1",
		headline = "Downtown Vault Breach: Suspects Evade State Police in High-Speed Pursuit",
		category = "crime",
		author = "Jack Howitzer",
		content = "A coordinated heist at Union Depository triggered a citywide alert early this morning. Multiple black armored SUVs were spotted fleeing northbound on Del Perro Freeway. SAPD tactical units remain deployed.",
		timestamp = os.time() - 1800,
		views = 1420,
		isBreaking = true,
	},
	{
		id = "art-2",
		headline = "City Council Passes Historic Infrastructure Bill for Elysian Island",
		category = "politics",
		author = "Dana Sterling",
		content = "Mayor and City Council members voted 8-1 to approve the $400M port expansion and transit overhaul project aimed at modernizing container docks and railway terminals.",
		timestamp = os.time() - 7200,
		views = 680,
		isBreaking = false,
	},
	{
		id = "art-3",
		headline = "Vinewood Bowl Unveils Stellar Summer Lineup Featuring Top Artists",
		category = "entertainment",
		author = "Chloe Vance",
		content = "Tickets for the 2026 Vinewood Summer Concert Series go live on Dynasty Ticketmaster this Friday. Expect performances from top hip-hop, synthwave, and indie headliners.",
		timestamp = os.time() - 18000,
		views = 930,
		isBreaking = false,
	},
}

local NewsService = {
	Name = "NewsService",
}

function NewsService:GetArticles(player: Player)
	return initialArticles
end

function NewsService:PublishArticle(player: Player, payload: {
	headline: string,
	category: string,
	content: string,
	isBreaking: boolean,
})
	if not payload.headline or #payload.headline == 0 then return false, "Headline required", nil end
	local art: NewsArticle = {
		id = "art-" .. tostring(os.time()),
		headline = payload.headline,
		category = payload.category,
		author = player.Name or "Weazel Bureau",
		content = payload.content,
		timestamp = os.time(),
		views = 1,
		isBreaking = payload.isBreaking or false,
	}
	table.insert(initialArticles, 1, art)
	Nerve.FireAllClients("NewsService", "ArticlePublished", art)
	return true, nil, art
end

function NewsService:IncrementView(player: Player, payload: { articleId: string })
	for _, a in ipairs(initialArticles) do
		if a.id == payload.articleId then
			a.views += 1
			return true, nil, a.views
		end
	end
	return false, "Article not found", nil
end

function NewsService:NerveInit()
end

function NewsService:NerveStart()
end

return NewsService
