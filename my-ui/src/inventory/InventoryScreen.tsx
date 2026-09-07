import { useEffect, useId, useReducer, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import type { ReactiveBindingStore } from '../bindings/reactive-bindings'
import { createInventoryState, equipment, inventoryReducer, inventoryWeight, itemById, type ItemDefinition, type InventoryStack } from './inventory-state'
import './inventory.css'
import { uiAudio } from '../audio/ui-audio.ts'
import { QuestsScreen } from '../quests/QuestsScreen.tsx'
import { StatsScreen } from '../stats/StatsScreen.tsx'
import { SettingsScreen } from '../settings/SettingsScreen.tsx'
import type { NervePreviewAdapter } from '../nerve/contracts.ts'
import { PhoneScreen } from '../phone/PhoneScreen.tsx'

const assetRoot = `${import.meta.env.BASE_URL}assets/inventory/`
const tabs = ['Inventory', 'Quests', 'Map', 'Phone', 'Stats', 'Settings'] as const
export type MenuPanel = typeof tabs[number]
const menuPanelNames = new Set<string>(tabs)

type Props = {
  panel: string
  bindings: ReactiveBindingStore
  nerve: NervePreviewAdapter
  onPanelChange: (panel: MenuPanel) => void
  onClose: () => void
}

function Icon({ name, className = '' }: { name: 'search' | 'weight' | 'box' | 'plus' | 'mouse' | 'pin' | 'arrow' | 'check'; className?: string }) {
  const paths = {
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    weight: <><path d="M5 7h14l2 14H3ZM9 7V5a3 3 0 0 1 6 0v2" /><path d="M12 11v3" /></>,
    box: <><path d="m12 2 10 6v10l-10 6L2 18V8ZM2 8l10 6 10-6M12 14v10M7 5l10 6" /></>,
    plus: <path d="M12 3v18M3 12h18" />,
    mouse: <><rect x="5" y="2" width="14" height="20" rx="6" /><path d="M12 2v8M5 10h14" /></>,
    pin: <><path d="M20 10c0 6-8 13-8 13S4 16 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="3" /></>,
    arrow: <path d="m9 4 8 8-8 8M3 12h14" />,
    check: <path d="m4 12 5 5L20 6" />,
  }
  return <svg className={className} aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function ItemArt({ item, className = '' }: { item: ItemDefinition; className?: string }) {
  const clipId = useId()
  // Art bounds isolate each object, including the few that extend past a nominal atlas cell.
  const bounds = [
    [40, 16, 175, 253], [272, 45, 265, 220], [560, 36, 195, 238], [775, 35, 285, 238], [1110, 30, 115, 240], [1350, 12, 120, 270],
    [50, 282, 150, 245], [260, 290, 280, 235], [580, 284, 155, 240], [815, 292, 175, 229], [1005, 290, 250, 240], [1258, 278, 275, 240],
    [10, 535, 250, 197], [315, 531, 145, 200], [530, 530, 230, 215], [760, 518, 265, 226], [1012, 548, 240, 190], [1255, 575, 280, 140],
    [10, 733, 240, 268], [310, 735, 155, 269], [495, 762, 265, 210], [775, 738, 245, 276],
  ][item.sprite]
  return <svg aria-hidden="true" className={`inventory-art ${className}`} viewBox={bounds.join(' ')} preserveAspectRatio="xMidYMid meet">
    <defs><clipPath id={clipId}><rect x={bounds[0]} y={bounds[1]} width={bounds[2]} height={bounds[3]} /></clipPath></defs>
    <image href={`${assetRoot}items-atlas.png`} width="1536" height="1024" clipPath={`url(#${clipId})`} />
  </svg>
}

type DragPayload = {
  type: 'grid' | 'quick' | 'equipment'
  id?: string
  slotIndex?: number
  quickIndex?: number
  itemId?: string
}

export function InventoryScreen({ panel, bindings, nerve, onPanelChange, onClose }: Props) {
  const [inventory, dispatch] = useReducer(inventoryReducer, undefined, createInventoryState)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [splitting, setSplitting] = useState(false)
  const [splitQuantity, setSplitQuantity] = useState(1)
  const [inspecting, setInspecting] = useState(false)
  const [panelOpacity, setPanelOpacity] = useState(80)
  const [showQuantities, setShowQuantities] = useState(true)
  const [motion, setMotion] = useState(true)
  const [draggedItem, setDraggedItem] = useState<DragPayload | null>(null)
  const [dragOverTarget, setDragOverTarget] = useState<string | null>(null)
  const [characterRotation, setCharacterRotation] = useState(0)
  const [isRotating, setIsRotating] = useState(false)
  const [dragStart, setDragStart] = useState<{ x: number; rot: number } | null>(null)
  const [zoomLevel, setZoomLevel] = useState(1)

  function handleViewportPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return
    if ((event.target as HTMLElement).closest('.city-viewport-controls')) return
    event.currentTarget.setPointerCapture?.(event.pointerId)
    setIsRotating(true)
    setDragStart({ x: event.clientX, rot: characterRotation })
  }

  function handleViewportPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!isRotating || !dragStart) return
    const deltaX = event.clientX - dragStart.x
    const nextRot = (dragStart.rot + deltaX * 0.75) % 360
    setCharacterRotation(nextRot < 0 ? nextRot + 360 : nextRot)
  }

  function handleViewportPointerUp(event: React.PointerEvent<HTMLDivElement>) {
    if (!isRotating) return
    setIsRotating(false)
    setDragStart(null)
    try {
      event.currentTarget.releasePointerCapture?.(event.pointerId)
    } catch {
      // ignore
    }
  }

  const normalizedYaw = ((characterRotation % 360) + 360) % 360
  const isFrontFacing = normalizedYaw > 90 && normalizedYaw < 270
  const visualTilt = isFrontFacing
    ? (normalizedYaw - 180) * 0.35
    : (normalizedYaw > 180 ? normalizedYaw - 360 : normalizedYaw) * 0.35

  const dialog = useRef<HTMLDivElement>(null)
  const open = menuPanelNames.has(panel)
  const selectedStack = inventory.slots.find(stack => stack?.id === selectedId) ?? null
  const selectedItem = selectedEquipment ? itemById[selectedEquipment] : selectedStack ? itemById[selectedStack.itemId] : null
  const weight = inventoryWeight(inventory)

  useEffect(() => {
    if (!open) return
    const previous = document.activeElement
    dialog.current?.focus({ preventScroll: true })
    return () => { if (previous instanceof HTMLElement && previous.isConnected) previous.focus({ preventScroll: true }) }
  }, [open])

  useEffect(() => {
    // Consuming/dropping an item or dismissing its form can remove the focused control.
    // Return focus to the dialog so Escape and the focus trap continue to work.
    const active = document.activeElement
    if (open && (active === document.body || (active instanceof HTMLElement && active.matches(':disabled')))) {
      dialog.current?.focus({ preventScroll: true })
    }
  }, [open, inventory.slots, splitting, query])

  function selectStack(stack: InventoryStack) {
    uiAudio.playClick()
    setSelectedId(stack.id)
    setSelectedEquipment(null)
    setSplitting(false)
    setInspecting(false)
  }

  function handleUseItem(stack = selectedStack) {
    if (!stack) return
    const item = itemById[stack.itemId]
    if (!item.action) return
    uiAudio.playEquip()
    dispatch({ type: 'use', id: stack.id })
    if (item.health) bindings.set('Player.HealthPercent', Math.min(1, Number(bindings.get('Player.HealthPercent') ?? 1) + item.health))
    if (item.id === 'phone') onPanelChange('Phone')
  }

  function startSplit() {
    if (!selectedStack || selectedStack.quantity < 2) return
    setSplitQuantity(Math.floor(selectedStack.quantity / 2))
    setSplitting(true)
  }

  function parseDragEvent(event: React.DragEvent): DragPayload | null {
    if (draggedItem) return draggedItem
    try {
      const raw = event.dataTransfer.getData('application/json')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (parsed && typeof parsed === 'object') return parsed
      }
    } catch {
      // ignore JSON parse error
    }
    const plain = event.dataTransfer.getData('text/plain')
    if (plain) {
      const fromIdx = inventory.slots.findIndex(s => s?.id === plain)
      if (fromIdx >= 0) return { type: 'grid', id: plain, slotIndex: fromIdx }
      if (equipment.some(e => e.itemId === plain)) return { type: 'equipment', itemId: plain }
      return { type: 'grid', id: plain }
    }
    return null
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (splitting) setSplitting(false)
      else if (inspecting) setInspecting(false)
      else onClose()
      return
    }
    if (event.key === 'Tab') {
      const controls = Array.from(dialog.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, select, [tabindex="0"]') ?? []).filter(element => element.getClientRects().length > 0)
      const first = controls[0]
      const last = controls.at(-1)
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      return
    }
    if (event.target instanceof HTMLElement && event.target.matches('input, select, textarea')) return
    if (event.ctrlKey || event.metaKey || event.altKey || panel !== 'Inventory') return
    if (event.key.toLowerCase() === 'r') { event.preventDefault(); startSplit() }
    if (event.key.toLowerCase() === 'e' && selectedItem) { event.preventDefault(); setInspecting(value => !value) }
    if (/^[1-5]$/.test(event.key)) {
      event.preventDefault()
      const stack = inventory.slots.find(stack => stack?.id === inventory.quickSlots[Number(event.key) - 1])
      if (stack) selectStack(stack)
    }
  }

  if (!open) return null
  const matchingSlots = query.trim() ? inventory.slots.filter(stack => stack && `${itemById[stack.itemId].name} ${itemById[stack.itemId].category}`.toLowerCase().includes(query.trim().toLowerCase())) : inventory.slots
  const slots = [...matchingSlots, ...Array.from({ length: Math.max(0, 30 - matchingSlots.length) }, () => null)]

  return (
    <div ref={dialog} role="dialog" aria-modal="true" aria-label={`${panel} menu`} tabIndex={-1}
      data-roblox-name={`${panel}PanelModal`} className={`city-menu${motion ? '' : ' city-menu-still'}`}
      style={{ '--city-scene': `url("${assetRoot}city-backdrop.jpg")`, '--city-panel-opacity': panelOpacity / 100 } as CSSProperties} onKeyDown={handleKeyDown}>
      <div className="city-menu-backdrop" />
      <header className="city-menu-header">
        <div className="city-brand">
          <strong>SUN CITY</strong>
          <span>{panel === 'Settings' ? 'SETTINGS' : 'A BRIGHTER TOMORROW'}</span>
        </div>
        <nav className="city-tabs" aria-label="Game menu">
          {tabs.map(tab => <button type="button" key={tab} aria-current={panel === tab ? 'page' : undefined} onClick={() => onPanelChange(tab)}>{tab.toUpperCase()}</button>)}
        </nav>
        {panel === 'Settings' ? (
          <div className="city-settings-top-right">
            <span className="city-quote-tagline">SAME CITY, DIFFERENT STORY.</span>
            <button
              type="button"
              className="city-settings-x-btn"
              data-roblox-name="CloseSettingsButton"
              onClick={onClose}
              aria-label="Close settings"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="city-account"><span className="city-balance">$ {Number(bindings.get('Player.Money') ?? 500).toLocaleString()}</span><div><time>12:24</time><span>Sep 6, 2026</span></div></div>
        )}
      </header>

      <div className={`city-menu-body${panel === 'Quests' ? ' is-quests-body' : ''}${panel === 'Stats' ? ' is-stats-body' : ''}${panel === 'Settings' ? ' is-settings-body' : ''}`}>
        {panel === 'Quests' ? (
          <QuestsScreen />
        ) : panel === 'Stats' ? (
          <StatsScreen bindings={bindings} />
        ) : panel === 'Settings' ? (
          <SettingsScreen
            showQuantities={showQuantities}
            setShowQuantities={setShowQuantities}
            motion={motion}
            setMotion={setMotion}
            panelOpacity={panelOpacity}
            setPanelOpacity={setPanelOpacity}
            nerve={nerve}
            onBack={() => onPanelChange('Inventory')}
          />
        ) : (
          <>
        <aside className="city-character" aria-label="Character equipment">
          <div className="city-equipment">
            {equipment.map(slot => {
              const isEquipped = inventory.equipped.includes(slot.itemId)
              return (
                <button type="button" key={slot.itemId}
                  className={`city-equipment-slot${selectedEquipment === slot.itemId ? ' is-selected' : ''}${isEquipped ? '' : ' is-unequipped'}${dragOverTarget === `equip-${slot.itemId}` ? ' is-drag-over' : ''}${draggedItem?.itemId === slot.itemId ? ' is-dragging' : ''}`}
                  aria-label={`${slot.label}: ${itemById[slot.itemId].name}`} aria-pressed={selectedEquipment === slot.itemId}
                  draggable={isEquipped}
                  onDragStart={event => {
                    event.dataTransfer.setData('text/plain', slot.itemId)
                    event.dataTransfer.setData('application/json', JSON.stringify({ type: 'equipment', itemId: slot.itemId }))
                    event.dataTransfer.effectAllowed = 'move'
                    setDraggedItem({ type: 'equipment', itemId: slot.itemId })
                  }}
                  onDragEnd={() => {
                    setDraggedItem(null)
                    setDragOverTarget(null)
                  }}
                  onDragOver={event => {
                    event.preventDefault()
                    event.dataTransfer.dropEffect = 'move'
                    if (dragOverTarget !== `equip-${slot.itemId}`) setDragOverTarget(`equip-${slot.itemId}`)
                  }}
                  onDragLeave={event => {
                    if (event.currentTarget.contains(event.relatedTarget as Node)) return
                    if (dragOverTarget === `equip-${slot.itemId}`) setDragOverTarget(null)
                  }}
                  onDrop={event => {
                    event.preventDefault()
                    const payload = parseDragEvent(event)
                    setDragOverTarget(null)
                    setDraggedItem(null)
                    if (!payload) return
                    if (payload.type === 'grid' && payload.id) {
                      const draggedStack = inventory.slots.find(s => s?.id === payload.id)
                      if (draggedStack) {
                        const draggedDef = itemById[draggedStack.itemId]
                        if (draggedDef.action === 'equip' || draggedDef.category === 'Clothing' || draggedDef.category === 'Equipment') {
                          dispatch({ type: 'equip-item', itemId: draggedDef.id })
                        }
                      }
                    }
                  }}
                  onClick={() => { setSelectedEquipment(slot.itemId); setSelectedId(null); setSplitting(false); setInspecting(false); onPanelChange('Inventory') }}>
                  <ItemArt item={itemById[slot.itemId]} /><span>{slot.label}</span>
                  {!isEquipped && <small>Unequipped</small>}
                </button>
              )
            })}
          </div>

          <div
            className={`city-viewport-frame${isRotating ? ' is-interacting' : ''}`}
            data-roblox-class="ViewportFrame"
            data-roblox-name="CharacterViewport"
            role="region"
            aria-label="Character ViewportFrame"
            onPointerDown={handleViewportPointerDown}
            onPointerMove={handleViewportPointerMove}
            onPointerUp={handleViewportPointerUp}
            onPointerCancel={handleViewportPointerUp}
          >
            <div className="city-viewport-badge">
              <span className="city-viewport-tag">
                <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                  <line x1="12" y1="22.08" x2="12" y2="12" />
                </svg>
                ViewportFrame
              </span>
              <div className="city-viewport-controls">
                <button
                  type="button"
                  className="city-viewport-btn"
                  aria-label="Rotate left"
                  title="Rotate left"
                  onClick={(e) => { e.stopPropagation(); setCharacterRotation((rot) => ((rot - 45) % 360 + 360) % 360) }}
                >
                  ↺
                </button>
                <button
                  type="button"
                  className="city-viewport-btn"
                  aria-label="Reset camera"
                  title="Reset camera view"
                  onClick={(e) => { e.stopPropagation(); setCharacterRotation(0); setZoomLevel(1) }}
                >
                  ⌖
                </button>
                <button
                  type="button"
                  className="city-viewport-btn"
                  aria-label="Rotate right"
                  title="Rotate right"
                  onClick={(e) => { e.stopPropagation(); setCharacterRotation((rot) => (rot + 45) % 360) }}
                >
                  ↻
                </button>
              </div>
            </div>

            <div
              className="city-viewport-stage"
              style={{ transform: `scale(${zoomLevel})` }}
            >
              <div className="city-viewport-pedestal" />
              <div
                className="city-viewport-model"
                style={{
                  transform: `perspective(700px) rotateY(${visualTilt}deg)`,
                }}
              >
                <img
                  src={`${assetRoot}${isFrontFacing ? 'character-front.png' : 'character-back.png'}`}
                  alt="Player character 3D preview"
                  className="city-viewport-character-img"
                  draggable={false}
                />
              </div>
            </div>

            <div className="city-viewport-hint">
              <span>Drag to rotate • {Math.round(normalizedYaw)}°</span>
            </div>
          </div>

          <div className="city-player-card"><strong>{String(bindings.get('Player.Name') ?? 'Player1')}</strong><span>Level {Number(bindings.get('Player.Level') ?? 42)}</span><div className="city-xp-track"><i /></div><small><b>12,450</b> / 25,000 XP</small></div>
        </aside>

        <section className={`city-content city-content-${panel.toLowerCase()}`} aria-label={panel}>
          {panel === 'Inventory' ? <>
            <div className="city-inventory-heading">
              <h1>INVENTORY</h1>
              <label className="city-search"><Icon name="search" /><input aria-label="Search inventory" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search..." />{query && <button type="button" aria-label="Clear search" onClick={() => setQuery('')}>×</button>}</label>
              <div className="city-capacity"><span><Icon name="weight" /><b>{weight.toFixed(1)}</b> / 60 KG</span><div><i style={{ width: `${Math.min(100, weight / 60 * 100)}%` }} /></div></div>
            </div>
            <div className="city-inventory-workspace">
              <div className="city-items-column">
                <div className="city-item-grid" aria-label="Inventory slots">
                  {slots.map((stack, index) => {
                    if (stack) {
                      const trueSlotIndex = inventory.slots.findIndex(s => s?.id === stack.id)
                      return (
                        <button type="button" key={stack.id}
                          className={`city-item-slot${selectedId === stack.id ? ' is-selected' : ''}${draggedItem?.id === stack.id ? ' is-dragging' : ''}${dragOverTarget === `grid-${stack.id}` ? ' is-drag-over' : ''}`}
                          aria-label={`${itemById[stack.itemId].name}, ${stack.quantity.toLocaleString()}`}
                          aria-pressed={selectedId === stack.id}
                          draggable
                          onDragStart={event => {
                            event.dataTransfer.setData('text/plain', stack.id)
                            event.dataTransfer.setData('application/json', JSON.stringify({ type: 'grid', id: stack.id, slotIndex: trueSlotIndex }))
                            event.dataTransfer.effectAllowed = 'move'
                            setDraggedItem({ type: 'grid', id: stack.id, slotIndex: trueSlotIndex })
                            selectStack(stack)
                          }}
                          onDragEnd={() => {
                            setDraggedItem(null)
                            setDragOverTarget(null)
                          }}
                          onDragOver={event => {
                            event.preventDefault()
                            event.dataTransfer.dropEffect = 'move'
                            if (dragOverTarget !== `grid-${stack.id}`) setDragOverTarget(`grid-${stack.id}`)
                          }}
                          onDragLeave={event => {
                            if (event.currentTarget.contains(event.relatedTarget as Node)) return
                            if (dragOverTarget === `grid-${stack.id}`) setDragOverTarget(null)
                          }}
                          onDrop={event => {
                            event.preventDefault()
                            const payload = parseDragEvent(event)
                            setDragOverTarget(null)
                            setDraggedItem(null)
                            if (!payload) return
                            if (payload.type === 'grid' && typeof payload.slotIndex === 'number') {
                              if (payload.slotIndex !== trueSlotIndex && trueSlotIndex >= 0) {
                                dispatch({ type: 'move', fromSlot: payload.slotIndex, toSlot: trueSlotIndex })
                              }
                            } else if (payload.type === 'quick' && typeof payload.quickIndex === 'number') {
                              dispatch({ type: 'unassign-quick', slot: payload.quickIndex })
                            } else if (payload.type === 'equipment' && payload.itemId) {
                              dispatch({ type: 'unequip-item', itemId: payload.itemId })
                            }
                          }}
                          onClick={() => selectStack(stack)}
                          onDoubleClick={() => handleUseItem(stack)}
                          onContextMenu={event => { event.preventDefault(); selectStack(stack) }}>
                          <ItemArt item={itemById[stack.itemId]} />
                          {showQuantities && <span className="city-item-quantity">{stack.quantity.toLocaleString()}</span>}
                        </button>
                      )
                    }
                    return (
                      <div key={`empty-${index}`}
                        className={`city-item-slot is-empty${dragOverTarget === `empty-${index}` ? ' is-drag-over' : ''}`}
                        aria-hidden="true"
                        onDragOver={event => {
                          event.preventDefault()
                          event.dataTransfer.dropEffect = 'move'
                          if (dragOverTarget !== `empty-${index}`) setDragOverTarget(`empty-${index}`)
                        }}
                        onDragLeave={event => {
                          if (event.currentTarget.contains(event.relatedTarget as Node)) return
                          if (dragOverTarget === `empty-${index}`) setDragOverTarget(null)
                        }}
                        onDrop={event => {
                          event.preventDefault()
                          const payload = parseDragEvent(event)
                          setDragOverTarget(null)
                          setDraggedItem(null)
                          if (!payload) return
                          const targetSlotIndex = query.trim() ? inventory.slots.indexOf(null) : index
                          if (targetSlotIndex < 0) return
                          if (payload.type === 'grid' && typeof payload.slotIndex === 'number') {
                            if (payload.slotIndex !== targetSlotIndex) {
                              dispatch({ type: 'move', fromSlot: payload.slotIndex, toSlot: targetSlotIndex })
                            }
                          } else if (payload.type === 'quick' && typeof payload.quickIndex === 'number') {
                            dispatch({ type: 'unassign-quick', slot: payload.quickIndex })
                          } else if (payload.type === 'equipment' && payload.itemId) {
                            dispatch({ type: 'unequip-item', itemId: payload.itemId })
                          }
                        }}
                      />
                    )
                  })}
                  {query && matchingSlots.length === 0 && <div className="city-no-results"><span>No items found.</span><button type="button" onClick={() => setQuery('')}>Clear search</button></div>}
                </div>
                <div className="city-quick-use">
                  <span>QUICK USE</span>
                  <div className="city-quick-slots">
                    {inventory.quickSlots.map((id, index) => {
                      const stack = inventory.slots.find(slot => slot?.id === id)
                      return (
                        <button type="button" key={index}
                          className={`city-quick-slot${selectedId && selectedId === id ? ' is-selected' : ''}${dragOverTarget === `quick-${index}` ? ' is-drag-over' : ''}${draggedItem?.quickIndex === index ? ' is-dragging' : ''}`}
                          aria-label={`Quick slot ${index + 1}${stack ? `: ${itemById[stack.itemId].name}` : ': empty'}`}
                          title={selectedStack ? `Assign ${itemById[selectedStack.itemId].name} to slot ${index + 1}` : 'Select an item, then click or drag it into a quick slot'}
                          draggable={Boolean(stack)}
                          onDragStart={event => {
                            if (!stack) return
                            event.dataTransfer.setData('text/plain', stack.id)
                            event.dataTransfer.setData('application/json', JSON.stringify({ type: 'quick', quickIndex: index, id: stack.id }))
                            event.dataTransfer.effectAllowed = 'move'
                            setDraggedItem({ type: 'quick', quickIndex: index, id: stack.id })
                            selectStack(stack)
                          }}
                          onDragEnd={() => {
                            setDraggedItem(null)
                            setDragOverTarget(null)
                          }}
                          onDragOver={event => {
                            event.preventDefault()
                            event.dataTransfer.dropEffect = 'move'
                            if (dragOverTarget !== `quick-${index}`) setDragOverTarget(`quick-${index}`)
                          }}
                          onDragLeave={event => {
                            if (event.currentTarget.contains(event.relatedTarget as Node)) return
                            if (dragOverTarget === `quick-${index}`) setDragOverTarget(null)
                          }}
                          onDrop={event => {
                            event.preventDefault()
                            const payload = parseDragEvent(event)
                            setDragOverTarget(null)
                            setDraggedItem(null)
                            if (!payload) return
                            if (payload.type === 'quick' && typeof payload.quickIndex === 'number') {
                              if (payload.quickIndex !== index) {
                                dispatch({ type: 'swap-quick', fromSlot: payload.quickIndex, toSlot: index })
                              }
                            } else {
                              const dropId = payload.id || event.dataTransfer.getData('text/plain')
                              if (dropId) { uiAudio.playEquip(); dispatch({ type: 'assign', id: dropId, slot: index }) }
                            }
                          }}
                          onClick={() => { if (selectedStack) { uiAudio.playEquip(); dispatch({ type: 'assign', id: selectedStack.id, slot: index }); } else if (stack) { selectStack(stack); } }}
                          onContextMenu={event => {
                            event.preventDefault()
                            if (stack) dispatch({ type: 'unassign-quick', slot: index })
                          }}>
                          <span className="city-quick-key">{index + 1}</span>
                          {stack ? <ItemArt item={itemById[stack.itemId]} /> : <Icon name="plus" />}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
              <div className="city-details-column">
                <div className={`city-item-details${selectedItem ? ' has-selection' : ''}`} aria-label="Item details">
                  {selectedItem ? <>
                    <div className={`city-detail-art${inspecting ? ' is-inspecting' : ''}`}><ItemArt item={selectedItem} /></div>
                    <span className="city-item-category">{selectedItem.category}</span><h2>{selectedItem.name}</h2><p>{selectedItem.description}</p>
                    <dl><div><dt>Weight</dt><dd>{selectedItem.weight < .01 ? '< 0.01' : selectedItem.weight.toFixed(2)} kg</dd></div><div><dt>Quantity</dt><dd>{(selectedStack?.quantity ?? 1).toLocaleString()}</dd></div></dl>
                    {selectedEquipment ? <button type="button" className="city-use-button" onClick={() => dispatch({ type: 'equipment', itemId: selectedEquipment })}>{inventory.equipped.includes(selectedEquipment) ? 'Unequip' : 'Equip'}</button>
                      : <button type="button" className="city-use-button" disabled={!selectedItem.action} onClick={() => handleUseItem()}>{selectedItem.action === 'equip' ? 'Equip item' : selectedItem.action ? 'Use item' : 'Cannot be used directly'}<Icon name="arrow" /></button>}
                    {selectedStack && <p className="city-detail-tip">Click a quick slot below the grid to assign this item.</p>}
                    {splitting && selectedStack && <form className="city-split-form" onSubmit={event => { event.preventDefault(); dispatch({ type: 'split', id: selectedStack.id, quantity: splitQuantity }); setSplitting(false) }}>
                      <label>Split quantity<input aria-label="Split quantity" type="number" min={1} max={selectedStack.quantity - 1} value={splitQuantity} onChange={event => setSplitQuantity(Number(event.target.value))} /></label>
                      <button type="submit" disabled={!Number.isInteger(splitQuantity) || splitQuantity < 1 || splitQuantity >= selectedStack.quantity}>Split stack</button><button type="button" onClick={() => setSplitting(false)}>Cancel</button>
                    </form>}
                  </> : <div className="city-empty-detail"><Icon name="box" /><strong>Select an item</strong><p>to view details, use or drop it.</p></div>}
                </div>
                <div className="city-item-actions">
                  <button type="button" disabled={!selectedStack || !selectedItem?.action} onClick={() => handleUseItem()}><kbd><Icon name="mouse" /></kbd><span>Use</span></button>
                  <button type="button" className={`city-action-drop${dragOverTarget === 'action-drop' ? ' is-drag-over' : ''}`} disabled={!selectedStack}
                    onDragOver={event => {
                      event.preventDefault()
                      event.dataTransfer.dropEffect = 'move'
                      if (dragOverTarget !== 'action-drop') setDragOverTarget('action-drop')
                    }}
                    onDragLeave={event => {
                      if (event.currentTarget.contains(event.relatedTarget as Node)) return
                      if (dragOverTarget === 'action-drop') setDragOverTarget(null)
                    }}
                    onDrop={event => {
                      event.preventDefault()
                      const payload = parseDragEvent(event)
                      setDragOverTarget(null)
                      setDraggedItem(null)
                      if (!payload) return
                      if (payload.type === 'grid' && payload.id) {
                        uiAudio.playDrop(); dispatch({ type: 'drop', id: payload.id })
                        if (selectedId === payload.id) {
                          setSelectedId(null)
                          setSplitting(false)
                        }
                      } else if (payload.type === 'quick' && typeof payload.quickIndex === 'number') {
                        dispatch({ type: 'unassign-quick', slot: payload.quickIndex })
                      } else if (payload.type === 'equipment' && payload.itemId) {
                        dispatch({ type: 'unequip-item', itemId: payload.itemId })
                      }
                    }}
                    onClick={() => { if (selectedStack) { uiAudio.playDrop(); dispatch({ type: 'drop', id: selectedStack.id }); } setSelectedId(null); setSplitting(false); }}><kbd><Icon name="mouse" /></kbd><span>Drop</span></button>
                  <button type="button" aria-label="Split" aria-keyshortcuts="R" disabled={!selectedStack || selectedStack.quantity < 2} onClick={startSplit}><kbd aria-hidden="true">R</kbd><span>Split</span></button>
                  <button type="button" aria-label="Inspect" aria-keyshortcuts="E" disabled={!selectedItem} aria-pressed={inspecting} onClick={() => setInspecting(value => !value)}><kbd aria-hidden="true">E</kbd><span>Inspect</span></button>
                </div>
              </div>
            </div>
          </> : panel === 'Map' ? <CityMap /> : panel === 'Phone' ? <PhoneScreen nerve={nerve} /> : panel === 'Stats' ? <>
            <h1>PLAYER STATISTICS</h1><p className="city-subtitle">Your life in Sun City.</p>
            <div className="city-stat-grid">{[
              ['Level', Number(bindings.get('Player.Level') ?? 42)], ['Total experience', '142,500'],
              ['Health', `${Math.round(Number(bindings.get('Player.HealthPercent') ?? 1) * 100)}%`], ['Account balance', `$${Number(bindings.get('Player.Money') ?? 500).toLocaleString()}`],
              ['Items carried', inventory.slots.filter(Boolean).length], ['Carry weight', `${weight.toFixed(1)} kg`],
            ].map(([name, value]) => <div key={name}><span>{name}</span><strong>{value}</strong></div>)}</div>
            <div className="city-location-summary"><Icon name="pin" /><div><strong>Sun City</strong><p>San Andreas Avenue · Downtown</p></div><button type="button" onClick={() => onPanelChange('Map')}>View map <Icon name="arrow" /></button></div>
          </> : <>
            <h1>SETTINGS</h1><p className="city-subtitle">Make yourself at home.</p>
            <div className="city-settings-list">
              <label><div><strong>Panel opacity</strong><span>Adjust how much of the background is visible</span></div><input type="range" aria-label="Panel opacity" min={40} max={100} value={panelOpacity} onChange={event => setPanelOpacity(Number(event.target.value))} /><b>{panelOpacity}%</b></label>
              <label><div><strong>Item quantities</strong><span>Show stack counts in your inventory</span></div><input type="checkbox" role="switch" checked={showQuantities} onChange={event => setShowQuantities(event.target.checked)} aria-label="Item quantities" /></label>
              <label><div><strong>Interface motion</strong><span>Item inspection and menu transitions</span></div><input type="checkbox" role="switch" checked={motion} onChange={event => setMotion(event.target.checked)} aria-label="Interface motion" /></label>
              <div className="city-settings-shortcuts"><strong>Keyboard controls</strong><p><kbd>I</kbd> Open inventory <kbd>ESC</kbd> Close menu <kbd>1–5</kbd> Select quick slot <kbd>R</kbd> Split <kbd>E</kbd> Inspect</p></div>
            </div>
          </>}
        </section>
          </>
        )}
      </div>
      {panel !== 'Settings' && (
        <footer className="city-menu-footer">
          <div role="status" className="city-notice" key={inventory.notice}>
            {panel === 'Stats' ? (
              <span className="city-stats-footer-tagline">SUN CITY • A BRIGHTER TOMORROW IN SUN CITY</span>
            ) : (
              <>
                {inventory.notice}
                {inventory.dropped && <button type="button" onClick={() => dispatch({ type: 'undo-drop' })}>Undo drop</button>}
              </>
            )}
          </div>
          {panel === 'Stats' && (
            <div className="city-stats-footer-motto">
              <span>PEOPLE</span>
              <span>CARS</span>
              <span>OPPORTUNITY</span>
              <span>TROUBLE</span>
            </div>
          )}
          <button type="button" className="city-close" data-roblox-name={`Close${panel}Button`} onClick={onClose}>
            <kbd>ESC</kbd><span>Close</span>
          </button>
        </footer>
      )}
    </div>
  )
}

const locations = [
  { name: 'You are here', address: 'San Andreas Avenue', x: 47, y: 53 },
  { name: 'Central garage', address: 'Power Street', x: 63, y: 34 },
  { name: 'Convenience store', address: 'Vespucci Boulevard', x: 31, y: 69 },
  { name: 'City hall', address: 'Alta Street', x: 70, y: 65 },
]

function CityMap() {
  const [selected, setSelected] = useState(0)
  const [waypoint, setWaypoint] = useState<number | null>(null)
  return <><h1>MAP</h1><p className="city-subtitle">Downtown, Sun City</p><div className="city-map">
    <svg className="city-map-streets" viewBox="0 0 800 500" preserveAspectRatio="none" aria-hidden="true">
      <defs><pattern id="city-blocks" width="85" height="70" patternUnits="userSpaceOnUse" patternTransform="rotate(-18)"><rect width="85" height="70" fill="#192025"/><rect x="9" y="9" width="64" height="49" rx="4" fill="#222b31" stroke="#303b41" /></pattern></defs>
      <rect width="800" height="500" fill="url(#city-blocks)" /><path d="M-30 480C150 350 130 190 380 150S680 0 820 40" stroke="#070d13" strokeWidth="50" fill="none"/><path d="M-30 480C150 350 130 190 380 150S680 0 820 40" stroke="#45606c" strokeWidth="2" fill="none"/><path d="M0 360 800 100M270 0l150 500" stroke="#576065" strokeWidth="10" /><path d="M0 360 800 100M270 0l150 500" stroke="#a8b0a6" strokeWidth="1" strokeDasharray="8 8" />
      <text x="345" y="270" fill="#8b979d" fontSize="17" letterSpacing="7">DOWNTOWN</text><text x="52" y="442" fill="#687d88" fontSize="12" letterSpacing="4">VESPUCCI</text>
    </svg>
    {locations.map((location, index) => <button type="button" key={location.name} className={`city-map-pin${selected === index ? ' is-selected' : ''}`} style={{ left: `${location.x}%`, top: `${location.y}%` }} aria-label={location.name} onClick={() => setSelected(index)}><Icon name="pin" /></button>)}
    <div className="city-map-caption"><div><strong>{locations[selected].name}</strong><span>{locations[selected].address}</span></div><button type="button" onClick={() => setWaypoint(waypoint === selected ? null : selected)}>{waypoint === selected ? 'Clear waypoint' : 'Set waypoint'}</button></div>
    {waypoint !== null && <div className="city-waypoint" role="status"><Icon name="check" /> Waypoint: {locations[waypoint].name}</div>}
  </div></>
}
