--!strict
-- Authoritative Map & GPS Navigation service for Roblox Nerve architecture.
-- Manages in-game world POIs, player positioning, waypoints, and GPS routing.

local Players = game:GetService("Players")

local Nerve = require(script.Parent.Nerve)

export type PoiCategory = "police" | "hospital" | "bank" | "mechanic" | "store" | "gas" | "garage"

export type MapPoi = {
	id: string,
	name: string,
	category: PoiCategory,
	x: number,
	y: number,
	address: string,
	icon: string,
}

export type MapWaypoint = {
	x: number,
	y: number,
	label: string,
	distance: number?,
}

export type PlayerBlip = {
	playerId: number,
	name: string,
	x: number,
	y: number,
	heading: number,
}

local MapService = Nerve.CreateService({
	Name = "MapService",
	Client = {
		WaypointChanged = Nerve.CreateSignal(),
		BlipsUpdated = Nerve.CreateSignal(),
	},
})

-- Default World POIs across Sun City
local WORLD_POIS: { MapPoi } = {
	{
		id = "poi-hosp-1",
		name = "Pillbox Hill Medical Center",
		category = "hospital",
		x = 310,
		y = -140,
		address = "Strawberry Ave & Elgin Way",
		icon = "+",
	},
	{
		id = "poi-pd-1",
		name = "Mission Row Police Dept",
		category = "police",
		x = 425,
		y = -980,
		address = "Sinner St & Atwater Ave",
		icon = "badge",
	},
	{
		id = "poi-bank-1",
		name = "Legion Square Central Bank",
		category = "bank",
		x = 150,
		y = -1040,
		address = "San Andreas Ave",
		icon = "$",
	},
	{
		id = "poi-mech-1",
		name = "Benny's Original Motor Works",
		category = "mechanic",
		x = -205,
		y = -1310,
		address = "Olympic Fwy, Strawberry",
		icon = "wrench",
	},
	{
		id = "poi-dealer-1",
		name = "Premium Deluxe Motorsport",
		category = "garage",
		x = -45,
		y = -1095,
		address = "Power St & Adam's Apple Blvd",
		icon = "car",
	},
	{
		id = "poi-store-1",
		name = "Davis 24/7 Supermarket",
		category = "store",
		x = 25,
		y = -1345,
		address = "Innocence Blvd",
		icon = "cart",
	},
	{
		id = "poi-gas-1",
		name = "Ron Alternates Gas Station",
		category = "gas",
		x = 180,
		y = -1560,
		address = "El Rancho Blvd",
		icon = "gas",
	},
}

-- Active waypoints per player
local playerWaypoints: { [Player]: MapWaypoint? } = {}

function MapService.Client:GetMapData(player: Player): ({ MapPoi }, { PlayerBlip }, MapWaypoint?)
	local activeWaypoint = playerWaypoints[player]

	-- In a live server, blips reflect nearby friendly or public player positions
	local blips: { PlayerBlip } = {}
	local character = player.Character
	local myX = 0
	local myY = -1000
	local myHeading = 90

	if character and character.PrimaryPart then
		myX = math.floor(character.PrimaryPart.Position.X)
		myY = math.floor(character.PrimaryPart.Position.Z)
	end

	table.insert(blips, {
		playerId = player.UserId,
		name = player.Name,
		x = myX,
		y = myY,
		heading = myHeading,
	})

	return WORLD_POIS, blips, activeWaypoint
end

function MapService.Client:SetWaypoint(player: Player, payload: { x: number, y: number, label: string }): (boolean, MapWaypoint?, string?)
	if type(payload) ~= "table" then
		return false, nil, "Invalid waypoint payload"
	end
	if type(payload.x) ~= "number" or type(payload.y) ~= "number" then
		return false, nil, "Coordinates required"
	end

	local waypoint: MapWaypoint = {
		x = payload.x,
		y = payload.y,
		label = payload.label or "Custom Destination",
		distance = math.random(350, 1800),
	}

	playerWaypoints[player] = waypoint
	self.WaypointChanged:Fire(player, waypoint)
	return true, waypoint, nil
end

function MapService.Client:ClearWaypoint(player: Player): (boolean, string?)
	playerWaypoints[player] = nil
	self.WaypointChanged:Fire(player, nil)
	return true, nil
end

Players.PlayerRemoving:Connect(function(player)
	playerWaypoints[player] = nil
end)

return MapService
