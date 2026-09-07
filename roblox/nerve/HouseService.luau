--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type PropertyKey = {
	keyId: string,
	holderName: string,
	issuedAt: number,
}

type HousingProperty = {
	id: string,
	label: string,
	address: string,
	tier: string,
	isLocked: boolean,
	alarmActive: boolean,
	hasStash: boolean,
	garageSlots: number,
	x: number,
	y: number,
	keys: { PropertyKey },
}

local INITIAL_PROPERTIES: { HousingProperty } = {
	{
		id = "prop-1",
		label = "Eclipse Towers Penthouse 3",
		address = "South Boulevard Del Perro, Rockford Hills",
		tier = "Luxury Penthouse",
		isLocked = true,
		alarmActive = true,
		hasStash = true,
		garageSlots = 10,
		x = -775,
		y = 312,
		keys = {
			{ keyId = "key-1", holderName = "Alex Mercer", issuedAt = os.time() - 86400 * 30 },
			{ keyId = "key-2", holderName = "Jordan Hayes", issuedAt = os.time() - 86400 * 5 },
		},
	},
	{
		id = "prop-2",
		label = "Vinewood Hills Stilt House",
		address = "2044 North Conker Avenue, Vinewood",
		tier = "Designer Villa",
		isLocked = false,
		alarmActive = false,
		hasStash = true,
		garageSlots = 6,
		x = -260,
		y = 1320,
		keys = {
			{ keyId = "key-3", holderName = "Alex Mercer", issuedAt = os.time() - 86400 * 14 },
		},
	},
	{
		id = "prop-3",
		label = "Vespucci Canals Waterfront",
		address = "Canal Walkway 4B, Vespucci",
		tier = "Beach Townhome",
		isLocked = true,
		alarmActive = true,
		hasStash = false,
		garageSlots = 2,
		x = -1150,
		y = -1420,
		keys = {
			{ keyId = "key-4", holderName = "Alex Mercer", issuedAt = os.time() - 86400 * 60 },
		},
	},
}

local playerProperties: { [number]: { HousingProperty } } = {}

local function getPlayerProperties(player: Player): { HousingProperty }
	local userId = player.UserId
	if not playerProperties[userId] then
		local copy: { HousingProperty } = {}
		for _, prop in ipairs(INITIAL_PROPERTIES) do
			local keysCopy = {}
			for _, k in ipairs(prop.keys) do
				table.insert(keysCopy, { keyId = k.keyId, holderName = k.holderName, issuedAt = k.issuedAt })
			end
			table.insert(copy, {
				id = prop.id,
				label = prop.label,
				address = prop.address,
				tier = prop.tier,
				isLocked = prop.isLocked,
				alarmActive = prop.alarmActive,
				hasStash = prop.hasStash,
				garageSlots = prop.garageSlots,
				x = prop.x,
				y = prop.y,
				keys = keysCopy,
			})
		end
		playerProperties[userId] = copy
	end
	return playerProperties[userId]
end

local HouseService = {
	Name = "HouseService",
}

function HouseService:GetProperties(player: Player)
	local props = getPlayerProperties(player)
	return props
end

function HouseService:ToggleLock(player: Player, payload: { propertyId: string })
	local props = getPlayerProperties(player)
	for _, prop in ipairs(props) do
		if prop.id == payload.propertyId then
			prop.isLocked = not prop.isLocked
			Nerve.FireClient(player, "HouseService", "PropertyUpdated", prop)
			return true, prop.isLocked, nil
		end
	end
	return false, false, "Property not found"
end

function HouseService:ToggleAlarm(player: Player, payload: { propertyId: string })
	local props = getPlayerProperties(player)
	for _, prop in ipairs(props) do
		if prop.id == payload.propertyId then
			prop.alarmActive = not prop.alarmActive
			Nerve.FireClient(player, "HouseService", "PropertyUpdated", prop)
			return true, prop.alarmActive, nil
		end
	end
	return false, false, "Property not found"
end

function HouseService:ShareKey(player: Player, payload: { propertyId: string, recipientName: string })
	local props = getPlayerProperties(player)
	for _, prop in ipairs(props) do
		if prop.id == payload.propertyId then
			local newKey = {
				keyId = "key-" .. tostring(os.time()),
				holderName = payload.recipientName,
				issuedAt = os.time(),
			}
			table.insert(prop.keys, newKey)
			Nerve.FireClient(player, "HouseService", "PropertyUpdated", prop)
			return true, newKey, nil
		end
	end
	return false, nil, "Property not found"
end

function HouseService:RevokeKey(player: Player, payload: { propertyId: string, keyId: string })
	local props = getPlayerProperties(player)
	for _, prop in ipairs(props) do
		if prop.id == payload.propertyId then
			for i, k in ipairs(prop.keys) do
				if k.keyId == payload.keyId then
					table.remove(prop.keys, i)
					Nerve.FireClient(player, "HouseService", "PropertyUpdated", prop)
					return true, nil
				end
			end
			return false, "Key not found"
		end
	end
	return false, "Property not found"
end

function HouseService:NerveInit()
end

function HouseService:NerveStart()
end

return HouseService
