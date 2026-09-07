--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type EmergencyAlert = {
	id: string,
	title: string,
	department: string,
	category: string, -- "police" | "fire" | "weather" | "ems" | "civic"
	severity: string, -- "critical" | "warning" | "advisory"
	location: string,
	x: number,
	y: number,
	description: string,
	timestamp: number,
	active: boolean,
}

local INITIAL_ALERTS: { EmergencyAlert } = {
	{
		id = "alert-01",
		title = "Severe Weather & High Surf Warning",
		department = "Emergency Management Agency",
		category = "weather",
		severity = "warning",
		location = "Del Perro Pier & Coastal Highway",
		x = -1600,
		y = -1000,
		description = "Gale force gusts up to 55 knots expected along western shoreline. Small craft and swimmers seek shelter.",
		timestamp = os.time() - 1800,
		active = true,
	},
	{
		id = "alert-02",
		title = "Code 3: Armed Robbery in Progress",
		department = "San Andreas State Police",
		category = "police",
		severity = "critical",
		location = "Legion Square / San Andreas Ave",
		x = 150,
		y = -1040,
		description = "Multiple armed suspects reported on scene. Perimeter established. Civilians avoid area.",
		timestamp = os.time() - 900,
		active = true,
	},
	{
		id = "alert-03",
		title = "Structure Fire 2nd Alarm",
		department = "Los Santos Fire & Rescue",
		category = "fire",
		severity = "critical",
		location = "El Burro Heights Industrial Park",
		x = 1200,
		y = -1400,
		description = "Commercial warehouse blaze. Engine 4 and Ladder 2 responding on TAC-3.",
		timestamp = os.time() - 3600,
		active = true,
	},
	{
		id = "alert-04",
		title = "Multi-Vehicle Collision Traffic Delay",
		department = "Department of Transportation",
		category = "civic",
		severity = "advisory",
		location = "La Puerta Fwy Northbound",
		x = -400,
		y = -1200,
		description = "Right two lanes blocked due to overturned flatbed. Expect 20-minute delays.",
		timestamp = os.time() - 7200,
		active = false,
	},
}

local allAlerts: { EmergencyAlert } = {}
for _, a in ipairs(INITIAL_ALERTS) do
	table.insert(allAlerts, {
		id = a.id,
		title = a.title,
		department = a.department,
		category = a.category,
		severity = a.severity,
		location = a.location,
		x = a.x,
		y = a.y,
		description = a.description,
		timestamp = a.timestamp,
		active = a.active,
	})
end

local EmergencyService = {
	Name = "EmergencyService",
}

function EmergencyService:GetAlerts(player: Player)
	return allAlerts
end

function EmergencyService:PublishAlert(player: Player, payload: {
	title: string,
	department: string,
	category: string,
	severity: string,
	location: string,
	x: number,
	y: number,
	description: string,
})
	local newAlert: EmergencyAlert = {
		id = "alert-" .. tostring(os.time()),
		title = payload.title,
		department = payload.department,
		category = payload.category,
		severity = payload.severity,
		location = payload.location,
		x = payload.x,
		y = payload.y,
		description = payload.description,
		timestamp = os.time(),
		active = true,
	}
	table.insert(allAlerts, 1, newAlert)
	Nerve.FireAllClients("EmergencyService", "AlertBroadcasted", newAlert)
	return true, newAlert
end

function EmergencyService:ResolveAlert(player: Player, payload: { alertId: string })
	for _, a in ipairs(allAlerts) do
		if a.id == payload.alertId then
			a.active = false
			Nerve.FireAllClients("EmergencyService", "AlertResolved", a)
			return true, nil
		end
	end
	return false, "Alert not found"
end

function EmergencyService:NerveInit()
end

function EmergencyService:NerveStart()
end

return EmergencyService
