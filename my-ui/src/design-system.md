# UI design system mapping

The canonical style definitions live in [`roblox/ui/styles.luau`](../../roblox/ui/styles.luau). The Vite preview adapter in [`src/roblox-style-translator.ts`](./roblox-style-translator.ts) consumes a generated or parsed representation of those definitions and translates supported Roblox properties into web styles.

The semantic classes in `index.css` are preview conveniences. Roblox property names and nested UI objects remain the source of truth.

| Web token or class | Roblox UI translation |
| --- | --- |
| `background` | `BackgroundColor3` on the root `ScreenGui` frame |
| `surface` | `BackgroundColor3` on a `Frame` |
| `border` | `UIStroke.Color` and `UIStroke.Transparency` |
| `text` | `TextColor3` |
| `text-muted` | `TextColor3` with a muted color or higher `TextTransparency` |
| `primary` | `BackgroundColor3` for primary actions |
| `ui-panel` | `Frame` + `UICorner` + `UIPadding` + optional `UIStroke` |
| `ui-card` | `Frame` + `UICorner` + `UIStroke`, with `surface-hover` on interaction |
| `ui-button ui-button-primary` | `TextButton` + `UICorner` + `UIPadding`; primary `BackgroundColor3` |
| `ui-button ui-button-secondary` | `TextButton` + `UICorner` + `UIPadding` + `UIStroke` |
| `ui-input` | `TextBox` + `UICorner` + `UIPadding` + `UIStroke` |
| `ui-badge` | `TextLabel` + pill `UICorner` + optional status `UIStroke` |
| `ui-text-title` | `TextLabel.TextSize` + `FontFace.Weight = Bold` |
| `ui-text-body` | `TextLabel.TextSize` + regular `FontFace` |
| `ui-text-muted` | `TextLabel.TextColor3` + optional `TextTransparency` |
| `ui-divider` | Thin `Frame` using the border color |
| spacing tokens | `UIPadding.Padding*` and `UIListLayout.Padding` |
| `radius-*` tokens | `UICorner.CornerRadius` |
| `transparency-*` tokens | `BackgroundTransparency` or `TextTransparency` |

The translator's `SUPPORTED_ROBLOX_PROPERTIES` registry is deliberately separate from the canonical values. It can later be generated or validated against a Roblox API dump so unsupported properties are reported before preview code uses them.

Use `UIGradient` only as an optional surface or accent treatment later. It is not required by the core classes.
