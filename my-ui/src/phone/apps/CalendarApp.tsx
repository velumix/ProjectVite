import { useState, useEffect, useCallback } from 'react'
import {
  CalendarService,
  type CalendarEvent,
} from '../../nerve/preview'

export function CalendarApp() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [selectedDay, setSelectedDay] = useState(8)
  const [modalOpen, setModalOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('Today')
  const [startTime, setStartTime] = useState('14:00')
  const [endTime, setEndTime] = useState('15:00')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('General')
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadEvents = useCallback(async () => {
    const [list] = await CalendarService.GetEvents.request(undefined)
    if (list) setEvents(list)
  }, [])

  useEffect(() => {
    loadEvents()
    const unsubAdded = CalendarService.CalendarEventAdded.connect((item) => {
      setEvents((prev) => [...prev, item])
    })
    const unsubDeleted = CalendarService.CalendarEventDeleted.connect((payload) => {
      setEvents((prev) => prev.filter((e) => e.id !== payload.id))
    })
    return () => {
      unsubAdded()
      unsubDeleted()
    }
  }, [loadEvents])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 2500)
  }

  const handleToggleReminder = async (id: string) => {
    const [ok, _, rem] = await CalendarService.ToggleReminder.request({ id })
    if (ok && rem !== undefined) {
      setEvents((prev) =>
        prev.map((e) => (e.id === id ? { ...e, reminder: rem } : e))
      )
      showToast(rem ? 'Reminder alarm set' : 'Reminder alarm muted')
    }
  }

  const handleDelete = async (id: string) => {
    const [ok] = await CalendarService.DeleteEvent.request({ id })
    if (ok) {
      setEvents((prev) => prev.filter((e) => e.id !== id))
      showToast('Event removed from calendar')
    }
  }

  const handleAddEvent = async () => {
    if (!title.trim()) {
      showToast('Event title is required')
      return
    }
    const [ok, err, item] = await CalendarService.AddEvent.request({
      title: title.trim(),
      date,
      startTime,
      endTime,
      location: location.trim() || 'Los Santos',
      category,
    })
    if (ok && item) {
      showToast('New event scheduled!')
      setModalOpen(false)
      setTitle('')
      setLocation('')
    } else if (err) {
      showToast(err)
    }
  }

  const daysOfWeek = [
    { day: 'Mon', num: 7 },
    { day: 'Tue', num: 8, isToday: true },
    { day: 'Wed', num: 9 },
    { day: 'Thu', num: 10 },
    { day: 'Fri', num: 11 },
    { day: 'Sat', num: 12 },
    { day: 'Sun', num: 13 },
  ]

  return (
    <div className="calendar-app-root">
      {/* Header */}
      <header className="calendar-header">
        <div className="calendar-top-row">
          <div>
            <h3 className="calendar-month-title">SEPTEMBER 2026</h3>
            <small className="calendar-sub">San Andreas Standard Time</small>
          </div>
          <button
            type="button"
            className="calendar-add-btn"
            onClick={() => setModalOpen(true)}
          >
            + Event
          </button>
        </div>

        {/* Weekday Strip */}
        <div className="calendar-week-strip">
          {daysOfWeek.map((d) => (
            <button
              key={d.num}
              type="button"
              className={`calendar-day-cell ${selectedDay === d.num ? 'selected' : ''} ${d.isToday ? 'today' : ''}`}
              onClick={() => setSelectedDay(d.num)}
            >
              <span className="calendar-day-name">{d.day}</span>
              <span className="calendar-day-num">{d.num}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Toast */}
      {toastMessage && (
        <aside className="calendar-toast" role="status">
          <span>📅</span>
          <small>{toastMessage}</small>
        </aside>
      )}

      {/* Add Event Modal */}
      {modalOpen && (
        <div className="calendar-modal-backdrop">
          <div className="calendar-modal-dialog">
            <div className="calendar-modal-header">
              <span>Schedule New Event</span>
              <button
                type="button"
                className="calendar-modal-close"
                onClick={() => setModalOpen(false)}
              >
                ✕
              </button>
            </div>

            <div className="calendar-form">
              <input
                type="text"
                placeholder="Event title (e.g. Heist Planning)..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />

              <div className="calendar-form-row">
                <input
                  type="text"
                  placeholder="Date (Today, Tomorrow...)"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="calendar-select"
                >
                  <option value="General">General</option>
                  <option value="Racing">Racing</option>
                  <option value="Heist">Heist</option>
                  <option value="Court">Court</option>
                  <option value="Social">Social</option>
                </select>
              </div>

              <div className="calendar-form-row">
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>

              <input
                type="text"
                placeholder="Location (e.g. Rockford Hills)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />

              <button
                type="button"
                className="calendar-save-btn"
                onClick={handleAddEvent}
              >
                SAVE EVENT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Feed */}
      <main className="calendar-events-scroll">
        <div className="calendar-agenda-label">
          <span>SCHEDULED AGENDA ({events.length})</span>
        </div>

        {events.length === 0 ? (
          <div className="calendar-empty">No events scheduled for this period.</div>
        ) : (
          events.map((ev) => (
            <article key={ev.id} className="calendar-event-card">
              <div className={`calendar-category-strip ${ev.category.toLowerCase()}`} />
              <div className="calendar-event-content">
                <div className="calendar-event-header">
                  <span className={`calendar-badge ${ev.category.toLowerCase()}`}>
                    {ev.category}
                  </span>
                  <div className="calendar-card-actions">
                    <button
                      type="button"
                      className={`calendar-action-btn reminder ${ev.reminder ? 'on' : ''}`}
                      onClick={() => handleToggleReminder(ev.id)}
                      aria-label="Toggle Reminder"
                    >
                      {ev.reminder ? '🔔' : '🔕'}
                    </button>
                    <button
                      type="button"
                      className="calendar-action-btn delete"
                      onClick={() => handleDelete(ev.id)}
                      aria-label="Delete Event"
                    >
                      🗑️
                    </button>
                  </div>
                </div>

                <h4 className="calendar-event-title">{ev.title}</h4>

                <div className="calendar-event-meta">
                  <div className="calendar-meta-item">
                    <span>🕒</span>
                    <small>{ev.date} • {ev.startTime} - {ev.endTime}</small>
                  </div>
                  <div className="calendar-meta-item">
                    <span>📍</span>
                    <small>{ev.location}</small>
                  </div>
                </div>
              </div>
            </article>
          ))
        )}
      </main>
    </div>
  )
}
