--!strict

-- Studio plugin receiver for the ProjectVite localhost bridge.
-- Enable HTTP requests for Studio plugins before using this script.
local HttpService = game:GetService("HttpService")
local CollectionService = game:GetService("CollectionService")

local BRIDGE_URL = "http://127.0.0.1:3210/v1/updates"
local MANAGED_ATTRIBUTE = "ProjectViteManaged"
local PATH_ATTRIBUTE = "ProjectVitePath"
local HASH_ATTRIBUTE = "ProjectViteHash"
local MANAGED_TAG = "ProjectViteManaged"
local root = game:GetService("Workspace"):FindFirstChild("ProjectViteSync")

local function getRoot(): Folder
	if root and root:IsA("Folder") then
		if root:GetAttribute(MANAGED_ATTRIBUTE) ~= true or not CollectionService:HasTag(root, MANAGED_TAG) then
			error("[ProjectVite] Workspace.ProjectViteSync exists but is not managed by this plugin")
		end
		return root
	end
	local created = Instance.new("Folder")
	created.Name = "ProjectViteSync"
	created:SetAttribute(MANAGED_ATTRIBUTE, true)
	CollectionService:AddTag(created, MANAGED_TAG)
	created.Parent = game:GetService("Workspace")
	root = created
	return created
end

local function poll()
	local ok, response = pcall(HttpService.GetAsync, HttpService, BRIDGE_URL)
	if not ok then warn(`[ProjectVite] bridge unavailable: {response}`); return end
	local decoded = HttpService:JSONDecode(response)
	if decoded.bundle == nil then return end
	for _, operation in decoded.bundle.operations do
		if operation.type == "delete" then
			local target = findManaged(operation.path)
			if target then target:Destroy() end
		elseif operation.type == "upsert" and operation.tree then
			applyInstance(operation.path, operation.tree, operation.hash)
		end
	end
	applyArtifacts(decoded.bundle.artifacts)
end

function findManaged(path: string): Instance?
	for _, descendant in getRoot():GetDescendants() do
		if descendant:GetAttribute(PATH_ATTRIBUTE) == path then return descendant end
	end
	return nil
end

function parentPath(path: string): string?
	return string.match(path, "^(.*)/[^/]+$")
end

function applyInstance(path: string, tree: any, hash: string)
	local instance = findManaged(path)
	if not instance then
		local parent = getRoot()
		local parentPathValue = parentPath(path)
		if parentPathValue then parent = findManaged(parentPathValue) or parent end
		instance = Instance.new(tree.ClassName)
		instance.Parent = parent
	end
	instance.Name = tree.Name or tree.ClassName
	instance:SetAttribute(MANAGED_ATTRIBUTE, true)
	instance:SetAttribute(PATH_ATTRIBUTE, path)
	instance:SetAttribute(HASH_ATTRIBUTE, hash)
	CollectionService:AddTag(instance, MANAGED_TAG)
	for property, value in tree do
		if property ~= "ClassName" and property ~= "Name" and property ~= "Children" then
			local converted = fromJson(property, value)
			pcall(function() (instance :: any)[property] = converted end)
		end
	end
end

function fromJson(property: string, value: any): any
	if property == "BackgroundColor3" or property == "BorderColor3" or property == "TextColor3" or property == "ImageColor3" then
		return Color3.new(value.R, value.G, value.B)
	elseif property == "AnchorPoint" or property == "Vector2" or property == "MinSize" or property == "MaxSize" then
		return Vector2.new(value.X, value.Y)
	elseif property == "Position" or property == "Size" or property == "CanvasSize" or property == "Padding" or string.match(property, "^Padding") or property == "CornerRadius" then
		if value.X and value.Y then return UDim2.new(value.X.Scale, value.X.Offset, value.Y.Scale, value.Y.Offset) end
		return UDim.new(value.Scale, value.Offset)
	elseif property == "AutomaticCanvasSize" or property == "FillDirection" or property == "HorizontalAlignment" or property == "VerticalAlignment" or property == "SortOrder" or property == "TextXAlignment" or property == "TextYAlignment" or property == "Font" then
		local enumType = ({ AutomaticCanvasSize = "AutomaticSize", FillDirection = "FillDirection", HorizontalAlignment = "HorizontalAlignment", VerticalAlignment = "VerticalAlignment", SortOrder = "SortOrder", TextXAlignment = "TextXAlignment", TextYAlignment = "TextYAlignment", Font = "Font" })[property]
		return Enum[enumType][value]
	end
	return value
end

function applyArtifacts(artifacts: any)
	local parent = getRoot():FindFirstChild("Modules")
	if not parent then
		parent = Instance.new("Folder")
		parent.Name = "Modules"
		parent.Parent = getRoot()
	end
	for _, artifact in artifacts or {} do
		local name = string.gsub(artifact.path, "[^%w_]", "_")
		local module = parent:FindFirstChild(name)
		if module and module:GetAttribute(MANAGED_ATTRIBUTE) ~= true then
			error(`[ProjectVite] refusing to overwrite unrelated module {name}`)
		end
		if not module then
			module = Instance.new("ModuleScript")
			module.Name = name
			module.Parent = parent
		end
		module:SetAttribute(MANAGED_ATTRIBUTE, true)
		module:SetAttribute(PATH_ATTRIBUTE, `/Modules/{artifact.path}`)
		module:SetAttribute(HASH_ATTRIBUTE, artifact.hash)
		pcall(function() (module :: ModuleScript).Source = artifact.source end)
	end
end

task.spawn(function()
	while true do
		poll()
		task.wait(1)
	end
end)
