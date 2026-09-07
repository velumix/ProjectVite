import type { RobloxInstanceJson } from './RobloxRenderer.tsx'

const scaleAndAnchorTree: RobloxInstanceJson = {
  ClassName: 'Frame',
  Name: 'ScaleAndAnchor',
  Size: { X: { Scale: 0, Offset: 280 }, Y: { Scale: 0, Offset: 170 } },
  Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 16 } },
  AnchorPoint: { X: 0, Y: 0 },
  Rotation: -2,
  ClipsDescendants: true,
  BorderSizePixel: 1,
  BorderColor3: { R: 0.96, G: 0.65, B: 0.14 },
  BackgroundColor3: { R: 0.067, G: 0.078, B: 0.102 },
  Children: [
    {
      ClassName: 'TextLabel',
      Name: 'AnchorLabel',
      Text: 'Scale + AnchorPoint',
      TextSize: 18,
      TextColor3: { R: 0.96, G: 0.97, B: 0.98 },
      TextXAlignment: 'Center',
      TextYAlignment: 'Center',
      Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 42 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.5, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      Children: [
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
        { ClassName: 'UIScale', Scale: 1.05 },
      ],
    },
  ],
}

const layoutAndTextTree: RobloxInstanceJson = {
  ClassName: 'Frame',
  Name: 'Inventory',
  Size: { X: { Scale: 0, Offset: 280 }, Y: { Scale: 0, Offset: 170 } },
  Position: { X: { Scale: 0, Offset: 312 }, Y: { Scale: 0, Offset: 16 } },
  BackgroundColor3: { R: 0.067, G: 0.078, B: 0.102 },
  Children: [
    {
      ClassName: 'TextButton',
      Name: 'BuyButton',
      LayoutOrder: 2,
      Text: 'Second item',
      TextSize: 15,
      TextWrapped: true,
      TextXAlignment: 'Center',
      TextYAlignment: 'Center',
      TextColor3: { R: 0.96, G: 0.97, B: 0.98 },
      Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 48 } },
      BackgroundColor3: { R: 0.09, G: 0.106, B: 0.133 },
      Children: [{ ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 8 } }],
    },
    {
      ClassName: 'TextLabel',
      Name: 'FirstByLayoutOrder',
      LayoutOrder: 1,
      Text: '<b>First item</b> via RichText',
      RichText: true,
      TextSize: 15,
      TextXAlignment: 'Left',
      TextYAlignment: 'Center',
      TextColor3: { R: 0.96, G: 0.65, B: 0.14 },
      Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 0, Offset: 48 } },
    },
    {
      ClassName: 'UIListLayout',
      FillDirection: 'Vertical',
      Padding: { Scale: 0, Offset: 8 },
      HorizontalAlignment: 'Center',
      VerticalAlignment: 'Top',
      SortOrder: 'LayoutOrder',
    },
    {
      ClassName: 'UIPadding',
      PaddingTop: { Scale: 0, Offset: 16 },
      PaddingRight: { Scale: 0, Offset: 16 },
      PaddingBottom: { Scale: 0, Offset: 16 },
      PaddingLeft: { Scale: 0, Offset: 16 },
    },
  ],
}

const scrollingTree: RobloxInstanceJson = {
  ClassName: 'ScrollingFrame',
  Name: 'ScrollingPreview',
  Size: { X: { Scale: 0, Offset: 280 }, Y: { Scale: 0, Offset: 170 } },
  Position: { X: { Scale: 0, Offset: 16 }, Y: { Scale: 0, Offset: 206 } },
  CanvasSize: { X: { Scale: 0, Offset: 0 }, Y: { Scale: 0, Offset: 420 } },
  AutomaticCanvasSize: 'Y',
  ScrollBarThickness: 8,
  BackgroundColor3: { R: 0.067, G: 0.078, B: 0.102 },
  Children: [
    {
      ClassName: 'TextLabel',
      Name: 'ScrollHeader',
      Text: 'ScrollingFrame canvas',
      TextSize: 16,
      TextColor3: { R: 0.96, G: 0.65, B: 0.14 },
      Size: { X: { Scale: 1, Offset: -24 }, Y: { Scale: 0, Offset: 36 } },
      Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 12 } },
    },
    {
      ClassName: 'ImageLabel',
      Name: 'ImagePreview',
      Image: 'rbxassetid://0',
      Size: { X: { Scale: 0, Offset: 100 }, Y: { Scale: 0, Offset: 100 } },
      Position: { X: { Scale: 0, Offset: 12 }, Y: { Scale: 0, Offset: 70 } },
      BackgroundColor3: { R: 0.09, G: 0.106, B: 0.133 },
    },
  ],
}

const constraintsTree: RobloxInstanceJson = {
  ClassName: 'Frame',
  Name: 'Constraints',
  Size: { X: { Scale: 0, Offset: 280 }, Y: { Scale: 0, Offset: 170 } },
  Position: { X: { Scale: 0, Offset: 312 }, Y: { Scale: 0, Offset: 206 } },
  BackgroundColor3: { R: 0.067, G: 0.078, B: 0.102 },
  Children: [
    {
      ClassName: 'TextLabel',
      Name: 'ConstraintLabel',
      Text: 'Aspect + Size + Text constraints',
      TextSize: 20,
      TextWrapped: true,
      TextXAlignment: 'Center',
      TextYAlignment: 'Center',
      TextColor3: { R: 0.96, G: 0.97, B: 0.98 },
      Size: { X: { Scale: 0.8, Offset: 0 }, Y: { Scale: 0.8, Offset: 0 } },
      Position: { X: { Scale: 0.5, Offset: 0 }, Y: { Scale: 0.5, Offset: 0 } },
      AnchorPoint: { X: 0.5, Y: 0.5 },
      Children: [
        { ClassName: 'UIAspectRatioConstraint', AspectRatio: 2.2 },
        { ClassName: 'UISizeConstraint', MinSize: { X: 150, Y: 50 }, MaxSize: { X: 240, Y: 110 } },
        { ClassName: 'UITextSizeConstraint', MinTextSize: 12, MaxTextSize: 20 },
        { ClassName: 'UICorner', CornerRadius: { Scale: 0, Offset: 10 } },
      ],
    },
  ],
}

export const previewTrees: RobloxInstanceJson[] = [
  scaleAndAnchorTree,
  layoutAndTextTree,
  scrollingTree,
  constraintsTree,
]

export const previewTree: RobloxInstanceJson = {
  ClassName: 'ScreenGui',
  Name: 'RendererPreviewGui',
  Children: previewTrees,
}
