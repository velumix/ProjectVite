import { useState, useEffect, useCallback } from 'react'
import {
  CityMarktService,
  type MarketplaceListing,
} from '../../nerve/preview'

export function CityMarktApp() {
  const [listings, setListings] = useState<MarketplaceListing[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [postModalOpen, setPostModalOpen] = useState(false)
  const [postTitle, setPostTitle] = useState('')
  const [postPrice, setPostPrice] = useState('')
  const [postCategory, setPostCategory] = useState('vehicles')
  const [postDescription, setPostDescription] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadListings = useCallback(async () => {
    const [list] = await CityMarktService.GetListings.request(undefined)
    if (list) setListings(list)
  }, [])

  useEffect(() => {
    loadListings()
    const unsubPosted = CityMarktService.ListingPosted.connect((item) => {
      setListings((prev) => [item, ...prev])
    })
    const unsubLiked = CityMarktService.ListingLiked.connect((ev) => {
      setListings((prev) =>
        prev.map((l) => (l.id === ev.id ? { ...l, likes: ev.likes } : l))
      )
    })
    return () => {
      unsubPosted()
      unsubLiked()
    }
  }, [loadListings])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleLike = async (id: string) => {
    const [ok, _, likes] = await CityMarktService.LikeListing.request({ id })
    if (ok && likes !== undefined) {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, likes } : l))
      )
    }
  }

  const handlePost = async () => {
    if (!postTitle.trim()) {
      showToast('Title is required')
      return
    }
    const priceNum = parseFloat(postPrice) || 0
    const [ok, err, item] = await CityMarktService.PostListing.request({
      title: postTitle.trim(),
      price: priceNum,
      category: postCategory,
      description: postDescription.trim(),
    })
    if (ok && item) {
      showToast('Listing published to CityMarkt!')
      setPostModalOpen(false)
      setPostTitle('')
      setPostPrice('')
      setPostDescription('')
    } else if (err) {
      showToast(err)
    }
  }

  const filteredListings = listings.filter((l) => {
    const matchCat = activeCategory === 'all' || l.category.toLowerCase() === activeCategory
    const matchQuery =
      searchQuery === '' ||
      l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      l.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchCat && matchQuery
  })

  return (
    <div className="citymarkt-app-root">
      {/* Header */}
      <header className="citymarkt-header">
        <div className="citymarkt-top-row">
          <div className="citymarkt-brand">
            <span className="citymarkt-icon">🏷️</span>
            <h3>CityMarkt</h3>
          </div>
          <button
            type="button"
            className="citymarkt-post-btn"
            onClick={() => setPostModalOpen(true)}
          >
            + Post
          </button>
        </div>

        {/* Search */}
        <div className="citymarkt-search-row">
          <input
            type="text"
            placeholder="Search listings (e.g. Granger, Loft)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Category Pills */}
        <div className="citymarkt-cat-pills">
          {['all', 'vehicles', 'electronics', 'properties'].map((cat) => (
            <button
              key={cat}
              type="button"
              className={`citymarkt-cat-pill ${activeCategory === cat ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="citymarkt-toast" role="status">
          <span>🛍️</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Post Modal */}
      {postModalOpen && (
        <div className="citymarkt-modal-backdrop">
          <div className="citymarkt-modal-dialog">
            <div className="citymarkt-modal-header">
              <span>Create Marketplace Listing</span>
              <button
                type="button"
                className="citymarkt-modal-close"
                onClick={() => setPostModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="citymarkt-form">
              <input
                type="text"
                placeholder="Listing title (e.g. Benefactor Schafter)..."
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
              />
              <div className="citymarkt-form-row">
                <input
                  type="number"
                  placeholder="Price ($)..."
                  value={postPrice}
                  onChange={(e) => setPostPrice(e.target.value)}
                />
                <select
                  value={postCategory}
                  onChange={(e) => setPostCategory(e.target.value)}
                  className="citymarkt-select"
                >
                  <option value="vehicles">Vehicles</option>
                  <option value="electronics">Electronics</option>
                  <option value="properties">Properties</option>
                  <option value="services">Services</option>
                </select>
              </div>
              <textarea
                placeholder="Item description, modifications, condition..."
                value={postDescription}
                onChange={(e) => setPostDescription(e.target.value)}
                rows={3}
              />
              <button
                type="button"
                className="citymarkt-publish-btn"
                onClick={handlePost}
              >
                PUBLISH LISTING
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Listings Scroll Feed */}
      <main className="citymarkt-main-scroll">
        {filteredListings.length === 0 ? (
          <div className="citymarkt-empty">No listings match your search criteria.</div>
        ) : (
          filteredListings.map((l) => (
            <article key={l.id} className="citymarkt-card">
              <div className="citymarkt-card-top">
                <span className={`citymarkt-badge ${l.category.toLowerCase()}`}>
                  {l.category.toUpperCase()}
                </span>
                <span className="citymarkt-price">${l.price.toLocaleString()}</span>
              </div>

              <h4 className="citymarkt-item-title">{l.title}</h4>
              <p className="citymarkt-desc">{l.description}</p>

              <div className="citymarkt-seller-meta">
                <small className="citymarkt-seller-name">
                  👤 {l.sellerName} ({l.sellerPhone})
                </small>
                <small className="citymarkt-date">{l.date}</small>
              </div>

              <div className="citymarkt-card-bottom">
                <button
                  type="button"
                  className="citymarkt-like-btn"
                  onClick={() => handleLike(l.id)}
                  aria-label="Like Listing"
                >
                  ❤️ <span>{l.likes}</span>
                </button>
                <button
                  type="button"
                  className="citymarkt-contact-btn"
                  onClick={() => showToast(`Dialing seller ${l.sellerPhone}...`)}
                >
                  CONTACT SELLER
                </button>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  )
}
