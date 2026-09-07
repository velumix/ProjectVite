import { useMemo, useState } from 'react'
import type { ScenarioTraceEvent } from './scenario-trace.ts'
import type { ScenarioPlaybackState } from './scenario-runner.ts'
import type { ReactiveBindingStore } from '../bindings/reactive-bindings.ts'
import type { RobloxRealm } from '../realm/roblox-realm.ts'
import type { EffectPatch } from '../effects/roblox-effects.ts'

type Filter = 'all' | 'state' | 'network' | 'action' | 'effect' | 'persistence' | 'error'
type Tab = 'trace' | 'state' | 'network' | 'effects' | 'persistence'

type Props = {
  scenarioName?: string
  playback: ScenarioPlaybackState
  events: ScenarioTraceEvent[]
  bindings: ReactiveBindingStore
  realm: RobloxRealm
  effectPatches: EffectPatch[]
  persistenceSnapshot: Record<string, Record<string, unknown>>
  isOpen?: boolean
  onClose?: () => void
}

const filters: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'state', label: 'State' },
  { id: 'network', label: 'Network' },
  { id: 'action', label: 'Action' },
  { id: 'effect', label: 'Effect' },
  { id: 'persistence', label: 'Persistence' },
  { id: 'error', label: 'Error' },
]

export function ScenarioInspector({
  scenarioName,
  playback,
  events,
  bindings,
  realm,
  effectPatches,
  persistenceSnapshot,
  isOpen = true,
  onClose,
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>('trace')
  const [filter, setFilter] = useState<Filter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedEventIndex, setSelectedEventIndex] = useState<number | undefined>()
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const handleCopy = (key: string, data: unknown) => {
    navigator.clipboard?.writeText(JSON.stringify(data, null, 2))
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 1500)
  }

  const visibleEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesFilter = filter === 'all' || eventCategory(event) === filter
      const matchesSearch =
        !searchQuery ||
        event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        event.type.toLowerCase().includes(searchQuery.toLowerCase())
      return matchesFilter && matchesSearch
    })
  }, [events, filter, searchQuery])

  const selectedEvent =
    selectedEventIndex !== undefined ? events[selectedEventIndex] : undefined

  const recentMethods = events.filter((e) => e.type === 'method').slice(-6).reverse()
  const recentSignals = events.filter((e) => e.type === 'signal').slice(-6).reverse()
  const playersList = Array.from(realm.clients.values())

  if (!isOpen) return null

  return (
    <aside className="ag-inspector-sidebar">
      {/* Top Header */}
      <div className="ag-inspector-header">
        <div className="ag-inspector-title-group">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-ag-primary">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
            <line x1="8" y1="21" x2="16" y2="21" />
            <line x1="12" y1="17" x2="12" y2="21" />
          </svg>
          <span className="ag-inspector-title">Scenario Inspector</span>
          <span className="ag-pill-badge">{events.length}</span>
        </div>

        {onClose && (
          <button
            type="button"
            className="ag-icon-button"
            onClick={onClose}
            aria-label="Close Inspector"
            title="Close Inspector"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>

      {/* Metrics Row */}
      <div className="ag-inspector-metrics">
        <div className="ag-metric-tile">
          <span className="ag-metric-label">Scenario</span>
          <span className="ag-metric-val truncate" title={scenarioName ?? 'Ready'}>
            {scenarioName ?? 'Ready'}
          </span>
        </div>
        <div className="ag-metric-tile">
          <span className="ag-metric-label">Virtual Time</span>
          <span className="ag-metric-val tabular-nums">{Math.round(playback.timeMs)}ms</span>
        </div>
        <div className="ag-metric-tile">
          <span className="ag-metric-label">Players</span>
          <span className="ag-metric-val">{realm.clients.size}</span>
        </div>
        <div className="ag-metric-tile">
          <span className="ag-metric-label">Effects</span>
          <span className="ag-metric-val">{effectPatches.length}</span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="ag-tabs-bar">
        <button
          type="button"
          className={`ag-tab-btn ${activeTab === 'trace' ? 'active' : ''}`}
          onClick={() => setActiveTab('trace')}
        >
          <span>Trace</span>
          <span className="ag-tab-count">{events.length}</span>
        </button>
        <button
          type="button"
          className={`ag-tab-btn ${activeTab === 'state' ? 'active' : ''}`}
          onClick={() => setActiveTab('state')}
        >
          <span>State</span>
        </button>
        <button
          type="button"
          className={`ag-tab-btn ${activeTab === 'network' ? 'active' : ''}`}
          onClick={() => setActiveTab('network')}
        >
          <span>Network</span>
        </button>
        <button
          type="button"
          className={`ag-tab-btn ${activeTab === 'effects' ? 'active' : ''}`}
          onClick={() => setActiveTab('effects')}
        >
          <span>Effects</span>
          {effectPatches.length > 0 && <span className="ag-tab-count">{effectPatches.length}</span>}
        </button>
        <button
          type="button"
          className={`ag-tab-btn ${activeTab === 'persistence' ? 'active' : ''}`}
          onClick={() => setActiveTab('persistence')}
        >
          <span>DataStore</span>
        </button>
      </div>

      {/* Tab Body */}
      <div className="ag-inspector-scroll-content">
        {/* TRACE TAB */}
        {activeTab === 'trace' && (
          <div className="ag-trace-panel">
            {/* Search & Filter Bar */}
            <div className="ag-trace-controls">
              <div className="ag-search-wrapper">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ag-search-icon">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter events..."
                  className="ag-trace-search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="ag-clear-search"
                    onClick={() => setSearchQuery('')}
                  >
                    ×
                  </button>
                )}
              </div>

              <div className="ag-filter-pills">
                {filters.map(({ id, label }) => (
                  <button
                    key={id}
                    type="button"
                    className={`ag-filter-pill ${filter === id ? 'active' : ''}`}
                    onClick={() => setFilter(id)}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Events List */}
            <div className="ag-trace-list">
              {visibleEvents.length === 0 ? (
                <div className="ag-empty-state">No matching events found.</div>
              ) : (
                visibleEvents.map((event) => {
                  const origIndex = events.indexOf(event)
                  const isSelected = selectedEventIndex === origIndex
                  const isError = event.type === 'error'

                  return (
                    <div
                      key={`${origIndex}-${event.name}-${event.timeMs}`}
                      className={`ag-trace-row ${isSelected ? 'selected' : ''} ${isError ? 'is-error' : ''}`}
                      onClick={() => setSelectedEventIndex(origIndex)}
                    >
                      <span className="ag-trace-time tabular-nums">
                        {Math.round(event.timeMs)}ms
                      </span>
                      <span className={`ag-category-badge badge-${eventCategory(event)}`}>
                        {event.type}
                      </span>
                      <span className="ag-trace-name truncate">{event.name}</span>
                    </div>
                  )
                })
              )}
            </div>

            {/* Selected Event Payload Card */}
            {selectedEvent && (
              <div className="ag-payload-card">
                <div className="ag-payload-header">
                  <div className="truncate">
                    <span className="font-semibold text-ag-text">{selectedEvent.name}</span>
                    <span className="ag-payload-time"> @ {Math.round(selectedEvent.timeMs)}ms</span>
                  </div>
                  <button
                    type="button"
                    className="ag-btn-copy"
                    onClick={() => handleCopy('selected-event', selectedEvent.payload ?? {})}
                  >
                    {copiedKey === 'selected-event' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <pre className="ag-code-block">
                  {JSON.stringify(selectedEvent.payload ?? {}, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* STATE TAB */}
        {activeTab === 'state' && (
          <div className="ag-tab-content">
            <div className="ag-content-header">
              <span className="ag-section-subtitle">Reactive Binding State</span>
              <button
                type="button"
                className="ag-btn-copy"
                onClick={() => handleCopy('state', bindings.getState())}
              >
                {copiedKey === 'state' ? 'Copied' : 'Copy State'}
              </button>
            </div>
            <pre className="ag-code-block">
              {JSON.stringify(bindings.getState(), null, 2)}
            </pre>
          </div>
        )}

        {/* NETWORK TAB */}
        {activeTab === 'network' && (
          <div className="ag-tab-content space-y-4">
            <div>
              <span className="ag-section-subtitle">Connected Players</span>
              <div className="ag-item-list mt-1.5">
                {playersList.length === 0 ? (
                  <div className="ag-empty-state">No connected players</div>
                ) : (
                  playersList.map((client) => (
                    <div key={client.LocalPlayer.UserId} className="ag-list-card">
                      <div className="flex items-center gap-2">
                        <span className="ag-status-dot dot-online" />
                        <span className="font-medium text-ag-text">{client.LocalPlayer.Name}</span>
                      </div>
                      <span className="ag-param-badge">ID: {client.LocalPlayer.UserId}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div>
              <span className="ag-section-subtitle">Recent Nerve RPC Calls & Signals</span>
              <div className="ag-item-list mt-1.5">
                {[...recentMethods, ...recentSignals].length === 0 ? (
                  <div className="ag-empty-state">No recent network activity</div>
                ) : (
                  [...recentMethods, ...recentSignals].map((event, idx) => (
                    <div key={`${event.name}-${idx}`} className="ag-list-card">
                      <div className="flex items-center gap-2 truncate">
                        <span className={`ag-category-badge badge-${eventCategory(event)}`}>
                          {event.type}
                        </span>
                        <span className="font-mono text-xs text-ag-text truncate">{event.name}</span>
                      </div>
                      <span className="text-ag-text-muted text-[11px] tabular-nums shrink-0">
                        {Math.round(event.timeMs)}ms
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* EFFECTS TAB */}
        {activeTab === 'effects' && (
          <div className="ag-tab-content">
            <div className="ag-content-header">
              <span className="ag-section-subtitle">Active Effect Patches</span>
              <span className="ag-pill-badge">{effectPatches.length}</span>
            </div>
            {effectPatches.length === 0 ? (
              <div className="ag-empty-state">No active effect patches currently playing.</div>
            ) : (
              <div className="ag-item-list mt-1.5">
                {effectPatches.map((patch, idx) => (
                  <div key={`${patch.Target}-${idx}`} className="ag-payload-card mb-2">
                    <div className="ag-payload-header">
                      <span className="font-semibold text-ag-text">Target: {patch.Target}</span>
                    </div>
                    <pre className="ag-code-block">
                      {JSON.stringify(patch.Properties, null, 2)}
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PERSISTENCE TAB */}
        {activeTab === 'persistence' && (
          <div className="ag-tab-content">
            <div className="ag-content-header">
              <span className="ag-section-subtitle">DataStore Profiles Snapshot</span>
              <button
                type="button"
                className="ag-btn-copy"
                onClick={() => handleCopy('persistence', persistenceSnapshot)}
              >
                {copiedKey === 'persistence' ? 'Copied' : 'Copy'}
              </button>
            </div>
            {Object.keys(persistenceSnapshot).length === 0 ? (
              <div className="ag-empty-state">No persistent data records saved.</div>
            ) : (
              <pre className="ag-code-block">
                {JSON.stringify(persistenceSnapshot, null, 2)}
              </pre>
            )}
          </div>
        )}
      </div>
    </aside>
  )
}

function eventCategory(event: ScenarioTraceEvent): Filter {
  if (event.type === 'state') return 'state'
  if (event.type === 'action') return 'action'
  if (event.type === 'effect') return 'effect'
  if (event.type === 'persistence') return 'persistence'
  if (event.type === 'error') return 'error'
  if (event.type === 'method' || event.type === 'signal' || event.type === 'player') return 'network'
  return 'error'
}
