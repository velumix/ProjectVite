--!strict
-- Authoritative Mail / Email service for Roblox Nerve architecture.
-- Manages inboxes, outgoing sent mail, read status, trash, and notifications.

local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")

local Nerve = require(script.Parent.Nerve)

export type MailItem = {
	id: string,
	sender: string,
	senderName: string,
	senderAddress: string,
	recipient: string,
	subject: string,
	body: string,
	timestamp: number,
	read: boolean,
	folder: string,
	starred: boolean,
}

export type MailboxStats = {
	inboxCount: number,
	unreadCount: number,
	sentCount: number,
	trashCount: number,
}

local MailService = Nerve.CreateService({
	Name = "MailService",
	Client = {
		MailChanged = Nerve.CreateSignal(),
	},
})

-- Server storage per player
local playerMails: { [Player]: { MailItem } } = {}

local function generateDefaultMails(player: Player): { MailItem }
	local now = os.time() * 1000
	local playerEmail = string.lower(player.Name) .. "@suncity.mail"

	return {
		{
			id = "mail-1",
			sender = "City Services <services@suncity.gov>",
			senderName = "City Services",
			senderAddress = "services@suncity.gov",
			recipient = playerEmail,
			subject = "Welcome to Sun City - Resident Handbook",
			body = "Welcome to Sun City! Please remember to register your vehicle at the local DMV and review the municipal guidelines. If you need any assistance, contact emergency or non-emergency dispatch at 555-0111.",
			timestamp = now - 18000000,
			read = false,
			folder = "inbox",
			starred = true,
		},
		{
			id = "mail-2",
			sender = "Sun City Bank <notifications@suncitybank.com>",
			senderName = "Sun City Bank",
			senderAddress = "notifications@suncitybank.com",
			recipient = playerEmail,
			subject = "Account Statement Available",
			body = "Your monthly electronic account statement is now available to download. Please review your recent deposits and transfers in the Sun City Banking mobile app.",
			timestamp = now - 43200000,
			read = true,
			folder = "inbox",
			starred = false,
		},
		{
			id = "mail-3",
			sender = "Premium Deluxe Motorsport <sales@pdm-autos.com>",
			senderName = "PDM Autos",
			senderAddress = "sales@pdm-autos.com",
			recipient = playerEmail,
			subject = "Special Offers on New Imports This Weekend",
			body = "Stop by our showroom on Power Street to check out the newly arrived high-performance tuners and executive sedans. Trade-ins welcomed!",
			timestamp = now - 86400000,
			read = true,
			folder = "inbox",
			starred = false,
		},
		{
			id = "mail-4",
			sender = playerEmail,
			senderName = player.Name,
			senderAddress = playerEmail,
			recipient = "mechanic@bennyscustoms.com",
			subject = "Quote for custom turbo install",
			body = "Hey Benny, can you let me know how much it will cost to get the stage 3 turbo and suspension tuning done on my Banshee?",
			timestamp = now - 129600000,
			read = true,
			folder = "sent",
			starred = false,
		},
	}
end

local function getOrCreateMailbox(player: Player): { MailItem }
	if not playerMails[player] then
		playerMails[player] = generateDefaultMails(player)
	end
	return playerMails[player]
end

local function calculateStats(mails: { MailItem }): MailboxStats
	local inboxCount = 0
	local unreadCount = 0
	local sentCount = 0
	local trashCount = 0

	for _, item in ipairs(mails) do
		if item.folder == "inbox" then
			inboxCount += 1
			if not item.read then
				unreadCount += 1
			end
		elseif item.folder == "sent" then
			sentCount += 1
		elseif item.folder == "trash" then
			trashCount += 1
		end
	end

	return {
		inboxCount = inboxCount,
		unreadCount = unreadCount,
		sentCount = sentCount,
		trashCount = trashCount,
	}
end

function MailService.Client:GetMailbox(player: Player, options: { folder: string?, query: string? }?): ({ MailItem }, MailboxStats)
	local mails = getOrCreateMailbox(player)
	local targetFolder = (options and options.folder) or "inbox"
	local query = (options and options.query and string.lower(options.query)) or nil

	local filtered: { MailItem } = {}
	for _, item in ipairs(mails) do
		local folderMatch = item.folder == targetFolder
		local queryMatch = true
		if query and query ~= "" then
			local sName = string.lower(item.senderName)
			local sSub = string.lower(item.subject)
			local sBody = string.lower(item.body)
			queryMatch = string.find(sName, query, 1, true) ~= nil
				or string.find(sSub, query, 1, true) ~= nil
				or string.find(sBody, query, 1, true) ~= nil
		end

		if folderMatch and queryMatch then
			table.insert(filtered, item)
		end
	end

	local stats = calculateStats(mails)
	return filtered, stats
end

function MailService.Client:SendMail(player: Player, payload: { to: string, subject: string, body: string }): (boolean, MailItem?, string?)
	if type(payload) ~= "table" then
		return false, nil, "Invalid payload"
	end
	if type(payload.to) ~= "string" or payload.to == "" then
		return false, nil, "Recipient required"
	end
	if type(payload.subject) ~= "string" or payload.subject == "" then
		return false, nil, "Subject required"
	end
	if type(payload.body) ~= "string" or payload.body == "" then
		return false, nil, "Message body cannot be empty"
	end

	local mails = getOrCreateMailbox(player)
	local playerEmail = string.lower(player.Name) .. "@suncity.mail"

	local newMail: MailItem = {
		id = "mail-" .. tostring(os.time()) .. "-" .. string.sub(HttpService:GenerateGUID(false), 1, 6),
		sender = playerEmail,
		senderName = player.Name,
		senderAddress = playerEmail,
		recipient = payload.to,
		subject = payload.subject,
		body = payload.body,
		timestamp = os.time() * 1000,
		read = true,
		folder = "sent",
		starred = false,
	}

	table.insert(mails, 1, newMail)
	self.MailChanged:Fire(player, "sent")
	return true, newMail, nil
end

function MailService.Client:MarkMailRead(player: Player, payload: { ids: { string }, read: boolean }): (boolean, string?)
	if type(payload) ~= "table" or type(payload.ids) ~= "table" or type(payload.read) ~= "boolean" then
		return false, "Invalid payload"
	end

	local mails = getOrCreateMailbox(player)
	local idMap = {}
	for _, id in ipairs(payload.ids) do
		idMap[id] = true
	end

	local updated = false
	for _, item in ipairs(mails) do
		if idMap[item.id] then
			item.read = payload.read
			updated = true
		end
	end

	if updated then
		self.MailChanged:Fire(player, "read_status")
	end
	return true, nil
end

function MailService.Client:ToggleMailStar(player: Player, payload: { id: string }): (boolean, boolean, string?)
	if type(payload) ~= "table" or type(payload.id) ~= "string" then
		return false, false, "Invalid payload"
	end

	local mails = getOrCreateMailbox(player)
	for _, item in ipairs(mails) do
		if item.id == payload.id then
			item.starred = not item.starred
			self.MailChanged:Fire(player, "star")
			return true, item.starred, nil
		end
	end

	return false, false, "Mail not found"
end

function MailService.Client:DeleteMail(player: Player, payload: { ids: { string }, permanent: boolean? }): (boolean, string?)
	if type(payload) ~= "table" or type(payload.ids) ~= "table" then
		return false, "Invalid payload"
	end

	local mails = getOrCreateMailbox(player)
	local idMap = {}
	for _, id in ipairs(payload.ids) do
		idMap[id] = true
	end

	local isPermanent = payload.permanent == true

	if isPermanent then
		-- Permanently remove from list
		local remaining: { MailItem } = {}
		for _, item in ipairs(mails) do
			if not idMap[item.id] then
				table.insert(remaining, item)
			end
		end
		playerMails[player] = remaining
	else
		-- Move to trash folder
		for _, item in ipairs(mails) do
			if idMap[item.id] then
				item.folder = "trash"
			end
		end
	end

	self.MailChanged:Fire(player, "delete")
	return true, nil
end

Players.PlayerRemoving:Connect(function(player)
	playerMails[player] = nil
end)

return MailService
