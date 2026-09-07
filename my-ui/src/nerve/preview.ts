import { nerveManifest } from '../generated/nerve-manifest.ts'
import { createNerveBrowserAdapter } from './browser-adapter.ts'
import type { NerveMethod, NerveSignal } from './contracts.ts'
import type { RobloxPersistence } from '../persistence/roblox-persistence.ts'
import {
  INITIAL_SETTINGS_STATE,
  SETTINGS_DATASTORE_KEY,
  SETTINGS_DATASTORE_NAME,
  normalizeSettings,
  type StreamlinedSettingsState,
} from '../settings/settings-data.ts'

export type PreviewInventoryService = {
  BuyItem: NerveMethod<string, [boolean, string?, number?]>
  GetInventory: NerveMethod<undefined, [{ ItemId: string; Quantity: number }]>
  EquipItem: NerveSignal<[string]>
  MoneyChanged: NerveSignal<[number]>
  InventoryChanged: NerveSignal<[string, number]>
}

export type PreviewSettingsService = {
  GetSettings: NerveMethod<undefined, [StreamlinedSettingsState]>
  SaveSettings: NerveMethod<StreamlinedSettingsState, [boolean, string?]>
  SettingsChanged: NerveSignal<[StreamlinedSettingsState]>
}

export type PhoneSettings = {
  airplaneMode: boolean
  wifiEnabled: boolean
  bluetoothEnabled: boolean
  darkMode: boolean
  ringtone: string
}

export type PhoneContact = { id: string; name: string; number: string }
export type PhoneConversation = { contactId: string; lastMessage: string; time: string; unread: number }
export type PhoneMessage = { id: string; body: string; fromPlayer: boolean; time: string }
export type PhoneState = {
  phoneNumber: string
  battery: number
  contacts: PhoneContact[]
  conversations: PhoneConversation[]
  settings: PhoneSettings
}

export type PreviewPhoneService = {
  GetPhoneState: NerveMethod<undefined, [PhoneState]>
  GetMessages: NerveMethod<string, [PhoneMessage[]]>
  SendMessage: NerveMethod<{ number: string; body: string }, [boolean, string?]>
  StartCall: NerveMethod<string, [boolean, string?]>
  EndCall: NerveMethod<undefined, [boolean, string?]>
  SavePhoneSettings: NerveMethod<PhoneSettings, [boolean, string?]>
  MessageReceived: NerveSignal<[string, string]>
  CallStateChanged: NerveSignal<[string, string]>
  PhoneSettingsChanged: NerveSignal<[PhoneSettings]>
}

export type BankingTransactionKind = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out'

export type BankingTransaction = {
  id: string
  kind: BankingTransactionKind
  amount: number
  label: string
  reference: string
  createdAt: number
}

export type BankingOverview = {
  bank: number
  cash: number
  currency: string
  playerId: number
  playerName: string
  transactions: BankingTransaction[]
}

export type BankingNotification = {
  kind: string
  amount: number
  currency: string
  sender?: string
  label?: string
}

export type PreviewBankingService = {
  GetBankingOverview: NerveMethod<undefined, [BankingOverview]>
  TransferMoney: NerveMethod<{ amount: number; phoneNumber: string; note?: string }, [boolean, string?]>
  DepositMoney: NerveMethod<{ amount: number }, [boolean, string?]>
  WithdrawMoney: NerveMethod<{ amount: number }, [boolean, string?]>
  BankingChanged: NerveSignal<[BankingNotification]>
}

const INITIAL_PHONE_STATE: PhoneState = {
  phoneNumber: '555-0199',
  battery: 87,
  contacts: [
    { id: 'alex', name: 'Alex Morgan', number: '555-0142' },
    { id: 'bank', name: 'Sun City Bank', number: '555-0100' },
    { id: 'services', name: 'City Services', number: '555-0111' },
  ],
  conversations: [
    { contactId: 'alex', lastMessage: 'Meet at the central garage?', time: '12:18', unread: 1 },
    { contactId: 'bank', lastMessage: 'Your account is ready to use.', time: '11:52', unread: 0 },
    { contactId: 'services', lastMessage: 'Stop by City Hall to learn about local jobs.', time: '09:30', unread: 0 },
  ],
  settings: { airplaneMode: false, wifiEnabled: true, bluetoothEnabled: true, darkMode: true, ringtone: 'Aurora' },
}

const INITIAL_PHONE_MESSAGES: Record<string, PhoneMessage[]> = {
  alex: [
    { id: 'alex-1', body: 'I left the car at the central garage. Meet you there?', fromPlayer: false, time: '12:18' },
    { id: 'alex-2', body: 'Sure, I will be there in five.', fromPlayer: true, time: '12:20' },
  ],
  bank: [{ id: 'bank-1', body: 'Welcome back. Your account is ready to use.', fromPlayer: false, time: '11:52' }],
  services: [{ id: 'services-1', body: 'New in town? Stop by City Hall to learn about local jobs.', fromPlayer: false, time: '09:30' }],
}

const INITIAL_BANKING_STATE: BankingOverview = {
  bank: 24850,
  cash: 1240,
  currency: '$',
  playerId: 1042,
  playerName: 'Player One',
  transactions: [
    {
      id: 'tx-1',
      kind: 'transfer_in',
      amount: 1500,
      label: 'Cargo Delivery (Alex Mercer)',
      reference: 'REF-98214',
      createdAt: Date.now() - 3600000 * 2,
    },
    {
      id: 'tx-2',
      kind: 'transfer_out',
      amount: 350,
      label: "Benny's Motorworks",
      reference: 'REF-98188',
      createdAt: Date.now() - 3600000 * 18,
    },
    {
      id: 'tx-3',
      kind: 'deposit',
      amount: 5000,
      label: 'ATM Deposit (Legion Square)',
      reference: 'REF-97992',
      createdAt: Date.now() - 3600000 * 36,
    },
    {
      id: 'tx-4',
      kind: 'transfer_out',
      amount: 120,
      label: 'Sun City Power & Water',
      reference: 'REF-97640',
      createdAt: Date.now() - 3600000 * 60,
    },
  ],
}

export type NervePreviewOptions = {
  persistence?: RobloxPersistence
  playerKey?: string
}

export function createNervePreview(options: NervePreviewOptions = {}) {
  const playerKey = options.playerKey ?? SETTINGS_DATASTORE_KEY
  let cachedSettings = { ...INITIAL_SETTINGS_STATE }
  let phoneState: PhoneState = clonePhoneState(INITIAL_PHONE_STATE)
  const phoneMessages = Object.fromEntries(Object.entries(INITIAL_PHONE_MESSAGES).map(([key, messages]) => [key, [...messages]])) as Record<string, PhoneMessage[]>
  let activeCall: { number: string } | undefined
  let bankingState: BankingOverview = {
    ...INITIAL_BANKING_STATE,
    transactions: [...INITIAL_BANKING_STATE.transactions],
  }
  let adapter: ReturnType<typeof createNerveBrowserAdapter>

  const readSettings = async (): Promise<StreamlinedSettingsState> => {
    if (!options.persistence) return { ...cachedSettings }
    const stored = await options.persistence.DataStoreService
      .GetDataStore(SETTINGS_DATASTORE_NAME)
      .GetAsync(playerKey)
    if (!isRecord(stored)) return { ...INITIAL_SETTINGS_STATE }
    return normalizeSettings('Settings' in stored ? stored.Settings : stored)
  }

  adapter = createNerveBrowserAdapter({
    manifest: nerveManifest,
    handlers: {
      'InventoryService.BuyItem': async (payload) => {
        if (typeof payload !== 'string') throw new Error('BuyItem expects an item id')
        return [payload.length > 0, payload.length > 0 ? undefined : 'Invalid item', 100]
      },
      'InventoryService.GetInventory': () => [{ ItemId: 'Bat', Quantity: 1 }],
      'SettingsService.GetSettings': async () => {
        cachedSettings = await readSettings()
        return [cachedSettings]
      },
      'SettingsService.SaveSettings': async (payload) => {
        if (!isRecord(payload)) return [false, 'Invalid settings payload']
        const nextSettings = normalizeSettings(payload)
        if (options.persistence) {
          await options.persistence.DataStoreService
            .GetDataStore(SETTINGS_DATASTORE_NAME)
            .UpdateAsync(playerKey, (current) => ({
              ...(isRecord(current) ? current : {}),
              Settings: nextSettings,
            }))
        }
        cachedSettings = nextSettings
        adapter.emitSignal('SettingsService', 'SettingsChanged', nextSettings)
        return [true, undefined]
      },
      'PhoneService.GetPhoneState': () => [clonePhoneState(phoneState)],
      'PhoneService.GetMessages': (payload) => {
        const contact = phoneState.contacts.find((entry) => entry.number === payload || entry.id === payload)
        return [contact ? [...(phoneMessages[contact.id] ?? [])] : []]
      },
      'PhoneService.SendMessage': (payload) => {
        if (!isRecord(payload) || typeof payload.number !== 'string' || typeof payload.body !== 'string' || !payload.body.trim()) return [false, 'Message cannot be empty']
        const contact = phoneState.contacts.find((entry) => entry.number === payload.number)
        if (!contact) return [false, 'Contact not found']
        const message = { id: `local-${Date.now()}`, body: payload.body.trim(), fromPlayer: true, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        phoneMessages[contact.id] = [...(phoneMessages[contact.id] ?? []), message]
        phoneState = { ...phoneState, conversations: phoneState.conversations.map((conversation) => conversation.contactId === contact.id ? { ...conversation, lastMessage: message.body, time: message.time, unread: 0 } : conversation) }
        adapter.emitSignal('PhoneService', 'MessageReceived', contact.number, message.body)
        return [true, undefined]
      },
      'PhoneService.StartCall': (payload) => {
        if (typeof payload !== 'string' || !phoneState.contacts.some((contact) => contact.number === payload)) return [false, 'Contact not found']
        activeCall = { number: payload }
        adapter.emitSignal('PhoneService', 'CallStateChanged', 'connected', payload)
        return [true, undefined]
      },
      'PhoneService.EndCall': () => {
        if (!activeCall) return [false, 'No active call']
        const number = activeCall.number
        activeCall = undefined
        adapter.emitSignal('PhoneService', 'CallStateChanged', 'ended', number)
        return [true, undefined]
      },
      'PhoneService.SavePhoneSettings': (payload) => {
        if (!isRecord(payload) || typeof payload.airplaneMode !== 'boolean' || typeof payload.wifiEnabled !== 'boolean' || typeof payload.bluetoothEnabled !== 'boolean' || typeof payload.darkMode !== 'boolean' || typeof payload.ringtone !== 'string') return [false, 'Invalid phone settings']
        phoneState = { ...phoneState, settings: { airplaneMode: payload.airplaneMode, wifiEnabled: payload.wifiEnabled, bluetoothEnabled: payload.bluetoothEnabled, darkMode: payload.darkMode, ringtone: payload.ringtone } }
        adapter.emitSignal('PhoneService', 'PhoneSettingsChanged', phoneState.settings)
        return [true, undefined]
      },
      'BankingService.GetBankingOverview': () => [bankingState],
      'BankingService.TransferMoney': (payload) => {
        if (!isRecord(payload) || typeof payload.amount !== 'number' || typeof payload.phoneNumber !== 'string') {
          return [false, 'Invalid transfer payload']
        }
        const amount = Math.floor(payload.amount)
        if (amount <= 0) return [false, 'Invalid transfer amount']
        if (bankingState.bank < amount) return [false, 'Insufficient bank funds']
        const memo = (typeof payload.note === 'string' && payload.note.trim()) ? payload.note.trim() : `Transfer to ${payload.phoneNumber}`
        const ref = `TR-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        const tx: BankingTransaction = {
          id: `tx-${Date.now()}`,
          kind: 'transfer_out',
          amount,
          label: memo,
          reference: ref,
          createdAt: Date.now(),
        }
        bankingState = {
          ...bankingState,
          bank: bankingState.bank - amount,
          transactions: [tx, ...bankingState.transactions],
        }
        adapter.emitSignal('BankingService', 'BankingChanged', {
          kind: 'transfer_out',
          amount,
          currency: bankingState.currency,
          label: memo,
        })
        return [true, undefined]
      },
      'BankingService.DepositMoney': (payload) => {
        if (!isRecord(payload) || typeof payload.amount !== 'number') return [false, 'Invalid payload']
        const amount = Math.floor(payload.amount)
        if (amount <= 0) return [false, 'Invalid deposit amount']
        if (bankingState.cash < amount) return [false, 'Insufficient cash on hand']
        const ref = `DEP-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        const tx: BankingTransaction = {
          id: `tx-${Date.now()}`,
          kind: 'deposit',
          amount,
          label: 'ATM Cash Deposit',
          reference: ref,
          createdAt: Date.now(),
        }
        bankingState = {
          ...bankingState,
          cash: bankingState.cash - amount,
          bank: bankingState.bank + amount,
          transactions: [tx, ...bankingState.transactions],
        }
        adapter.emitSignal('BankingService', 'BankingChanged', {
          kind: 'deposit',
          amount,
          currency: bankingState.currency,
          label: 'ATM Cash Deposit',
        })
        return [true, undefined]
      },
      'BankingService.WithdrawMoney': (payload) => {
        if (!isRecord(payload) || typeof payload.amount !== 'number') return [false, 'Invalid payload']
        const amount = Math.floor(payload.amount)
        if (amount <= 0) return [false, 'Invalid withdrawal amount']
        if (bankingState.bank < amount) return [false, 'Insufficient bank funds']
        const ref = `WTH-${Math.random().toString(36).substring(2, 9).toUpperCase()}`
        const tx: BankingTransaction = {
          id: `tx-${Date.now()}`,
          kind: 'withdrawal',
          amount,
          label: 'ATM Cash Withdrawal',
          reference: ref,
          createdAt: Date.now(),
        }
        bankingState = {
          ...bankingState,
          bank: bankingState.bank - amount,
          cash: bankingState.cash + amount,
          transactions: [tx, ...bankingState.transactions],
        }
        adapter.emitSignal('BankingService', 'BankingChanged', {
          kind: 'withdrawal',
          amount,
          currency: bankingState.currency,
          label: 'ATM Cash Withdrawal',
        })
        return [true, undefined]
      },
    },
  })

  return adapter
}

function clonePhoneState(value: PhoneState): PhoneState {
  return { ...value, contacts: value.contacts.map((contact) => ({ ...contact })), conversations: value.conversations.map((conversation) => ({ ...conversation })), settings: { ...value.settings } }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

export const nervePreview = createNervePreview()

export const InventoryService = nervePreview.GetService<PreviewInventoryService>('InventoryService')
export const BankingService = nervePreview.GetService<PreviewBankingService>('BankingService')
