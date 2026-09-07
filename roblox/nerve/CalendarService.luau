--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type CalendarEvent = {
	id: string,
	title: string,
	date: string,
	startTime: string,
	endTime: string,
	location: string,
	category: string,
	reminder: boolean,
}

local initialEvents: { CalendarEvent } = {
	{
		id = "cal-1",
		title = "Legion Square Car Meet",
		date = "Today",
		startTime = "19:00",
		endTime = "21:00",
		location = "Legion Square Parking",
		category = "Racing",
		reminder = true,
	},
	{
		id = "cal-2",
		title = "Maze Bank Heist Briefing",
		date = "Today",
		startTime = "22:30",
		endTime = "23:45",
		location = "Darnell Bros Garment Factory",
		category = "Heist",
		reminder = true,
	},
	{
		id = "cal-3",
		title = "Los Santos City Council Hearing",
		date = "Tomorrow",
		startTime = "10:00",
		endTime = "11:30",
		location = "City Hall chambers",
		category = "Court",
		reminder = false,
	},
}

local CalendarService = {
	Name = "CalendarService",
}

function CalendarService:GetEvents(player: Player)
	return initialEvents
end

function CalendarService:AddEvent(player: Player, payload: {
	title: string,
	date: string,
	startTime: string,
	endTime: string,
	location: string,
	category: string,
})
	if not payload.title or #payload.title == 0 then return false, "Title required", nil end
	local item: CalendarEvent = {
		id = "cal-" .. tostring(os.time()),
		title = payload.title,
		date = payload.date or "Today",
		startTime = payload.startTime or "12:00",
		endTime = payload.endTime or "13:00",
		location = payload.location or "Los Santos",
		category = payload.category or "General",
		reminder = true,
	}
	table.insert(initialEvents, item)
	Nerve.FireAllClients("CalendarService", "CalendarEventAdded", item)
	return true, nil, item
end

function CalendarService:DeleteEvent(player: Player, payload: { id: string })
	for i, ev in ipairs(initialEvents) do
		if ev.id == payload.id then
			table.remove(initialEvents, i)
			Nerve.FireAllClients("CalendarService", "CalendarEventDeleted", { id = payload.id })
			return true, nil, payload.id
		end
	end
	return false, "Event not found", nil
end

function CalendarService:ToggleReminder(player: Player, payload: { id: string })
	for _, ev in ipairs(initialEvents) do
		if ev.id == payload.id then
			ev.reminder = not ev.reminder
			return true, nil, ev.reminder
		end
	end
	return false, "Event not found", nil
end

function CalendarService:NerveInit()
end

function CalendarService:NerveStart()
end

return CalendarService
