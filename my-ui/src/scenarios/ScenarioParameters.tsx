import type { ScenarioParameter } from './scenario-runner.ts'

type Props = { definitions: Record<string, ScenarioParameter>; values: Record<string, unknown>; onChange(name: string, value: unknown): void }

export function ScenarioParameters({ definitions, values, onChange }: Props) {
  const entries = Object.entries(definitions)
  if (entries.length === 0) return null
  return <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-border pt-2 text-xs">
    <span className="text-text-muted">Parameters</span>
    {entries.map(([name, definition]) => <label key={name} className="flex items-center gap-1 rounded bg-surface-hover px-2 py-1">
      <span className="text-text-muted">{name}</span>
      {definition.type === 'boolean' && <input type="checkbox" checked={values[name] === true} onChange={(event) => onChange(name, event.target.checked)} />}
      {definition.type === 'number' && <input className="w-20 bg-transparent text-text outline-none" type="number" value={String(values[name] ?? definition.default)} min={definition.min} max={definition.max} step={definition.step} onChange={(event) => onChange(name, Number(event.target.value))} />}
      {definition.type === 'string' && <input className="w-24 bg-transparent text-text outline-none" type="text" value={String(values[name] ?? definition.default)} onChange={(event) => onChange(name, event.target.value)} />}
      {definition.type === 'select' && <select className="bg-transparent text-text outline-none" value={String(values[name] ?? definition.default)} onChange={(event) => onChange(name, event.target.value)}>{definition.options.map((option) => <option key={option} value={option}>{option}</option>)}</select>}
    </label>)}
  </div>
}
