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


export type PoiCategory = 'police' | 'hospital' | 'bank' | 'mechanic' | 'store' | 'gas' | 'garage'

export type MapPoi = {
  id: string
  name: string
  category: PoiCategory
  x: number
  y: number
  address: string
  icon: string
}

export type MapWaypoint = {
  x: number
  y: number
  label: string
  distance?: number
}

export type PlayerBlip = {
  playerId: number
  name: string
  x: number
  y: number
  heading: number
}

export type PreviewMapService = {
  GetMapData: NerveMethod<undefined, [MapPoi[], PlayerBlip[], MapWaypoint?]>
  SetWaypoint: NerveMethod<{ x: number; y: number; label: string }, [boolean, MapWaypoint?, string?]>
  ClearWaypoint: NerveMethod<undefined, [boolean, string?]>
  WaypointChanged: NerveSignal<[MapWaypoint?]>
}

const INITIAL_MAP_POIS: MapPoi[] = [
  {
    id: 'poi-hosp-1',
    name: 'Pillbox Hill Medical Center',
    category: 'hospital',
    x: 310,
    y: -140,
    address: 'Strawberry Ave & Elgin Way',
    icon: '+',
  },
  {
    id: 'poi-pd-1',
    name: 'Mission Row Police Dept',
    category: 'police',
    x: 425,
    y: -980,
    address: 'Sinner St & Atwater Ave',
    icon: 'badge',
  },
  {
    id: 'poi-bank-1',
    name: 'Legion Square Central Bank',
    category: 'bank',
    x: 150,
    y: -1040,
    address: 'San Andreas Ave',
    icon: 'bank',
  },
  {
    id: 'poi-mech-1',
    name: "Benny's Original Motor Works",
    category: 'mechanic',
    x: -205,
    y: -1310,
    address: 'Olympic Fwy, Strawberry',
    icon: 'wrench',
  },
  {
    id: 'poi-dealer-1',
    name: 'Premium Deluxe Motorsport',
    category: 'garage',
    x: -45,
    y: -1095,
    address: "Power St & Adam's Apple Blvd",
    icon: 'car',
  },
  {
    id: 'poi-store-1',
    name: 'Davis 24/7 Supermarket',
    category: 'store',
    x: 25,
    y: -1345,
    address: 'Innocence Blvd',
    icon: 'cart',
  },
  {
    id: 'poi-gas-1',
    name: 'Ron Alternates Gas Station',
    category: 'gas',
    x: 180,
    y: -1560,
    address: 'El Rancho Blvd',
    icon: 'gas',
  },
]


export type MusicTrack = {
  id: string
  title: string
  artist: string
  album: string
  duration: number
  coverColor: string
  station?: string
}

export type PlaybackState = {
  track?: MusicTrack
  isPlaying: boolean
  position: number
  volume: number
  loop: boolean
  shuffle: boolean
}

export type PreviewMusicService = {
  GetMusicLibrary: NerveMethod<undefined, [MusicTrack[], PlaybackState]>
  PlayTrack: NerveMethod<{ trackId: string }, [boolean, PlaybackState?, string?]>
  TogglePlayback: NerveMethod<undefined, [boolean, PlaybackState?, string?]>
  NextTrack: NerveMethod<undefined, [boolean, PlaybackState?, string?]>
  PreviousTrack: NerveMethod<undefined, [boolean, PlaybackState?, string?]>
  SetVolume: NerveMethod<{ volume: number }, [boolean, string?]>
  SeekTrack: NerveMethod<{ position: number }, [boolean, string?]>
  PlaybackChanged: NerveSignal<[PlaybackState]>
}

const INITIAL_MUSIC_TRACKS: MusicTrack[] = [
  {
    id: 'track-1',
    title: 'Midnight City',
    artist: 'M83',
    album: "Hurry Up, We're Dreaming",
    duration: 244,
    coverColor: '#38bdf8',
    station: 'Non-Stop-Pop FM',
  },
  {
    id: 'track-2',
    title: 'Sleepwalking',
    artist: 'The Chain Gang of 1974',
    album: 'Daydream',
    duration: 218,
    coverColor: '#a855f7',
    station: 'Radio Mirror Park',
  },
  {
    id: 'track-3',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    album: 'After Hours',
    duration: 200,
    coverColor: '#ef4444',
    station: 'Los Santos Underground',
  },
  {
    id: 'track-4',
    title: 'Lady (Hear Me Tonight)',
    artist: 'Modjo',
    album: 'Modjo',
    duration: 306,
    coverColor: '#f59e0b',
    station: 'Non-Stop-Pop FM',
  },
  {
    id: 'track-5',
    title: 'Still D.R.E.',
    artist: 'Dr. Dre ft. Snoop Dogg',
    album: '2001',
    duration: 270,
    coverColor: '#10b981',
    station: 'West Coast Classics',
  },
  {
    id: 'track-6',
    title: 'Nightcall',
    artist: 'Kavinsky',
    album: 'OutRun',
    duration: 259,
    coverColor: '#ec4899',
    station: 'Synthwave Sun City',
  },
]


export type VehicleCategory = 'sports' | 'super' | 'suv' | 'sedan' | 'motorcycle' | 'compact'
export type VehicleStatus = 'stored' | 'out' | 'impounded'

export type VehicleItem = {
  id: string
  plate: string
  model: string
  label: string
  category: VehicleCategory
  garage: string
  status: VehicleStatus
  fuel: number
  engineHealth: number
  bodyHealth: number
  isLocked: boolean
  engineOn: boolean
  x: number
  y: number
}

export type PreviewGarageService = {
  GetVehicles: NerveMethod<undefined, [VehicleItem[]]>
  ToggleLock: NerveMethod<{ plate: string }, [boolean, boolean?, string?]>
  ToggleEngine: NerveMethod<{ plate: string }, [boolean, boolean?, string?]>
  RequestValet: NerveMethod<{ plate: string }, [boolean, VehicleItem?, string?]>
  TrackVehicle: NerveMethod<{ plate: string }, [boolean, { x: number; y: number; label: string }?, string?]>
  VehicleStateChanged: NerveSignal<[VehicleItem]>
}

const INITIAL_VEHICLES: VehicleItem[] = [
  {
    id: 'veh-1',
    plate: 'SUN-042',
    model: 'ninef2',
    label: 'Obey 9F Cabrio',
    category: 'sports',
    garage: 'Legion Square',
    status: 'out',
    fuel: 85,
    engineHealth: 92,
    bodyHealth: 95,
    isLocked: false,
    engineOn: false,
    x: 180,
    y: -1020,
  },
  {
    id: 'veh-2',
    plate: 'FAST-77',
    model: 'zentorno',
    label: 'Pegassi Zentorno',
    category: 'super',
    garage: 'Pillbox Hill Garage',
    status: 'stored',
    fuel: 68,
    engineHealth: 98,
    bodyHealth: 100,
    isLocked: true,
    engineOn: false,
    x: 310,
    y: -140,
  },
  {
    id: 'veh-3',
    plate: 'VIP-881',
    model: 'schafter3',
    label: 'Benefactor Schafter V12',
    category: 'sedan',
    garage: 'Central Park Underground',
    status: 'stored',
    fuel: 94,
    engineHealth: 100,
    bodyHealth: 98,
    isLocked: true,
    engineOn: false,
    x: 50,
    y: -800,
  },
  {
    id: 'veh-4',
    plate: 'DRIFT-9',
    model: 'sultanrs',
    label: 'Karin Sultan RS',
    category: 'sports',
    garage: "Benny's Workshop",
    status: 'stored',
    fuel: 48,
    engineHealth: 75,
    bodyHealth: 82,
    isLocked: true,
    engineOn: false,
    x: -205,
    y: -1310,
  },
  {
    id: 'veh-5',
    plate: 'COP-301',
    model: 'gresley',
    label: 'Bravado Gresley SUV',
    category: 'suv',
    garage: 'Davis Impound Lot',
    status: 'impounded',
    fuel: 100,
    engineHealth: 100,
    bodyHealth: 100,
    isLocked: true,
    engineOn: false,
    x: 400,
    y: -1600,
  },
]


export type SocialAuthor = {
  id: string
  name: string
  handle: string
  avatar: string
  verified: boolean
}

export type SocialPost = {
  id: string
  author: SocialAuthor
  content: string
  timestamp: number
  likes: number
  retweets: number
  replies: number
  liked: boolean
  retweeted: boolean
  hashtags: string[]
}

export type PreviewSocialService = {
  GetFeed: NerveMethod<{ tag?: string; query?: string } | undefined, [SocialPost[]]>
  CreatePost: NerveMethod<{ content: string; hashtags?: string[] }, [boolean, SocialPost?, string?]>
  ToggleLike: NerveMethod<{ postId: string }, [boolean, boolean?, number?, string?]>
  ToggleRetweet: NerveMethod<{ postId: string }, [boolean, boolean?, number?, string?]>
  DeletePost: NerveMethod<{ postId: string }, [boolean, string?]>
  PostCreated: NerveSignal<[SocialPost]>
  PostUpdated: NerveSignal<[SocialPost]>
}

const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    author: {
      id: 'auth-weazel',
      name: 'Weazel News',
      handle: 'weazelnews',
      avatar: '📰',
      verified: true,
    },
    content: 'BREAKING: Traffic alert on Del Perro Freeway eastbound due to high-speed pursuit. Avoid the area! #SunCity #TrafficAlert',
    timestamp: Date.now() - 15 * 60000,
    likes: 142,
    retweets: 38,
    replies: 15,
    liked: false,
    retweeted: false,
    hashtags: ['SunCity', 'TrafficAlert'],
  },
  {
    id: 'post-2',
    author: {
      id: 'auth-bennys',
      name: "Benny's Original Motor Works",
      handle: 'bennyscustoms',
      avatar: '🔧',
      verified: true,
    },
    content: 'Fresh batch of widebody kits just arrived for the Karin Sultan RS! Stop by Strawberry today. #Bennys #CarCulture',
    timestamp: Date.now() - 45 * 60000,
    likes: 89,
    retweets: 24,
    replies: 8,
    liked: false,
    retweeted: false,
    hashtags: ['Bennys', 'CarCulture'],
  },
  {
    id: 'post-3',
    author: {
      id: 'auth-casino',
      name: 'Diamond Casino & Resort',
      handle: 'diamondcasino',
      avatar: '💎',
      verified: true,
    },
    content: 'Tonight only: Triple payouts on High Stakes Blackjack at the penthouse lounge. Dress to impress. #DiamondCasino #Nightlife',
    timestamp: Date.now() - 2 * 3600000,
    likes: 210,
    retweets: 56,
    replies: 32,
    liked: true,
    retweeted: false,
    hashtags: ['DiamondCasino', 'Nightlife'],
  },
  {
    id: 'post-4',
    author: {
      id: 'auth-scpd',
      name: 'Sun City Police Dept',
      handle: 'scpd_official',
      avatar: '🚓',
      verified: true,
    },
    content: 'Community safety reminder: Always lock your vehicle doors when parked downtown. Stay alert Sun City! #PublicSafety #SCPD',
    timestamp: Date.now() - 4 * 3600000,
    likes: 64,
    retweets: 12,
    replies: 4,
    liked: false,
    retweeted: false,
    hashtags: ['PublicSafety', 'SCPD'],
  },
]


export type StoreAppItem = {
  id: string
  name: string
  category: string
  developer: string
  rating: number
  reviewsCount: number
  sizeMb: number
  description: string
  version: string
  isSystem: boolean
}

export type PreviewAppStoreService = {
  GetStoreCatalog: NerveMethod<Record<string, never> | undefined, [StoreAppItem[]]>
  GetInstalledApps: NerveMethod<Record<string, never> | undefined, [string[]]>
  InstallApp: NerveMethod<{ appId: string }, [boolean, string[]?, string?]>
  UninstallApp: NerveMethod<{ appId: string }, [boolean, string[]?, string?]>
  InstalledAppsChanged: NerveSignal<[string[]]>
}

const STORE_CATALOG_ITEMS: StoreAppItem[] = [
  {
    id: 'fliptok',
    name: 'FlipTok',
    category: 'social',
    developer: 'BytePulse Media',
    rating: 4.8,
    reviewsCount: 14200,
    sizeMb: 48,
    description: 'Watch, create, and share trending short-form videos across Sun City. Join viral dance challenges and comedy clips.',
    version: '3.2.0',
    isSystem: false,
  },
  {
    id: 'crypto',
    name: 'Crypto',
    category: 'utilities',
    developer: 'Satoshi Financial',
    rating: 4.6,
    reviewsCount: 8900,
    sizeMb: 22,
    description: 'Live cryptocurrency ticker, decentralized wallet, and instant coin swap for BTC, ETH, and SunCoin.',
    version: '2.1.4',
    isSystem: false,
  },
  {
    id: 'snake',
    name: 'Snake',
    category: 'games',
    developer: 'RetroByte Studios',
    rating: 4.9,
    reviewsCount: 31500,
    sizeMb: 8,
    description: 'Classic arcade retro snake game with neon themes, high score leaderboards, and speed multipliers.',
    version: '1.0.8',
    isSystem: false,
  },
  {
    id: 'darkchat',
    name: 'DarkChat',
    category: 'social',
    developer: 'CipherWorks',
    rating: 4.7,
    reviewsCount: 5400,
    sizeMb: 14,
    description: 'End-to-end encrypted anonymous messenger with burner channels, self-destructing notes, and VPN masking.',
    version: '4.0.1',
    isSystem: false,
  },
  {
    id: 'house',
    name: 'House',
    category: 'utilities',
    developer: 'Dynasty8 Real Estate',
    rating: 4.5,
    reviewsCount: 6700,
    sizeMb: 31,
    description: 'Manage your owned luxury apartments, villas, and lockups. Remote door locks, stash security, and valet parking.',
    version: '2.5.0',
    isSystem: false,
  },
  {
    id: 'skyride',
    name: 'SkyRide',
    category: 'utilities',
    developer: 'SkyRide Mobility',
    rating: 4.4,
    reviewsCount: 11200,
    sizeMb: 18,
    description: 'On-demand city cab and luxury chauffeur hailer. Track your driver in real-time with automatic Fleeca Bank billing.',
    version: '1.9.3',
    isSystem: false,
  },
  {
    id: 'picstagram',
    name: 'Picstagram',
    category: 'social',
    developer: 'PixelMedia Inc.',
    rating: 4.7,
    reviewsCount: 18400,
    sizeMb: 42,
    description: 'Share stunning photo filters, reels, and stories with friends and followers across San Andreas.',
    version: '5.1.2',
    isSystem: false,
  },
  {
    id: 'number-merge',
    name: 'Number Merge',
    category: 'games',
    developer: 'BrainBox Puzzles',
    rating: 4.8,
    reviewsCount: 9400,
    sizeMb: 6,
    description: 'Addictive swipe-and-merge numbers puzzle. Reach the 2048 tile and challenge global records.',
    version: '1.2.0',
    isSystem: false,
  },
  {
    id: 'citymarkt',
    name: 'CityMarkt',
    category: 'shopping',
    developer: 'Sun City Commerce',
    rating: 4.3,
    reviewsCount: 7600,
    sizeMb: 26,
    description: 'Peer-to-peer classifieds and marketplace. Buy, sell, or trade vehicles, rare weapons, and collector items.',
    version: '2.0.4',
    isSystem: false,
  },
  {
    id: 'minesweeper',
    name: 'Minesweeper',
    category: 'games',
    developer: 'RetroByte Studios',
    rating: 4.6,
    reviewsCount: 12800,
    sizeMb: 5,
    description: 'Classic tactical grid puzzle. Flag dangerous mines and clear the minefield against the clock.',
    version: '1.1.0',
    isSystem: false,
  },
  {
    id: 'weazel-news',
    name: 'Weazel News',
    category: 'social',
    developer: 'Weazel Broadcasting',
    rating: 4.2,
    reviewsCount: 8200,
    sizeMb: 19,
    description: 'Breaking news, high-speed chase alerts, weather warnings, and investigative journalism live.',
    version: '3.0.1',
    isSystem: false,
  },
  {
    id: 'tower-stack',
    name: 'Tower Stack',
    category: 'games',
    developer: 'NeonArcade',
    rating: 4.7,
    reviewsCount: 15300,
    sizeMb: 9,
    description: 'Test your reflexes by stacking skyscraper blocks as high as you can into the Sun City clouds.',
    version: '1.4.2',
    isSystem: false,
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

  let worldPois: MapPoi[] = [...INITIAL_MAP_POIS]

  const musicTracks: MusicTrack[] = [...INITIAL_MUSIC_TRACKS]

  
  const installedAppIds: string[] = [
    'phone', 'messages', 'calculator', 'camera', 'clock', 'weather',
    'banking', 'mail', 'notes', 'memos', 'photos', 'app-store',
    'settings', 'map', 'music', 'garage', 'feather', 'calendar',
    'health', 'citywarn'
  ]
  const systemAppIds = new Set(['phone', 'messages', 'settings', 'app-store', 'camera'])

  let feedPosts: SocialPost[] = INITIAL_POSTS.map((p) => ({ ...p, author: { ...p.author }, hashtags: [...p.hashtags] }))


  let vehicles: VehicleItem[] = INITIAL_VEHICLES.map((v) => ({ ...v }))

  let playbackState: PlaybackState = {
    track: musicTracks[0],
    isPlaying: false,
    position: 0,
    volume: 75,
    loop: false,
    shuffle: false,
  }

  let activeWaypoint: MapWaypoint | null = null
  const playerBlips: PlayerBlip[] = [
    { playerId: 1, name: 'You', x: 0, y: -1000, heading: 45 }
  ]

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
      'MapService.GetMapData': () => {
        return [worldPois, playerBlips, activeWaypoint ?? undefined]
      },
      'MapService.SetWaypoint': (payload) => {
        if (!isRecord(payload) || typeof payload.x !== 'number' || typeof payload.y !== 'number' || typeof payload.label !== 'string') {
          return [false, undefined, 'Invalid waypoint payload']
        }
        const wp: MapWaypoint = {
          x: payload.x,
          y: payload.y,
          label: payload.label,
          distance: Math.floor(Math.sqrt(Math.pow(payload.x - 0, 2) + Math.pow(payload.y - (-1000), 2))),
        }
        activeWaypoint = wp
        adapter.emitSignal('MapService', 'WaypointChanged', wp)
        return [true, wp, undefined]
      },
      'MapService.ClearWaypoint': () => {
        activeWaypoint = null
        adapter.emitSignal('MapService', 'WaypointChanged', undefined)
        return [true, undefined]
      },
      'MusicService.GetMusicLibrary': () => {
        return [musicTracks, playbackState]
      },
      'MusicService.PlayTrack': (payload) => {
        if (!isRecord(payload) || typeof payload.trackId !== 'string') {
          return [false, undefined, 'Invalid track id']
        }
        const target = musicTracks.find((t) => t.id === payload.trackId)
        if (!target) return [false, undefined, 'Track not found']
        playbackState = {
          ...playbackState,
          track: target,
          isPlaying: true,
          position: 0,
        }
        adapter.emitSignal('MusicService', 'PlaybackChanged', playbackState)
        return [true, playbackState, undefined]
      },
      'MusicService.TogglePlayback': () => {
        playbackState = {
          ...playbackState,
          isPlaying: !playbackState.isPlaying,
        }
        adapter.emitSignal('MusicService', 'PlaybackChanged', playbackState)
        return [true, playbackState, undefined]
      },
      'MusicService.NextTrack': () => {
        const currentIndex = musicTracks.findIndex((t) => t.id === playbackState.track?.id)
        const nextIndex = (currentIndex + 1) % musicTracks.length
        playbackState = {
          ...playbackState,
          track: musicTracks[nextIndex],
          isPlaying: true,
          position: 0,
        }
        adapter.emitSignal('MusicService', 'PlaybackChanged', playbackState)
        return [true, playbackState, undefined]
      },
      'MusicService.PreviousTrack': () => {
        const currentIndex = musicTracks.findIndex((t) => t.id === playbackState.track?.id)
        const prevIndex = (currentIndex - 1 + musicTracks.length) % musicTracks.length
        playbackState = {
          ...playbackState,
          track: musicTracks[prevIndex],
          isPlaying: true,
          position: 0,
        }
        adapter.emitSignal('MusicService', 'PlaybackChanged', playbackState)
        return [true, playbackState, undefined]
      },
      'MusicService.SetVolume': (payload) => {
        if (!isRecord(payload) || typeof payload.volume !== 'number') return [false, 'Invalid volume']
        playbackState = {
          ...playbackState,
          volume: Math.max(0, Math.min(100, payload.volume)),
        }
        adapter.emitSignal('MusicService', 'PlaybackChanged', playbackState)
        return [true, undefined]
      },
      'GarageService.GetVehicles': () => {
        return [vehicles]
      },
      'GarageService.ToggleLock': (payload) => {
        if (!isRecord(payload) || typeof payload.plate !== 'string') return [false, undefined, 'Invalid plate']
        const target = vehicles.find((v) => v.plate === payload.plate)
        if (!target) return [false, undefined, 'Vehicle not found']
        target.isLocked = !target.isLocked
        adapter.emitSignal('GarageService', 'VehicleStateChanged', { ...target })
        return [true, target.isLocked, undefined]
      },
      'GarageService.ToggleEngine': (payload) => {
        if (!isRecord(payload) || typeof payload.plate !== 'string') return [false, undefined, 'Invalid plate']
        const target = vehicles.find((v) => v.plate === payload.plate)
        if (!target) return [false, undefined, 'Vehicle not found']
        if (target.status !== 'out') return [false, undefined, 'Vehicle must be out of garage to start engine']
        target.engineOn = !target.engineOn
        adapter.emitSignal('GarageService', 'VehicleStateChanged', { ...target })
        return [true, target.engineOn, undefined]
      },
      'GarageService.RequestValet': (payload) => {
        if (!isRecord(payload) || typeof payload.plate !== 'string') return [false, undefined, 'Invalid plate']
        const target = vehicles.find((v) => v.plate === payload.plate)
        if (!target) return [false, undefined, 'Vehicle not found']
        if (target.status === 'impounded') return [false, undefined, 'Vehicle is impounded']
        target.status = 'out'
        target.garage = 'Delivered to Player'
        target.isLocked = false
        adapter.emitSignal('GarageService', 'VehicleStateChanged', { ...target })
        return [true, { ...target }, undefined]
      },
      'GarageService.TrackVehicle': (payload) => {
        if (!isRecord(payload) || typeof payload.plate !== 'string') return [false, undefined, 'Invalid plate']
        const target = vehicles.find((v) => v.plate === payload.plate)
        if (!target) return [false, undefined, 'Vehicle not found']
        return [true, { x: target.x, y: target.y, label: `${target.label} (${target.plate})` }, undefined]
      },
      'SocialService.GetFeed': (payload) => {
        const filterTag = isRecord(payload) && typeof payload.tag === 'string' ? payload.tag.toLowerCase() : undefined
        const filterQuery = isRecord(payload) && typeof payload.query === 'string' ? payload.query.toLowerCase() : undefined

        let filtered = [...feedPosts]
        if (filterTag && filterTag !== 'all') {
          filtered = filtered.filter((p) => p.hashtags.some((t) => t.toLowerCase() === filterTag))
        }
        if (filterQuery && filterQuery.trim().length > 0) {
          filtered = filtered.filter(
            (p) =>
              p.content.toLowerCase().includes(filterQuery) ||
              p.author.name.toLowerCase().includes(filterQuery) ||
              p.author.handle.toLowerCase().includes(filterQuery)
          )
        }
        return [filtered]
      },
      'SocialService.CreatePost': (payload) => {
        if (!isRecord(payload) || typeof payload.content !== 'string') return [false, undefined, 'Invalid post payload']
        const trimmed = payload.content.trim()
        if (!trimmed) return [false, undefined, 'Post cannot be empty']
        if (trimmed.length > 280) return [false, undefined, 'Post exceeds 280 characters']

        const tags: string[] = []
        if (Array.isArray(payload.hashtags)) {
          for (const t of payload.hashtags) {
            if (typeof t === 'string' && t) tags.push(t)
          }
        }
        const matches = trimmed.match(/#(\w+)/g)
        if (matches) {
          for (const m of matches) {
            const tag = m.slice(1)
            if (!tags.some((t) => t.toLowerCase() === tag.toLowerCase())) {
              tags.push(tag)
            }
          }
        }

        const newPost: SocialPost = {
          id: 'post-' + Date.now(),
          author: {
            id: 'user-self',
            name: 'Alex Mercer',
            handle: 'alexmercer',
            avatar: '🪶',
            verified: false,
          },
          content: trimmed,
          timestamp: Date.now(),
          likes: 0,
          retweets: 0,
          replies: 0,
          liked: false,
          retweeted: false,
          hashtags: tags,
        }

        feedPosts.unshift(newPost)
        adapter.emitSignal('SocialService', 'PostCreated', { ...newPost })
        return [true, { ...newPost }, undefined]
      },
      'SocialService.ToggleLike': (payload) => {
        if (!isRecord(payload) || typeof payload.postId !== 'string') return [false, undefined, undefined, 'Invalid post id']
        const post = feedPosts.find((p) => p.id === payload.postId)
        if (!post) return [false, undefined, undefined, 'Post not found']
        post.liked = !post.liked
        post.likes += post.liked ? 1 : -1
        adapter.emitSignal('SocialService', 'PostUpdated', { ...post })
        return [true, post.liked, post.likes, undefined]
      },
      'SocialService.ToggleRetweet': (payload) => {
        if (!isRecord(payload) || typeof payload.postId !== 'string') return [false, undefined, undefined, 'Invalid post id']
        const post = feedPosts.find((p) => p.id === payload.postId)
        if (!post) return [false, undefined, undefined, 'Post not found']
        post.retweeted = !post.retweeted
        post.retweets += post.retweeted ? 1 : -1
        adapter.emitSignal('SocialService', 'PostUpdated', { ...post })
        return [true, post.retweeted, post.retweets, undefined]
      },
      'SocialService.DeletePost': (payload) => {
        if (!isRecord(payload) || typeof payload.postId !== 'string') return [false, 'Invalid post id']
        const idx = feedPosts.findIndex((p) => p.id === payload.postId)
        if (idx === -1) return [false, 'Post not found']
        feedPosts.splice(idx, 1)
        return [true, undefined]
      },
      'AppStoreService.GetStoreCatalog': () => {
        return [STORE_CATALOG_ITEMS]
      },
      'AppStoreService.GetInstalledApps': () => {
        return [[...installedAppIds]]
      },
      'AppStoreService.InstallApp': (payload) => {
        if (!isRecord(payload) || typeof payload.appId !== 'string') return [false, undefined, 'Invalid app ID']
        if (!installedAppIds.includes(payload.appId)) {
          installedAppIds.push(payload.appId)
          adapter.emitSignal('AppStoreService', 'InstalledAppsChanged', [...installedAppIds])
        }
        return [true, [...installedAppIds], undefined]
      },
      'AppStoreService.UninstallApp': (payload) => {
        if (!isRecord(payload) || typeof payload.appId !== 'string') return [false, undefined, 'Invalid app ID']
        if (systemAppIds.has(payload.appId)) {
          return [false, undefined, 'System apps cannot be uninstalled']
        }
        const idx = installedAppIds.indexOf(payload.appId)
        if (idx !== -1) {
          installedAppIds.splice(idx, 1)
          adapter.emitSignal('AppStoreService', 'InstalledAppsChanged', [...installedAppIds])
          return [true, [...installedAppIds], undefined]
        }
        return [false, undefined, 'App is not installed']
      },


      'MusicService.SeekTrack': (payload) => {
        if (!isRecord(payload) || typeof payload.position !== 'number') return [false, 'Invalid position']
        playbackState = {
          ...playbackState,
          position: Math.max(0, payload.position),
        }
        adapter.emitSignal('MusicService', 'PlaybackChanged', playbackState)
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
export const MapService = nervePreview.GetService<PreviewMapService>('MapService')
export const MusicService = nervePreview.GetService<PreviewMusicService>('MusicService')
export const GarageService = nervePreview.GetService<PreviewGarageService>('GarageService')
export const SocialService = nervePreview.GetService<PreviewSocialService>('SocialService')
export const AppStoreService = nervePreview.GetService<PreviewAppStoreService>('AppStoreService')
