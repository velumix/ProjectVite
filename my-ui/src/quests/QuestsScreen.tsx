import { useState, useMemo } from 'react'
import {
  QUEST_CATEGORIES,
  INITIAL_QUESTS,
  type QuestDefinition,
  type QuestCategory,
  type QuestStatus,
} from './quests-data.ts'
import './quests.css'
import { uiAudio } from '../audio/ui-audio.ts'

type FilterStatus = 'all' | QuestStatus

interface QuestsScreenProps {
  onSetGPS?: (location: string) => void
  onTrackQuest?: (questId: string) => void
}

function QuestIcon({ name, className = '' }: { name: string; className?: string }) {
  const iconPaths: Record<string, React.ReactNode> = {
    book: (
      <>
        <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1-2.5-2.5Z" />
        <path d="M6 6h10M6 10h10M6 14h6" />
      </>
    ),
    briefcase: (
      <>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
      </>
    ),
    calendar: (
      <>
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" />
      </>
    ),
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    mask: (
      <>
        <path d="M2 10s2-4 10-4 10 4 10 4-2 8-10 8-10-8-10-8Z" />
        <circle cx="8" cy="11" r="1.5" />
        <circle cx="16" cy="11" r="1.5" />
      </>
    ),
    landmark: (
      <>
        <line x1="3" x2="21" y1="22" y2="22" />
        <line x1="6" x2="6" y1="18" y2="11" />
        <line x1="10" x2="10" y1="18" y2="11" />
        <line x1="14" x2="14" y1="18" y2="11" />
        <line x1="18" x2="18" y1="18" y2="11" />
        <polygon points="12 2 20 7 4 7" />
      </>
    ),
    star: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
    pizza: (
      <>
        <path d="M15 11h.01M11 15h.01M16 16h.01" />
        <path d="m2 2 20 7-11 13L2 2Z" />
      </>
    ),
    package: (
      <>
        <path d="m16.5 9.4-9-5.19M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <polyline points="3.29 7 12 12 20.71 7" />
        <line x1="12" x2="12" y1="22" y2="12" />
      </>
    ),
    wrench: (
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
    ),
    home: (
      <>
        <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </>
    ),
    shield: (
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
    ),
    cross: (
      <>
        <line x1="12" x2="12" y1="5" y2="19" />
        <line x1="5" x2="19" y1="12" y2="12" />
      </>
    ),
    pin: (
      <>
        <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z" />
        <circle cx="12" cy="10" r="3" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </>
    ),
    search: (
      <>
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </>
    ),
    check: (
      <polyline points="20 6 9 17 4 12" />
    ),
    cash: (
      <>
        <rect width="20" height="12" x="2" y="6" rx="2" />
        <circle cx="12" cy="12" r="2" />
        <path d="M6 12h.01M18 12h.01" />
      </>
    ),
    plane: (
      <path d="m22 2-7 20-4-9-9-4Z" />
    ),
    trash: (
      <>
        <path d="M3 6h18M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
        <line x1="10" x2="10" y1="11" y2="17" />
        <line x1="14" x2="14" y1="11" y2="17" />
      </>
    ),
  }

  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {iconPaths[name] ?? <circle cx="12" cy="12" r="8" />}
    </svg>
  )
}

export function QuestsScreen({ onSetGPS, onTrackQuest }: QuestsScreenProps) {
  const [quests, setQuests] = useState<QuestDefinition[]>(INITIAL_QUESTS)
  const [selectedCategory, setSelectedCategory] = useState<QuestCategory | null>(null)
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedQuestId, setSelectedQuestId] = useState<string>('pizza-run')
  const [trackedQuestId, setTrackedQuestId] = useState<string | null>('pizza-run')
  const [gpsTarget, setGpsTarget] = useState<string | null>(null)

  // Filtered Quests List
  const filteredQuests = useMemo(() => {
    return quests.filter(quest => {
      // Category match
      if (selectedCategory && quest.category !== selectedCategory) return false

      // Status filter match
      if (filterStatus !== 'all' && quest.status !== filterStatus) return false

      // Search match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase()
        const matchTitle = quest.title.toLowerCase().includes(q)
        const matchSub = quest.subtitle.toLowerCase().includes(q)
        const matchLoc = quest.location.toLowerCase().includes(q)
        const matchTag = quest.tag.toLowerCase().includes(q)
        if (!matchTitle && !matchSub && !matchLoc && !matchTag) return false
      }

      return true
    })
  }, [quests, selectedCategory, filterStatus, searchQuery])

  // Active Selected Quest
  const selectedQuest = useMemo(() => {
    return quests.find(q => q.id === selectedQuestId) ?? quests[0]
  }, [quests, selectedQuestId])

  // Dynamic Category Counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const cat of QUEST_CATEGORIES) counts[cat.id] = 0
    for (const q of quests) {
      if (counts[q.category] !== undefined) counts[q.category]++
    }
    return counts
  }, [quests])

  // Toggle Objective Completion
  const handleToggleObjective = (objectiveId: string) => {
    if (!selectedQuest) return
    uiAudio.playEquip()

    setQuests(prev =>
      prev.map(q => {
        if (q.id !== selectedQuest.id) return q
        const nextObjs = q.objectives.map(o => (o.id === objectiveId ? { ...o, completed: !o.completed } : o))
        const completedCount = nextObjs.filter(o => o.completed).length
        const totalCount = nextObjs.length
        const isCompleted = completedCount === totalCount
        return {
          ...q,
          status: isCompleted ? 'completed' : completedCount > 0 ? 'in-progress' : 'available',
          objectives: nextObjs,
        }
      }),
    )
  }

  // Handle Track Quest
  const handleToggleTrack = () => {
    if (!selectedQuest) return
    uiAudio.playClick()
    const nextTrack = trackedQuestId === selectedQuest.id ? null : selectedQuest.id
    setTrackedQuestId(nextTrack)
    onTrackQuest?.(selectedQuest.id)
  }

  // Handle Set GPS
  const handleSetGPS = () => {
    if (!selectedQuest) return
    uiAudio.playClick()
    setGpsTarget(selectedQuest.location)
    onSetGPS?.(selectedQuest.location)
  }

  // Handle Abandon Quest
  const handleAbandon = () => {
    if (!selectedQuest) return
    uiAudio.playDrop()
    setQuests(prev =>
      prev.map(q => {
        if (q.id !== selectedQuest.id) return q
        return {
          ...q,
          status: 'available',
          objectives: q.objectives.map(o => ({ ...o, completed: false })),
        }
      }),
    )
    if (trackedQuestId === selectedQuest.id) {
      setTrackedQuestId(null)
    }
  }

  const completedObjectivesCount = selectedQuest.objectives.filter(o => o.completed).length
  const totalObjectivesCount = selectedQuest.objectives.length

  return (
    <div className="quests-screen">
      {/* ------------------------------------------------------------------
          LEFT SIDEBAR: Categories & Player Card
          ------------------------------------------------------------------ */}
      <aside className="quests-sidebar">
        <nav className="quests-category-list" aria-label="Quest Categories">
          {QUEST_CATEGORIES.map(cat => {
            const isActive = selectedCategory === cat.id
            return (
              <button
                key={cat.id}
                type="button"
                className={`quests-cat-btn${isActive ? ' is-active' : ''}`}
                onClick={() => {
                  uiAudio.playClick()
                  setSelectedCategory(isActive ? null : cat.id)
                }}
              >
                <div className="quests-cat-left">
                  <span className="quests-cat-icon">
                    <QuestIcon name={cat.icon} />
                  </span>
                  <span>{cat.label}</span>
                </div>
                <span className="quests-cat-count">{categoryCounts[cat.id] ?? cat.count}</span>
              </button>
            )
          })}
        </nav>

        {/* Motivational Slogan Card */}
        <div className="quests-slogan-card">
          <svg className="quests-skyline-icon" viewBox="0 0 64 36" fill="currentColor">
            <rect x="2" y="16" width="6" height="18" rx="1" />
            <rect x="10" y="10" width="7" height="24" rx="1" />
            <rect x="19" y="4" width="8" height="30" rx="1" />
            <rect x="29" y="12" width="6" height="22" rx="1" />
            <rect x="37" y="2" width="9" height="32" rx="1" />
            <rect x="48" y="8" width="7" height="26" rx="1" />
            <rect x="57" y="18" width="5" height="16" rx="1" />
          </svg>
          <div className="quests-slogan-title">Explore. Work. Build.</div>
          <div className="quests-slogan-sub">A Brighter Tomorrow in Sun City.</div>
        </div>

        {/* Bottom Player Card */}
        <div className="quests-player-card">
          <div className="quests-player-card-header">
            <span className="quests-player-name">Player1</span>
            <span className="quests-player-level">Level 42</span>
          </div>
          <div className="quests-xp-track">
            <div className="quests-xp-fill" style={{ width: '49.8%' }} />
          </div>
          <div className="quests-player-meta">
            <span className="quests-xp-text">12,450 / 25,000 XP</span>
            <div className="quests-watermark-logo">
              <svg viewBox="0 0 24 16" fill="currentColor">
                <rect x="1" y="8" width="3" height="8" rx="0.5" />
                <rect x="5" y="4" width="3" height="12" rx="0.5" />
                <rect x="9" y="1" width="4" height="15" rx="0.5" />
                <rect x="14" y="6" width="3" height="10" rx="0.5" />
                <rect x="18" y="3" width="3" height="13" rx="0.5" />
              </svg>
              <span className="quests-watermark-text">SUN CITY</span>
            </div>
          </div>
        </div>
      </aside>

      {/* ------------------------------------------------------------------
          CENTER COLUMN: Quests List, Search & Filters
          ------------------------------------------------------------------ */}
      <section className="quests-list-panel" aria-label="Quest Registry">
        <div className="quests-header-row">
          <div className="quests-title-box">
            <h2>QUESTS</h2>
            <p>Take on jobs, help the city, and make a name for yourself in Sun City.</p>
          </div>
          <div className="quests-search-wrapper">
            <QuestIcon name="search" className="quests-search-icon" />
            <input
              type="text"
              className="quests-search-input"
              placeholder="Search quests..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Status Filters */}
        <div className="quests-filters-row">
          {(['all', 'in-progress', 'available', 'completed'] as const).map(filter => {
            const labelMap: Record<string, string> = {
              all: 'All',
              'in-progress': 'In Progress',
              available: 'Available',
              completed: 'Completed',
            }
            return (
              <button
                key={filter}
                type="button"
                className={`quests-filter-btn${filterStatus === filter ? ' is-active' : ''}`}
                onClick={() => {
                  uiAudio.playClick()
                  setFilterStatus(filter)
                }}
              >
                {labelMap[filter]}
              </button>
            )
          })}
        </div>

        {/* Scrollable Cards List */}
        <div className="quests-cards-scroll">
          {filteredQuests.map(quest => {
            const isSelected = quest.id === selectedQuestId
            const doneCount = quest.objectives.filter(o => o.completed).length
            const totalCount = quest.objectives.length
            const progressPercent = totalCount > 0 ? (doneCount / totalCount) * 100 : 0

            return (
              <div
                key={quest.id}
                className={`quest-card${isSelected ? ' is-selected' : ''}`}
                onClick={() => {
                  uiAudio.playClick()
                  setSelectedQuestId(quest.id)
                }}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
              >
                {/* Icon */}
                <div className="quest-card-icon-box">
                  <QuestIcon name={quest.icon} />
                </div>

                {/* Main Info */}
                <div className="quest-card-main">
                  <div className="quest-card-title-row">
                    <span className="quest-card-title">{quest.title}</span>
                    <span className={`quest-tag-pill quest-tag-${quest.tagColor}`}>{quest.tag}</span>
                  </div>
                  <span className="quest-card-subtitle">{quest.subtitle}</span>
                  <div className="quest-card-location">
                    <QuestIcon name="pin" />
                    <span>{quest.location}</span>
                  </div>
                </div>

                {/* Rewards */}
                <div className="quest-card-rewards">
                  <div className="quest-reward-chip-money">
                    <QuestIcon name="cash" />
                    <span>${quest.rewards.money.toLocaleString()}</span>
                  </div>
                  <div className="quest-reward-chip-xp">
                    <b>XP</b>
                    <span>{quest.rewards.xp}</span>
                  </div>
                </div>

                {/* Status Column */}
                <div className="quest-card-status-col">
                  {quest.status === 'in-progress' && (
                    <>
                      <span className="quest-status-text quest-status-in-progress">In Progress</span>
                      <div className="quest-progress-track">
                        <div className="quest-progress-fill" style={{ width: `${progressPercent}%` }} />
                      </div>
                      <span className="quest-step-fraction">
                        {doneCount}/{totalCount}
                      </span>
                    </>
                  )}

                  {quest.status === 'available' && !quest.timer && (
                    <span className="quest-status-text quest-status-available">Available</span>
                  )}

                  {quest.status === 'available' && quest.timer && (
                    <div className={`quest-timer-chip${quest.category === 'events' ? ' is-event' : ''}`}>
                      <QuestIcon name="clock" />
                      <span>{quest.timer}</span>
                    </div>
                  )}

                  {quest.status === 'completed' && (
                    <span className="quest-status-text quest-status-completed">Completed</span>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ------------------------------------------------------------------
          RIGHT COLUMN: Selected Quest Detail
          ------------------------------------------------------------------ */}
      <section className="quests-detail-panel" aria-label="Selected Quest Details">
        {/* Detail Title Row */}
        <div className="quests-detail-header">
          <div className="quests-detail-icon-box">
            <QuestIcon name={selectedQuest.icon} />
          </div>
          <div className="quests-detail-title-col">
            <div className="quests-detail-title-row">
              <span className="quests-detail-title">{selectedQuest.title}</span>
              <span className={`quest-tag-pill quest-tag-${selectedQuest.tagColor}`}>{selectedQuest.tag}</span>
            </div>
            <div className="quests-detail-location">
              <QuestIcon name="pin" />
              <span>{selectedQuest.location}</span>
            </div>
          </div>
        </div>

        {/* Narrative Description */}
        <p className="quests-detail-description">{selectedQuest.description}</p>

        {/* Hero Banner Visual */}
        <div className="quests-hero-banner">
          <img
            src={selectedQuest.bannerImage ?? '/assets/quests/pizza-this.jpg'}
            alt={`${selectedQuest.title} location`}
            className="quests-hero-image"
          />
          <div className="quests-hero-overlay">
            <div className="quests-hero-location-badge">
              <strong>{selectedQuest.bannerLocation ?? selectedQuest.location}</strong>
              <span>{selectedQuest.bannerCity ?? 'Sun City'}</span>
            </div>
            <div className="quests-hero-slogan">
              {selectedQuest.bannerSlogan ?? 'Good Food · Brighter People'}
            </div>
          </div>
        </div>

        {/* OBJECTIVES */}
        <div className="quests-objectives-section">
          <div className="quests-section-header">
            <span>Objectives</span>
            <span className="quests-section-fraction">
              {completedObjectivesCount} / {totalObjectivesCount}
            </span>
          </div>

          <div className="quests-objectives-list">
            {selectedQuest.objectives.map(obj => (
              <div
                key={obj.id}
                className={`quest-objective-item${obj.completed ? ' is-done' : ''}`}
                onClick={() => handleToggleObjective(obj.id)}
                role="checkbox"
                aria-checked={obj.completed}
                tabIndex={0}
              >
                <div className="quest-checkbox">
                  {obj.completed && <QuestIcon name="check" />}
                </div>
                <span className="quest-objective-text">{obj.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* REWARDS */}
        <div className="quests-rewards-section">
          <div className="quests-section-header">
            <span>Rewards</span>
          </div>

          <div className="quests-rewards-grid">
            <div className="quest-reward-card">
              <div className="quest-reward-card-icon is-money">
                <QuestIcon name="cash" />
              </div>
              <div className="quest-reward-card-body">
                <strong>${selectedQuest.rewards.money.toLocaleString()}</strong>
                <span>Cash</span>
              </div>
            </div>

            <div className="quest-reward-card-icon quest-reward-card">
              <div className="quest-reward-card-icon is-xp">
                <span>XP</span>
              </div>
              <div className="quest-reward-card-body">
                <strong>{selectedQuest.rewards.xp}</strong>
                <span>Experience</span>
              </div>
            </div>

            <div className="quest-reward-card">
              <div className="quest-reward-card-icon is-rep">
                <QuestIcon name="users" />
              </div>
              <div className="quest-reward-card-body">
                <strong>{selectedQuest.rewards.rep?.split(' ')[0] ?? '+10'}</strong>
                <span>Reputation</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="quests-actions-footer">
          <button
            type="button"
            className={`quest-act-btn quest-act-track${trackedQuestId === selectedQuest.id ? ' is-tracking' : ''}`}
            onClick={handleToggleTrack}
          >
            <QuestIcon name="plane" />
            <span>{trackedQuestId === selectedQuest.id ? 'Tracking' : 'Track Quest'}</span>
          </button>

          <button
            type="button"
            className={`quest-act-btn quest-act-gps${gpsTarget === selectedQuest.location ? ' is-set' : ''}`}
            onClick={handleSetGPS}
          >
            <QuestIcon name="pin" />
            <span>{gpsTarget === selectedQuest.location ? 'GPS Active' : 'Set GPS'}</span>
          </button>

          <button
            type="button"
            className="quest-act-btn quest-act-abandon"
            onClick={handleAbandon}
          >
            <QuestIcon name="trash" />
            <span>Abandon</span>
          </button>
        </div>
      </section>
    </div>
  )
}
