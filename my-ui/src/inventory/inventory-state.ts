export type ItemDefinition = {
  id: string
  name: string
  category: string
  description: string
  weight: number
  sprite: number
  action?: 'consume' | 'equip' | 'use'
  health?: number
}

export const items: ItemDefinition[] = [
  { id: 'phone', name: 'Smartphone', category: 'Personal', description: 'Your connection to Sun City. Check messages and keep in touch while you are out.', weight: .2, sprite: 0, action: 'use' },
  { id: 'wallet', name: 'Leather wallet', category: 'Personal', description: 'A worn leather wallet containing your identification and a few business cards.', weight: .1, sprite: 1 },
  { id: 'keys', name: 'Vehicle keys', category: 'Personal', description: 'A key and remote for your personal vehicle. Keep them somewhere safe.', weight: .1, sprite: 2, action: 'use' },
  { id: 'cash', name: 'Cash', category: 'Valuables', description: 'A bundle of banknotes. Carried cash is separate from your account balance.', weight: .0001, sprite: 3 },
  { id: 'lighter', name: 'Red lighter', category: 'Utility', description: 'A pocket-sized refillable lighter. A little spark when you need one.', weight: .1, sprite: 4, action: 'use' },
  { id: 'water', name: 'Water bottle', category: 'Consumable', description: 'Fresh bottled water. Take a moment to rehydrate and restore a little health.', weight: .5, sprite: 5, action: 'consume', health: .05 },
  { id: 'cola', name: 'Cola', category: 'Consumable', description: 'An ice-cold can of cola. A small energy boost for the road ahead.', weight: .35, sprite: 6, action: 'consume', health: .05 },
  { id: 'sandwich', name: 'Toasted sandwich', category: 'Consumable', description: 'A freshly toasted sandwich with lettuce, tomato and cheese. Restores 20% health.', weight: .3, sprite: 7, action: 'consume', health: .2 },
  { id: 'cigarettes', name: 'Cigarette pack', category: 'Personal', description: 'A small red-and-white packet of cigarettes.', weight: .05, sprite: 8 },
  { id: 'cup', name: 'Paper cup', category: 'Utility', description: 'An empty disposable cup. Lightweight and ready for your next coffee.', weight: .05, sprite: 9 },
  { id: 'tape', name: 'Duct tape', category: 'Utility', description: 'A sturdy roll of black tape. Useful for a quick repair.', weight: .3, sprite: 10, action: 'use' },
  { id: 'duffel', name: 'Duffel bag', category: 'Equipment', description: 'A durable black carryall with plenty of room for everyday essentials.', weight: 1.2, sprite: 11, action: 'equip' },
  { id: 'pistol', name: 'Compact pistol', category: 'Equipment', description: 'A compact sidearm carried in its safe inventory state. Equip it to your quick-use bar.', weight: 1.1, sprite: 12, action: 'equip' },
  { id: 'magazine', name: 'Pistol magazine', category: 'Equipment', description: 'A spare magazine for a compatible sidearm.', weight: .2, sprite: 13 },
  { id: 'ammo', name: '9 mm ammunition', category: 'Equipment', description: 'Boxed ammunition. This stack can be split into smaller quantities.', weight: .012, sprite: 14 },
  { id: 'bat', name: 'Wooden bat', category: 'Equipment', description: 'A well-balanced wooden baseball bat.', weight: .9, sprite: 15, action: 'equip' },
  { id: 'cap', name: 'Black cap', category: 'Clothing', description: 'An understated black baseball cap with an adjustable fit.', weight: .1, sprite: 16, action: 'equip' },
  { id: 'glasses', name: 'Sunglasses', category: 'Clothing', description: 'Classic dark frames and tinted lenses.', weight: .05, sprite: 17, action: 'equip' },
  { id: 'hoodie', name: 'Black hoodie', category: 'Clothing', description: 'A heavyweight zip-up hoodie. Made for cool city nights.', weight: .8, sprite: 18, action: 'equip' },
  { id: 'jeans', name: 'Dark jeans', category: 'Clothing', description: 'Relaxed dark denim with subtle stitched detailing.', weight: .7, sprite: 19, action: 'equip' },
  { id: 'shoes', name: 'White sneakers', category: 'Clothing', description: 'A clean pair of comfortable low-top sneakers.', weight: .6, sprite: 20, action: 'equip' },
  { id: 'backpack', name: 'Black backpack', category: 'Clothing', description: 'An everyday backpack with padded straps and multiple compartments.', weight: .8, sprite: 21, action: 'equip' },
]

export const itemById = Object.fromEntries(items.map(item => [item.id, item]))
export type InventoryStack = { id: string; itemId: string; quantity: number }
export type InventoryState = {
  slots: (InventoryStack | null)[]
  quickSlots: (string | null)[]
  equipped: string[]
  nextId: number
  notice: string
  dropped?: { stack: InventoryStack; slot: number; quickSlots: (string | null)[] }
}

export const equipment = [
  { label: 'Head', itemId: 'cap' }, { label: 'Face', itemId: 'glasses' },
  { label: 'Torso', itemId: 'hoodie' }, { label: 'Legs', itemId: 'jeans' },
  { label: 'Feet', itemId: 'shoes' }, { label: 'Accessories', itemId: 'backpack' },
]

export function createInventoryState(): InventoryState {
  const quantities = [1, 1, 1, 2350, 1, 3, 4, 2, 6, 1, 2, 1, 1, 3, 48]
  return {
    slots: Array.from({ length: 30 }, (_, index) => index < quantities.length
      ? { id: `stack-${index}`, itemId: items[index].id, quantity: quantities[index] } : null),
    quickSlots: ['stack-12', 'stack-4', 'stack-7', 'stack-5', null],
    equipped: equipment.map(slot => slot.itemId), nextId: 30, notice: '',
  }
}

export type InventoryAction =
  | { type: 'use' | 'drop'; id: string }
  | { type: 'split'; id: string; quantity: number }
  | { type: 'assign'; id: string; slot: number }
  | { type: 'equipment'; itemId: string }
  | { type: 'equip-item'; itemId: string }
  | { type: 'unequip-item'; itemId: string }
  | { type: 'move'; fromSlot: number; toSlot: number }
  | { type: 'swap-quick'; fromSlot: number; toSlot: number }
  | { type: 'unassign-quick'; slot: number }
  | { type: 'undo-drop' }

export function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  if (action.type === 'equipment') {
    const equipped = state.equipped.includes(action.itemId)
    return { ...state, equipped: equipped ? state.equipped.filter(id => id !== action.itemId) : [...state.equipped, action.itemId], notice: `${itemById[action.itemId]?.name ?? action.itemId} ${equipped ? 'unequipped' : 'equipped'}.` }
  }
  if (action.type === 'equip-item') {
    if (state.equipped.includes(action.itemId)) return state
    return { ...state, equipped: [...state.equipped, action.itemId], notice: `${itemById[action.itemId]?.name ?? action.itemId} equipped.` }
  }
  if (action.type === 'unequip-item') {
    if (!state.equipped.includes(action.itemId)) return state
    return { ...state, equipped: state.equipped.filter(id => id !== action.itemId), notice: `${itemById[action.itemId]?.name ?? action.itemId} unequipped.` }
  }
  if (action.type === 'swap-quick') {
    const { fromSlot, toSlot } = action
    if (fromSlot === toSlot || fromSlot < 0 || toSlot < 0 || fromSlot >= 5 || toSlot >= 5) return state
    const nextQuick = [...state.quickSlots]
    const temp = nextQuick[fromSlot]
    nextQuick[fromSlot] = nextQuick[toSlot]
    nextQuick[toSlot] = temp
    return {
      ...state,
      quickSlots: nextQuick,
      notice: `Quick slot ${fromSlot + 1} and ${toSlot + 1} swapped.`,
    }
  }
  if (action.type === 'unassign-quick') {
    if (action.slot < 0 || action.slot >= 5) return state
    return {
      ...state,
      quickSlots: state.quickSlots.map((id, index) => index === action.slot ? null : id),
      notice: `Quick slot ${action.slot + 1} cleared.`,
    }
  }
  if (action.type === 'move') {
    const { fromSlot, toSlot } = action
    if (fromSlot === toSlot || fromSlot < 0 || toSlot < 0 || fromSlot >= state.slots.length || toSlot >= state.slots.length) {
      return state
    }
    const source = state.slots[fromSlot]
    if (!source) return state
    const target = state.slots[toSlot]
    const sourceItem = itemById[source.itemId]

    if (!target) {
      // Move into empty slot
      const nextSlots = [...state.slots]
      nextSlots[toSlot] = source
      nextSlots[fromSlot] = null
      return {
        ...state,
        slots: nextSlots,
        notice: `Moved ${sourceItem.name} to slot ${toSlot + 1}.`,
      }
    }

    if (target.itemId === source.itemId) {
      // Merge identical stacks
      const nextSlots = [...state.slots]
      nextSlots[toSlot] = { ...target, quantity: target.quantity + source.quantity }
      nextSlots[fromSlot] = null
      // Re-point any quickSlot using source id to target id
      const nextQuick = state.quickSlots.map(id => id === source.id ? target.id : id)
      return {
        ...state,
        slots: nextSlots,
        quickSlots: nextQuick,
        notice: `Combined ${sourceItem.name} (${target.quantity + source.quantity} total).`,
      }
    }

    // Swap two different items
    const targetItem = itemById[target.itemId]
    const nextSlots = [...state.slots]
    nextSlots[toSlot] = source
    nextSlots[fromSlot] = target
    return {
      ...state,
      slots: nextSlots,
      notice: `Swapped ${sourceItem.name} and ${targetItem.name}.`,
    }
  }
  if (action.type === 'undo-drop') {
    if (!state.dropped) return state
    const { stack, slot, quickSlots } = state.dropped
    const target = state.slots[slot] ? state.slots.indexOf(null) : slot
    if (target < 0) return { ...state, notice: 'Free a slot before restoring this item.' }
    return { ...state, slots: state.slots.map((entry, index) => index === target ? stack : entry),
      quickSlots: state.quickSlots.map((entry, index) => entry ?? (quickSlots[index] === stack.id ? stack.id : null)),
      dropped: undefined, notice: `${itemById[stack.itemId].name} restored.` }
  }
  const index = state.slots.findIndex(slot => slot?.id === action.id)
  const stack = state.slots[index]
  if (!stack) return state
  const item = itemById[stack.itemId]
  if (action.type === 'assign') {
    if (action.slot < 0 || action.slot >= 5) return state
    return { ...state, quickSlots: state.quickSlots.map((entry, index) => index === action.slot ? stack.id : entry === stack.id ? null : entry), notice: `${item.name} assigned to quick slot ${action.slot + 1}.` }
  }
  if (action.type === 'drop') return {
    ...state, slots: state.slots.map((entry, slot) => slot === index ? null : entry),
    quickSlots: state.quickSlots.map(id => id === stack.id ? null : id),
    dropped: { stack, slot: index, quickSlots: state.quickSlots }, notice: `Dropped ${stack.quantity.toLocaleString()} \u00d7 ${item.name}.`,
  }
  if (action.type === 'split') {
    const empty = state.slots.indexOf(null)
    if (empty < 0) return { ...state, notice: 'Your inventory is full. Free a slot to split this stack.' }
    if (!Number.isInteger(action.quantity) || action.quantity <= 0 || action.quantity >= stack.quantity) return state
    return { ...state, nextId: state.nextId + 1, slots: state.slots.map((entry, slot) =>
      slot === index ? { ...stack, quantity: stack.quantity - action.quantity } :
        slot === empty ? { ...stack, id: `stack-${state.nextId}`, quantity: action.quantity } : entry), notice: `Split ${action.quantity.toLocaleString()} \u00d7 ${item.name} into a new stack.` }
  }
  if (!item.action) return state
  if (item.action === 'consume') return {
    ...state, slots: state.slots.map((entry, slot) => slot === index ? stack.quantity > 1 ? { ...stack, quantity: stack.quantity - 1 } : null : entry),
    quickSlots: state.quickSlots.map(id => id === stack.id && stack.quantity === 1 ? null : id), notice: `Used ${item.name}.`,
  }
  if (item.action === 'equip') return { ...state, equipped: [...new Set([...state.equipped, item.id])], notice: `${item.name} equipped. Select a quick slot to assign it.` }
  return { ...state, notice: item.id === 'keys' ? 'Your vehicle is nearby in the parking garage.' : item.id === 'lighter' ? 'Lighter ready.' : `${item.name} ready to use.` }
}

export function inventoryWeight(state: InventoryState): number {
  return state.slots.reduce((weight, stack) => weight + (stack ? itemById[stack.itemId].weight * stack.quantity : 0), 0)
    + state.equipped.filter(id => equipment.some(slot => slot.itemId === id)).reduce((weight, id) => weight + itemById[id].weight, 0)
}
