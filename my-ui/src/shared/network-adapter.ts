import type {
  BuyItemRequest,
  BuyItemResponse,
  Disconnect,
  EquipItemRequest,
  GetInventoryRequest,
  GetInventoryResponse,
  InventoryChangedPayload,
  MoneyChangedPayload,
  NetworkTransport,
  RobloxNetworkApi,
  Signal,
} from './roblox-contracts.ts'

export type NetworkValidators = {
  BuyItemRequest: (payload: unknown) => payload is BuyItemRequest
  BuyItemResponse: (payload: unknown) => payload is BuyItemResponse
  GetInventoryRequest: (payload: unknown) => payload is GetInventoryRequest
  GetInventoryResponse: (payload: unknown) => payload is GetInventoryResponse
  EquipItemRequest: (payload: unknown) => payload is EquipItemRequest
  MoneyChangedPayload: (payload: unknown) => payload is MoneyChangedPayload
  InventoryChangedPayload: (payload: unknown) => payload is InventoryChangedPayload
}

export const networkValidators: NetworkValidators = {
  BuyItemRequest: (payload): payload is BuyItemRequest =>
    isRecord(payload) && typeof payload.ItemId === 'string',
  BuyItemResponse: (payload): payload is BuyItemResponse =>
    isRecord(payload) && typeof payload.Success === 'boolean',
  GetInventoryRequest: (payload): payload is GetInventoryRequest =>
    isRecord(payload) && Object.keys(payload).length === 0,
  GetInventoryResponse: (payload): payload is GetInventoryResponse =>
    isRecord(payload) && Array.isArray(payload.Items),
  EquipItemRequest: (payload): payload is EquipItemRequest =>
    isRecord(payload) && typeof payload.ItemId === 'string',
  MoneyChangedPayload: (payload): payload is MoneyChangedPayload =>
    isRecord(payload) && typeof payload.Amount === 'number',
  InventoryChangedPayload: (payload): payload is InventoryChangedPayload =>
    isRecord(payload) && typeof payload.ItemId === 'string' && typeof payload.Quantity === 'number',
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function assertPayload<TPayload>(
  payloadName: keyof NetworkValidators,
  payload: unknown,
): asserts payload is TPayload {
  if (!networkValidators[payloadName](payload)) {
    throw new Error(`Invalid Roblox network payload: ${payloadName}`)
  }
}

class LocalSignal<TPayload> implements Signal<TPayload> {
  private readonly listeners = new Set<(payload: TPayload) => void>()

  connect(listener: (payload: TPayload) => void): Disconnect {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  emit(payload: TPayload): void {
    for (const listener of this.listeners) listener(payload)
  }
}

export type BrowserNetworkHandlers = {
  BuyItem?: (request: BuyItemRequest) => BuyItemResponse | Promise<BuyItemResponse>
  GetInventory?: (request: GetInventoryRequest) => GetInventoryResponse | Promise<GetInventoryResponse>
  EquipItem?: (request: EquipItemRequest) => void
}

export type BrowserNetworkAdapterOptions = {
  handlers?: BrowserNetworkHandlers
  responses?: {
    BuyItem?: BuyItemResponse
    GetInventory?: GetInventoryResponse
  }
}

export type BrowserNetworkAdapter = {
  Network: RobloxNetworkApi
  transport: NetworkTransport
  preview: {
    emitMoneyChanged(payload: MoneyChangedPayload): void
    emitInventoryChanged(payload: InventoryChangedPayload): void
  }
}

const defaultResponses = {
  BuyItem: {
    Success: true,
    RemainingMoney: 100,
  },
  GetInventory: {
    Items: [{ ItemId: 'Bat', Quantity: 1 }],
  },
} satisfies NonNullable<BrowserNetworkAdapterOptions['responses']>

export function createBrowserNetworkAdapter(
  options: BrowserNetworkAdapterOptions = {},
): BrowserNetworkAdapter {
  const moneyChanged = new LocalSignal<MoneyChangedPayload>()
  const inventoryChanged = new LocalSignal<InventoryChangedPayload>()

  const transport: NetworkTransport = {
    async request<TRequest, TResponse>(messageName: string, payload: TRequest): Promise<TResponse> {
      if (messageName === 'BuyItem') {
        assertPayload<BuyItemRequest>('BuyItemRequest', payload)
        const response = await options.handlers?.BuyItem?.(payload)
        const resolvedResponse = response ?? options.responses?.BuyItem ?? defaultResponses.BuyItem
        assertPayload<BuyItemResponse>('BuyItemResponse', resolvedResponse)
        return resolvedResponse as TResponse
      }

      if (messageName === 'GetInventory') {
        assertPayload<GetInventoryRequest>('GetInventoryRequest', payload)
        const response = await options.handlers?.GetInventory?.(payload)
        const resolvedResponse = response ?? options.responses?.GetInventory ?? defaultResponses.GetInventory
        assertPayload<GetInventoryResponse>('GetInventoryResponse', resolvedResponse)
        return resolvedResponse as TResponse
      }

      throw new Error(`Unknown Roblox request: ${messageName}`)
    },
    send(messageName, payload) {
      if (messageName === 'EquipItem') {
        assertPayload<EquipItemRequest>('EquipItemRequest', payload)
        options.handlers?.EquipItem?.(payload)
        return
      }

      throw new Error(`Unknown Roblox one-way message: ${messageName}`)
    },
    connect(messageName, listener) {
      if (messageName === 'MoneyChanged') return moneyChanged.connect(listener as (payload: MoneyChangedPayload) => void)
      if (messageName === 'InventoryChanged') return inventoryChanged.connect(listener as (payload: InventoryChangedPayload) => void)
      throw new Error(`Unknown Roblox event: ${messageName}`)
    },
  }

  const Network: RobloxNetworkApi = {
    BuyItem: {
      send: (payload) => transport.request<BuyItemRequest, BuyItemResponse>('BuyItem', payload),
    },
    GetInventory: {
      request: (payload) => transport.request<GetInventoryRequest, GetInventoryResponse>('GetInventory', payload),
    },
    EquipItem: {
      send: (payload) => transport.send('EquipItem', payload),
    },
    MoneyChanged: {
      connect: (listener) => transport.connect('MoneyChanged', listener),
    },
    InventoryChanged: {
      connect: (listener) => transport.connect('InventoryChanged', listener),
    },
  }

  return {
    Network,
    transport,
    preview: {
      emitMoneyChanged: (payload) => {
        assertPayload<MoneyChangedPayload>('MoneyChangedPayload', payload)
        moneyChanged.emit(payload)
      },
      emitInventoryChanged: (payload) => {
        assertPayload<InventoryChangedPayload>('InventoryChangedPayload', payload)
        inventoryChanged.emit(payload)
      },
    },
  }
}
