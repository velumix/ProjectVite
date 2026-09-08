import { useState } from 'react'
import { PHONE_APPS, type PhoneAppDefinition } from './phone-apps'

type Props = {
  onLaunch: (appId: string) => void
  installedApps: PhoneAppDefinition[]
  dockApps?: PhoneAppDefinition[]
}

const APPS_PER_PAGE = 48

export function PhoneSpringboard({ onLaunch, installedApps, dockApps = [] }: Props) {
  const [activePageIndex, setActivePageIndex] = useState(0)

  // Split apps into pages
  const allApps = PHONE_APPS
  const pages: PhoneAppDefinition[][] = []

  // Page 0: Installed apps
  pages.push(installedApps.slice(0, APPS_PER_PAGE))

  // Page 1: Remaining apps and games
  const remaining = allApps.filter((app) => !pages[0].some((p) => p.id === app.id))
  if (remaining.length > 0) {
    for (let i = 0; i < remaining.length; i += APPS_PER_PAGE) {
      pages.push(remaining.slice(i, i + APPS_PER_PAGE))
    }
  }

  const currentPage = pages[activePageIndex] ?? pages[0]

  return (
    <div className="phone-springboard">
      <div className="phone-springboard-scroll">
        {/* Springboard Header Widget (Page 0) */}
        {activePageIndex === 0 && (
          <div className="phone-springboard-widget-row">
            <div className="phone-springboard-clock-card">
              <time className="phone-widget-time">12:24</time>
              <span className="phone-widget-date">Sunday, September 6</span>
              <div className="phone-widget-weather-snip">
                <span>☀️ 74°F</span>
                <small>Sun City • Clear</small>
              </div>
            </div>
          </div>
        )}

        {/* Springboard App Grid for current page */}
        <div className="phone-app-grid" role="grid" aria-label={`Springboard page ${activePageIndex + 1}`}>
          {currentPage.map((app) => (
            <button
              type="button"
              key={app.id}
              onClick={() => onLaunch(app.id)}
              className="phone-springboard-icon-btn"
              aria-label={`Open ${app.label}`}
              title={app.label}
            >
              <div className="phone-app-icon-wrapper">
                <img className="phone-app-icon" src={app.icon} alt="" loading="lazy" />
              </div>
              <span className="phone-app-label">{app.label}</span>
            </button>
          ))}
        </div>

        {/* Pagination Page Dots */}
        {pages.length > 1 && (
          <div className="phone-pagination-dots" role="tablist" aria-label="Springboard pages">
            {pages.map((_, idx) => (
              <button
                type="button"
                key={idx}
                className={`phone-page-dot ${idx === activePageIndex ? 'is-active' : ''}`}
                onClick={() => setActivePageIndex(idx)}
                aria-label={`Page ${idx + 1}`}
                aria-selected={idx === activePageIndex}
                role="tab"
              />
            ))}
          </div>
        )}
      </div>

      {/* Frosted Glass Springboard Dock */}
      {dockApps.length > 0 && (
        <nav className="phone-dock" aria-label="Phone navigation">
          {dockApps.map((app) => (
            <button
              type="button"
              key={app.id}
              onClick={() => onLaunch(app.id)}
              className="phone-dock-btn"
              aria-label={app.label}
              title={app.label}
            >
              <div className="phone-dock-icon-wrapper">
                <img className="phone-dock-icon" src={app.icon} alt="" loading="lazy" />
              </div>
            </button>
          ))}
        </nav>
      )}
    </div>
  )
}
