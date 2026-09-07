--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type MedicalId = {
	bloodType: string,
	allergies: string,
	emergencyContactName: string,
	emergencyContactPhone: string,
	organDonor: boolean,
}

type HealthStats = {
	heartRate: number,
	steps: number,
	calories: number,
	activeMinutes: number,
	bloodOxygen: number,
	stamina: number,
	hunger: number,
	hydration: number,
	medicalId: MedicalId,
}

local userStats: { [number]: HealthStats } = {}

local function getUserStats(player: Player): HealthStats
	local userId = player.UserId
	if not userStats[userId] then
		userStats[userId] = {
			heartRate = 72,
			steps = 8420,
			calories = 540,
			activeMinutes = 48,
			bloodOxygen = 99,
			stamina = 95,
			hunger = 80,
			hydration = 85,
			medicalId = {
				bloodType = "O+",
				allergies = "Penicillin, Latex",
				emergencyContactName = "Sarah Mercer",
				emergencyContactPhone = "555-0199",
				organDonor = true,
			},
		}
	end
	return userStats[userId]
end

local HealthService = {
	Name = "HealthService",
}

function HealthService:GetStats(player: Player)
	return getUserStats(player)
end

function HealthService:UpdateMedicalId(player: Player, payload: MedicalId)
	local stats = getUserStats(player)
	stats.medicalId = payload
	Nerve.FireClient(player, "HealthService", "HealthStatsUpdated", stats)
	return true, nil, stats
end

function HealthService:SendSosBeacon(player: Player)
	local stats = getUserStats(player)
	Nerve.FireAllClients("HealthService", "SosBeaconTriggered", {
		playerName = player.Name,
		bloodType = stats.medicalId.bloodType,
		heartRate = stats.heartRate,
		timestamp = os.time(),
	})
	return true, nil
end

function HealthService:NerveInit()
end

function HealthService:NerveStart()
end

return HealthService
