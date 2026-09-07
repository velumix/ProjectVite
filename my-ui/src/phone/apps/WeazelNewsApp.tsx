import { useState, useEffect, useCallback } from 'react'
import {
  NewsService,
  type NewsArticle,
} from '../../nerve/preview'

type CategoryFilter = 'all' | 'breaking' | 'crime' | 'politics' | 'entertainment'

export function WeazelNewsApp() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [filter, setFilter] = useState<CategoryFilter>('all')
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  // Compose state
  const [newHeadline, setNewHeadline] = useState('')
  const [newCategory, setNewCategory] = useState('crime')
  const [newContent, setNewContent] = useState('')
  const [isBreaking, setIsBreaking] = useState(false)

  const loadArticles = useCallback(async () => {
    const [list] = await NewsService.GetArticles.request(undefined)
    if (list) setArticles(list)
  }, [])

  useEffect(() => {
    loadArticles()
    const unsub = NewsService.ArticlePublished.connect((art) => {
      setArticles((prev) => [art, ...prev])
    })
    return () => {
      unsub()
    }
  }, [loadArticles])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleReadArticle = async (a: NewsArticle) => {
    setActiveArticle(a)
    const [ok, _, newViews] = await NewsService.IncrementView.request({ articleId: a.id })
    if (ok && newViews !== undefined) {
      setArticles((prev) =>
        prev.map((art) => (art.id === a.id ? { ...art, views: newViews } : art))
      )
      setActiveArticle((prev) => (prev ? { ...prev, views: newViews } : prev))
    }
  }

  const handlePublish = async () => {
    if (!newHeadline.trim() || !newContent.trim()) {
      showToast('Headline and Story Content are required')
      return
    }
    const [ok, err, created] = await NewsService.PublishArticle.request({
      headline: newHeadline.trim(),
      category: newCategory,
      content: newContent.trim(),
      isBreaking,
    })
    if (ok && created) {
      showToast('Story published across Weazel News Network!')
      setComposeOpen(false)
      setNewHeadline('')
      setNewContent('')
      setIsBreaking(false)
    } else if (err) {
      showToast(err)
    }
  }

  const breakingArticles = articles.filter((a) => a.isBreaking)

  const filteredArticles = articles.filter((a) => {
    if (filter === 'all') return true
    if (filter === 'breaking') return a.isBreaking
    return a.category.toLowerCase() === filter.toLowerCase()
  })

  return (
    <div className="weazel-app-root">
      {/* Header */}
      <header className="weazel-header">
        <div className="weazel-top-row">
          <div className="weazel-branding">
            <span className="weazel-logo">🦊</span>
            <div>
              <h3>WEAZEL NEWS</h3>
              <small>We Read You The News So You Don't Have To</small>
            </div>
          </div>
          <button
            type="button"
            className="weazel-submit-btn"
            onClick={() => setComposeOpen(true)}
          >
            + Report
          </button>
        </div>

        {/* Breaking News Ticker */}
        {breakingArticles.length > 0 && (
          <div className="weazel-ticker">
            <span className="weazel-ticker-tag">BREAKING</span>
            <div className="weazel-ticker-text">
              <span>{breakingArticles[0].headline}</span>
            </div>
          </div>
        )}

        {/* Filter Ribbon */}
        <nav className="weazel-cat-ribbon">
          {(['all', 'breaking', 'crime', 'politics', 'entertainment'] as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`weazel-cat-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat === 'all' ? 'Top' : cat.toUpperCase()}
            </button>
          ))}
        </nav>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="weazel-toast" role="status">
          <span>📰</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Submit Report Modal */}
      {composeOpen && (
        <div className="weazel-modal-backdrop">
          <div className="weazel-modal-dialog">
            <div className="weazel-modal-header">
              <h4>File Field Report</h4>
              <button
                type="button"
                className="weazel-close-modal"
                onClick={() => setComposeOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="weazel-form">
              <input
                type="text"
                placeholder="Article Headline..."
                value={newHeadline}
                onChange={(e) => setNewHeadline(e.target.value)}
              />

              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                className="weazel-select"
              >
                <option value="crime">Crime & Justice</option>
                <option value="politics">Politics & Civic</option>
                <option value="entertainment">Entertainment & Arts</option>
              </select>

              <textarea
                placeholder="Full article copy, eyewitness accounts, police statements..."
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                rows={4}
              />

              <label className="weazel-breaking-checkbox-label">
                <input
                  type="checkbox"
                  checked={isBreaking}
                  onChange={(e) => setIsBreaking(e.target.checked)}
                />
                <span>Flag as BREAKING NEWS bulletin</span>
              </label>

              <button
                type="button"
                className="weazel-publish-btn"
                onClick={handlePublish}
              >
                TRANSMIT ARTICLE TO WIRE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Article Detail View */}
      {activeArticle ? (
        <div className="weazel-detail-container">
          <div className="weazel-detail-top">
            <button
              type="button"
              className="weazel-back-btn"
              onClick={() => setActiveArticle(null)}
            >
              ← Back to Headlines
            </button>
            <span className="weazel-detail-views">👁️ {activeArticle.views} reads</span>
          </div>

          <article className="weazel-full-article">
            <div className="weazel-badge-row">
              {activeArticle.isBreaking && (
                <span className="weazel-breaking-badge">BREAKING</span>
              )}
              <span className="weazel-cat-tag">{activeArticle.category.toUpperCase()}</span>
            </div>

            <h2 className="weazel-full-title">{activeArticle.headline}</h2>

            <div className="weazel-author-line">
              <span>By <strong>{activeArticle.author}</strong></span>
              <small>{new Date(activeArticle.timestamp).toLocaleString()}</small>
            </div>

            <p className="weazel-full-body">{activeArticle.content}</p>
          </article>
        </div>
      ) : (
        /* Articles List Feed */
        <main className="weazel-main-scroll">
          {filteredArticles.length === 0 ? (
            <div className="weazel-empty">
              <span>📰</span>
              <p>No stories in this section.</p>
            </div>
          ) : (
            <div className="weazel-feed">
              {filteredArticles.map((a) => (
                <article
                  key={a.id}
                  className={`weazel-card ${a.isBreaking ? 'breaking' : ''}`}
                  onClick={() => handleReadArticle(a)}
                  role="button"
                  tabIndex={0}
                >
                  <div className="weazel-card-header">
                    <div className="weazel-card-tags">
                      {a.isBreaking && (
                        <span className="weazel-card-breaking-tag">BREAKING</span>
                      )}
                      <span className="weazel-card-cat">{a.category.toUpperCase()}</span>
                    </div>
                    <span className="weazel-card-views">👁️ {a.views}</span>
                  </div>

                  <h4 className="weazel-card-headline">{a.headline}</h4>
                  <p className="weazel-card-snippet">{a.content}</p>

                  <div className="weazel-card-footer">
                    <span>By {a.author}</span>
                    <small>{new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                </article>
              ))}
            </div>
          )}
        </main>
      )}
    </div>
  )
}
