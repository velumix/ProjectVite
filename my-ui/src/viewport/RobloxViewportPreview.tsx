import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { RobloxRuntimeContext, RobloxViewportSize } from '../runtime/roblox-runtime.ts'
import {
  parameterDeviceToViewportMode,
  resolveRobloxViewport,
  type RobloxViewportMode,
} from './roblox-viewport.ts'

type Props = {
  runtime: RobloxRuntimeContext
  device?: unknown
  children: ReactNode
}

export function RobloxViewportPreview({ runtime, device, children }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ width: 0, height: 0 })
  const parameterMode = parameterDeviceToViewportMode(device)
  const [selection, setSelection] = useState<{ parameterMode?: RobloxViewportMode; mode: RobloxViewportMode }>(
    () => ({ parameterMode, mode: parameterMode ?? 'Runtime' }),
  )
  const [custom, setCustom] = useState<RobloxViewportSize>({ X: 1280, Y: 720 })
  const [pixelPerfect, setPixelPerfect] = useState(false)
  const [expanded, setExpanded] = useState(false)
  const [showSafeArea, setShowSafeArea] = useState(false)

  const effectiveMode = selection.parameterMode === parameterMode ? selection.mode : parameterMode ?? 'Runtime'
  const viewport = resolveRobloxViewport(runtime, effectiveMode, custom)

  const fitScale =
    stage.width && stage.height
      ? Math.max(.01, Math.min(stage.width / viewport.size.X, stage.height / viewport.size.Y))
      : 1
  const scale = pixelPerfect ? 1 : fitScale

  const insetStyle: CSSProperties = {
    left: viewport.inset.Min.X,
    top: viewport.inset.Min.Y,
    right: viewport.inset.Max.X,
    bottom: viewport.inset.Max.Y,
  }

  useEffect(() => {
    if (!stageRef.current) return
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]
      if (entry) {
        setStage({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        })
      }
    })
    observer.observe(stageRef.current)
    return () => observer.disconnect()
  }, [])

  return (
    <section className={`ag-viewport-section${expanded ? ' ag-viewport-expanded' : ''}`}>
      {/* Sub-toolbar: Device & Canvas Controls */}
      <div className="ag-viewport-toolbar">
        <div className="flex items-center gap-2">
          <span className="ag-viewport-title">Viewport</span>

          <div className="ag-select-wrapper">
            <select
              className="ag-select-field"
              value={effectiveMode}
              onChange={(e) => setSelection({ parameterMode, mode: e.target.value as RobloxViewportMode })}
              aria-label="Viewport device mode"
            >
              <option value="Runtime">Runtime Viewport</option>
              <option value="Desktop">Desktop (1280 × 720)</option>
              <option value="Tablet">Tablet (1024 × 768)</option>
              <option value="PhonePortrait">Mobile Portrait (390 × 844)</option>
              <option value="PhoneLandscape">Mobile Landscape (844 × 390)</option>
              <option value="Custom">Custom Size...</option>
            </select>
          </div>

          {effectiveMode === 'Custom' && (
            <div className="flex items-center gap-1">
              <input
                className="ag-input-number w-18"
                type="number"
                min="1"
                value={custom.X}
                onChange={(e) => setCustom({ ...custom, X: Number(e.target.value) })}
                aria-label="Viewport width"
              />
              <span className="text-ag-text-dim text-xs">×</span>
              <input
                className="ag-input-number w-18"
                type="number"
                min="1"
                value={custom.Y}
                onChange={(e) => setCustom({ ...custom, Y: Number(e.target.value) })}
                aria-label="Viewport height"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <span className="ag-pill-badge font-mono">
            {viewport.size.X} × {viewport.size.Y}
          </span>

          <label className="ag-toggle-label">
            <input
              type="checkbox"
              className="ag-checkbox"
              checked={pixelPerfect}
              onChange={(e) => setPixelPerfect(e.target.checked)}
            />
            <span>100% Scale</span>
          </label>

          <span className="ag-pill-badge font-mono text-[10px]" title="Safe Area Inset">
            Inset: {viewport.inset.Min.X},{viewport.inset.Min.Y}
          </span>

          <span className="ag-scale-indicator font-mono">
            {Math.round(scale * 100)}%
          </span>
          <label className="ag-toggle-label">
            <input type="checkbox" className="ag-checkbox" checked={showSafeArea} onChange={event => setShowSafeArea(event.target.checked)} />
            <span>Safe area</span>
          </label>
          <button type="button" className="ag-btn-secondary" onClick={() => setExpanded(value => !value)}>
            {expanded ? 'Exit preview' : 'Expand preview'}
          </button>
        </div>
      </div>

      {/* Canvas Stage */}
      <div ref={stageRef} className="ag-canvas-stage">
        <div className="ag-canvas-size" style={{ width: viewport.size.X * scale, height: viewport.size.Y * scale }}>
          <div
            className="ag-canvas-frame"
            data-viewport-mode={effectiveMode}
            data-viewport-w={viewport.size.X}
            data-viewport-h={viewport.size.Y}
            style={{
              width: viewport.size.X,
              height: viewport.size.Y,
              transform: `scale(${scale})`,
              '--canvas-w': `${viewport.size.X}px`,
              '--canvas-h': `${viewport.size.Y}px`,
              '--canvas-scale': scale,
            } as CSSProperties}
          >
            {children}
            {showSafeArea && <div
              className="pointer-events-none absolute border border-dashed border-blue-500/60"
              style={insetStyle}
              title="Roblox Safe Area Boundary"
            />}
          </div>
        </div>
      </div>
    </section>
  )
}
