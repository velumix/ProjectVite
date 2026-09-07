import { previewTree } from '../renderer/preview-tree.ts'
import type { RobloxFeature } from './feature.ts'

export const PreviewFeature: RobloxFeature = {
  Name: 'PreviewFeature',
  UI: { Tree: previewTree, ActionBindings: [], EffectHooks: [] },
  State: {},
  Actions: {},
  Effects: {},
  Scenarios: [],
  Nerve: { Services: [], Controllers: [] },
  Network: {},
}
