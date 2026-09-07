export interface AttributeData {
  id: string
  name: string
  level: number
  maxLevel: number
  color: string
  icon: 'heart' | 'stamina' | 'strength' | 'intelligence' | 'lungs'
  description: string
}

export interface SkillData {
  id: string
  name: string
  level: number
  maxLevel: number
  color: string
  icon: 'driving' | 'shooting' | 'melee' | 'stealth' | 'fishing' | 'medical' | 'mechanic' | 'cooking' | 'business' | 'charisma'
  description: string
}

export interface FactionReputation {
  id: string
  name: string
  status: 'Friendly' | 'Neutral' | 'Suspicious' | 'Hostile'
  color: string
  icon: 'civilians' | 'police' | 'ems' | 'mechanics' | 'criminals'
  description: string
}

export interface ActiveQuestItem {
  id: string
  title: string
  subtitle: string
  badge: 'MAIN' | 'SIDE' | 'DAILY'
  rewardCash: number
  rewardXp: number
  thumbnail: string
  type: 'checkbox' | 'progress'
  objectiveText: string
  isCompleted: boolean
  progress?: number
  maxProgress?: number
}

export interface CompletedQuestItem {
  id: string
  title: string
  subtitle: string
  date: string
  rewardCash: number
  thumbnail: string
}

export interface MilestoneItem {
  id: string
  title: string
  icon: 'house' | 'cash' | 'star' | 'check'
  current: number
  max: number
  isCurrency?: boolean
  unit?: string
}

export const INITIAL_ATTRIBUTES: AttributeData[] = [
  { id: 'health', name: 'HEALTH', level: 4, maxLevel: 10, color: '#ef4444', icon: 'heart', description: 'Increases maximum vitality and resistance to injury.' },
  { id: 'stamina', name: 'STAMINA', level: 5, maxLevel: 10, color: '#22c55e', icon: 'stamina', description: 'Extends sprinting duration and reduces fatigue from physical exertion.' },
  { id: 'strength', name: 'STRENGTH', level: 3, maxLevel: 10, color: '#f59e0b', icon: 'strength', description: 'Boosts melee combat impact and carry capacity threshold.' },
  { id: 'intelligence', name: 'INTELLIGENCE', level: 2, maxLevel: 10, color: '#a855f7', icon: 'intelligence', description: 'Improves hacking speed, business negotiation, and crafting efficiency.' },
  { id: 'lung_capacity', name: 'LUNG CAPACITY', level: 3, maxLevel: 10, color: '#38bdf8', icon: 'lungs', description: 'Increases breath holding underwater and recovery rate.' },
]

export const INITIAL_SKILLS: SkillData[] = [
  { id: 'driving', name: 'Driving', level: 5, maxLevel: 10, color: '#38bdf8', icon: 'driving', description: 'Sharpens vehicle control, drift recovery, and off-road stability.' },
  { id: 'shooting', name: 'Shooting', level: 4, maxLevel: 10, color: '#ef4444', icon: 'shooting', description: 'Reduces weapon recoil, quickens reload speed, and increases accuracy.' },
  { id: 'melee', name: 'Melee', level: 3, maxLevel: 10, color: '#f59e0b', icon: 'melee', description: 'Enhances unarmed strike precision and defensive parry timing.' },
  { id: 'stealth', name: 'Stealth', level: 2, maxLevel: 10, color: '#c084fc', icon: 'stealth', description: 'Muffles movement noise and shortens detection meters.' },
  { id: 'fishing', name: 'Fishing', level: 1, maxLevel: 10, color: '#67e8f9', icon: 'fishing', description: 'Improves bite frequency and reel-in success on coastal shores.' },
  { id: 'medical', name: 'Medical', level: 3, maxLevel: 10, color: '#2dd4bf', icon: 'medical', description: 'Increases first-aid treatment efficiency and bandaging speed.' },
  { id: 'mechanic', name: 'Mechanic', level: 4, maxLevel: 10, color: '#fbbf24', icon: 'mechanic', description: 'Accelerates roadside repairs and engine tuning output.' },
  { id: 'cooking', name: 'Cooking', level: 2, maxLevel: 10, color: '#fb7185', icon: 'cooking', description: 'Unlocks nutritious recipes with longer-lasting buff benefits.' },
  { id: 'business', name: 'Business', level: 3, maxLevel: 10, color: '#38bdf8', icon: 'business', description: 'Yields higher merchant returns and property revenue dividends.' },
  { id: 'charisma', name: 'Charisma', level: 1, maxLevel: 10, color: '#f472b6', icon: 'charisma', description: 'Unlocks favorable dialogue branches and contact discounts.' },
]

export const INITIAL_REPUTATIONS: FactionReputation[] = [
  { id: 'civilians', name: 'Civilians', status: 'Neutral', color: '#94a3b8', icon: 'civilians', description: 'General public sentiment. Bystanders are cooperative.' },
  { id: 'police', name: 'Police', status: 'Suspicious', color: '#ef4444', icon: 'police', description: 'Heightened patrol monitoring. Traffic infractions attract rapid response.' },
  { id: 'ems', name: 'EMS', status: 'Neutral', color: '#38bdf8', icon: 'ems', description: 'Paramedics provide standard emergency response time and treatment.' },
  { id: 'mechanics', name: 'Mechanics', status: 'Friendly', color: '#22c55e', icon: 'mechanics', description: 'Auto garages offer a 15% discount on vehicle repair and parts.' },
  { id: 'criminals', name: 'Criminals', status: 'Neutral', color: '#f59e0b', icon: 'criminals', description: 'Underworld contacts treat you with cautious indifference.' },
]

export const INITIAL_ACTIVE_QUESTS: ActiveQuestItem[] = [
  {
    id: 'better_ride',
    title: 'A Better Ride',
    subtitle: 'Meet the mechanic at the docks.',
    badge: 'MAIN',
    rewardCash: 2500,
    rewardXp: 1200,
    thumbnail: '/assets/stats/docks.jpg',
    type: 'checkbox',
    objectiveText: 'Talk to the mechanic',
    isCompleted: false,
  },
  {
    id: 'clean_slate',
    title: 'Clean Slate',
    subtitle: 'Deliver the package to the marked location.',
    badge: 'SIDE',
    rewardCash: 1000,
    rewardXp: 600,
    thumbnail: '/assets/stats/garage.jpg',
    type: 'checkbox',
    objectiveText: 'Deliver the package',
    isCompleted: false,
  },
  {
    id: 'city_life',
    title: 'City Life',
    subtitle: 'Take 5 photos around the city.',
    badge: 'DAILY',
    rewardCash: 750,
    rewardXp: 400,
    thumbnail: '/assets/stats/sunset.jpg',
    type: 'progress',
    objectiveText: 'Photos captured',
    isCompleted: false,
    progress: 2,
    maxProgress: 5,
  },
]

export const INITIAL_COMPLETED_QUESTS: CompletedQuestItem[] = [
  {
    id: 'first_steps',
    title: 'First Steps',
    subtitle: 'Get settled in the city.',
    date: 'Aug 12, 2026',
    rewardCash: 500,
    thumbnail: '/assets/stats/street.jpg',
  },
  {
    id: 'helping_hands',
    title: 'Helping Hands',
    subtitle: 'Assist the local business.',
    date: 'Aug 14, 2026',
    rewardCash: 1000,
    thumbnail: '/assets/stats/street.jpg',
  },
  {
    id: 'on_the_move',
    title: 'On The Move',
    subtitle: 'Purchase your first vehicle.',
    date: 'Aug 18, 2026',
    rewardCash: 2000,
    thumbnail: '/assets/stats/garage.jpg',
  },
]

export const INITIAL_MILESTONES: MilestoneItem[] = [
  { id: 'properties', title: 'Own 5 Properties', icon: 'house', current: 1, max: 5 },
  { id: 'earnings', title: 'Earn $100,000', icon: 'cash', current: 12450, max: 100000, isCurrency: true },
  { id: 'level', title: 'Reach Level 50', icon: 'star', current: 42, max: 50 },
  { id: 'quests', title: 'Complete 50 Quests', icon: 'check', current: 24, max: 50 },
]
