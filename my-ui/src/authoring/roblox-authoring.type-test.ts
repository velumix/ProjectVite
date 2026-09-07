import { instance } from './roblox-authoring.ts'

const frame = instance('Frame', {
  Name: 'Panel',
  Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 80 } },
  BackgroundColor3: { R: 0.1, G: 0.2, B: 0.3 },
  Children: [
    instance('TextLabel', {
      Text: 'Hello',
      TextXAlignment: 'Center',
      Events: { Changed: (property) => property.toUpperCase() },
    }),
  ],
})

const button = instance('TextButton', {
  Text: 'Buy',
  TextXAlignment: 'Center',
  Events: {
    Activated: (input, clickCount) => {
      void input.ClassName
      clickCount.toFixed()
    },
    MouseButton1Click: () => undefined,
  },
})

const layout = instance('UIListLayout', {
  FillDirection: 'Vertical',
  SortOrder: 'LayoutOrder',
  Padding: { Scale: 0, Offset: 8 },
})

// @ts-expect-error Frame does not expose Text.
instance('Frame', { Text: 'invalid' })
// @ts-expect-error TextButton does not expose Frame-only constraint properties.
instance('TextButton', { CornerRadius: { Scale: 0, Offset: 4 } })
// @ts-expect-error Enum values come from the Roblox API dump.
instance('TextLabel', { TextXAlignment: 'Stretch' })
// @ts-expect-error Frame has no Activated event.
instance('Frame', { Events: { Activated: () => undefined } })

void frame
void button
void layout
