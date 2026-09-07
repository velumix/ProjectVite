--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type SkyRide = {
	id: string,
	driverName: string,
	vehicleModel: string,
	licensePlate: string,
	pickup: string,
	destination: string,
	fare: number,
	status: string,
	etaMinutes: number,
	driverRating: number,
}

type SkyRideHistory = {
	id: string,
	destination: string,
	date: string,
	fare: number,
}

local activeRide: SkyRide? = nil

local initialHistory: { SkyRideHistory } = {
	{ id = "ride-h1", destination = "Del Perro Pier", date = "Yesterday", fare = 45 },
	{ id = "ride-h2", destination = "Diamond Casino & Resort", date = "3 days ago", fare = 65 },
}

local SkyRideService = {
	Name = "SkyRideService",
}

function SkyRideService:GetRideStatus(player: Player)
	return {
		activeRide = activeRide,
		history = initialHistory,
	}
end

function SkyRideService:RequestRide(player: Player, payload: {
	pickup: string,
	destination: string,
	tier: string,
})
	if not payload.destination or #payload.destination == 0 then
		return false, "Destination required", nil
	end

	local fare = 35
	local vehicle = "Albany Primo"
	if payload.tier == "Executive" then
		fare = 75
		vehicle = "Enus Windsor Drop"
	elseif payload.tier == "XL" then
		fare = 90
		vehicle = "Gallivanter Baller ST"
	end

	local ride: SkyRide = {
		id = "ride-" .. tostring(os.time()),
		driverName = "Dmitri Vance",
		vehicleModel = vehicle,
		licensePlate = "SKY-" .. tostring(math.random(100, 999)),
		pickup = payload.pickup or "Current GPS Location",
		destination = payload.destination,
		fare = fare,
		status = "accepted",
		etaMinutes = 2,
		driverRating = 4.95,
	}
	activeRide = ride
	Nerve.FireAllClients("SkyRideService", "RideStatusChanged", ride)
	return true, nil, ride
end

function SkyRideService:CancelRide(player: Player)
	if not activeRide then return false, "No active ride", nil end
	local canceledId = activeRide.id
	activeRide = nil
	Nerve.FireAllClients("SkyRideService", "RideUpdated", { id = canceledId, status = "cancelled" })
	return true, nil, canceledId
end

function SkyRideService:NerveInit()
end

function SkyRideService:NerveStart()
end

return SkyRideService
