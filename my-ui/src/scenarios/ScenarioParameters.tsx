import { useState } from 'react'
import type { ScenarioParameter } from './scenario-runner.ts'

type Props = {
  definitions: Record<string, ScenarioParameter>
  values: Record<string, unknown>
  onChange(name: string, value: unknown): void
}

export function ScenarioParameters({ definitions, values, onChange }: Props) {
  const entries = Object.entries(definitions)
  const [collapsed, setCollapsed] = useState(false)

  if (entries.length === 0) return null

  return (
    <div className="ag-parameters-container">
      <div className="ag-parameters-header">
        <button
          type="button"
          className="ag-parameters-toggle"
          onClick={() => setCollapsed((prev) => !prev)}
        >
          <svg
            className={`ag-chevron ${collapsed ? '-rotate-90' : 'rotate-0'}`}
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
          <span className="ag-parameters-title">Parameters</span>
          <span className="ag-pill-badge">{entries.length}</span>
        </button>
      </div>

      {!collapsed && (
        <div className="ag-parameters-grid">
          {entries.map(([name, definition]) => {
            const currentValue = values[name] ?? definition.default

            return (
              <div key={name} className="ag-parameter-item">
                <span className="ag-parameter-label" title={name}>
                  {name}
                </span>

                {definition.type === 'boolean' && (
                  <label className="ag-switch">
                    <input
                      type="checkbox"
                      checked={currentValue === true}
                      onChange={(e) => onChange(name, e.target.checked)}
                    />
                    <span className="ag-switch-slider" />
                  </label>
                )}

                {definition.type === 'number' && (
                  <div className="ag-number-wrapper">
                    <input
                      className="ag-input-number"
                      type="number"
                      value={String(currentValue)}
                      min={definition.min}
                      max={definition.max}
                      step={definition.step ?? 1}
                      onChange={(e) => onChange(name, Number(e.target.value))}
                    />
                  </div>
                )}

                {definition.type === 'string' && (
                  <input
                    className="ag-input-text"
                    type="text"
                    value={String(currentValue)}
                    onChange={(e) => onChange(name, e.target.value)}
                  />
                )}

                {definition.type === 'select' && (
                  <div className="ag-select-wrapper">
                    <select
                      className="ag-select-field"
                      value={String(currentValue)}
                      onChange={(e) => onChange(name, e.target.value)}
                    >
                      {definition.options.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
