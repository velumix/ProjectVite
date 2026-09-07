import { previewTree } from '../renderer/preview-tree.ts'
import type { RobloxFeature } from './feature.ts'

export const PreviewFeature: RobloxFeature = {
  Name: 'PreviewFeature',
  UI: { Tree: previewTree, ActionBindings: [], EffectHooks: [] },
  State: {
    Loading: {
      Visible: true,
      Progress: 0,
      Status: 'Initializing game engine...',
    },
    UI: {
      HUDVisible: false,
      ActivePanel: 'None',
      LastError: null,
    },
    Player: {
      Name: 'Player1',
      Level: 42,
      Money: 500,
      HealthPercent: 1,
      SelectedSlot: 1,
      Inventory: [{ ItemId: 'Bat', Quantity: 1 }],
    },
    EMS: {
      HasActiveCall: false,
    },
  },
  Actions: {},
  Effects: {},
  Scenarios: [],
  Nerve: { Services: [], Controllers: [] },
  Network: {},
}
