import { previewTree } from './preview-tree.ts'
import {
  exportRobloxTreeToLuau,
  normalizeRobloxInstanceTree,
} from './roblox-luau-export.ts'

// Preview-only export artifacts. The normalized structure is the comparison
// target for a future Luau parser or Studio round-trip harness.
export const previewLuau = exportRobloxTreeToLuau(previewTree)
export const previewStructure = normalizeRobloxInstanceTree(previewTree)
