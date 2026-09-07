import { useState, useEffect, useCallback } from 'react'
import {
  PicstagramService,
  type PicStory,
  type PicPost,
  type PicComment,
} from '../../nerve/preview'

export function PicstagramApp() {
  const [stories, setStories] = useState<PicStory[]>([])
  const [posts, setPosts] = useState<PicPost[]>([])
  const [activeCommentsPostId, setActiveCommentsPostId] = useState<string | null>(null)
  const [comments, setComments] = useState<PicComment[]>([])
  const [commentDraft, setCommentDraft] = useState('')
  const [composeOpen, setComposeOpen] = useState(false)
  const [newCaption, setNewCaption] = useState('')
  const [newLocation, setNewLocation] = useState('')
  const [newFilter, setNewFilter] = useState('Normal')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadFeed = useCallback(async () => {
    const [feed] = await PicstagramService.GetFeed.request(undefined)
    if (feed) {
      setStories(feed.stories)
      setPosts(feed.posts)
    }
  }, [])

  useEffect(() => {
    loadFeed()
    const unsubLike = PicstagramService.PostLiked.connect((ev) => {
      setPosts((prev) =>
        prev.map((p) => (p.id === ev.postId ? { ...p, likes: ev.likes, isLiked: ev.isLiked } : p))
      )
    })
    const unsubComment = PicstagramService.PostCommentAdded.connect((comm) => {
      setComments((prev) => [comm, ...prev])
      setPosts((prev) =>
        prev.map((p) => (p.id === comm.postId ? { ...p, commentsCount: p.commentsCount + 1 } : p))
      )
    })
    const unsubCreated = PicstagramService.PostCreated.connect((post) => {
      setPosts((prev) => [post, ...prev])
    })
    return () => {
      unsubLike()
      unsubComment()
      unsubCreated()
    }
  }, [loadFeed])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleLike = async (postId: string) => {
    const [ok, err] = await PicstagramService.LikePost.request({ postId })
    if (!ok && err) showToast(err)
  }

  const openComments = async (postId: string) => {
    setActiveCommentsPostId(postId)
    const [list] = await PicstagramService.GetComments.request({ postId })
    if (list) setComments(list)
  }

  const handleSendComment = async () => {
    if (!activeCommentsPostId || !commentDraft.trim()) return
    const [ok, err] = await PicstagramService.AddComment.request({
      postId: activeCommentsPostId,
      text: commentDraft.trim(),
    })
    if (ok) {
      setCommentDraft('')
    } else if (err) {
      showToast(err)
    }
  }

  const handleCreatePost = async () => {
    if (!newCaption.trim()) {
      showToast('Caption is required')
      return
    }
    const [ok, err] = await PicstagramService.CreatePost.request({
      caption: newCaption.trim(),
      location: newLocation.trim(),
      filterName: newFilter,
    })
    if (ok) {
      showToast('Photo posted to Picstagram feed!')
      setComposeOpen(false)
      setNewCaption('')
      setNewLocation('')
      setNewFilter('Normal')
    } else if (err) {
      showToast(err)
    }
  }

  return (
    <div className="picstagram-app-root">
      {/* Header */}
      <header className="picstagram-header">
        <div className="picstagram-top-row">
          <h3 className="picstagram-brand">Picstagram</h3>
          <button
            type="button"
            className="picstagram-new-btn"
            onClick={() => setComposeOpen(true)}
          >
            + New Post
          </button>
        </div>

        {/* Stories Horizontal Tray */}
        <div className="picstagram-stories-tray">
          {stories.map((s) => (
            <div key={s.id} className="picstagram-story-bubble">
              <div className={`picstagram-story-ring ${s.hasUnread ? 'unread' : ''}`}>
                <div className="picstagram-story-avatar">
                  {s.username.charAt(0).toUpperCase()}
                </div>
              </div>
              <small>{s.username.split('.')[0]}</small>
            </div>
          ))}
        </div>
      </header>

      {/* Toast Alert */}
      {toastMessage && (
        <aside className="picstagram-toast" role="status">
          <span>📷</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Create Post Modal */}
      {composeOpen && (
        <div className="picstagram-modal-backdrop">
          <div className="picstagram-modal-dialog">
            <div className="picstagram-modal-header">
              <span>New Photo Post</span>
              <button
                type="button"
                className="picstagram-modal-close"
                onClick={() => setComposeOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="picstagram-form">
              <input
                type="text"
                placeholder="Add location (e.g. Del Perro Pier)..."
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
              />

              <textarea
                placeholder="Write a caption... #lossantos #vibes"
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                rows={3}
              />

              <div className="picstagram-filter-selector">
                <label>Filter:</label>
                <select
                  value={newFilter}
                  onChange={(e) => setNewFilter(e.target.value)}
                  className="picstagram-select"
                >
                  <option value="Normal">Normal</option>
                  <option value="Valencia">Valencia</option>
                  <option value="Clarendon">Clarendon</option>
                  <option value="Gingham">Gingham</option>
                </select>
              </div>

              <button
                type="button"
                className="picstagram-share-btn"
                onClick={handleCreatePost}
              >
                SHARE TO FEED
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Drawer */}
      {activeCommentsPostId && (
        <div className="picstagram-drawer-backdrop" onClick={() => setActiveCommentsPostId(null)}>
          <div className="picstagram-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="picstagram-drawer-header">
              <span>Comments</span>
              <button
                type="button"
                className="picstagram-modal-close"
                onClick={() => setActiveCommentsPostId(null)}
              >
                ✕
              </button>
            </div>

            <div className="picstagram-comments-list">
              {comments.length === 0 ? (
                <div className="picstagram-no-comments">No comments yet. Start the conversation!</div>
              ) : (
                comments.map((c) => (
                  <div key={c.id} className="picstagram-comment-item">
                    <strong>{c.author}</strong>
                    <p>{c.text}</p>
                    <small>{new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                ))
              )}
            </div>

            <div className="picstagram-comment-input-bar">
              <input
                type="text"
                placeholder="Add a comment for this post..."
                value={commentDraft}
                onChange={(e) => setCommentDraft(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendComment()}
              />
              <button
                type="button"
                className="picstagram-post-comm-btn"
                onClick={handleSendComment}
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Posts Feed Scroll */}
      <main className="picstagram-feed-scroll">
        {posts.map((p) => (
          <article key={p.id} className="picstagram-post-card">
            {/* Post Header */}
            <div className="picstagram-post-header">
              <div className="picstagram-post-author-row">
                <div className="picstagram-author-avatar">{p.author.charAt(0).toUpperCase()}</div>
                <div>
                  <strong>{p.author}</strong>
                  <small>{p.location}</small>
                </div>
              </div>
              <span className="picstagram-filter-badge">{p.filterName}</span>
            </div>

            {/* Photo Canvas Simulation */}
            <div
              className="picstagram-photo-canvas"
              style={{ background: p.gradient }}
            >
              <div className="picstagram-photo-watermark">
                <span>📸 PICSTAGRAM</span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="picstagram-actions-bar">
              <div className="picstagram-left-actions">
                <button
                  type="button"
                  className={`picstagram-action-icon like ${p.isLiked ? 'liked' : ''}`}
                  onClick={() => handleLike(p.id)}
                  aria-label="Like Post"
                >
                  {p.isLiked ? '❤️' : '🤍'}
                </button>
                <button
                  type="button"
                  className="picstagram-action-icon"
                  onClick={() => openComments(p.id)}
                  aria-label="Comments"
                >
                  💬
                </button>
                <button
                  type="button"
                  className="picstagram-action-icon"
                  onClick={() => showToast('Post link copied to clipboard!')}
                  aria-label="Share Post"
                >
                  ↗️
                </button>
              </div>
              <span className="picstagram-likes-count">
                {p.likes.toLocaleString()} likes
              </span>
            </div>

            {/* Caption Block */}
            <div className="picstagram-caption-block">
              <p>
                <strong>{p.author}</strong> {p.caption}
              </p>
              {p.commentsCount > 0 && (
                <button
                  type="button"
                  className="picstagram-view-comments-btn"
                  onClick={() => openComments(p.id)}
                >
                  View all {p.commentsCount} comments
                </button>
              )}
              <small className="picstagram-post-time">
                {new Date(p.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
              </small>
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}
