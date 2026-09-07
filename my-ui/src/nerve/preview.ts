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

export type MediaItem = {
  id: string
  mediaType: 'photo' | 'video'
  url: string
  thumbnailUrl?: string
  favorite: boolean
  createdAt: number
  title: string
  location?: string
}

export type MediaCounts = {
  all: number
  photos: number
  videos: number
  favorites: number
}

export type PreviewMediaService = {
  GetMediaList: NerveMethod<{ filter?: string; favoritesOnly?: boolean } | undefined, [MediaItem[], MediaCounts]>
  CaptureMedia: NerveMethod<{ mediaType: string; url: string; title?: string; location?: string }, [boolean, MediaItem?, string?]>
  ToggleFavorite: NerveMethod<{ id: string }, [boolean, boolean, string?]>
  DeleteMedia: NerveMethod<{ ids: string[] }, [boolean, string?]>
  MediaChanged: NerveSignal<[string]>
}

export function createMockPhotoSvg(title: string, sky = '#172554', land = '#111827', accent = '#7c3aed'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 1200"><defs><linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop stop-color="${sky}"/><stop offset="1" stop-color="${accent}"/></linearGradient><linearGradient id="land" x1="0" y1="0" x2="1" y2="1"><stop stop-color="${land}"/><stop offset="1" stop-color="#101114"/></linearGradient></defs><rect width="900" height="1200" fill="url(#sky)"/><circle cx="690" cy="260" r="105" fill="#fff" opacity=".72"/><path d="M0 690 210 440 390 650 585 360 900 720V1200H0Z" fill="${land}" opacity=".84"/><path d="M0 790 230 620 410 765 650 525 900 770V1200H0Z" fill="url(#land)"/><path d="M360 1200 475 690 560 690 690 1200Z" fill="${accent}" opacity=".48"/><text x="54" y="1100" fill="#fff" font-family="system-ui,sans-serif" font-size="62" font-weight="700">${title}</text><text x="57" y="1160" fill="#fff" opacity=".72" font-family="system-ui,sans-serif" font-size="30">Sun City Mobile</text></svg>`
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`
}

const INITIAL_MEDIA_ITEMS: MediaItem[] = [
  {
    id: 'photo-1',
    mediaType: 'photo',
    url: createMockPhotoSvg('City Skyline', '#172554', '#111827', '#7c3aed'),
    favorite: true,
    createdAt: Date.now() - 7200000,
    title: 'City Skyline',
    location: 'Downtown Sun City',
  },
  {
    id: 'photo-2',
    mediaType: 'photo',
    url: createMockPhotoSvg('Del Perro Pier', '#0369a1', '#164e63', '#fbbf24'),
    favorite: false,
    createdAt: Date.now() - 18000000,
    title: 'Del Perro Pier',
    location: 'Del Perro Boardwalk',
  },
  {
    id: 'photo-3',
    mediaType: 'photo',
    url: createMockPhotoSvg('Chiliad Sunset', '#c2410c', '#422006', '#facc15'),
    favorite: true,
    createdAt: Date.now() - 43200000,
    title: 'Chiliad Sunset',
    location: 'Mount Chiliad Lookout',
  },
  {
    id: 'photo-4',
    mediaType: 'photo',
    url: createMockPhotoSvg('Marlowe Vineyards', '#166534', '#14532d', '#86efac'),
    favorite: false,
    createdAt: Date.now() - 86400000,
    title: 'Marlowe Vineyards',
    location: 'Tongva Hills',
  },
]

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


export type MailItem = {
  id: string
  sender: string
  senderName: string
  senderAddress: string
  recipient: string
  subject: string
  body: string
  timestamp: number
  read: boolean
  folder: string
  starred: boolean
}

export type MailboxStats = {
  inboxCount: number
  unreadCount: number
  sentCount: number
  trashCount: number
}

export type PreviewMailService = {
  GetMailbox: NerveMethod<{ folder?: string; query?: string } | undefined, [MailItem[], MailboxStats]>
  SendMail: NerveMethod<{ to: string; subject: string; body: string }, [boolean, MailItem?, string?]>
  MarkMailRead: NerveMethod<{ ids: string[]; read: boolean }, [boolean, string?]>
  ToggleMailStar: NerveMethod<{ id: string }, [boolean, boolean, string?]>
  DeleteMail: NerveMethod<{ ids: string[]; permanent?: boolean }, [boolean, string?]>
  MailChanged: NerveSignal<[string]>
}

const INITIAL_MAIL_ITEMS: MailItem[] = [
  {
    id: 'mail-1',
    sender: 'City Services <services@suncity.gov>',
    senderName: 'City Services',
    senderAddress: 'services@suncity.gov',
    recipient: 'user@suncity.mail',
    subject: 'Welcome to Sun City - Resident Handbook',
    body: 'Welcome to Sun City! Please remember to register your vehicle at the local DMV and review the municipal guidelines. If you need any assistance, contact emergency or non-emergency dispatch at 555-0111.',
    timestamp: Date.now() - 18000000,
    read: false,
    folder: 'inbox',
    starred: true,
  },
  {
    id: 'mail-2',
    sender: 'Sun City Bank <notifications@suncitybank.com>',
    senderName: 'Sun City Bank',
    senderAddress: 'notifications@suncitybank.com',
    recipient: 'user@suncity.mail',
    subject: 'Account Statement Available',
    body: 'Your monthly electronic account statement is now available to download. Please review your recent deposits and transfers in the Sun City Banking mobile app.',
    timestamp: Date.now() - 43200000,
    read: true,
    folder: 'inbox',
    starred: false,
  },
  {
    id: 'mail-3',
    sender: 'Premium Deluxe Motorsport <sales@pdm-autos.com>',
    senderName: 'PDM Autos',
    senderAddress: 'sales@pdm-autos.com',
    recipient: 'user@suncity.mail',
    subject: 'Special Offers on New Imports This Weekend',
    body: 'Stop by our showroom on Power Street to check out the newly arrived high-performance tuners and executive sedans. Trade-ins welcomed!',
    timestamp: Date.now() - 86400000,
    read: true,
    folder: 'inbox',
    starred: false,
  },
  {
    id: 'mail-4',
    sender: 'user@suncity.mail',
    senderName: 'You',
    senderAddress: 'user@suncity.mail',
    recipient: 'mechanic@bennyscustoms.com',
    subject: 'Quote for custom turbo install',
    body: 'Hey Benny, can you let me know how much it will cost to get the stage 3 turbo and suspension tuning done on my Banshee?',
    timestamp: Date.now() - 129600000,
    read: true,
    folder: 'sent',
    starred: false,
  },
]

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
  let mediaItems: MediaItem[] = [...INITIAL_MEDIA_ITEMS]
  let mailItems: MailItem[] = [...INITIAL_MAIL_ITEMS]
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
        const normalized = normalizeSettings(payload)
        cachedSettings = normalized
        if (options.persistence) {
          await options.persistence.DataStoreService
            .GetDataStore(SETTINGS_DATASTORE_NAME)
            .SetAsync(playerKey, { Settings: normalized })
        }
        adapter.emitSignal('SettingsService', 'SettingsChanged', normalized)
        return [true, undefined]
      },
      'PhoneService.GetPhoneState': () => [clonePhoneState(phoneState)],
      'PhoneService.GetMessages': (contactId) => {
        if (typeof contactId !== 'string') return [[]]
        if (phoneMessages[contactId]) return [[...phoneMessages[contactId]]]
        const byNum = phoneState.contacts.find((c) => c.number === contactId)
        if (byNum && phoneMessages[byNum.id]) return [[...phoneMessages[byNum.id]]]
        return [[]]
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
      'MediaService.GetMediaList': (options) => {
        const filter = isRecord(options) && typeof options.filter === 'string' ? options.filter : 'all'
        const favoritesOnly = isRecord(options) && options.favoritesOnly === true
        const counts: MediaCounts = {
          all: mediaItems.length,
          photos: mediaItems.filter((item) => item.mediaType === 'photo').length,
          videos: mediaItems.filter((item) => item.mediaType === 'video').length,
          favorites: mediaItems.filter((item) => item.favorite).length,
        }
        const filtered = mediaItems.filter((item) => {
          const matchType = filter === 'all' || item.mediaType === filter
          const matchFav = !favoritesOnly || item.favorite
          return matchType && matchFav
        })
        return [filtered, counts]
      },
      'MediaService.CaptureMedia': (payload) => {
        if (!isRecord(payload) || typeof payload.url !== 'string') return [false, undefined, 'Invalid media payload']
        const mediaType = payload.mediaType === 'video' ? 'video' : 'photo'
        const title = typeof payload.title === 'string' && payload.title.trim() ? payload.title.trim() : `Capture ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}`
        const location = typeof payload.location === 'string' ? payload.location : 'Sun City'
        const newItem: MediaItem = {
          id: `media-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          mediaType,
          url: payload.url,
          favorite: false,
          createdAt: Date.now(),
          title,
          location,
        }
        mediaItems = [newItem, ...mediaItems]
        adapter.emitSignal('MediaService', 'MediaChanged', 'capture')
        return [true, newItem, undefined]
      },
      'MediaService.ToggleFavorite': (payload) => {
        if (!isRecord(payload) || typeof payload.id !== 'string') return [false, false, 'Invalid payload']
        const index = mediaItems.findIndex((item) => item.id === payload.id)
        if (index < 0) return [false, false, 'Media item not found']
        const updated = { ...mediaItems[index], favorite: !mediaItems[index].favorite }
        mediaItems = [...mediaItems]
        mediaItems[index] = updated
        adapter.emitSignal('MediaService', 'MediaChanged', 'favorite')
        return [true, updated.favorite, undefined]
      },
      'MediaService.DeleteMedia': (payload) => {
        if (!isRecord(payload) || !Array.isArray(payload.ids)) return [false, 'Invalid payload']
        const idSet = new Set(payload.ids)
        mediaItems = mediaItems.filter((item) => !idSet.has(item.id))
        adapter.emitSignal('MediaService', 'MediaChanged', 'delete')
        return [true, undefined]
      },
      'MailService.GetMailbox': (options) => {
        const folder = isRecord(options) && typeof options.folder === 'string' ? options.folder : 'inbox'
        const query = isRecord(options) && typeof options.query === 'string' ? options.query.toLowerCase() : ''
        
        let inboxCount = 0
        let unreadCount = 0
        let sentCount = 0
        let trashCount = 0
        for (const item of mailItems) {
          if (item.folder === 'inbox') {
            inboxCount++
            if (!item.read) unreadCount++
          } else if (item.folder === 'sent') {
            sentCount++
          } else if (item.folder === 'trash') {
            trashCount++
          }
        }
        const stats: MailboxStats = { inboxCount, unreadCount, sentCount, trashCount }

        const filtered = mailItems.filter((item) => {
          if (item.folder !== folder) return false
          if (!query) return true
          return item.senderName.toLowerCase().includes(query) ||
            item.subject.toLowerCase().includes(query) ||
            item.body.toLowerCase().includes(query)
        })
        return [filtered, stats]
      },
      'MailService.SendMail': (payload) => {
        if (!isRecord(payload) || typeof payload.to !== 'string' || typeof payload.subject !== 'string' || typeof payload.body !== 'string') {
          return [false, undefined, 'Invalid payload']
        }
        if (!payload.to.trim()) return [false, undefined, 'Recipient required']
        if (!payload.subject.trim()) return [false, undefined, 'Subject required']
        if (!payload.body.trim()) return [false, undefined, 'Body required']

        const newMail: MailItem = {
          id: `mail-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          sender: 'user@suncity.mail',
          senderName: 'You',
          senderAddress: 'user@suncity.mail',
          recipient: payload.to.trim(),
          subject: payload.subject.trim(),
          body: payload.body.trim(),
          timestamp: Date.now(),
          read: true,
          folder: 'sent',
          starred: false,
        }
        mailItems = [newMail, ...mailItems]
        adapter.emitSignal('MailService', 'MailChanged', 'sent')
        return [true, newMail, undefined]
      },
      'MailService.MarkMailRead': (payload) => {
        if (!isRecord(payload) || !Array.isArray(payload.ids) || typeof payload.read !== 'boolean') {
          return [false, 'Invalid payload']
        }
        const idSet = new Set(payload.ids)
        const isRead = payload.read === true
        mailItems = mailItems.map((item) => (idSet.has(item.id) ? { ...item, read: isRead } : item))
        adapter.emitSignal('MailService', 'MailChanged', 'read_status')
        return [true, undefined]
      },
      'MailService.ToggleMailStar': (payload) => {
        if (!isRecord(payload) || typeof payload.id !== 'string') return [false, false, 'Invalid payload']
        const index = mailItems.findIndex((item) => item.id === payload.id)
        if (index < 0) return [false, false, 'Mail not found']
        const updated = { ...mailItems[index], starred: !mailItems[index].starred }
        mailItems = [...mailItems]
        mailItems[index] = updated
        adapter.emitSignal('MailService', 'MailChanged', 'star')
        return [true, updated.starred, undefined]
      },
      'MailService.DeleteMail': (payload) => {
        if (!isRecord(payload) || !Array.isArray(payload.ids)) return [false, 'Invalid payload']
        const idSet = new Set(payload.ids)
        const isPermanent = payload.permanent === true
        if (isPermanent) {
          mailItems = mailItems.filter((item) => !idSet.has(item.id))
        } else {
          mailItems = mailItems.map((item) => (idSet.has(item.id) ? { ...item, folder: 'trash' } : item))
        }
        adapter.emitSignal('MailService', 'MailChanged', 'delete')
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
export const MediaService = nervePreview.GetService<PreviewMediaService>('MediaService')
export const MailService = nervePreview.GetService<PreviewMailService>('MailService')
