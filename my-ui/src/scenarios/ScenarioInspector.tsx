import { useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { ScenarioTraceEvent } from './scenario-trace.ts'
import type { ScenarioPlaybackState } from './scenario-runner.ts'
import type { ReactiveBindingStore } from '../bindings/reactive-bindings.ts'
import type { RobloxRealm } from '../realm/roblox-realm.ts'
import type { EffectPatch } from '../effects/roblox-effects.ts'

type Filter = 'all' | 'state' | 'network' | 'action' | 'effect' | 'persistence' | 'error'

type Props = {
  scenarioName?: string
  playback: ScenarioPlaybackState
  events: ScenarioTraceEvent[]
  bindings: ReactiveBindingStore
  realm: RobloxRealm
  effectPatches: EffectPatch[]
  persistenceSnapshot: Record<string, Record<string, unknown>>
}

const filters: Filter[] = ['all', 'state', 'network', 'action', 'effect', 'persistence', 'error']

export function ScenarioInspector({ scenarioName, playback, events, bindings, realm, effectPatches, persistenceSnapshot }: Props) {
  const [open, setOpen] = useState(true)
  const [filter, setFilter] = useState<Filter>('all')
  const [selected, setSelected] = useState<number | undefined>()
  const visibleEvents = useMemo(() => events.filter((event) => filter === 'all' || eventCategory(event) === filter), [events, filter])
  const selectedEvent = selected === undefined ? undefined : events[selected]
  const recentMethods = events.filter((event) => event.type === 'method').slice(-5).reverse()
  const recentSignals = events.filter((event) => event.type === 'signal').slice(-5).reverse()
  const assertionEvents = events.filter((event) => event.type === 'assertion' || event.type === 'error' && event.name.startsWith('state ') || event.name.startsWith('signal ') || event.name.startsWith('method ') || event.name.startsWith('profile ')).slice(-8).reverse()

  return (
    <aside className="absolute bottom-4 right-4 z-20 w-[min(440px,calc(100vw-2rem))] overflow-hidden rounded-lg border border-border bg-surface/95 text-sm shadow-panel">
      <button className="flex w-full items-center justify-between border-b border-border px-3 py-2 text-left font-semibold" onClick={() => setOpen((value) => !value)}>
        <span>Scenario inspector</span>
        <span className="text-text-muted">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="max-h-[min(70vh,620px)] overflow-y-auto p-3">
        <div className="grid grid-cols-2 gap-2 text-xs">
          <Summary label="Scenario" value={scenarioName ?? 'Ready'} />
          <Summary label="Virtual time" value={`${Math.round(playback.timeMs)}ms`} />
          <Summary label="Players" value={`${realm.clients.size}`} />
          <Summary label="Active effects" value={`${effectPatches.length}`} />
        </div>

        <InspectorSection title="State">
          <CodeBlock value={bindings.getState()} />
        </InspectorSection>
        <InspectorSection title="Players / clients">
          <div className="space-y-1 text-xs text-text-muted">{[...realm.clients.values()].map((client) => <div key={client.LocalPlayer.UserId}>{client.LocalPlayer.Name} · {client.LocalPlayer.UserId}</div>)}{realm.clients.size === 0 && <div>None</div>}</div>
        </InspectorSection>
        <InspectorSection title="Recent Nerve activity">
          <TraceList events={[...recentMethods, ...recentSignals]} empty="No methods or signals yet." />
        </InspectorSection>
        <InspectorSection title="Active effects">
          <TraceList events={effectPatches.map((patch) => ({ type: 'effect', name: patch.Target, timeMs: playback.timeMs, payload: patch.Properties }))} empty="No active effect patches." />
        </InspectorSection>
        <InspectorSection title="Persistence">
          <TraceList events={events.filter((event) => event.type === 'persistence').slice(-6).reverse()} empty={Object.keys(persistenceSnapshot).length ? `${Object.keys(persistenceSnapshot).length} profile(s) loaded.` : 'No persistence operations yet.'} />
        </InspectorSection>
        <InspectorSection title="Assertions">
          <TraceList events={assertionEvents} empty="No assertions evaluated." />
        </InspectorSection>

        <div className="mt-3 border-t border-border pt-3">
          <div className="mb-2 flex items-center justify-between"><span className="font-semibold">Trace timeline</span><span className="text-xs text-text-muted">{visibleEvents.length} events</span></div>
          <div className="mb-2 flex flex-wrap gap-1">{filters.map((name) => <button key={name} className={`rounded px-2 py-1 text-xs ${filter === name ? 'bg-primary text-background' : 'bg-surface-hover text-text-muted'}`} onClick={() => setFilter(name)}>{name}</button>)}</div>
          <div className="space-y-1">
            {visibleEvents.map((event) => { const index = events.indexOf(event); const failed = event.type === 'error'; return <button key={`${index}-${event.name}`} className={`flex w-full items-center gap-2 rounded px-2 py-1 text-left text-xs ${failed ? 'bg-danger/20 text-danger' : selected === index ? 'bg-primary/20 text-text' : 'bg-surface-hover text-text-muted'}`} onClick={() => setSelected(index)}><span className="w-12 shrink-0 tabular-nums">{Math.round(event.timeMs)}ms</span><span className="w-20 shrink-0 uppercase">{event.type}</span><span className="truncate">{event.name}</span></button> })}
            {visibleEvents.length === 0 && <div className="text-xs text-text-muted">No matching events.</div>}
          </div>
          {selectedEvent && <div className="mt-2 rounded border border-border bg-background p-2"><div className="mb-1 text-xs font-semibold">{selectedEvent.name} · {Math.round(selectedEvent.timeMs)}ms</div><CodeBlock value={selectedEvent.payload ?? {}} /></div>}
        </div>
      </div>}
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

function Summary({ label, value }: { label: string; value: string }) { return <div className="rounded bg-surface-hover px-2 py-1"><div className="text-text-muted">{label}</div><div className="truncate text-text">{value}</div></div> }
function InspectorSection({ title, children }: { title: string; children: ReactNode }) { return <section className="mt-3"><div className="mb-1 font-semibold">{title}</div>{children}</section> }
function TraceList({ events, empty }: { events: ScenarioTraceEvent[]; empty: string }) { return events.length ? <div className="space-y-1">{events.map((event, index) => <div key={`${event.name}-${event.timeMs}-${index}`} className={`truncate rounded bg-surface-hover px-2 py-1 text-xs ${event.type === 'error' ? 'text-danger' : 'text-text-muted'}`}>{Math.round(event.timeMs)}ms · {event.name}</div>)}</div> : <div className="text-xs text-text-muted">{empty}</div> }
function CodeBlock({ value }: { value: unknown }) { return <pre className="max-h-32 overflow-auto whitespace-pre-wrap break-words text-[11px] text-text-muted">{JSON.stringify(value, null, 2)}</pre> }
