import { useState } from 'react'
import { createRoot } from 'react-dom/client'
import { RobloxRenderer, type RobloxInstanceJson } from '../src/renderer/RobloxRenderer'

const tree: RobloxInstanceJson = {
  ClassName: 'ScreenGui', Name: 'TestGui', Children: [
    { ClassName: 'ImageButton', Name: 'ImageAction', Size: { X: { Scale: 0, Offset: 100 }, Y: { Scale: 0, Offset: 50 } },
      Children: [{ ClassName: 'TextLabel', Name: 'ButtonCaption', Text: 'Image action' }] },
    { ClassName: 'TextLabel', Name: 'HiddenAlignedLabel', Text: 'Hidden', Visible: false, TextXAlignment: 'Center' },
    { ClassName: 'Frame', Name: 'HiddenList', Visible: false, Children: [
      { ClassName: 'UIListLayout' }, { ClassName: 'TextLabel', Text: 'Hidden list child' },
    ] },
    { ClassName: 'Frame', Name: 'EmptyOverlay', BackgroundTransparency: 1, ZIndex: 10,
      Size: { X: { Scale: 1, Offset: 0 }, Y: { Scale: 1, Offset: 0 } } },
  ],
}

export function Fixture() {
  const [activated, setActivated] = useState(0)
  const [clicked, setClicked] = useState(0)
  const [observed, setObserved] = useState(0)
  const [parent, setParent] = useState(0)
  return <>
    <div style={{ width: 400, height: 300 }}>
      <RobloxRenderer tree={tree} Handlers={{
        ImageAction: { Activated: () => setActivated(value => value + 1), MouseButton1Click: () => setClicked(value => value + 1) },
        TestGui: { Activated: () => setParent(value => value + 1) },
      }} onInstanceActivated={() => setObserved(value => value + 1)} />
    </div>
    <output>{JSON.stringify({ activated, clicked, observed, parent })}</output>
  </>
}

createRoot(document.getElementById('root')!).render(<Fixture />)
