import { useEffect, useMemo, useState } from 'react'
import { RobloxRenderer } from './renderer/RobloxRenderer.tsx'
import { previewEventAdapter } from './renderer/preview-handlers.ts'
import { previewNetworkAdapter } from './renderer/preview-network.ts'
import { createScenarioRunner } from './scenarios/scenario-runner.ts'
import type { PlaybackSpeed, ScenarioPlaybackState } from './scenarios/scenario-runner.ts'
import { nervePreview } from './nerve/preview.ts'
import { applyEffectPatches, createEffectPlayer } from './effects/roblox-effects.ts'
import { applyBindings, createReactiveBindingStore } from './bindings/reactive-bindings.ts'
import { createPreviewActions, createPreviewHandlers } from './actions/preview-actions.ts'
import { compileRobloxProject } from './features/project-compiler.ts'
import { PreviewFeature } from './features/preview-feature.ts'
import { ShopFeature } from './features/shop-feature.ts'
import { createRobloxRuntimeContext } from './runtime/roblox-runtime.ts'
import { createRobloxPersistence } from './persistence/roblox-persistence.ts'
import { createRobloxRealm } from './realm/roblox-realm.ts'
import { ScenarioInspector } from './scenarios/ScenarioInspector.tsx'
import { ScenarioParameters } from './scenarios/ScenarioParameters.tsx'
import { RobloxViewportPreview } from './viewport/RobloxViewportPreview.tsx'

function App() {
  const bindingStore = useMemo(() => createReactiveBindingStore(), [])
  const runtime = useMemo(() => createRobloxRuntimeContext(), [])
  const persistence = useMemo(() => createRobloxPersistence(), [])
  const realm = useMemo(() => createRobloxRealm(persistence), [persistence])
  const featureProject = useMemo(() => compileRobloxProject([PreviewFeature, ShopFeature]), [])
  const compiledTree = featureProject.Tree
  const effectPlayer = useMemo(() => createEffectPlayer(compiledTree, featureProject.Effects), [compiledTree, featureProject])
  const [scenarioId, setScenarioId] = useState(featureProject.Scenarios[0].id)
  const activeScenario = featureProject.Scenarios.find((scenario) => scenario.id === scenarioId) ?? featureProject.Scenarios[0]
  const scenarioRunner = useMemo(() => createScenarioRunner({ nerve: nervePreview, network: previewNetworkAdapter, effects: effectPlayer, bindings: bindingStore, runtime, persistence, realm }), [bindingStore, effectPlayer, persistence, realm, runtime])
    const actions = useMemo(() => createPreviewActions({ bindings: bindingStore, effects: effectPlayer, nerve: nervePreview, network: previewNetworkAdapter, persistence, getTimeMs: () => scenarioRunner.getState().timeMs, getTrace: scenarioRunner.getTrace }, featureProject.Actions), [bindingStore, effectPlayer, featureProject.Actions, persistence, scenarioRunner])
  const previewHandlers = useMemo(() => createPreviewHandlers(actions, featureProject.ActionBindings, featureProject.EffectHooks, effectPlayer, () => scenarioRunner.getState().timeMs), [actions, effectPlayer, featureProject.ActionBindings, featureProject.EffectHooks, scenarioRunner])
  const [playback, setPlayback] = useState<ScenarioPlaybackState>(scenarioRunner.getState())
  const [effectPatches, setEffectPatches] = useState(effectPlayer.getPatches())
  const [parameters, setParameters] = useState<Record<string, unknown>>({})
  const [, setBindingVersion] = useState(0)
  const renderedTree = applyEffectPatches(applyBindings(compiledTree, bindingStore), effectPatches)

  useEffect(() => {
    scenarioRunner.start(activeScenario)
    const playbackConnection = scenarioRunner.subscribe((state) => {
      setPlayback(state)
      setEffectPatches(effectPlayer.getPatches())
    })
    const bindingConnection = bindingStore.subscribe(() => setBindingVersion((version) => version + 1))
    const moneyConnection = previewNetworkAdapter.Network.MoneyChanged.connect((payload) => {
      console.info('Network.MoneyChanged.connect', payload.Amount)
    })

    void previewNetworkAdapter.Network.GetInventory.request({}).then((response) => {
      console.info('Network.GetInventory.request', response.Items)
    })

    return () => {
      moneyConnection()
      playbackConnection()
      bindingConnection()
      actions.cancel()
      scenarioRunner.stop()
    }
  }, [actions, activeScenario, bindingStore, effectPlayer, featureProject, scenarioId, scenarioRunner])

  return (
    <main className="workbench">
      <section className="workbench-toolbar">
        <div className="workbench-toolbar-row">
        <select className="ui-input workbench-select" value={scenarioId} onChange={(event) => { const nextId = event.target.value; setScenarioId(nextId); const nextScenario = featureProject.Scenarios.find((scenario) => scenario.id === nextId); setParameters(Object.fromEntries(Object.entries(nextScenario?.parameters ?? {}).map(([name, definition]) => [name, definition.default]))) }} aria-label="Scenario">
          {featureProject.Scenarios.map((scenario) => <option key={scenario.id} value={scenario.id}>{scenario.name}</option>)}
        </select>
          <button className="ui-button ui-button-primary workbench-control" onClick={() => scenarioRunner.play()}>Play</button>
          <button className="ui-button ui-button-secondary workbench-control" onClick={() => scenarioRunner.pause()}>Pause</button>
          <button className="ui-button ui-button-secondary workbench-control" onClick={() => { actions.cancel(); scenarioRunner.restart() }}>Restart</button>
          <button className="ui-button ui-button-secondary workbench-control" onClick={() => scenarioRunner.stepForward()}>Step</button>
          <select className="ui-input workbench-select workbench-speed" value={playback.speed} onChange={(event) => scenarioRunner.setSpeed(Number(event.target.value) as PlaybackSpeed)} aria-label="Playback speed">
            {[0.25, 0.5, 1, 2].map((speed) => <option key={speed} value={speed}>{speed}x</option>)}
          </select>
          <span className="workbench-readout">{Math.round(playback.timeMs)}ms / {playback.durationMs}ms</span>
          <span className="workbench-step">{playback.currentStep ?? 'Ready'}</span>
          {featureProject.Scenarios.find((scenario) => scenario.id === scenarioId)?.triggers?.map((trigger) => (
            <button key={trigger.id} className="ui-button ui-button-secondary workbench-control" onClick={() => scenarioRunner.trigger(trigger.id)}>{trigger.label}</button>
          ))}
        </div>
        <ScenarioParameters definitions={activeScenario.parameters ?? {}} values={parameters} onChange={(name, value) => { scenarioRunner.setParameter(name, value); setParameters(scenarioRunner.getParameters()) }} />
        <input className="workbench-timeline" type="range" min="0" max={playback.durationMs} step="1" value={playback.timeMs} onChange={(event) => { actions.cancel(); scenarioRunner.scrub(Number(event.target.value)) }} aria-label="Scenario timeline" />
      </section>
      <ScenarioInspector
        scenarioName={featureProject.Scenarios.find((scenario) => scenario.id === scenarioId)?.name}
        playback={playback}
        events={scenarioRunner.getTrace().events()}
        bindings={bindingStore}
        realm={realm}
        effectPatches={effectPatches}
        persistenceSnapshot={persistence.snapshot()}
      />
      <RobloxViewportPreview runtime={runtime} device={parameters.Device}>
        <RobloxRenderer tree={renderedTree} Handlers={previewHandlers} eventAdapter={previewEventAdapter} />
      </RobloxViewportPreview>
    </main>
  )
}

export default App
