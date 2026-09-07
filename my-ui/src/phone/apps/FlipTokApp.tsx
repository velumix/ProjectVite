import { useState, useEffect, useCallback } from 'react'
import {
  FlipTokService,
  type FlipTokReel,
  type ReelComment,
} from '../../nerve/preview'

export function FlipTokApp() {
  const [reels, setReels] = useState<FlipTokReel[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [commentsOpen, setCommentsOpen] = useState(false)
  const [comments, setComments] = useState<ReelComment[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [uploadOpen, setUploadOpen] = useState(false)
  const [uploadCaption, setUploadCaption] = useState('')
  const [uploadMusic, setUploadMusic] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadFeed = useCallback(async () => {
    const [list] = await FlipTokService.GetFeed.request(undefined)
    if (list) setReels(list)
  }, [])

  useEffect(() => {
    loadFeed()
    const unsubLike = FlipTokService.VideoLiked.connect((ev) => {
      setReels((prev) =>
        prev.map((r) => (r.id === ev.reelId ? { ...r, likes: ev.likes, isLiked: ev.isLiked } : r))
      )
    })
    const unsubComm = FlipTokService.NewCommentAdded.connect((comm) => {
      setComments((prev) => [comm, ...prev])
      setReels((prev) =>
        prev.map((r) => (r.id === comm.reelId ? { ...r, commentsCount: r.commentsCount + 1 } : r))
      )
    })
    const unsubUpload = FlipTokService.ReelUploaded.connect((reel) => {
      setReels((prev) => [reel, ...prev])
      setCurrentIndex(0)
    })
    return () => {
      unsubLike()
      unsubComm()
      unsubUpload()
    }
  }, [loadFeed])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const currentReel = reels[currentIndex]

  const handleLike = async () => {
    if (!currentReel) return
    const [ok, err] = await FlipTokService.LikeVideo.request({ reelId: currentReel.id })
    if (!ok && err) showToast(err)
  }

  const openComments = async () => {
    if (!currentReel) return
    setCommentsOpen(true)
    const [list] = await FlipTokService.GetComments.request({ reelId: currentReel.id })
    if (list) setComments(list)
  }

  const handleSendComment = async () => {
    if (!currentReel || !commentDraft.trim()) return
    const [ok, err] = await FlipTokService.AddComment.request({
      reelId: currentReel.id,
      text: commentDraft.trim(),
    })
    if (ok) {
      setCommentDraft('')
    } else if (err) {
      showToast(err)
    }
  }

  const handleUpload = async () => {
    if (!uploadCaption.trim()) {
      showToast('Caption is required')
      return
    }
    const [ok, err] = await FlipTokService.UploadReel.request({
      caption: uploadCaption.trim(),
      musicTrack: uploadMusic.trim(),
    })
    if (ok) {
      showToast('Reel uploaded to FlipTok!')
      setUploadOpen(false)
      setUploadCaption('')
      setUploadMusic('')
    } else if (err) {
      showToast(err)
    }
  }

  const handleNextReel = () => {
    if (currentIndex < reels.length - 1) {
      setCurrentIndex((prev) => prev + 1)
      setCommentsOpen(false)
    } else {
      setCurrentIndex(0)
      setCommentsOpen(false)
    }
  }

  if (!currentReel) return <div className="fliptok-loading">Loading FlipTok...</div>

  return (
    <div className="fliptok-app-root">
      {/* Top Bar */}
      <header className="fliptok-header-overlay">
        <div className="fliptok-tabs">
          <span className="active">For You</span>
        </div>
        <button
          type="button"
          className="fliptok-upload-btn"
          onClick={() => setUploadOpen(true)}
        >
          + Upload
        </button>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="fliptok-toast" role="status">
          <span>🎵</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Main Reel Viewport */}
      <div
        className="fliptok-viewport"
        style={{ background: currentReel.accentGradient }}
      >
        <div className="fliptok-animated-wave" />

        {/* Bottom Content Info */}
        <div className="fliptok-bottom-info">
          <strong className="fliptok-creator">{currentReel.creator}</strong>
          <p className="fliptok-caption">{currentReel.caption}</p>
          <div className="fliptok-audio-marquee">
            <span>🎵</span>
            <small>{currentReel.musicTrack}</small>
          </div>
        </div>

        {/* Right Sidebar Actions */}
        <aside className="fliptok-side-actions">
          <button
            type="button"
            className={`fliptok-action-pill like ${currentReel.isLiked ? 'liked' : ''}`}
            onClick={handleLike}
            aria-label="Like"
          >
            <span>{currentReel.isLiked ? '❤️' : '🤍'}</span>
            <small>{currentReel.likes.toLocaleString()}</small>
          </button>

          <button
            type="button"
            className="fliptok-action-pill"
            onClick={openComments}
            aria-label="Comments"
          >
            <span>💬</span>
            <small>{currentReel.commentsCount}</small>
          </button>

          <button
            type="button"
            className="fliptok-action-pill"
            onClick={() => showToast('Link copied to clipboard!')}
            aria-label="Share"
          >
            <span>↗️</span>
            <small>{currentReel.shares}</small>
          </button>

          <button
            type="button"
            className="fliptok-action-pill next"
            onClick={handleNextReel}
            aria-label="Next Reel"
          >
            <span>⬇️</span>
            <small>Next</small>
          </button>
        </aside>
      </div>

      {/* Comments Drawer */}
      {commentsOpen && (
        <div className="fliptok-drawer-backdrop" onClick={() => setCommentsOpen(false)}>
          <div className="fliptok-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="fliptok-drawer-header">
              <span>{currentReel.commentsCount} Comments</span>
              <button
                type="button"
                className="fliptok-drawer-close"
                onClick={() => setCommentsOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="fliptok-comments-list">
              {comments.length === 0 ? (
                <div className="fliptok-no-comments">No comments yet. Be the first!</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="fliptok-comment-item">
                    <strong className="fliptok-comment-author">{c.author}</strong>
                    <p className="fliptok-comment-text">{c.text}</p>
                    <small className="fliptok-comment-time">
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </small>
                  </div>
                ))
              )}
            </div>

            <div className="fliptok-comment-input-bar">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              />
              <button
                type="button"
                className="fliptok-comment-send"
                onClick={handleSendComment}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {uploadOpen && (
        <div className="fliptok-modal-backdrop">
          <div className="fliptok-modal-dialog">
            <div className="fliptok-drawer-header">
              <span>Post New FlipTok Reel</span>
              <button
                type="button"
                className="fliptok-drawer-close"
                onClick={() => setUploadOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="fliptok-upload-form">
              <textarea
                placeholder="Describe your video, add hashtags (#drift #rp)..."
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                rows={3}
              />
              <input
                type="text"
                placeholder="Sound track name..."
                value={uploadMusic}
                onChange={(e) => setUploadMusic(e.target.value)}
              />
              <button
                type="button"
                className="fliptok-post-submit"
                onClick={handleUpload}
              >
                POST TO FOR YOU
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
