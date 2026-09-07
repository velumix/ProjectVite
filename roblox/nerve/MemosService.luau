--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type VoiceMemo = {
	id: string,
	title: string,
	durationSec: number,
	date: string,
	waveform: { number },
	notes: string,
}

local initialMemos: { VoiceMemo } = {
	{
		id = "memo-1",
		title = "Undercover Wiretap - Port of LS",
		durationSec = 42,
		date = "Yesterday",
		waveform = { 0.2, 0.5, 0.8, 0.4, 0.9, 0.3, 0.7, 0.6, 0.8, 0.5, 0.2, 0.4, 0.6, 0.7 },
		notes = "Intercepted shipment drop coordinates at Terminal 4.",
	},
	{
		id = "memo-2",
		title = "Engine Sound Diagnostics - Sultan RS",
		durationSec = 18,
		date = "3 days ago",
		waveform = { 0.1, 0.3, 0.6, 0.9, 0.95, 0.8, 0.6, 0.4, 0.2, 0.5, 0.7, 0.3 },
		notes = "Wastegate rattle at 4500 RPM on boost pull.",
	},
}

local MemosService = {
	Name = "MemosService",
}

function MemosService:GetMemos(player: Player)
	return initialMemos
end

function MemosService:SaveMemo(player: Player, payload: { title: string, durationSec: number, notes: string })
	if not payload.title or #payload.title == 0 then return false, "Title required", nil end
	local item: VoiceMemo = {
		id = "memo-" .. tostring(os.time()),
		title = payload.title,
		durationSec = payload.durationSec or 15,
		date = "Today",
		waveform = { 0.3, 0.6, 0.8, 0.9, 0.7, 0.5, 0.8, 0.6, 0.4, 0.7, 0.5, 0.3 },
		notes = payload.notes or "",
	}
	table.insert(initialMemos, 1, item)
	Nerve.FireAllClients("MemosService", "MemoSaved", item)
	return true, nil, item
end

function MemosService:DeleteMemo(player: Player, payload: { id: string })
	for i, m in ipairs(initialMemos) do
		if m.id == payload.id then
			table.remove(initialMemos, i)
			Nerve.FireAllClients("MemosService", "MemoDeleted", { id = payload.id })
			return true, nil, payload.id
		end
	end
	return false, "Memo not found", nil
end

function MemosService:NerveInit()
end

function MemosService:NerveStart()
end

return MemosService
