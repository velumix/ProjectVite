export type MoneyChangedPayload = {
  Amount: number
}

export type InventoryChangedPayload = {
  ItemId: string
  Quantity: number
}

export type BuyItemRequest = {
  ItemId: string
}

export type BuyItemResponse = {
  Success: boolean
  Reason?: string
  RemainingMoney?: number
}

export type GetInventoryRequest = Record<string, never>

export type InventoryItem = {
  ItemId: string
  Quantity: number
}

export type GetInventoryResponse = {
  Items: InventoryItem[]
}

export type EquipItemRequest = {
  ItemId: string
}

export type Disconnect = () => void

export type Signal<TPayload> = {
  connect(listener: (payload: TPayload) => void): Disconnect
}

export type NetworkMessage<TRequest, TResponse> = {
  send(payload: TRequest): Promise<TResponse>
}

export type NetworkRequest<TRequest, TResponse> = {
  request(payload: TRequest): Promise<TResponse>
}

export type OneWayMessage<TPayload> = {
  send(payload: TPayload): void
}

export type NetworkTransport = {
  request<TRequest, TResponse>(messageName: string, payload: TRequest): Promise<TResponse>
  send<TPayload>(messageName: string, payload: TPayload): void
  connect<TPayload>(messageName: string, listener: (payload: TPayload) => void): Disconnect
}

export type RobloxNetworkApi = {
  BuyItem: NetworkMessage<BuyItemRequest, BuyItemResponse>
  GetInventory: NetworkRequest<GetInventoryRequest, GetInventoryResponse>
  EquipItem: OneWayMessage<EquipItemRequest>
  MoneyChanged: Signal<MoneyChangedPayload>
  InventoryChanged: Signal<InventoryChangedPayload>
}

export type RobloxUiApi = {
  Network: RobloxNetworkApi
  Signals: {
    MoneyChanged: Signal<MoneyChangedPayload>
    InventoryChanged: Signal<InventoryChangedPayload>
  }
}

export const SIGNAL_DEFINITIONS = {
  MoneyChanged: {
    Name: 'MoneyChanged',
    Kind: 'Event',
    Payload: 'MoneyChangedPayload',
    Direction: 'ServerToClient',
  },
  InventoryChanged: {
    Name: 'InventoryChanged',
    Kind: 'Event',
    Payload: 'InventoryChangedPayload',
    Direction: 'ServerToClient',
  },
} as const

export const NETWORK_DEFINITIONS = {
  BuyItem: {
    Name: 'BuyItem',
    Kind: 'RequestResponse',
    Request: 'BuyItemRequest',
    Response: 'BuyItemResponse',
    Direction: 'ClientToServer',
  },
  GetInventory: {
    Name: 'GetInventory',
    Kind: 'RequestResponse',
    Request: 'GetInventoryRequest',
    Response: 'GetInventoryResponse',
    Direction: 'ClientToServer',
  },
  EquipItem: {
    Name: 'EquipItem',
    Kind: 'OneWay',
    Payload: 'EquipItemRequest',
    Direction: 'ClientToServer',
  },
  MoneyChanged: SIGNAL_DEFINITIONS.MoneyChanged,
  InventoryChanged: SIGNAL_DEFINITIONS.InventoryChanged,
} as const
