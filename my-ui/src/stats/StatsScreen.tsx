import { useState, useId } from 'react'
import {
  INITIAL_ATTRIBUTES,
  INITIAL_SKILLS,
  INITIAL_REPUTATIONS,
  INITIAL_ACTIVE_QUESTS,
  INITIAL_COMPLETED_QUESTS,
  INITIAL_MILESTONES,
  type AttributeData,
  type ActiveQuestItem,
  type FactionReputation,
} from './stats-data.ts'
import { uiAudio } from '../audio/ui-audio.ts'
import './stats.css'

interface BindingStoreReader {
  get(key: string): unknown
}

interface StatsScreenProps {
  bindings?: BindingStoreReader
}

function StatsIcon({ name, className = '' }: { name: string; className?: string }) {
  switch (name) {
    case 'heart':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
        </svg>
      )
    case 'stamina':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="17" cy="4" r="2" />
          <path d="m15 8-4.5 2.5-3-2.5-3.5 3" />
          <path d="M10.5 10.5 13 15l-3 4-4-1" />
          <path d="m13 15 4-1.5 3 3.5" />
        </svg>
      )
    case 'strength':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M4 14c0-2.2 1.8-4 4-4h2l2-3c1.5-2 4-2 5 0l1.5 3.5c1 .5 2 1.5 2.5 3 1 2.5 0 5.5-2 6.5l-4 1.5-5-2-3 2c-1.5-1.5-3-4-3-6.5Z" />
        </svg>
      )
    case 'intelligence':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04Z" />
          <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04Z" />
        </svg>
      )
    case 'lungs':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4v7" />
          <path d="M12 7c-2-2-5-2-7 0a6 6 0 0 0-2 6c.5 4 4 7 7 7 1 0 2-.5 2-2V7Z" />
          <path d="M12 7c2-2 5-2 7 0a6 6 0 0 1 2 6c-.5 4-4 7-7 7-1 0-2-.5-2-2V7Z" />
        </svg>
      )
    case 'driving':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9L16 10H8L3.5 11.1C2.7 11.3 2 12.1 2 13v3c0 .6.4 1 1 1h2" />
          <circle cx="7" cy="17" r="2" />
          <path d="M9 17h6" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      )
    case 'shooting':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="6" />
          <circle cx="12" cy="12" r="2" />
          <path d="M12 2v4M12 18v4M2 12h4M18 12h4" />
        </svg>
      )
    case 'melee':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m14.5 17.5 5 5a1 1 0 0 0 1.4-1.4l-5-5" />
          <path d="m9.5 6.5 5 5" />
          <path d="m17 4 3 3-9 9-4-1-1-4 9-9Z" />
          <path d="m4.5 19.5 5-5" />
          <path d="m2 22 2-2" />
        </svg>
      )
    case 'stealth':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 10s2-4 10-4 10 4 10 4-2 8-10 8-10-8-10-8Z" />
          <circle cx="8" cy="11" r="1.5" />
          <circle cx="16" cy="11" r="1.5" />
          <path d="M9 15c1 .8 2.5 1 3 1s2-.2 3-1" />
        </svg>
      )
    case 'fishing':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6.5 12c.94-2.07 3-3.5 5.5-3.5 3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5c-2.5 0-4.56-1.43-5.5-3.5" />
          <path d="M18 15h4" />
          <path d="M2 3l10 5" />
          <circle cx="6" cy="5" r="1" />
        </svg>
      )
    case 'medical':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 4v16M4 12h16" />
        </svg>
      )
    case 'mechanic':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76Z" />
        </svg>
      )
    case 'cooking':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M6 13.8a4.5 4.5 0 1 1 5-7.7 4.5 4.5 0 1 1 6.3 3.6A4.5 4.5 0 0 1 18 14H6Z" />
          <path d="M6 14v4a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2v-4" />
          <line x1="6" x2="18" y1="17" y2="17" />
        </svg>
      )
    case 'business':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" x2="18" y1="20" y2="10" />
          <line x1="12" x2="12" y1="20" y2="4" />
          <line x1="6" x2="6" y1="20" y2="14" />
        </svg>
      )
    case 'charisma':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      )
    case 'civilians':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
        </svg>
      )
    case 'police':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <circle cx="12" cy="11" r="2.5" />
        </svg>
      )
    case 'ems':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 2v20M2 12h20M4.93 4.93l14.14 14.14M19.07 4.93 4.93 19.07" />
        </svg>
      )
    case 'criminals':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
          <path d="M8 10h2M14 10h2M9 15h6" />
        </svg>
      )
    case 'house':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      )
    case 'cash':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="12" x="2" y="6" rx="2" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M6 12h.01M18 12h.01" />
        </svg>
      )
    case 'star':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
        </svg>
      )
    case 'check':
      return (
        <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      )
    default:
      return null
  }
}

export function StatsScreen({ bindings }: StatsScreenProps) {
  const [attributes, setAttributes] = useState<AttributeData[]>(INITIAL_ATTRIBUTES)
  const [availablePoints, setAvailablePoints] = useState<number>(0)
  const [activeQuests, setActiveQuests] = useState<ActiveQuestItem[]>(INITIAL_ACTIVE_QUESTS)
  const [selectedFaction, setSelectedFaction] = useState<FactionReputation | null>(null)
  const [showMilestonesModal, setShowMilestonesModal] = useState(false)
  const circularRingId = useId()

  // Read player data from bindings or fallback
  const playerName = String(bindings?.get('Player.Name') ?? 'Player1')
  const playerLevel = Number(bindings?.get('Player.Level') ?? 42)
  const currentXp = 12450
  const maxXp = 25000
  const xpPercent = Math.min(100, Math.round((currentXp / maxXp) * 100))
  const healthPercent = Math.round(Number(bindings?.get('Player.HealthPercent') ?? 1) * 100)

  // Total skill level calculation
  const totalSkillLevel = INITIAL_SKILLS.reduce((sum, s) => sum + s.level, 0)

  // Level progress ring radius & circumference
  const radius = 38
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (circumference * xpPercent) / 100

  // Spend attribute point handler
  const handleUpgradeAttribute = (attrId: string) => {
    if (availablePoints <= 0) {
      uiAudio.playTick()
      return
    }
    uiAudio.playEquip()
    setAvailablePoints((prev) => prev - 1)
    setAttributes((prev) =>
      prev.map((attr) =>
        attr.id === attrId && attr.level < attr.maxLevel ? { ...attr, level: attr.level + 1 } : attr
      )
    )
  }

  // Quick dev simulator: toggle available point for testing
  const handleAddPoint = () => {
    uiAudio.playReward()
    setAvailablePoints((p) => p + 2)
  }

  const handleResetPoints = () => {
    uiAudio.playTick()
    setAttributes(INITIAL_ATTRIBUTES)
    setAvailablePoints(0)
  }

  // Toggle active quest checklist
  const handleToggleQuestObjective = (questId: string) => {
    uiAudio.playCheck()
    setActiveQuests((prev) =>
      prev.map((q) => (q.id === questId ? { ...q, isCompleted: !q.isCompleted } : q))
    )
  }

  // Increment photo progress
  const handleIncrementProgress = (questId: string) => {
    uiAudio.playCheck()
    setActiveQuests((prev) =>
      prev.map((q) => {
        if (q.id === questId && q.progress !== undefined && q.maxProgress !== undefined) {
          const next = q.progress >= q.maxProgress ? 0 : q.progress + 1
          return { ...q, progress: next }
        }
        return q
      })
    )
  }

  return (
    <div className="stats-screen" role="region" aria-label="Player Statistics">
      {/* =========================================================================
          LEFT COLUMN: Progression, Attributes, Skills, Reputation
          ========================================================================= */}
      <div className="stats-col-left">
        {/* Card 1: Progression */}
        <section className="stats-card stats-progression-card" aria-label="Progression">
          <div className="stats-card-header">
            <div>
              <h2 className="stats-card-title">PROGRESSION</h2>
              <span className="stats-card-sub">LIVE ANOTHER DAY</span>
            </div>
          </div>

          <div className="stats-progression-content">
            {/* Circular Ring Progress */}
            <div className="stats-level-ring-wrap" aria-label={`Level ${playerLevel}`}>
              <svg className="stats-level-ring-svg" viewBox="0 0 100 100">
                <defs>
                  <linearGradient id={circularRingId} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#00b4d8" />
                  </linearGradient>
                </defs>
                <circle className="stats-ring-bg" cx="50" cy="50" r={radius} />
                <circle
                  className="stats-ring-meter"
                  cx="50"
                  cy="50"
                  r={radius}
                  stroke={`url(#${circularRingId})`}
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                />
              </svg>
              <div className="stats-level-ring-text">
                <span className="stats-level-number">{playerLevel}</span>
                <span className="stats-level-caption">LEVEL</span>
              </div>
            </div>

            {/* Player Info & XP Bar */}
            <div className="stats-player-details">
              <div className="stats-player-header-line">
                <div className="stats-player-name-box">
                  <h3 className="stats-player-name">{playerName}</h3>
                  <span className="stats-citizen-badge">CITIZEN</span>
                </div>
                <div className="stats-xp-counter">
                  <strong>{currentXp.toLocaleString()}</strong> / {maxXp.toLocaleString()} XP
                </div>
              </div>

              <div className="stats-xp-bar-track">
                <div className="stats-xp-bar-fill" style={{ width: `${xpPercent}%` }} />
              </div>

              <p className="stats-player-quote">&ldquo;Same city, different story.&rdquo;</p>
            </div>
          </div>
        </section>

        {/* Card 2: Attributes */}
        <section className="stats-card stats-attributes-card" aria-label="Attributes">
          <div className="stats-card-header">
            <h2 className="stats-card-title">ATTRIBUTES</h2>
            <div className="stats-points-header">
              <span className={`stats-points-badge ${availablePoints > 0 ? 'has-points' : ''}`}>
                {availablePoints} {availablePoints === 1 ? 'POINT' : 'POINTS'} AVAILABLE
              </span>
              {availablePoints === 0 ? (
                <button
                  type="button"
                  className="stats-dev-point-btn"
                  onClick={handleAddPoint}
                  title="Simulate Level Up (+2 Points)"
                >
                  + Point
                </button>
              ) : (
                <button
                  type="button"
                  className="stats-dev-point-btn"
                  onClick={handleResetPoints}
                  title="Reset Points"
                >
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="stats-attributes-grid">
            {attributes.map((attr) => (
              <div
                key={attr.id}
                className={`stats-attr-card ${availablePoints > 0 ? 'is-upgradeable' : ''}`}
                title={attr.description}
                onMouseEnter={() => uiAudio.playHover()}
              >
                <div className="stats-attr-icon" style={{ color: attr.color }}>
                  <StatsIcon name={attr.icon} />
                </div>
                <strong className="stats-attr-name">{attr.name}</strong>
                <div className="stats-attr-level-line">
                  <div className="stats-attr-level-row">
                    <span className="stats-attr-level">LV. {attr.level}</span>
                    {attr.id === 'health' && (
                      <span className="stats-attr-extra-badge" title="Current Health Vitality">{healthPercent}%</span>
                    )}
                  </div>
                  <div className="stats-attr-track">
                    <div
                      className="stats-attr-fill"
                      style={{
                        width: `${(attr.level / attr.maxLevel) * 100}%`,
                        backgroundColor: attr.color,
                        boxShadow: `0 0 8px ${attr.color}88`,
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="stats-attr-plus-btn"
                  aria-label={`Upgrade ${attr.name}`}
                  disabled={availablePoints <= 0 || attr.level >= attr.maxLevel}
                  onClick={() => handleUpgradeAttribute(attr.id)}
                >
                  +
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Card 3: Skills */}
        <section className="stats-card stats-skills-card" aria-label="Skills">
          <div className="stats-card-header">
            <h2 className="stats-card-title">SKILLS</h2>
            <span className="stats-total-skills">TOTAL SKILL LEVEL {totalSkillLevel}</span>
          </div>

          <div className="stats-skills-grid">
            {/* Column 1 */}
            <div className="stats-skills-col">
              {INITIAL_SKILLS.slice(0, 5).map((skill) => (
                <div
                  key={skill.id}
                  className="stats-skill-item"
                  title={skill.description}
                  onMouseEnter={() => uiAudio.playHover()}
                >
                  <div className="stats-skill-icon-wrap">
                    <StatsIcon name={skill.icon} className="stats-skill-icon" />
                  </div>
                  <span className="stats-skill-name">{skill.name}</span>
                  <div className="stats-skill-bar-wrap">
                    <div
                      className="stats-skill-bar-fill"
                      style={{
                        width: `${(skill.level / skill.maxLevel) * 100}%`,
                        backgroundColor: skill.color,
                        boxShadow: `0 0 6px ${skill.color}99`,
                      }}
                    />
                  </div>
                  <span className="stats-skill-level">Lv. {skill.level}</span>
                </div>
              ))}
            </div>

            {/* Column 2 */}
            <div className="stats-skills-col">
              {INITIAL_SKILLS.slice(5, 10).map((skill) => (
                <div
                  key={skill.id}
                  className="stats-skill-item"
                  title={skill.description}
                  onMouseEnter={() => uiAudio.playHover()}
                >
                  <div className="stats-skill-icon-wrap">
                    <StatsIcon name={skill.icon} className="stats-skill-icon" />
                  </div>
                  <span className="stats-skill-name">{skill.name}</span>
                  <div className="stats-skill-bar-wrap">
                    <div
                      className="stats-skill-bar-fill"
                      style={{
                        width: `${(skill.level / skill.maxLevel) * 100}%`,
                        backgroundColor: skill.color,
                        boxShadow: `0 0 6px ${skill.color}99`,
                      }}
                    />
                  </div>
                  <span className="stats-skill-level">Lv. {skill.level}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Card 4: Reputation */}
        <section className="stats-card stats-reputation-card" aria-label="Reputation">
          <div className="stats-card-header">
            <div>
              <h2 className="stats-card-title">REPUTATION</h2>
              <span className="stats-card-sub">HOW THEY SEE YOU</span>
            </div>
          </div>

          <div className="stats-reputation-grid">
            {INITIAL_REPUTATIONS.map((rep) => (
              <button
                type="button"
                key={rep.id}
                className={`stats-rep-card ${selectedFaction?.id === rep.id ? 'is-selected' : ''}`}
                onClick={() => {
                  uiAudio.playClick()
                  setSelectedFaction((cur) => (cur?.id === rep.id ? null : rep))
                }}
                onMouseEnter={() => uiAudio.playHover()}
                title={rep.description}
              >
                <div className="stats-rep-top">
                  <StatsIcon name={rep.icon} className="stats-rep-icon" />
                  <div className="stats-rep-labels">
                    <strong className="stats-rep-name">{rep.name}</strong>
                    <span className="stats-rep-status" style={{ color: rep.color }}>
                      {rep.status}
                    </span>
                  </div>
                </div>
                <div className="stats-rep-line" style={{ backgroundColor: rep.color }} />
              </button>
            ))}
          </div>

          {selectedFaction && (
            <div className="stats-faction-tooltip" role="status">
              <strong>{selectedFaction.name} &bull; {selectedFaction.status}</strong>
              <p>{selectedFaction.description}</p>
            </div>
          )}
        </section>
      </div>

      {/* =========================================================================
          RIGHT COLUMN: Active Quests, Completed Quests, Milestones
          ========================================================================= */}
      <div className="stats-col-right">
        {/* Card 1: Active Quests */}
        <section className="stats-card stats-active-quests-card" aria-label="Active Quests">
          <div className="stats-card-header">
            <h2 className="stats-card-title">ACTIVE QUESTS</h2>
            <span className="stats-active-count">{activeQuests.length} ACTIVE</span>
          </div>

          <div className="stats-active-quests-list">
            {activeQuests.map((quest) => (
              <div
                key={quest.id}
                className="stats-active-quest-item"
                onMouseEnter={() => uiAudio.playHover()}
              >
                <div className="stats-quest-thumb-wrap">
                  <img
                    src={quest.thumbnail}
                    alt={quest.title}
                    className="stats-quest-thumb"
                    loading="lazy"
                  />
                </div>

                <div className="stats-quest-info">
                  <h3 className="stats-quest-title">{quest.title}</h3>
                  <p className="stats-quest-sub">{quest.subtitle}</p>

                  {quest.type === 'checkbox' ? (
                    <label className="stats-quest-check-label">
                      <input
                        type="checkbox"
                        checked={quest.isCompleted}
                        onChange={() => handleToggleQuestObjective(quest.id)}
                        className="stats-quest-checkbox"
                      />
                      <span className={quest.isCompleted ? 'is-checked-text' : ''}>
                        {quest.objectiveText}
                      </span>
                    </label>
                  ) : (
                    <div className="stats-quest-progress-row">
                      <div
                        className="stats-quest-progress-track"
                        onClick={() => handleIncrementProgress(quest.id)}
                        title="Click to take photo"
                      >
                        <div
                          className="stats-quest-progress-fill"
                          style={{
                            width: `${((quest.progress ?? 0) / (quest.maxProgress ?? 1)) * 100}%`,
                          }}
                        />
                      </div>
                      <button
                        type="button"
                        className="stats-quest-progress-num"
                        onClick={() => handleIncrementProgress(quest.id)}
                        title="Increment photos"
                      >
                        {quest.progress} / {quest.maxProgress}
                      </button>
                    </div>
                  )}
                </div>

                <div className="stats-quest-rewards-side">
                  <span className={`stats-quest-badge badge-${quest.badge.toLowerCase()}`}>
                    {quest.badge}
                  </span>
                  <strong className="stats-quest-cash">$ {quest.rewardCash.toLocaleString()}</strong>
                  <span className="stats-quest-xp">+ {quest.rewardXp.toLocaleString()} XP</span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Card 2: Completed Quests */}
        <section className="stats-card stats-completed-quests-card" aria-label="Completed Quests">
          <div className="stats-card-header">
            <h2 className="stats-card-title">COMPLETED QUESTS</h2>
            <span className="stats-completed-count">124 COMPLETED</span>
          </div>

          <div className="stats-completed-quests-list">
            {INITIAL_COMPLETED_QUESTS.map((quest) => (
              <div
                key={quest.id}
                className="stats-completed-quest-item"
                onMouseEnter={() => uiAudio.playHover()}
              >
                <div className="stats-completed-thumb-wrap">
                  <img
                    src={quest.thumbnail}
                    alt={quest.title}
                    className="stats-completed-thumb"
                    loading="lazy"
                  />
                </div>

                <div className="stats-completed-check-icon">
                  <svg viewBox="0 0 24 24" fill="currentColor">
                    <circle cx="12" cy="12" r="10" />
                    <path
                      d="m9 12 2 2 4-4"
                      fill="none"
                      stroke="#0d171e"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>

                <div className="stats-completed-info">
                  <h3 className="stats-completed-title">{quest.title}</h3>
                  <p className="stats-completed-sub">{quest.subtitle}</p>
                </div>

                <div className="stats-completed-side">
                  <time className="stats-completed-date">{quest.date}</time>
                  <strong className="stats-completed-cash">$ {quest.rewardCash.toLocaleString()}</strong>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Card 3: Milestones */}
        <section className="stats-card stats-milestones-card" aria-label="Milestones">
          <div className="stats-card-header">
            <div>
              <h2 className="stats-card-title">MILESTONES</h2>
              <span className="stats-card-sub">LONG TERM GOALS</span>
            </div>
            <button
              type="button"
              className="stats-view-all-btn"
              onClick={() => {
                uiAudio.playClick()
                setShowMilestonesModal((v) => !v)
              }}
            >
              VIEW ALL
            </button>
          </div>

          <div className="stats-milestones-grid">
            {INITIAL_MILESTONES.map((m) => {
              const pct = Math.min(100, Math.round((m.current / m.max) * 100))
              return (
                <div
                  key={m.id}
                  className="stats-milestone-card"
                  onMouseEnter={() => uiAudio.playHover()}
                >
                  <div className="stats-milestone-icon">
                    <StatsIcon name={m.icon} />
                  </div>
                  <strong className="stats-milestone-title">{m.title}</strong>
                  <div className="stats-milestone-track">
                    <div className="stats-milestone-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="stats-milestone-counter">
                    {m.isCurrency
                      ? `$ ${m.current.toLocaleString()} / ${m.max.toLocaleString()}`
                      : `${m.current} / ${m.max}`}
                  </span>
                </div>
              )
            })}
          </div>

          {showMilestonesModal && (
            <div className="stats-milestones-modal-backdrop" onClick={() => setShowMilestonesModal(false)}>
              <div className="stats-milestones-modal" onClick={(e) => e.stopPropagation()}>
                <div className="stats-modal-header">
                  <h3>SUN CITY CITIZEN MILESTONES</h3>
                  <button
                    type="button"
                    className="stats-modal-close"
                    onClick={() => setShowMilestonesModal(false)}
                  >
                    &times;
                  </button>
                </div>
                <p className="stats-modal-desc">
                  Complete milestone challenges to earn exclusive vehicle decals, apartment discounts, and Sun City reputation.
                </p>
                <div className="stats-modal-list">
                  {INITIAL_MILESTONES.map((m) => (
                    <div key={m.id} className="stats-modal-row">
                      <StatsIcon name={m.icon} className="stats-modal-icon" />
                      <div>
                        <strong>{m.title}</strong>
                        <span>Reward: 10,000 XP &bull; Custom Title</span>
                      </div>
                      <span className="stats-modal-status">
                        {Math.round((m.current / m.max) * 100)}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
