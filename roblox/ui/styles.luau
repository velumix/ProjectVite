-- Canonical UI style definitions.
-- Keep Roblox property names here. The web preview consumes a generated or
-- parsed representation of this file; it must not become the source of truth.

export type Color3 = {
	R: number,
	G: number,
	B: number,
}

export type UDim = {
	Scale: number,
	Offset: number,
}

export type UDim2 = {
	X: UDim,
	Y: UDim,
}

export type ColorSequenceKeypoint = {
	Time: number,
	Value: Color3,
}

export type NumberSequenceKeypoint = {
	Time: number,
	Value: number,
}

export type RobloxStyle = {
	BackgroundColor3: Color3?,
	BackgroundTransparency: number?,
	TextColor3: Color3?,
	TextTransparency: number?,
	TextSize: number?,
	FontFace: {
		Family: string,
		Weight: string,
		Style: string,
	}?,
	Size: UDim2?,
	Position: UDim2?,
	UICorner: {
		CornerRadius: UDim,
	}?,
	UIStroke: {
		Color: Color3?,
		Transparency: number?,
		Thickness: number?,
	}?,
	UIPadding: {
		PaddingTop: UDim?,
		PaddingRight: UDim?,
		PaddingBottom: UDim?,
		PaddingLeft: UDim?,
	}?,
	UIGradient: {
		Color: { ColorSequenceKeypoint },
		Transparency: { NumberSequenceKeypoint }?,
		Rotation: number?,
	}?,
	UIListLayout: {
		FillDirection: string?,
		HorizontalAlignment: string?,
		VerticalAlignment: string?,
		Padding: UDim?,
	}?,
}

local function color3(r: number, g: number, b: number): Color3
	return { R = r, G = g, B = b }
end

local function pixels(offset: number): UDim
	return { Scale = 0, Offset = offset }
end

local function size(width: number, height: number): UDim2
	return { X = pixels(width), Y = pixels(height) }
end

local Styles = {
	Tokens = {
		BackgroundColor3 = color3(0.027, 0.035, 0.051),
		SurfaceColor3 = color3(0.067, 0.078, 0.102),
		SurfaceHoverColor3 = color3(0.090, 0.106, 0.133),
		BorderColor3 = color3(1, 1, 1),
		TextColor3 = color3(0.961, 0.969, 0.980),
		TextMutedColor3 = color3(0.545, 0.580, 0.620),
		PrimaryColor3 = color3(0.961, 0.651, 0.137),
		PrimaryHoverColor3 = color3(1, 0.702, 0.231),
		DangerColor3 = color3(0.937, 0.267, 0.267),
		SuccessColor3 = color3(0.133, 0.773, 0.298),
		WarningColor3 = color3(0.961, 0.620, 0.043),
	},

	Panel = {
		BackgroundColor3 = color3(0.067, 0.078, 0.102),
		BackgroundTransparency = 0,
		UICorner = {
			CornerRadius = pixels(14),
		},
		UIStroke = {
			Color = color3(1, 1, 1),
			Transparency = 0.90,
			Thickness = 1,
		},
		UIPadding = {
			PaddingTop = pixels(20),
			PaddingRight = pixels(20),
			PaddingBottom = pixels(20),
			PaddingLeft = pixels(20),
		},
	},

	Card = {
		BackgroundColor3 = color3(0.067, 0.078, 0.102),
		UICorner = {
			CornerRadius = pixels(12),
		},
		UIStroke = {
			Color = color3(1, 1, 1),
			Transparency = 0.90,
			Thickness = 1,
		},
		UIPadding = {
			PaddingTop = pixels(16),
			PaddingRight = pixels(16),
			PaddingBottom = pixels(16),
			PaddingLeft = pixels(16),
		},
	},

	ButtonPrimary = {
		BackgroundColor3 = color3(0.961, 0.651, 0.137),
		UICorner = {
			CornerRadius = pixels(10),
		},
		UIPadding = {
			PaddingTop = pixels(10),
			PaddingRight = pixels(16),
			PaddingBottom = pixels(10),
			PaddingLeft = pixels(16),
		},
	},

	Input = {
		BackgroundColor3 = color3(0.027, 0.035, 0.051),
		UICorner = {
			CornerRadius = pixels(10),
		},
		UIStroke = {
			Color = color3(1, 1, 1),
			Transparency = 0.90,
			Thickness = 1,
		},
		UIPadding = {
			PaddingTop = pixels(10),
			PaddingRight = pixels(12),
			PaddingBottom = pixels(10),
			PaddingLeft = pixels(12),
		},
	},

	Title = {
		TextColor3 = color3(0.961, 0.969, 0.980),
		TextSize = 24,
		FontFace = {
			Family = "rbxasset://fonts/families/BuilderSans.json",
			Weight = "Bold",
			Style = "Normal",
		},
	},

	Body = {
		TextColor3 = color3(0.961, 0.969, 0.980),
		TextSize = 14,
		FontFace = {
			Family = "rbxasset://fonts/families/BuilderSans.json",
			Weight = "Regular",
			Style = "Normal",
		},
	},

	Stack = {
		UIListLayout = {
			FillDirection = "Vertical",
			HorizontalAlignment = "Left",
			VerticalAlignment = "Top",
			Padding = pixels(12),
		},
	},

	AccentSurface = {
		BackgroundColor3 = color3(0.067, 0.078, 0.102),
		UIGradient = {
			Color = {
				{ Time = 0, Value = color3(0.067, 0.078, 0.102) },
				{ Time = 1, Value = color3(0.027, 0.035, 0.051) },
			},
			Rotation = 90,
		},
	},
}

return Styles
