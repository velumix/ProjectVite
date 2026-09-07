import { createRobloxEventAdapter } from './roblox-events.ts'
import { previewNetworkAdapter } from './preview-network.ts'

export const previewEventAdapter = createRobloxEventAdapter()

export const previewHandlers = {
  BuyButton: {
    Activated: async () => {
      console.info('BuyButton.Activated')
      const response = await previewNetworkAdapter.Network.BuyItem.send({ ItemId: 'Bat' })
      if (response.Success) previewNetworkAdapter.Network.EquipItem.send({ ItemId: 'Bat' })
      previewNetworkAdapter.preview.emitMoneyChanged({ Amount: response.RemainingMoney ?? 0 })
      previewEventAdapter.emitChanged('Inventory', 'Text', 'Preview changed')
    },
    MouseButton1Click: () => console.info('BuyButton.MouseButton1Click'),
    MouseButton1Down: (input: { UserInputType: string }) => console.info('BuyButton.MouseButton1Down', input.UserInputType),
    MouseButton1Up: (input: { UserInputType: string }) => console.info('BuyButton.MouseButton1Up', input.UserInputType),
    InputBegan: (input: { UserInputType: string }) => console.info('BuyButton.InputBegan', input.UserInputType),
    InputEnded: (input: { UserInputType: string }) => console.info('BuyButton.InputEnded', input.UserInputType),
  },
  Inventory: {
    Changed: (propertyName: string) => console.info('Inventory.Changed', propertyName),
    MouseEnter: () => console.info('Inventory.MouseEnter'),
    MouseLeave: () => console.info('Inventory.MouseLeave'),
    InputChanged: (input: { Position: { X: number; Y: number } }) => console.info('Inventory.InputChanged', input.Position),
    GetPropertyChangedSignal: {
      Text: () => console.info('Inventory.GetPropertyChangedSignal("Text")'),
    },
  },
}
