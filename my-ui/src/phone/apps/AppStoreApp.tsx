import { useState, useEffect, useCallback, useMemo } from 'react'
import { AppStoreService, type StoreAppItem } from '../../nerve/preview'

type Props = {
  onLaunchApp: (appId: string) => void
}

const CATEGORIES = ['all', 'featured', 'social', 'games', 'utilities', 'shopping']

export function AppStoreApp({ onLaunchApp }: Props) {
  const [catalog, setCatalog] = useState<StoreAppItem[]>([])
  const [installedIds, setInstalledIds] = useState<string[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [installingId, setInstallingId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    const [apps] = await AppStoreService.GetStoreCatalog.request(undefined)
    if (apps) setCatalog(apps)

    const [installed] = await AppStoreService.GetInstalledApps.request(undefined)
    if (installed) setInstalledIds(installed)
  }, [])

  useEffect(() => {
    loadData()
    const unsub = AppStoreService.InstalledAppsChanged.connect((nextIds) => {
      setInstalledIds(nextIds)
    })
    return () => {
      unsub()
    }
  }, [loadData])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleInstall = async (app: StoreAppItem) => {
    setInstallingId(app.id)
    // Simulate realistic store download progress
    await new Promise((resolve) => setTimeout(resolve, 600))
    const [ok, nextInstalled, err] = await AppStoreService.InstallApp.request({ appId: app.id })
    setInstallingId(null)
    if (ok && nextInstalled) {
      setInstalledIds(nextInstalled)
      showToast(`${app.name} installed to Springboard!`)
    } else if (err) {
      showToast(err)
    }
  }

  const handleUninstall = async (app: StoreAppItem) => {
    const [ok, nextInstalled, err] = await AppStoreService.UninstallApp.request({ appId: app.id })
    if (ok && nextInstalled) {
      setInstalledIds(nextInstalled)
      showToast(`${app.name} removed from phone.`)
    } else if (err) {
      showToast(err)
    }
  }

  const filteredApps = useMemo(() => {
    return catalog.filter((app) => {
      const matchCat =
        activeCategory === 'all' ||
        (activeCategory === 'featured' && app.rating >= 4.7) ||
        app.category.toLowerCase() === activeCategory.toLowerCase()

      const matchQuery =
        !searchQuery.trim() ||
        app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        app.developer.toLowerCase().includes(searchQuery.toLowerCase())

      return matchCat && matchQuery
    })
  }, [catalog, activeCategory, searchQuery])

  return (
    <div className="store-app-root">
      {/* Header */}
      <header className="store-header">
        <div className="store-title-row">
          <div className="store-brand">
            <span className="store-logo-icon">🛍️</span>
            <h3>App Store</h3>
          </div>
          <span className="store-installed-count">
            {installedIds.length} Installed
          </span>
        </div>

        {/* Search */}
        <div className="store-search-bar">
          <span className="store-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search games, utilities, social..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="store-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="store-cat-ribbon">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`store-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </header>

      {/* Toast Notice */}
      {toastMessage && (
        <aside className="store-toast" role="status">
          <span>🛍️</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Main Catalog View */}
      <main className="store-main-scroll">
        {/* Featured Banner (Shown when no search or in featured/all) */}
        {!searchQuery && (activeCategory === 'all' || activeCategory === 'featured') && (
          <section className="store-spotlight-card">
            <div className="store-spotlight-badge">FEATURED APP</div>
            <div className="store-spotlight-content">
              <h4>FlipTok - Viral Short Videos</h4>
              <p>Join millions of creators streaming live challenges from Sun City.</p>
              <div className="store-spotlight-actions">
                {installedIds.includes('fliptok') ? (
                  <button
                    type="button"
                    className="store-btn-open"
                    onClick={() => onLaunchApp('fliptok')}
                  >
                    OPEN
                  </button>
                ) : (
                  <button
                    type="button"
                    className="store-btn-get"
                    disabled={installingId === 'fliptok'}
                    onClick={() => {
                      const fliptok = catalog.find((a) => a.id === 'fliptok')
                      if (fliptok) handleInstall(fliptok)
                    }}
                  >
                    {installingId === 'fliptok' ? 'INSTALLING...' : 'GET'}
                  </button>
                )}
              </div>
            </div>
          </section>
        )}

        {/* App List */}
        <div className="store-apps-list">
          {filteredApps.length === 0 ? (
            <div className="store-empty">
              <p>No apps found in this category.</p>
            </div>
          ) : (
            filteredApps.map((app) => {
              const isInstalled = installedIds.includes(app.id)
              const isBusy = installingId === app.id

              return (
                <article key={app.id} className="store-app-card">
                  <div className="store-app-icon-wrapper">
                    <img
                      src={`${import.meta.env.BASE_URL}assets/phone/app-icons/${app.id}.webp`}
                      alt={app.name}
                      onError={(e) => {
                        // Fallback placeholder if custom icon isn't available
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                    <div className="store-app-icon-fallback">📱</div>
                  </div>

                  <div className="store-app-info">
                    <div className="store-app-name-row">
                      <strong className="store-app-title">{app.name}</strong>
                      <span className="store-cat-badge">{app.category}</span>
                    </div>

                    <small className="store-app-developer">{app.developer}</small>

                    <div className="store-app-meta">
                      <span className="store-rating">★ {app.rating.toFixed(1)}</span>
                      <span className="store-reviews">
                        ({(app.reviewsCount / 1000).toFixed(1)}k)
                      </span>
                      <span className="store-dot">·</span>
                      <span className="store-size">{app.sizeMb} MB</span>
                    </div>

                    <p className="store-description">{app.description}</p>

                    <div className="store-action-buttons">
                      {isInstalled ? (
                        <>
                          <button
                            type="button"
                            className="store-btn-open"
                            onClick={() => onLaunchApp(app.id)}
                          >
                            OPEN
                          </button>
                          {!app.isSystem && (
                            <button
                              type="button"
                              className="store-btn-remove"
                              onClick={() => handleUninstall(app)}
                            >
                              UNINSTALL
                            </button>
                          )}
                        </>
                      ) : (
                        <button
                          type="button"
                          className="store-btn-get"
                          disabled={isBusy}
                          onClick={() => handleInstall(app)}
                        >
                          {isBusy ? 'INSTALLING...' : 'GET'}
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              )
            })
          )}
        </div>
      </main>
    </div>
  )
}
