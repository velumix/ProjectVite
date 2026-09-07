--!strict
-- Authoritative Garage & Vehicle Management service for Roblox Nerve architecture.
-- Manages player owned vehicles, garage storage, remote key fob actions (lock/engine),
-- GPS tracking, and valet delivery.

local Players = game:GetService("Players")

local Nerve = require(script.Parent.Nerve)

export type VehicleCategory = "sports" | "super" | "suv" | "sedan" | "motorcycle" | "compact"
export type VehicleStatus = "stored" | "out" | "impounded"

export type VehicleItem = {
	id: string,
	plate: string,
	model: string,
	label: string,
	category: VehicleCategory,
	garage: string,
	status: VehicleStatus,
	fuel: number,
	engineHealth: number,
	bodyHealth: number,
	isLocked: boolean,
	engineOn: boolean,
	x: number,
	y: number,
}

local GarageService = Nerve.CreateService({
	Name = "GarageService",
	Client = {
		VehicleStateChanged = Nerve.CreateSignal(),
	},
})

local DEFAULT_VEHICLES: { VehicleItem } = {
	{
		id: "veh-1",
		plate: "SUN-042",
		model: "ninef2",
		label: "Obey 9F Cabrio",
		category: "sports",
		garage: "Legion Square Garage",
		status: "out",
		fuel: 85,
		engineHealth: 92,
		bodyHealth: 95,
		isLocked: false,
		engineOn: false,
		x: 180,
		y: -1020,
	},
	{
		id: "veh-2",
		plate: "FAST-77",
		model: "zentorno",
		label: "Pegassi Zentorno",
		category: "super",
		garage: "Pillbox Hill Garage",
		status: "stored",
		fuel: 68,
		engineHealth: 98,
		bodyHealth: 100,
		isLocked: true,
		engineOn: false,
		x: 310,
		y: -140,
	},
	{
		id: "veh-3",
		plate: "VIP-881",
		model: "schafter3",
		label: "Benefactor Schafter V12",
		category: "sedan",
		garage: "Central Park Underground",
		status: "stored",
		fuel: 94,
		engineHealth: 100,
		bodyHealth: 98,
		isLocked: true,
		engineOn: false,
		x: 50,
		y: -800,
	},
	{
		id: "veh-4",
		plate: "DRIFT-9",
		model: "sultanrs",
		label: "Karin Sultan RS",
		category: "sports",
		garage: "Benny's Workshop",
		status: "stored",
		fuel: 48,
		engineHealth: 75,
		bodyHealth: 82,
		isLocked: true,
		engineOn: false,
		x: -205,
		y: -1310,
	},
	{
		id: "veh-5",
		plate: "COP-301",
		model: "gresley",
		label: "Bravado Gresley SUV",
		category: "suv",
		garage: "Davis Impound Lot",
		status: "impounded",
		fuel: 100,
		engineHealth: 100,
		bodyHealth: 100,
		isLocked: true,
		engineOn: false,
		x: 400,
		y: -1600,
	},
}

-- Per player vehicle list
local playerVehicles: { [Player]: { VehicleItem } } = {}

local function getOrCreateVehicles(player: Player): { VehicleItem }
	local list = playerVehicles[player]
	if not list then
		list = {}
		for _, v in ipairs(DEFAULT_VEHICLES) do
			table.insert(list, table.clone(v))
		end
		playerVehicles[player] = list
	end
	return list
end

function GarageService.Client:GetVehicles(player: Player): { VehicleItem }
	return getOrCreateVehicles(player)
end

function GarageService.Client:ToggleLock(player: Player, payload: { plate: string }): (boolean, boolean?, string?)
	if type(payload) ~= "table" or type(payload.plate) ~= "string" then
		return false, nil, "Invalid plate"
	end

	local vehicles = getOrCreateVehicles(player)
	for _, v in ipairs(vehicles) do
		if v.plate == payload.plate then
			v.isLocked = not v.isLocked
			self.VehicleStateChanged:Fire(player, v)
			return true, v.isLocked, nil
		end
	end

	return false, nil, "Vehicle not found"
end

function GarageService.Client:ToggleEngine(player: Player, payload: { plate: string }): (boolean, boolean?, string?)
	if type(payload) ~= "table" or type(payload.plate) ~= "string" then
		return false, nil, "Invalid plate"
	end

	local vehicles = getOrCreateVehicles(player)
	for _, v in ipairs(vehicles) do
		if v.plate == payload.plate then
			if v.status == "stored" or v.status == "impounded" then
				return false, nil, "Vehicle is currently stored in garage"
			end
			v.engineOn = not v.engineOn
			self.VehicleStateChanged:Fire(player, v)
			return true, v.engineOn, nil
		end
	end

	return false, nil, "Vehicle not found"
end

function GarageService.Client:RequestValet(player: Player, payload: { plate: string }): (boolean, VehicleItem?, string?)
	if type(payload) ~= "table" or type(payload.plate) ~= "string" then
		return false, nil, "Invalid plate"
	end

	local vehicles = getOrCreateVehicles(player)
	for _, v in ipairs(vehicles) do
		if v.plate == payload.plate then
			if v.status == "impounded" then
				return false, nil, "Vehicle is impounded. Visit the impound lot to release."
			end
			v.status = "out"
			v.garage = "Delivered to Player"
			v.isLocked = false
			self.VehicleStateChanged:Fire(player, v)
			return true, v, nil
		end
	end

	return false, nil, "Vehicle not found"
end

function GarageService.Client:TrackVehicle(player: Player, payload: { plate: string }): (boolean, { x: number, y: number, label: string }?, string?)
	if type(payload) ~= "table" or type(payload.plate) ~= "string" then
		return false, nil, "Invalid plate"
	end

	local vehicles = getOrCreateVehicles(player)
	for _, v in ipairs(vehicles) do
		if v.plate == payload.plate then
			return true, { x = v.x, y = v.y, label = v.label .. " (" .. v.plate .. ")" }, nil
		end
	end

	return false, nil, "Vehicle not found"
end

Players.PlayerRemoving:Connect(function(player)
	playerVehicles[player] = nil
end)

return GarageService
