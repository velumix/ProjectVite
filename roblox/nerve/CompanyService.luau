--!strict
local Players = game:GetService("Players")
local ReplicatedStorage = game:GetService("ReplicatedStorage")
local Nerve = require(ReplicatedStorage.Nerve)

type CompanyListing = {
	id: string,
	name: string,
	category: string,
	rating: number,
	phone: string,
	address: string,
	open: boolean,
	hiring: boolean,
	jobRole: string,
	hourlyWage: number,
	x: number,
	y: number,
}

type ServiceTicket = {
	ticketId: string,
	companyId: string,
	companyName: string,
	subject: string,
	message: string,
	senderName: string,
	status: string,
	createdAt: number,
}

local INITIAL_COMPANIES: { CompanyListing } = {
	{
		id = "comp-1",
		name = "Los Santos Customs",
		category = "Automotive",
		rating = 4.9,
		phone = "555-0182",
		address = "Carcer Way, Burton",
		open = true,
		hiring = true,
		jobRole = "Master Technician",
		hourlyWage = 120,
		x = -360,
		y = -135,
	},
	{
		id = "comp-2",
		name = "Dynasty 8 Executive",
		category = "Real Estate",
		rating = 4.8,
		phone = "555-0144",
		address = "Alta Street, Downtown",
		open = true,
		hiring = false,
		jobRole = "Property Agent",
		hourlyWage = 95,
		x = -140,
		y = -620,
	},
	{
		id = "comp-3",
		name = "Up-n-Atom Burgers",
		category = "Food & Hospitality",
		rating = 4.6,
		phone = "555-0199",
		address = "Vinewood Boulevard 88",
		open = true,
		hiring = true,
		jobRole = "Shift Supervisor",
		hourlyWage = 45,
		x = 85,
		y = 280,
	},
	{
		id = "comp-4",
		name = "FlyUS Aviation",
		category = "Transport & Logistics",
		rating = 4.7,
		phone = "555-0112",
		address = "LSIA Terminal 4",
		open = false,
		hiring = true,
		jobRole = "Cargo Dispatcher",
		hourlyWage = 150,
		x = -1020,
		y = -2750,
	},
}

local userTickets: { [number]: { ServiceTicket } } = {}

local function getUserTickets(player: Player): { ServiceTicket }
	local userId = player.UserId
	if not userTickets[userId] then
		userTickets[userId] = {
			{
				ticketId = "tkt-01",
				companyId = "comp-1",
				companyName = "Los Santos Customs",
				subject = "Vehicle armor upgrade quote",
				message = "Looking for titanium plating and turbo tune for Sultan RS.",
				senderName = "Alex Mercer",
				status = "in_progress",
				createdAt = os.time() - 7200,
			},
		}
	end
	return userTickets[userId]
end

local CompanyService = {
	Name = "CompanyService",
}

function CompanyService:GetCompanies(player: Player)
	return INITIAL_COMPANIES
end

function CompanyService:GetTickets(player: Player)
	return getUserTickets(player)
end

function CompanyService:ApplyForJob(player: Player, payload: { companyId: string, coverLetter: string })
	local targetComp: CompanyListing? = nil
	for _, c in ipairs(INITIAL_COMPANIES) do
		if c.id == payload.companyId then
			targetComp = c
			break
		end
	end
	if not targetComp then return false, "Company not found" end
	if not targetComp.hiring then return false, "Company is not actively hiring" end

	Nerve.FireClient(player, "CompanyService", "JobApplicationSubmitted", {
		companyId = targetComp.id,
		companyName = targetComp.name,
		role = targetComp.jobRole,
	})
	return true, nil
end

function CompanyService:CreateTicket(player: Player, payload: { companyId: string, subject: string, message: string })
	local targetComp: CompanyListing? = nil
	for _, c in ipairs(INITIAL_COMPANIES) do
		if c.id == payload.companyId then
			targetComp = c
			break
		end
	end
	if not targetComp then return false, "Company not found", nil end

	local list = getUserTickets(player)
	local newTicket: ServiceTicket = {
		ticketId = "tkt-" .. tostring(os.time()),
		companyId = targetComp.id,
		companyName = targetComp.name,
		subject = payload.subject,
		message = payload.message,
		senderName = player.Name,
		status = "open",
		createdAt = os.time(),
	}
	table.insert(list, 1, newTicket)

	Nerve.FireClient(player, "CompanyService", "TicketCreated", newTicket)
	return true, nil, newTicket
end

function CompanyService:NerveInit()
end

function CompanyService:NerveStart()
end

return CompanyService
