import { useState, useEffect, useMemo } from 'react'
import type { NervePreviewAdapter } from '../../nerve/contracts.ts'
import {
  type PreviewMediaService,
  type MediaItem,
  type MediaCounts,
  type PhoneContact,
} from '../../nerve/preview.ts'

export type PhotosAppProps = {
  nerve: NervePreviewAdapter
  contacts?: PhoneContact[]
  onShareToMessages?: (contactId: string, text: string) => void
}

type TabType = 'all' | 'photo' | 'video' | 'favorites'

export function PhotosApp({ nerve, contacts = [] }: PhotosAppProps) {
  const mediaService = nerve.GetService<PreviewMediaService>('MediaService')

  const [activeTab, setActiveTab] = useState<TabType>('all')
  const [items, setItems] = useState<MediaItem[]>([])
  const [counts, setCounts] = useState<MediaCounts>({ all: 0, photos: 0, videos: 0, favorites: 0 })
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null)
  const [zoomScale, setZoomScale] = useState<number>(1)

  // Selection mode
  const [isSelectMode, setIsSelectMode] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Share Modal
  const [showShareModal, setShowShareModal] = useState<boolean>(false)
  const [shareSuccessToast, setShareSuccessToast] = useState<string | null>(null)

  // Delete Confirm Dialog
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false)

  const loadMedia = () => {
    const filter = activeTab === 'photo' ? 'photo' : activeTab === 'video' ? 'video' : 'all'
    const favoritesOnly = activeTab === 'favorites'

    void mediaService.GetMediaList.request({ filter, favoritesOnly }).then(([list, meta]) => {
      if (list) setItems(list)
      if (meta) setCounts(meta)
    })
  }

  useEffect(() => {
    loadMedia()
  }, [activeTab])

  // Subscribe to MediaChanged signal
  useEffect(() => {
    const unsub = mediaService.MediaChanged.connect(() => {
      loadMedia()
    })
    return () => unsub()
  }, [activeTab, mediaService])

  const showToast = (msg: string) => {
    setShareSuccessToast(msg)
    setTimeout(() => setShareSuccessToast(null), 2500)
  }

  const handleTileClick = (item: MediaItem) => {
    if (isSelectMode) {
      if (selectedIds.includes(item.id)) {
        setSelectedIds(selectedIds.filter((id) => id !== item.id))
      } else {
        setSelectedIds([...selectedIds, item.id])
      }
      return
    }
    setSelectedItem(item)
    setZoomScale(1)
  }

  const handleToggleFavorite = async () => {
    if (!selectedItem) return
    const [ok, isFav] = await mediaService.ToggleFavorite.request({ id: selectedItem.id })
    if (ok) {
      setSelectedItem({ ...selectedItem, favorite: isFav ?? !selectedItem.favorite })
      loadMedia()
    }
  }

  const handleDeleteCurrent = async () => {
    if (!selectedItem) return
    const [ok] = await mediaService.DeleteMedia.request({ ids: [selectedItem.id] })
    if (ok) {
      setShowDeleteConfirm(false)
      setSelectedItem(null)
      showToast('Photo deleted')
      loadMedia()
    }
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) return
    const [ok] = await mediaService.DeleteMedia.request({ ids: selectedIds })
    if (ok) {
      const count = selectedIds.length
      setSelectedIds([])
      setIsSelectMode(false)
      showToast(`${count} items deleted`)
      loadMedia()
    }
  }

  const handleShareToContact = (contact: PhoneContact) => {
    setShowShareModal(false)
    showToast(`Shared "${selectedItem?.title}" with ${contact.name}`)
  }

  const subtitleText = useMemo(() => {
    if (activeTab === 'favorites') return `${counts.favorites} Favorites`
    if (activeTab === 'photo') return `${counts.photos} Photos`
    if (activeTab === 'video') return `${counts.videos} Videos`
    return `${counts.all} Items`
  }, [activeTab, counts])

  return (
    <div className="photos-app-root">
      {/* Top Navigation Bar */}
      <header className="photos-header">
        <div className="photos-header-info">
          <h1 className="photos-title">Photos</h1>
          <span className="photos-subtitle">{subtitleText}</span>
        </div>
        <div className="photos-header-actions">
          <button
            type="button"
            className={`photos-select-btn ${isSelectMode ? 'active' : ''}`}
            onClick={() => {
              setIsSelectMode(!isSelectMode)
              setSelectedIds([])
            }}
          >
            {isSelectMode ? 'Cancel' : 'Select'}
          </button>
        </div>
      </header>

      {/* Filter Tabs */}
      <div className="photos-filter-tabs">
        <button
          type="button"
          className={`photos-tab-btn ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          All
        </button>
        <button
          type="button"
          className={`photos-tab-btn ${activeTab === 'photo' ? 'active' : ''}`}
          onClick={() => setActiveTab('photo')}
        >
          Photos
        </button>
        <button
          type="button"
          className={`photos-tab-btn ${activeTab === 'video' ? 'active' : ''}`}
          onClick={() => setActiveTab('video')}
        >
          Videos
        </button>
        <button
          type="button"
          className={`photos-tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
      </div>

      {/* Grid Content */}
      <main className="photos-content">
        {items.length === 0 ? (
          <div className="photos-empty-state">
            <div className="photos-empty-icon">
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                <circle cx="9" cy="9" r="2" />
                <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
              </svg>
            </div>
            <strong className="photos-empty-title">No Media Found</strong>
            <p className="photos-empty-desc">
              {activeTab === 'favorites'
                ? 'Heart photos in your album to see them here.'
                : 'Snap pictures or videos with Camera to fill your gallery.'}
            </p>
          </div>
        ) : (
          <div className="photos-grid">
            {items.map((item) => {
              const isSelected = selectedIds.includes(item.id)
              return (
                <button
                  key={item.id}
                  type="button"
                  className={`photos-grid-tile ${isSelected ? 'selected' : ''}`}
                  onClick={() => handleTileClick(item)}
                >
                  <img src={item.url} alt={item.title} className="photos-grid-img" loading="lazy" />

                  {/* Video Play Badge */}
                  {item.mediaType === 'video' && (
                    <div className="photos-video-badge">
                      <span className="photos-play-triangle" />
                    </div>
                  )}

                  {/* Favorite Indicator Badge */}
                  {item.favorite && (
                    <div className="photos-favorite-badge">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
                      </svg>
                    </div>
                  )}

                  {/* Select Mode Checkbox */}
                  {isSelectMode && (
                    <div className={`photos-select-checkbox ${isSelected ? 'checked' : ''}`}>
                      {isSelected ? '✓' : ''}
                    </div>
                  )}
                </button>
              )
            })}
          </div>
        )}
      </main>

      {/* Multi-Selection Toolbar */}
      {isSelectMode && (
        <footer className="photos-selection-toolbar">
          <span className="photos-selection-count">
            {selectedIds.length} Selected
          </span>
          <div className="photos-selection-actions">
            <button
              type="button"
              className="photos-toolbar-btn photos-toolbar-btn--danger"
              disabled={selectedIds.length === 0}
              onClick={handleDeleteSelected}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
              <span>Delete</span>
            </button>
          </div>
        </footer>
      )}

      {/* Fullscreen Photo Detail Modal */}
      {selectedItem && (
        <div className="photos-detail-overlay">
          <header className="photos-detail-header">
            <button
              type="button"
              className="photos-detail-back-btn"
              onClick={() => setSelectedItem(null)}
              title="Back"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>

            <div className="photos-detail-meta">
              <span className="photos-detail-title">{selectedItem.title}</span>
              <span className="photos-detail-date">
                {new Date(selectedItem.createdAt).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                • {selectedItem.location ?? 'Sun City'}
              </span>
            </div>

            <div className="photos-detail-zoom-actions">
              <button
                type="button"
                className="photos-detail-header-btn"
                onClick={() => setZoomScale((z) => (z >= 3 ? 1 : z + 1))}
                title="Zoom"
              >
                {zoomScale}x
              </button>
            </div>
          </header>

          {/* Media Stage */}
          <div className="photos-detail-stage">
            <img
              src={selectedItem.url}
              alt={selectedItem.title}
              className="photos-detail-img"
              style={{ transform: `scale(${zoomScale})` }}
              onDoubleClick={() => setZoomScale((z) => (z > 1 ? 1 : 2))}
            />

            {selectedItem.mediaType === 'video' && (
              <div className="photos-detail-video-overlay">
                <span className="photos-detail-video-chip">▶ VIDEO PREVIEW</span>
              </div>
            )}
          </div>

          {/* Bottom Toolbar */}
          <footer className="photos-detail-toolbar">
            <button
              type="button"
              className="photos-detail-tool-btn"
              onClick={() => setShowShareModal(true)}
              title="Share"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8m-4-6-4-4-4 4m4-4v13" />
              </svg>
            </button>

            <button
              type="button"
              className={`photos-detail-tool-btn ${selectedItem.favorite ? 'favorited' : ''}`}
              onClick={handleToggleFavorite}
              title={selectedItem.favorite ? 'Remove Favorite' : 'Favorite'}
            >
              <svg width="21" height="21" viewBox="0 0 24 24" fill={selectedItem.favorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
              </svg>
            </button>

            <button
              type="button"
              className="photos-detail-tool-btn photos-detail-tool-btn--danger"
              onClick={() => setShowDeleteConfirm(true)}
              title="Delete"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18m-2 0v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6m3 0V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
              </svg>
            </button>
          </footer>
        </div>
      )}

      {/* Share Modal Dialog */}
      {showShareModal && (
        <div className="photos-modal-overlay" onClick={() => setShowShareModal(false)}>
          <div className="photos-modal-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="photos-modal-title">Share Photo</h3>
            <p className="photos-modal-desc">Select a contact to send "{selectedItem?.title}" via Sun City Messages:</p>

            <div className="photos-share-contacts-list">
              {contacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className="photos-share-contact-item"
                  onClick={() => handleShareToContact(c)}
                >
                  <div className="photos-share-contact-avatar">
                    {c.name.charAt(0)}
                  </div>
                  <div className="photos-share-contact-text">
                    <span className="photos-share-contact-name">{c.name}</span>
                    <span className="photos-share-contact-number">{c.number}</span>
                  </div>
                </button>
              ))}
            </div>

            <button
              type="button"
              className="photos-modal-cancel-btn"
              onClick={() => setShowShareModal(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Delete Single Photo Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="photos-modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="photos-modal-card photos-modal-card--danger" onClick={(e) => e.stopPropagation()}>
            <h3 className="photos-modal-title">Delete Photo?</h3>
            <p className="photos-modal-desc">This item will be permanently removed from your phone storage.</p>
            <div className="photos-modal-btn-row">
              <button
                type="button"
                className="photos-modal-btn photos-modal-btn--secondary"
                onClick={() => setShowDeleteConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="photos-modal-btn photos-modal-btn--danger"
                onClick={handleDeleteCurrent}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Toast */}
      {shareSuccessToast && (
        <div className="photos-toast-pill" role="status">
          {shareSuccessToast}
        </div>
      )}
    </div>
  )
}
