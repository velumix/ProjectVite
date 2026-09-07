import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { RobloxRuntimeContext, RobloxViewportSize } from '../runtime/roblox-runtime.ts'
import { parameterDeviceToViewportMode, resolveRobloxViewport, type RobloxViewportMode } from './roblox-viewport.ts'

type Props = { runtime: RobloxRuntimeContext; device?: unknown; children: ReactNode }

export function RobloxViewportPreview({ runtime, device, children }: Props) {
  const stageRef = useRef<HTMLDivElement>(null)
  const [stage, setStage] = useState({ width: 0, height: 0 })
  const [mode, setMode] = useState<RobloxViewportMode>(() => parameterDeviceToViewportMode(device) ?? 'Runtime')
  const [custom, setCustom] = useState<RobloxViewportSize>({ X: 1280, Y: 720 })
  const [pixelPerfect, setPixelPerfect] = useState(false)
  const parameterMode = parameterDeviceToViewportMode(device)
  const effectiveMode = parameterMode ?? mode
  const viewport = resolveRobloxViewport(runtime, effectiveMode, custom)
  const fitScale = stage.width && stage.height ? Math.min(1, stage.width / viewport.size.X, stage.height / viewport.size.Y) : 1
  const scale = pixelPerfect ? 1 : fitScale
  const insetStyle: CSSProperties = {
    left: viewport.inset.Min.X,
    top: viewport.inset.Min.Y,
    right: viewport.inset.Max.X,
    bottom: viewport.inset.Max.Y,
  }

  useEffect(() => {
    if (!stageRef.current) return
    const observer = new ResizeObserver((entries) => { const entry = entries[0]; if (entry) setStage({ width: entry.contentRect.width, height: entry.contentRect.height }) })
    observer.observe(stageRef.current)
    return () => observer.disconnect()
  }, [])

  return <section className="workbench-viewport">
    <div className="workbench-viewport-toolbar">
      <span className="workbench-section-title">Roblox viewport</span>
      <select className="ui-input workbench-select" value={effectiveMode} onChange={(event) => setMode(event.target.value as RobloxViewportMode)}>
        <option value="Runtime">Runtime</option><option value="Desktop">Desktop</option><option value="Tablet">Tablet</option><option value="PhonePortrait">Phone portrait</option><option value="PhoneLandscape">Phone landscape</option><option value="Custom">Custom</option>
      </select>
      {effectiveMode === 'Custom' && <><input className="input w-20 py-1 text-xs" type="number" min="1" value={custom.X} onChange={(event) => setCustom({ ...custom, X: Number(event.target.value) })} aria-label="Viewport width" /><span>×</span><input className="input w-20 py-1 text-xs" type="number" min="1" value={custom.Y} onChange={(event) => setCustom({ ...custom, Y: Number(event.target.value) })} aria-label="Viewport height" /></>}
      <span className="text-text-muted">{viewport.size.X} × {viewport.size.Y}</span>
      <label className="flex items-center gap-1 text-text-muted"><input type="checkbox" checked={pixelPerfect} onChange={(event) => setPixelPerfect(event.target.checked)} /> Pixel perfect</label>
      <span className="text-text-muted">Inset {viewport.inset.Min.X},{viewport.inset.Min.Y} / {viewport.inset.Max.X},{viewport.inset.Max.Y}</span>
    </div>
    <div ref={stageRef} className="workbench-stage">
      <div className="workbench-canvas" style={{ width: viewport.size.X, height: viewport.size.Y, transform: `scale(${scale})` }}>
        {children}
        <div className="pointer-events-none absolute border border-dashed border-primary/70" style={insetStyle} />
      </div>
    </div>
  </section>
}
