import { createBrowserNetworkAdapter } from '../shared/network-adapter.ts'

export const previewNetworkAdapter = createBrowserNetworkAdapter({
  handlers: {
    BuyItem: async (request) => {
      console.info('Network.BuyItem.send', request)
      return { Success: true, RemainingMoney: 100 }
    },
    GetInventory: async () => ({
      Items: [{ ItemId: 'Bat', Quantity: 1 }],
    }),
    EquipItem: (request) => console.info('Network.EquipItem.send', request),
  },
})
