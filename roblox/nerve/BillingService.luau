--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type InvoiceItem = {
	id: string,
	title: string,
	sender: string,
	amount: number,
	dueDate: number,
	status: string, -- "unpaid" | "paid" | "overdue"
	category: string, -- "citation" | "utility" | "service" | "tax"
	issuedAt: number,
}

local INITIAL_INVOICES: { InvoiceItem } = {
	{
		id = "inv-101",
		title = "Excessive Speed (85 in 55 MPH)",
		sender = "Los Santos Police Dept",
		amount = 450,
		dueDate = os.time() + 86400 * 3,
		status = "unpaid",
		category = "citation",
		issuedAt = os.time() - 86400 * 2,
	},
	{
		id = "inv-102",
		title = "Monthly Utility & Grid Maintenance",
		sender = "LS Water & Power",
		amount = 185,
		dueDate = os.time() + 86400 * 7,
		status = "unpaid",
		category = "utility",
		issuedAt = os.time() - 86400 * 1,
	},
	{
		id = "inv-103",
		title = "Performance Tuning & Body Repair",
		sender = "Los Santos Customs",
		amount = 1250,
		dueDate = os.time() - 86400 * 1,
		status = "overdue",
		category = "service",
		issuedAt = os.time() - 86400 * 10,
	},
	{
		id = "inv-104",
		title = "Q3 Municipal Property Tax",
		sender = "San Andreas Treasury Dept",
		amount = 890,
		dueDate = os.time() - 86400 * 20,
		status = "paid",
		category = "tax",
		issuedAt = os.time() - 86400 * 45,
	},
}

local playerInvoices: { [number]: { InvoiceItem } } = {}

local function getPlayerInvoices(player: Player): { InvoiceItem }
	local userId = player.UserId
	if not playerInvoices[userId] then
		local copy: { InvoiceItem } = {}
		for _, inv in ipairs(INITIAL_INVOICES) do
			table.insert(copy, {
				id = inv.id,
				title = inv.title,
				sender = inv.sender,
				amount = inv.amount,
				dueDate = inv.dueDate,
				status = inv.status,
				category = inv.category,
				issuedAt = inv.issuedAt,
			})
		end
		playerInvoices[userId] = copy
	end
	return playerInvoices[userId]
end

local BillingService = {
	Name = "BillingService",
}

function BillingService:GetInvoices(player: Player)
	local list = getPlayerInvoices(player)
	return list
end

function BillingService:PayInvoice(player: Player, payload: { invoiceId: string })
	local list = getPlayerInvoices(player)
	for _, inv in ipairs(list) do
		if inv.id == payload.invoiceId then
			if inv.status == "paid" then
				return false, "Invoice is already paid"
			end
			inv.status = "paid"
			Nerve.FireClient(player, "BillingService", "InvoicePaid", inv)
			return true, nil, inv
		end
	end
	return false, "Invoice not found", nil
end

function BillingService:PayAll(player: Player)
	local list = getPlayerInvoices(player)
	local paidCount = 0
	local totalAmount = 0
	for _, inv in ipairs(list) do
		if inv.status ~= "paid" then
			inv.status = "paid"
			paidCount += 1
			totalAmount += inv.amount
		end
	end
	Nerve.FireClient(player, "BillingService", "InvoicesBatchPaid", list)
	return true, paidCount, totalAmount
end

function BillingService:NerveInit()
end

function BillingService:NerveStart()
end

return BillingService
