import { useEffect } from 'react'
import { RobloxRenderer } from './renderer/RobloxRenderer.tsx'
import { previewEventAdapter, previewHandlers } from './renderer/preview-handlers.ts'
import { previewNetworkAdapter } from './renderer/preview-network.ts'
import { previewTree } from './renderer/preview-tree.ts'

function App() {
  useEffect(() => {
    const moneyConnection = previewNetworkAdapter.Network.MoneyChanged.connect((payload) => {
      console.info('Network.MoneyChanged.connect', payload.Amount)
    })

    void previewNetworkAdapter.Network.GetInventory.request({}).then((response) => {
      console.info('Network.GetInventory.request', response.Items)
    })

    return moneyConnection
  }, [])

  return (
    <main className="h-screen bg-background text-text">
      <RobloxRenderer tree={previewTree} Handlers={previewHandlers} eventAdapter={previewEventAdapter} />
    </main>
  )
}

export default App
