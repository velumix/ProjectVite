--!strict

-- Authoritative Roblox implementation for the React phone banking app.
-- Keeps financial state, ledger transactions, and balance transfers modular.
local DataStoreService = game:GetService("DataStoreService")
local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)
local S = Nerve.Schema

local BankingStore = DataStoreService:GetDataStore("PlayerData")
local BANKING_DATA_KEY = "BankingState"

export type BankingTransactionKind = "deposit" | "withdrawal" | "transfer_in" | "transfer_out"

export type BankingTransaction = {
	id: string,
	kind: BankingTransactionKind,
	amount: number,
	label: string,
	reference: string,
	createdAt: number,
}

export type BankingOverview = {
	bank: number,
	cash: number,
	currency: string,
	playerId: number,
	playerName: string,
	transactions: {BankingTransaction},
}

local BankingTransactionSchema = S.Struct({
	id = S.String,
	kind = S.String,
	amount = S.Float64,
	label = S.String,
	reference = S.String,
	createdAt = S.Float64,
})

local BankingOverviewSchema = S.Struct({
	bank = S.Float64,
	cash = S.Float64,
	currency = S.String,
	playerId = S.Int32,
	playerName = S.String,
	transactions = S.Array(BankingTransactionSchema),
})

local BankingNotificationSchema = S.Struct({
	kind = S.String,
	amount = S.Float64,
	currency = S.String,
	sender = S.Optional(S.String),
	label = S.Optional(S.String),
})

local BankingService = Nerve.CreateService({
	Name = "BankingService",
	Client = {
		BankingChanged = Nerve.Signal(S.Tuple({BankingNotificationSchema}), {Direction = "server"}),
	},
	Network = {
		GetBankingOverview = Nerve.Method({
			Request = S.Tuple({}),
			Response = S.Tuple({BankingOverviewSchema}),
		}),
		TransferMoney = Nerve.Method({
			Request = S.Struct({
				amount = S.Float64,
				phoneNumber = S.String,
				note = S.Optional(S.String),
			}),
			Response = S.Tuple({S.Boolean, S.Optional(S.String)}),
			RateLimit = {Requests = 10, Window = 1},
		}),
		DepositMoney = Nerve.Method({
			Request = S.Struct({amount = S.Float64}),
			Response = S.Tuple({S.Boolean, S.Optional(S.String)}),
			RateLimit = {Requests = 10, Window = 1},
		}),
		WithdrawMoney = Nerve.Method({
			Request = S.Struct({amount = S.Float64}),
			Response = S.Tuple({S.Boolean, S.Optional(S.String)}),
			RateLimit = {Requests = 10, Window = 1},
		}),
	},
})

type PlayerBankingState = {
	bank: number,
	cash: number,
	transactions: {BankingTransaction},
}

local playerBanking: {[Player]: PlayerBankingState} = {}

local function defaultState(): PlayerBankingState
	return {
		bank = 24850,
		cash = 1240,
		transactions = {
			{
				id = "tx-1",
				kind = "transfer_in",
				amount = 1500,
				label = "Cargo Delivery (Alex Mercer)",
				reference = "REF-98214",
				createdAt = os.time() * 1000 - 3600000 * 2,
			},
			{
				id = "tx-2",
				kind = "transfer_out",
				amount = 350,
				label = "Benny's Motorworks",
				reference = "REF-98188",
				createdAt = os.time() * 1000 - 3600000 * 18,
			},
			{
				id = "tx-3",
				kind = "deposit",
				amount = 5000,
				label = "ATM Deposit (Legion Square)",
				reference = "REF-97992",
				createdAt = os.time() * 1000 - 3600000 * 36,
			},
			{
				id = "tx-4",
				kind = "transfer_out",
				amount = 120,
				label = "Sun City Power & Water",
				reference = "REF-97640",
				createdAt = os.time() * 1000 - 3600000 * 60,
			},
		},
	}
end

local function recordTransaction(
	state: PlayerBankingState,
	kind: BankingTransactionKind,
	amount: number,
	label: string,
	reference: string
)
	local tx: BankingTransaction = {
		id = "tx-" .. HttpService:GenerateGUID(false):sub(1, 8),
		kind = kind,
		amount = amount,
		label = label,
		reference = reference,
		createdAt = os.time() * 1000,
	}
	table.insert(state.transactions, 1, tx)
	if #state.transactions > 30 then
		table.remove(state.transactions)
	end
end

function BankingService.Init()
	Players.PlayerAdded:Connect(function(player)
		playerBanking[player] = defaultState()
	end)

	Players.PlayerRemoving:Connect(function(player)
		playerBanking[player] = nil
	end)

	BankingService.Network.GetBankingOverview:SetCallback(function(player)
		local state = playerBanking[player] or defaultState()
		playerBanking[player] = state

		local overview: BankingOverview = {
			bank = state.bank,
			cash = state.cash,
			currency = "$",
			playerId = player.UserId,
			playerName = player.DisplayName or player.Name,
			transactions = state.transactions,
		}
		return overview
	end)

	BankingService.Network.TransferMoney:SetCallback(function(player, payload)
		local state = playerBanking[player]
		if not state then
			return false, "Banking unavailable."
		end

		local amount = math.floor(payload.amount)
		if amount <= 0 then
			return false, "Invalid transfer amount."
		end

		if state.bank < amount then
			return false, "Insufficient bank funds."
		end

		local ref = "TR-" .. HttpService:GenerateGUID(false):sub(1, 8):upper()
		local memo = payload.note and payload.note ~= "" and payload.note or "Transfer to " .. payload.phoneNumber

		state.bank -= amount
		recordTransaction(state, "transfer_out", amount, memo, ref)

		BankingService.Client.BankingChanged:Fire(player, {
			kind = "transfer_out",
			amount = amount,
			currency = "$",
			label = memo,
		})

		return true, nil
	end)

	BankingService.Network.DepositMoney:SetCallback(function(player, payload)
		local state = playerBanking[player]
		if not state then
			return false, "Banking unavailable."
		end

		local amount = math.floor(payload.amount)
		if amount <= 0 then
			return false, "Invalid deposit amount."
		end

		if state.cash < amount then
			return false, "Insufficient cash on hand."
		end

		local ref = "DEP-" .. HttpService:GenerateGUID(false):sub(1, 8):upper()
		state.cash -= amount
		state.bank += amount
		recordTransaction(state, "deposit", amount, "ATM Cash Deposit", ref)

		BankingService.Client.BankingChanged:Fire(player, {
			kind = "deposit",
			amount = amount,
			currency = "$",
			label = "ATM Cash Deposit",
		})

		return true, nil
	end)

	BankingService.Network.WithdrawMoney:SetCallback(function(player, payload)
		local state = playerBanking[player]
		if not state then
			return false, "Banking unavailable."
		end

		local amount = math.floor(payload.amount)
		if amount <= 0 then
			return false, "Invalid withdrawal amount."
		end

		if state.bank < amount then
			return false, "Insufficient bank funds."
		end

		local ref = "WTH-" .. HttpService:GenerateGUID(false):sub(1, 8):upper()
		state.bank -= amount
		state.cash += amount
		recordTransaction(state, "withdrawal", amount, "ATM Cash Withdrawal", ref)

		BankingService.Client.BankingChanged:Fire(player, {
			kind = "withdrawal",
			amount = amount,
			currency = "$",
			label = "ATM Cash Withdrawal",
		})

		return true, nil
	end)
end

return BankingService
