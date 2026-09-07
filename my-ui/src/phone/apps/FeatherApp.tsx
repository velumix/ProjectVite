import { useState, useEffect, useCallback, useMemo } from 'react'
import { SocialService, type SocialPost } from '../../nerve/preview'

const QUICK_TAGS = ['SunCity', 'Nightlife', 'CarCulture', 'Bennys', 'DiamondCasino', 'PublicSafety']

export function FeatherApp() {
  const [feed, setFeed] = useState<SocialPost[]>([])
  const [activeTag, setActiveTag] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isComposing, setIsComposing] = useState(false)
  const [newPostContent, setNewPostContent] = useState('')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const refreshFeed = useCallback(async () => {
    const [posts] = await SocialService.GetFeed.request({
      tag: activeTag === 'all' ? undefined : activeTag,
      query: searchQuery.trim() || undefined,
    })
    if (posts) setFeed(posts)
  }, [activeTag, searchQuery])

  useEffect(() => {
    refreshFeed()
    const unsubCreated = SocialService.PostCreated.connect((post) => {
      setFeed((prev) => [post, ...prev])
    })
    const unsubUpdated = SocialService.PostUpdated.connect((post) => {
      setFeed((prev) => prev.map((p) => (p.id === post.id ? post : p)))
    })
    return () => {
      unsubCreated()
      unsubUpdated()
    }
  }, [refreshFeed])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleToggleLike = async (post: SocialPost) => {
    const [ok, liked] = await SocialService.ToggleLike.request({ postId: post.id })
    if (ok) {
      showToast(liked ? 'Liked post ❤️' : 'Unliked post')
    }
  }

  const handleToggleRetweet = async (post: SocialPost) => {
    const [ok, retweeted] = await SocialService.ToggleRetweet.request({ postId: post.id })
    if (ok) {
      showToast(retweeted ? 'Retweeted 🔁' : 'Undid retweet')
    }
  }

  const handleDeletePost = async (post: SocialPost) => {
    const [ok] = await SocialService.DeletePost.request({ postId: post.id })
    if (ok) {
      setFeed((prev) => prev.filter((p) => p.id !== post.id))
      showToast('Post deleted')
    }
  }

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) return
    const [ok, post, err] = await SocialService.CreatePost.request({
      content: newPostContent.trim(),
    })
    if (ok && post) {
      setNewPostContent('')
      setIsComposing(false)
      showToast('Chirped to Feather! 🪶')
    } else if (err) {
      showToast(err)
    }
  }

  const appendTag = (tag: string) => {
    if (!newPostContent.includes(`#${tag}`)) {
      setNewPostContent((prev) => (prev ? `${prev.trim()} #${tag}` : `#${tag}`))
    }
  }

  const formatTimestamp = (ts: number) => {
    const diff = Math.floor((Date.now() - ts) / 1000)
    if (diff < 60) return 'just now'
    if (diff < 3600) return `${Math.floor(diff / 60)}m`
    if (diff < 86400) return `${Math.floor(diff / 3600)}h`
    return `${Math.floor(diff / 86400)}d`
  }

  const charactersRemaining = 280 - newPostContent.length

  const filteredFeed = useMemo(() => {
    return feed.filter((p) => {
      const matchTag =
        activeTag === 'all' || p.hashtags.some((t) => t.toLowerCase() === activeTag.toLowerCase())
      const matchQuery =
        !searchQuery.trim() ||
        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.author.handle.toLowerCase().includes(searchQuery.toLowerCase())
      return matchTag && matchQuery
    })
  }, [feed, activeTag, searchQuery])

  return (
    <div className="feather-app-root">
      {/* Top Header */}
      <header className="feather-header">
        <div className="feather-title-row">
          <div className="feather-brand">
            <span className="feather-logo-icon">🪶</span>
            <h3>Feather</h3>
          </div>
          <button
            type="button"
            className="feather-compose-btn"
            title="Compose Feather"
            onClick={() => setIsComposing(true)}
          >
            + Chirp
          </button>
        </div>

        {/* Search */}
        <div className="feather-search-bar">
          <span className="feather-search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search Feather or @handles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="feather-clear-search"
              onClick={() => setSearchQuery('')}
            >
              ✕
            </button>
          )}
        </div>

        {/* Hashtags Ribbon */}
        <div className="feather-tag-ribbon">
          <button
            type="button"
            className={`feather-tag-pill ${activeTag === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTag('all')}
          >
            #All
          </button>
          {QUICK_TAGS.map((tag) => (
            <button
              key={tag}
              type="button"
              className={`feather-tag-pill ${activeTag === tag.toLowerCase() ? 'active' : ''}`}
              onClick={() => setActiveTag(tag.toLowerCase())}
            >
              #{tag}
            </button>
          ))}
        </div>
      </header>

      {/* Floating Toast Notice */}
      {toastMessage && (
        <aside className="feather-toast" role="status">
          <span>🪶</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Timeline Feed */}
      <main className="feather-feed">
        {filteredFeed.length === 0 ? (
          <div className="feather-empty">
            <p>No chirps found in this feed.</p>
          </div>
        ) : (
          filteredFeed.map((post) => {
            const isOwn = post.author.id === 'user-self'
            return (
              <article key={post.id} className="feather-post-card">
                <div className="feather-post-avatar">{post.author.avatar}</div>

                <div className="feather-post-content-col">
                  <header className="feather-author-header">
                    <span className="feather-author-name">{post.author.name}</span>
                    {post.author.verified && (
                      <span className="feather-verified-badge" title="Verified Account">
                        ✓
                      </span>
                    )}
                    <span className="feather-author-handle">@{post.author.handle}</span>
                    <span className="feather-dot-sep">·</span>
                    <time className="feather-timestamp">{formatTimestamp(post.timestamp)}</time>
                  </header>

                  <p className="feather-text">
                    {post.content.split(' ').map((word, idx) => {
                      if (word.startsWith('#')) {
                        return (
                          <span
                            key={idx}
                            className="feather-hashtag"
                            onClick={() => setActiveTag(word.slice(1).toLowerCase())}
                          >
                            {word}{' '}
                          </span>
                        )
                      }
                      if (word.startsWith('@')) {
                        return (
                          <span key={idx} className="feather-mention">
                            {word}{' '}
                          </span>
                        )
                      }
                      return word + ' '
                    })}
                  </p>

                  <footer className="feather-actions-row">
                    <button
                      type="button"
                      className="feather-action-btn"
                      title="Reply"
                      onClick={() => showToast('Replies coming soon!')}
                    >
                      <span className="feather-action-icon">💬</span>
                      <small>{post.replies}</small>
                    </button>

                    <button
                      type="button"
                      className={`feather-action-btn ${post.retweeted ? 'is-retweeted' : ''}`}
                      title={post.retweeted ? 'Undo Retweet' : 'Retweet'}
                      onClick={() => handleToggleRetweet(post)}
                    >
                      <span className="feather-action-icon">🔁</span>
                      <small>{post.retweets}</small>
                    </button>

                    <button
                      type="button"
                      className={`feather-action-btn ${post.liked ? 'is-liked' : ''}`}
                      title={post.liked ? 'Unlike' : 'Like'}
                      onClick={() => handleToggleLike(post)}
                    >
                      <span className="feather-action-icon">{post.liked ? '❤️' : '🤍'}</span>
                      <small>{post.likes}</small>
                    </button>

                    {isOwn && (
                      <button
                        type="button"
                        className="feather-action-btn feather-delete-btn"
                        title="Delete Chirp"
                        onClick={() => handleDeletePost(post)}
                      >
                        <span className="feather-action-icon">🗑️</span>
                      </button>
                    )}
                  </footer>
                </div>
              </article>
            )
          })
        )}
      </main>

      {/* Compose Modal */}
      {isComposing && (
        <section className="feather-compose-modal" aria-label="Compose Chirp">
          <header className="feather-compose-header">
            <h4>New Chirp</h4>
            <button
              type="button"
              className="feather-compose-close"
              title="Close Compose"
              onClick={() => setIsComposing(false)}
            >
              ✕
            </button>
          </header>

          <div className="feather-compose-body">
            <textarea
              className="feather-textarea"
              placeholder="What's happening in Sun City?"
              maxLength={280}
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              autoFocus
            />

            <div className="feather-compose-tags-row">
              <span className="feather-compose-tags-label">Add Tag:</span>
              <div className="feather-quick-chips">
                {QUICK_TAGS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    className="feather-quick-chip"
                    onClick={() => appendTag(t)}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>

            <footer className="feather-compose-footer">
              <span
                className={`feather-char-count ${charactersRemaining < 20 ? 'is-danger' : ''}`}
              >
                {charactersRemaining}
              </span>
              <button
                type="button"
                className="feather-submit-btn"
                disabled={!newPostContent.trim() || charactersRemaining < 0}
                onClick={handleCreatePost}
              >
                Chirp 🪶
              </button>
            </footer>
          </div>
        </section>
      )}
    </div>
  )
}
