--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type CryptoHolding = {
	coin: string,
	name: string,
	symbol: string,
	amount: number,
	valueUsd: number,
	change24h: number,
	priceUsd: number,
}

type CryptoTransaction = {
	id: string,
	coin: string,
	side: string, -- "buy" | "sell" | "transfer"
	amount: number,
	totalUsd: number,
	timestamp: number,
	recipient: string?,
}

type CryptoState = {
	walletAddress: string,
	holdings: { [string]: number }, -- coin -> amount
	transactions: { CryptoTransaction },
}

local COIN_PRICES: { [string]: { name: string, symbol: string, priceUsd: number, change24h: number } } = {
	BTC = { name = "Bitcoin", symbol = "BTC", priceUsd = 64250, change24h = 3.4 },
	ETH = { name = "Ethereum", symbol = "ETH", priceUsd = 3450, change24h = -1.2 },
	SUN = { name = "SunCoin", symbol = "SUN", priceUsd = 12.80, change24h = 8.7 },
	SHIB = { name = "Shiba Sun", symbol = "SHIB", priceUsd = 0.000028, change24h = 14.2 },
}

local playerWallets: { [number]: CryptoState } = {}

local function getPlayerWallet(player: Player): CryptoState
	local userId = player.UserId
	if not playerWallets[userId] then
		local addr = string.format("0x%04x...%04x", math.random(0x1000, 0xffff), math.random(0x1000, 0xffff))
		playerWallets[userId] = {
			walletAddress = addr,
			holdings = {
				BTC = 0.045,
				ETH = 0.85,
				SUN = 120,
				SHIB = 2500000,
			},
			transactions = {
				{
					id = "tx-1",
					coin = "BTC",
					side = "buy",
					amount = 0.045,
					totalUsd = 2891.25,
					timestamp = os.time() - 86400,
				},
				{
					id = "tx-2",
					coin = "SUN",
					side = "buy",
					amount = 120,
					totalUsd = 1536.00,
					timestamp = os.time() - 3600,
				}
			}
		}
	end
	return playerWallets[userId]
end

local CryptoService = {
	Name = "CryptoService",
}

function CryptoService:GetPortfolio(player: Player)
	local wallet = getPlayerWallet(player)
	local list: { CryptoHolding } = {}
	local totalValue = 0

	for coin, info in pairs(COIN_PRICES) do
		local amount = wallet.holdings[coin] or 0
		local val = amount * info.priceUsd
		totalValue += val
		table.insert(list, {
			coin = coin,
			name = info.name,
			symbol = info.symbol,
			amount = amount,
			valueUsd = val,
			change24h = info.change24h,
			priceUsd = info.priceUsd,
		})
	end

	return list, totalValue, wallet.walletAddress, wallet.transactions
end

function CryptoService:TradeCoin(player: Player, payload: { coin: string, side: string, amount: number })
	local wallet = getPlayerWallet(player)
	local info = COIN_PRICES[payload.coin]
	if not info then
		return false, "Unsupported cryptocurrency"
	end
	if payload.amount <= 0 then
		return false, "Trade amount must be positive"
	end

	local coinCost = payload.amount * info.priceUsd

	if payload.side == "buy" then
		-- In full game, deducts from BankingService
		wallet.holdings[payload.coin] = (wallet.holdings[payload.coin] or 0) + payload.amount
	elseif payload.side == "sell" then
		local cur = wallet.holdings[payload.coin] or 0
		if cur < payload.amount then
			return false, "Insufficient crypto balance to sell"
		end
		wallet.holdings[payload.coin] = cur - payload.amount
	else
		return false, "Invalid trade side"
	end

	local tx: CryptoTransaction = {
		id = "tx-" .. tostring(os.time()) .. "-" .. tostring(math.random(100, 999)),
		coin = payload.coin,
		side = payload.side,
		amount = payload.amount,
		totalUsd = coinCost,
		timestamp = os.time(),
	}
	table.insert(wallet.transactions, 1, tx)

	-- Signal wallet update
	local list, totalVal, addr, txs = self:GetPortfolio(player)
	Nerve.FireClient(player, "CryptoService", "PortfolioUpdated", list, totalVal, txs)

	return true, nil, tx
end

function CryptoService:TransferCoin(player: Player, payload: { coin: string, amount: number, toAddress: string })
	local wallet = getPlayerWallet(player)
	local info = COIN_PRICES[payload.coin]
	if not info then return false, "Unsupported cryptocurrency" end
	if payload.amount <= 0 then return false, "Transfer amount must be positive" end
	if not payload.toAddress or #payload.toAddress < 6 then return false, "Invalid destination wallet address" end

	local cur = wallet.holdings[payload.coin] or 0
	if cur < payload.amount then return false, "Insufficient balance" end

	wallet.holdings[payload.coin] = cur - payload.amount
	local tx: CryptoTransaction = {
		id = "tx-" .. tostring(os.time()) .. "-" .. tostring(math.random(100, 999)),
		coin = payload.coin,
		side = "transfer",
		amount = payload.amount,
		totalUsd = payload.amount * info.priceUsd,
		timestamp = os.time(),
		recipient = payload.toAddress,
	}
	table.insert(wallet.transactions, 1, tx)

	local list, totalVal, addr, txs = self:GetPortfolio(player)
	Nerve.FireClient(player, "CryptoService", "PortfolioUpdated", list, totalVal, txs)

	return true, nil, tx
end

function CryptoService:NerveInit()
	-- Initialized
end

function CryptoService:NerveStart()
	-- Started
end

return CryptoService
