import { useState, useEffect, useCallback } from 'react'
import {
  LocalPagesService,
  MapService,
  type LocalPost,
} from '../../nerve/preview'

type Props = {
  onOpenMap?: () => void
  onCall?: (number: string) => void
}

type CategoryFilter = 'All' | 'Services' | 'Automotive' | 'Trade'

export function LocalPagesApp({ onOpenMap, onCall }: Props) {
  const [posts, setPosts] = useState<LocalPost[]>([])
  const [filter, setFilter] = useState<CategoryFilter>('All')
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [composeOpen, setComposeOpen] = useState(false)

  // Compose state
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('Services')
  const [newDistrict, setNewDistrict] = useState('Pillbox Hill')
  const [newPhone, setNewPhone] = useState('555-0199')
  const [newBody, setNewBody] = useState('')

  const loadPosts = useCallback(async () => {
    const [list] = await LocalPagesService.GetPosts.request(undefined)
    if (list) setPosts(list)
  }, [])

  useEffect(() => {
    loadPosts()
    const unsubPub = LocalPagesService.PostPublished.connect((post) => {
      setPosts((prev) => [post, ...prev])
    })
    const unsubLike = LocalPagesService.PostLiked.connect((event) => {
      setPosts((prev) =>
        prev.map((p) =>
          p.id === event.postId ? { ...p, likes: event.likes, isLiked: event.isLiked } : p
        )
      )
    })
    return () => {
      unsubPub()
      unsubLike()
    }
  }, [loadPosts])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleLike = async (postId: string) => {
    const [ok, err] = await LocalPagesService.LikePost.request({ postId })
    if (!ok && err) showToast(err)
  }

  const handleRouteGps = async (p: LocalPost) => {
    const [ok] = await MapService.SetWaypoint.request({
      x: p.x,
      y: p.y,
      label: p.title,
    })
    if (ok) {
      showToast(`GPS set to ${p.district}`)
      if (onOpenMap) onOpenMap()
    }
  }

  const handlePublish = async () => {
    if (!newTitle.trim() || !newBody.trim()) {
      showToast('Title and Description are required')
      return
    }
    const [ok, err, created] = await LocalPagesService.CreatePost.request({
      title: newTitle.trim(),
      category: newCategory,
      district: newDistrict.trim(),
      phone: newPhone.trim(),
      body: newBody.trim(),
    })
    if (ok && created) {
      showToast('Classified ad published to Yellow Pages!')
      setComposeOpen(false)
      setNewTitle('')
      setNewBody('')
    } else if (err) {
      showToast(err)
    }
  }

  const filteredPosts = posts.filter((p) => {
    if (filter === 'All') return true
    return p.category.toLowerCase() === filter.toLowerCase()
  })

  return (
    <div className="localpages-app-root">
      {/* Header */}
      <header className="localpages-header">
        <div className="localpages-top-row">
          <div className="localpages-branding">
            <span className="localpages-logo">📖</span>
            <div>
              <h3>Local Pages</h3>
              <small>Yellow Pages & Classifieds</small>
            </div>
          </div>
          <button
            type="button"
            className="localpages-compose-btn"
            onClick={() => setComposeOpen(true)}
          >
            + Post Ad
          </button>
        </div>

        {/* Category Ribbon */}
        <nav className="localpages-cat-ribbon">
          {(['All', 'Services', 'Automotive', 'Trade'] as CategoryFilter[]).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`localpages-cat-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </nav>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="localpages-toast" role="status">
          <span>📖</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Compose Ad Modal */}
      {composeOpen && (
        <div className="localpages-modal-backdrop">
          <div className="localpages-modal-dialog">
            <div className="localpages-modal-header">
              <h4>Create Classified Ad</h4>
              <button
                type="button"
                className="localpages-close-modal"
                onClick={() => setComposeOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="localpages-form">
              <input
                type="text"
                placeholder="Listing headline..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
              />

              <div className="localpages-form-row">
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="localpages-select"
                >
                  <option value="Services">Services</option>
                  <option value="Automotive">Automotive</option>
                  <option value="Trade">Trade</option>
                </select>

                <input
                  type="text"
                  placeholder="District (e.g. Rockford Hills)"
                  value={newDistrict}
                  onChange={(e) => setNewDistrict(e.target.value)}
                />
              </div>

              <input
                type="text"
                placeholder="Contact phone (555-XXXX)"
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
              />

              <textarea
                placeholder="Describe your services, pricing, availability..."
                value={newBody}
                onChange={(e) => setNewBody(e.target.value)}
                rows={3}
              />

              <button
                type="button"
                className="localpages-submit-ad-btn"
                onClick={handlePublish}
              >
                PUBLISH CLASSIFIED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Ads Feed */}
      <main className="localpages-main-scroll">
        {filteredPosts.length === 0 ? (
          <div className="localpages-empty">
            <span>📑</span>
            <p>No listings in this category.</p>
          </div>
        ) : (
          <div className="localpages-feed">
            {filteredPosts.map((p) => (
              <article key={p.id} className="localpages-card">
                <div className="localpages-card-header">
                  <span className="localpages-category-badge">{p.category}</span>
                  <span className="localpages-district">📍 {p.district}</span>
                </div>

                <h4 className="localpages-ad-title">{p.title}</h4>
                <p className="localpages-ad-body">{p.body}</p>

                <div className="localpages-card-meta">
                  <span className="localpages-author">👤 {p.author}</span>
                  <small className="localpages-time">
                    {new Date(p.timestamp).toLocaleDateString()}
                  </small>
                </div>

                <div className="localpages-card-actions">
                  <button
                    type="button"
                    className={`localpages-action-btn like ${p.isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(p.id)}
                  >
                    {p.isLiked ? '❤️' : '🤍'} {p.likes}
                  </button>
                  <button
                    type="button"
                    className="localpages-action-btn"
                    onClick={() => onCall?.(p.phone)}
                  >
                    📞 {p.phone}
                  </button>
                  <button
                    type="button"
                    className="localpages-action-btn"
                    onClick={() => handleRouteGps(p)}
                  >
                    📍 GPS
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
