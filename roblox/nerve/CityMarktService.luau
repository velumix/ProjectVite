--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type MarketplaceListing = {
	id: string,
	title: string,
	price: number,
	category: string,
	sellerName: string,
	sellerPhone: string,
	description: string,
	date: string,
	likes: number,
}

local initialListings: { MarketplaceListing } = {
	{
		id = "cm-1",
		title = "Custom Declasse Granger 3600LX",
		price = 145000,
		category = "vehicles",
		sellerName = "Dominic 'Dom' T.",
		sellerPhone = "555-0199",
		description = "Armored plating, Imani tech missile lock-on jammer installed. Clean title.",
		date = "2 hours ago",
		likes = 14,
	},
	{
		id = "cm-2",
		title = "Unlocked Cypher OS Drone Rig",
		price = 12500,
		category = "electronics",
		sellerName = "ZeroByte",
		sellerPhone = "555-0842",
		description = "FPV thermal optics with long range encrypted transmitter.",
		date = "5 hours ago",
		likes = 8,
	},
	{
		id = "cm-3",
		title = "Vespucci Canals 2BR Studio Loft",
		price = 480000,
		category = "properties",
		sellerName = "Dynasty 8 Realty",
		sellerPhone = "555-0310",
		description = "Spectacular canal front balcony, rooftop helipad access, modern minimalist interior.",
		date = "Yesterday",
		likes = 29,
	},
}

local CityMarktService = {
	Name = "CityMarktService",
}

function CityMarktService:GetListings(player: Player)
	return initialListings
end

function CityMarktService:PostListing(player: Player, payload: {
	title: string,
	price: number,
	category: string,
	description: string,
})
	if not payload.title or #payload.title == 0 then
		return false, "Title required", nil
	end

	local item: MarketplaceListing = {
		id = "cm-" .. tostring(os.time()),
		title = payload.title,
		price = payload.price or 1000,
		category = payload.category or "vehicles",
		sellerName = "Alex Mercer",
		sellerPhone = "555-0143",
		description = payload.description or "",
		date = "Just now",
		likes = 0,
	}
	table.insert(initialListings, 1, item)
	Nerve.FireAllClients("CityMarktService", "ListingPosted", item)
	return true, nil, item
end

function CityMarktService:LikeListing(player: Player, payload: { id: string })
	for _, l in ipairs(initialListings) do
		if l.id == payload.id then
			l.likes += 1
			Nerve.FireAllClients("CityMarktService", "ListingLiked", { id = payload.id, likes = l.likes })
			return true, nil, l.likes
		end
	end
	return false, "Listing not found", nil
end

function CityMarktService:NerveInit()
end

function CityMarktService:NerveStart()
end

return CityMarktService
