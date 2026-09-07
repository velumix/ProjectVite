--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

local initialScores: { [string]: number } = {
	snake = 120,
	memory = 45,
	["number-merge"] = 2048,
	minesweeper = 180,
	["tower-stack"] = 34,
	["sky-flappy"] = 28,
	["neon-drop"] = 520,
}

local GameScoreService = {
	Name = "GameScoreService",
}

function GameScoreService:GetGameScores(player: Player)
	return initialScores
end

function GameScoreService:SubmitScore(player: Player, payload: { gameId: string, score: number })
	if not payload.gameId then return false, "Game ID required", nil end
	local currentHigh = initialScores[payload.gameId] or 0
	if payload.score > currentHigh then
		initialScores[payload.gameId] = payload.score
		Nerve.FireAllClients("GameScoreService", "ScoreUpdated", { gameId = payload.gameId, highScore = payload.score })
		return true, nil, payload.score
	end
	return true, nil, currentHigh
end

function GameScoreService:ResetScore(player: Player, payload: { gameId: string })
	if not payload.gameId then return false, "Game ID required" end
	initialScores[payload.gameId] = 0
	Nerve.FireAllClients("GameScoreService", "ScoreUpdated", { gameId = payload.gameId, highScore = 0 })
	return true, nil
end

function GameScoreService:NerveInit()
end

function GameScoreService:NerveStart()
end

return GameScoreService
