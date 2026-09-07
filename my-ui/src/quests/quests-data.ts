export type QuestCategory =
  | 'main-story'
  | 'side-jobs'
  | 'daily'
  | 'faction'
  | 'criminal'
  | 'civilian'
  | 'events'

export type QuestStatus = 'in-progress' | 'available' | 'completed'

export type QuestObjective = {
  id: string
  text: string
  completed: boolean
}

export type QuestDefinition = {
  id: string
  title: string
  category: QuestCategory
  tag: string
  tagColor: 'story' | 'job' | 'criminal' | 'side-job' | 'civilian' | 'daily' | 'faction' | 'event'
  icon: 'book' | 'pizza' | 'package' | 'wrench' | 'home' | 'shield' | 'cross'
  subtitle: string
  location: string
  description: string
  bannerImage?: string
  bannerLocation?: string
  bannerCity?: string
  bannerSlogan?: string
  timer?: string
  rewards: {
    money: number
    xp: number
    rep?: string
  }
  status: QuestStatus
  objectives: QuestObjective[]
}

export type CategoryDefinition = {
  id: QuestCategory
  label: string
  icon: 'book' | 'briefcase' | 'calendar' | 'users' | 'mask' | 'landmark' | 'star'
  count: number
}

export const QUEST_CATEGORIES: CategoryDefinition[] = [
  { id: 'main-story', label: 'Main Story', icon: 'book', count: 2 },
  { id: 'side-jobs', label: 'Side Jobs', icon: 'briefcase', count: 5 },
  { id: 'daily', label: 'Daily', icon: 'calendar', count: 3 },
  { id: 'faction', label: 'Faction', icon: 'users', count: 2 },
  { id: 'criminal', label: 'Criminal', icon: 'mask', count: 4 },
  { id: 'civilian', label: 'Civilian', icon: 'landmark', count: 1 },
  { id: 'events', label: 'Events', icon: 'star', count: 3 },
]

export const INITIAL_QUESTS: QuestDefinition[] = [
  {
    id: 'first-shift',
    title: 'First Shift',
    category: 'main-story',
    tag: 'Story',
    tagColor: 'story',
    icon: 'book',
    subtitle: 'Start your journey in Sun City.',
    location: 'City Hall',
    description: 'Report to Sun City Hall to register your residency, obtain civilian credentials, and speak with City Administrator Vance.',
    rewards: { money: 1000, xp: 500, rep: '+ 5 Reputation (City)' },
    status: 'in-progress',
    objectives: [
      { id: '1', text: 'Visit Sun City Hall administrative desk', completed: true },
      { id: '2', text: 'File identity documentation and residence papers', completed: true },
      { id: '3', text: 'Meet Administrator Vance on the 2nd floor', completed: false },
      { id: '4', text: 'Collect Sun City Citizen ID card', completed: false },
    ],
  },
  {
    id: 'pizza-run',
    title: 'Pizza Run',
    category: 'side-jobs',
    tag: 'Job',
    tagColor: 'job',
    icon: 'pizza',
    subtitle: 'Deliver pizzas around the city.',
    location: 'Pizza This..',
    bannerImage: '/assets/quests/pizza-this.jpg',
    bannerLocation: 'Downtown',
    bannerCity: 'Sun City',
    bannerSlogan: 'Good Food · Brighter People',
    description: 'Help Pizza This.. deliver hot pizzas to hungry customers across Sun City. Keep it fast, keep it fresh, and make the city a little happier.',
    rewards: { money: 350, xp: 200, rep: '+ 10 Reputation (Civilian)' },
    status: 'in-progress',
    objectives: [
      { id: '1', text: 'Pick up pizzas from Pizza This..', completed: true },
      { id: '2', text: 'Deliver pizza to the customer in Downtown', completed: true },
      { id: '3', text: 'Deliver pizza to the customer in Vespucci', completed: false },
    ],
  },
  {
    id: 'street-pickup',
    title: 'Street Pickup',
    category: 'criminal',
    tag: 'Criminal',
    tagColor: 'criminal',
    icon: 'package',
    subtitle: 'Meet the contact and grab the package.',
    location: 'La Mesa',
    description: 'Meet the underground courier near the La Mesa rail yards and retrieve the unmarked drop box before patrol arrives.',
    rewards: { money: 800, xp: 300, rep: '+ 15 Reputation (Underground)' },
    status: 'available',
    objectives: [
      { id: '1', text: 'Reach the La Mesa railway siding', completed: false },
      { id: '2', text: 'Retrieve package from dumpster drop point', completed: false },
      { id: '3', text: 'Deliver crate to fence at Cypress Flats', completed: false },
    ],
  },
  {
    id: 'mechanic-delivery',
    title: 'Mechanic Delivery',
    category: 'side-jobs',
    tag: 'Side Job',
    tagColor: 'side-job',
    icon: 'wrench',
    subtitle: 'Deliver vehicle parts to the customer.',
    location: 'Customs',
    description: 'Deliver precision vehicle performance components to Los Santos Customs garage. Keep your vehicle intact to earn bonus tips.',
    rewards: { money: 450, xp: 250, rep: '+ 8 Reputation (Civilian)' },
    status: 'available',
    objectives: [
      { id: '1', text: 'Collect turbocharger crate from auto warehouse', completed: false },
      { id: '2', text: 'Drive to Customs Garage without taking collision damage', completed: false },
    ],
  },
  {
    id: 'late-rent',
    title: 'Late Rent',
    category: 'civilian',
    tag: 'Civilian',
    tagColor: 'civilian',
    icon: 'home',
    subtitle: 'Help a local with their rent payment.',
    location: 'Rancho',
    description: 'A struggling tenant in Rancho is facing eviction by an aggressive landlord. Step in to negotiate and cover their balance.',
    rewards: { money: 300, xp: 150, rep: '+ 20 Reputation (Civilian)' },
    status: 'available',
    objectives: [
      { id: '1', text: 'Speak with tenant Marcus in Rancho', completed: false },
      { id: '2', text: 'Front the overdue payment at landlord office', completed: false },
    ],
  },
  {
    id: 'lost-package',
    title: 'Lost Package',
    category: 'daily',
    tag: 'Daily',
    tagColor: 'daily',
    icon: 'package',
    subtitle: 'Find and return the lost package.',
    location: 'Vespucci',
    timer: '2h 36m',
    description: 'A courier dropped a registered shipping manifest along the Vespucci Beach boardwalk. Search the area and return it.',
    rewards: { money: 500, xp: 250, rep: '+ 12 Reputation (Daily)' },
    status: 'available',
    objectives: [
      { id: '1', text: 'Search Vespucci Beach promenade stalls', completed: false },
      { id: '2', text: 'Deliver discovered package to courier depot', completed: false },
    ],
  },
  {
    id: 'night-patrol',
    title: 'Night Patrol',
    category: 'faction',
    tag: 'Faction',
    tagColor: 'faction',
    icon: 'shield',
    subtitle: 'Keep the city safe tonight.',
    location: 'Mission Row',
    description: 'Join the community safety watch along Mission Row to preserve neighborhood peace and prevent street violence.',
    rewards: { money: 600, xp: 300, rep: '+ 25 Reputation (Faction)' },
    status: 'available',
    objectives: [
      { id: '1', text: 'Check in with Sergeant Miller at Mission Row', completed: false },
      { id: '2', text: 'Patrol 3 designated commercial sectors', completed: false },
      { id: '3', text: 'De-escalate disturbances in the area', completed: false },
    ],
  },
  {
    id: 'hospital-supply-drop',
    title: 'Hospital Supply Drop',
    category: 'events',
    tag: 'Event',
    tagColor: 'event',
    icon: 'cross',
    subtitle: 'Deliver medical supplies to the hospital.',
    location: 'Pillbox Medical',
    timer: '1d 4h',
    description: 'Pillbox Hill Medical Center emergency trauma ward is experiencing urgent shortages of plasma and trauma packs. Expedite emergency shipment.',
    rewards: { money: 700, xp: 350, rep: '+ 30 Reputation (Emergency Services)' },
    status: 'available',
    objectives: [
      { id: '1', text: 'Load trauma supplies at Central Medical Supply', completed: false },
      { id: '2', text: 'Deliver to Pillbox Hill Medical ER bay', completed: false },
    ],
  },
]
