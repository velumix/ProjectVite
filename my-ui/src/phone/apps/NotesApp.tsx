import { useState } from 'react'

type NoteItem = {
  id: string
  title: string
  body: string
  date: string
  pinned: boolean
}

const DEFAULT_NOTES: NoteItem[] = [
  {
    id: '1',
    title: 'Garage Access Codes',
    body: 'Central Bay Garage: 4921\nVinewood Safehouse: 8830\nHelipad Gate: 1104',
    date: 'Sep 7',
    pinned: true,
  },
  {
    id: '2',
    title: 'Meeting with Mercer',
    body: 'Discuss shipping manifests and schedule pickup at Terminal 4 before dusk.',
    date: 'Sep 6',
    pinned: true,
  },
  {
    id: '3',
    title: 'Custom Parts List',
    body: 'Turbo upgrade stage 3, sport ceramic brakes, tinted headlights, matte titanium finish.',
    date: 'Sep 4',
    pinned: false,
  },
]

export function NotesApp() {
  const [notes, setNotes] = useState<NoteItem[]>(DEFAULT_NOTES)
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const activeNote = notes.find((n) => n.id === activeNoteId)

  const handleCreateNote = () => {
    const newNote: NoteItem = {
      id: String(Date.now()),
      title: 'New Note',
      body: '',
      date: 'Today',
      pinned: false,
    }
    setNotes([newNote, ...notes])
    setActiveNoteId(newNote.id)
  }

  const handleUpdateActiveNote = (field: 'title' | 'body', value: string) => {
    if (!activeNoteId) return
    setNotes((prev) =>
      prev.map((note) => (note.id === activeNoteId ? { ...note, [field]: value } : note)),
    )
  }

  const handleTogglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((note) => (note.id === id ? { ...note, pinned: !note.pinned } : note)),
    )
  }

  const handleDeleteNote = (id: string) => {
    setNotes((prev) => prev.filter((note) => note.id !== id))
    if (activeNoteId === id) setActiveNoteId(null)
  }

  const filteredNotes = notes.filter((n) => {
    const q = searchQuery.toLowerCase()
    return n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
  })

  const pinnedNotes = filteredNotes.filter((n) => n.pinned)
  const otherNotes = filteredNotes.filter((n) => !n.pinned)

  if (activeNote) {
    return (
      <div className="notes-app-container notes-editor-view" aria-label="Note editor">
        <div className="notes-editor-toolbar">
          <button
            type="button"
            className="notes-back-btn"
            onClick={() => setActiveNoteId(null)}
          >
            ‹ Notes
          </button>
          <div className="notes-editor-actions">
            <button
              type="button"
              className={`notes-tool-btn ${activeNote.pinned ? 'is-pinned' : ''}`}
              onClick={() => handleTogglePin(activeNote.id)}
              title={activeNote.pinned ? 'Unpin' : 'Pin'}
            >
              📌
            </button>
            <button
              type="button"
              className="notes-tool-btn is-delete"
              onClick={() => handleDeleteNote(activeNote.id)}
              title="Delete Note"
            >
              🗑
            </button>
          </div>
        </div>

        <input
          type="text"
          className="notes-title-input"
          value={activeNote.title}
          placeholder="Title"
          onChange={(e) => handleUpdateActiveNote('title', e.target.value)}
        />
        <div className="notes-editor-meta">{activeNote.date} • {activeNote.body.length} characters</div>
        <textarea
          className="notes-body-input"
          value={activeNote.body}
          placeholder="Start typing your note..."
          onChange={(e) => handleUpdateActiveNote('body', e.target.value)}
        />
      </div>
    )
  }

  return (
    <div className="notes-app-container" aria-label="Notes">
      {/* Header */}
      <div className="notes-header">
        <h2 className="notes-heading">Notes</h2>
        <button
          type="button"
          className="notes-create-btn"
          onClick={handleCreateNote}
          aria-label="Create note"
        >
          ✏️
        </button>
      </div>

      {/* Searchbar */}
      <div className="notes-search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search notes..."
        />
      </div>

      {/* Notes List */}
      <div className="notes-list-scroll">
        {pinnedNotes.length > 0 && (
          <div className="notes-group">
            <span className="notes-group-label">PINNED</span>
            <div className="notes-card-list">
              {pinnedNotes.map((note) => (
                <div
                  key={note.id}
                  className="notes-item-card"
                  onClick={() => setActiveNoteId(note.id)}
                >
                  <div className="notes-item-header">
                    <strong>{note.title || 'Untitled'}</strong>
                    <span className="notes-pin-badge">📌</span>
                  </div>
                  <p className="notes-item-preview">
                    {note.body.split('\n')[0] || 'No additional text'}
                  </p>
                  <small className="notes-item-date">{note.date}</small>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="notes-group">
          {pinnedNotes.length > 0 && otherNotes.length > 0 && (
            <span className="notes-group-label">NOTES</span>
          )}
          <div className="notes-card-list">
            {otherNotes.map((note) => (
              <div
                key={note.id}
                className="notes-item-card"
                onClick={() => setActiveNoteId(note.id)}
              >
                <div className="notes-item-header">
                  <strong>{note.title || 'Untitled'}</strong>
                </div>
                <p className="notes-item-preview">
                  {note.body.split('\n')[0] || 'No additional text'}
                </p>
                <small className="notes-item-date">{note.date}</small>
              </div>
            ))}
            {filteredNotes.length === 0 && (
              <p className="notes-empty-state">No notes found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
