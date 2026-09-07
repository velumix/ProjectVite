import { useCallback, useEffect, useMemo, useState } from 'react'
import type { NervePreviewAdapter } from '../nerve/contracts.ts'
import { type PhoneContact, type PhoneMessage, type PhoneSettings, type PhoneState, type PreviewPhoneService } from '../nerve/preview.ts'
import './phone.css'

type PhoneApp = 'home' | 'messages' | 'contacts' | 'phone' | 'settings' | 'camera' | 'map' | 'banking' | 'radio' | 'gallery' | 'mail' | 'calendar' | 'music'

type PhoneAppDefinition = { id: PhoneApp; label: string; glyph: string }

const apps: PhoneAppDefinition[] = [
  { id: 'phone', label: 'Phone', glyph: '☎' },
  { id: 'messages', label: 'Messages', glyph: '✉' },
  { id: 'contacts', label: 'Contacts', glyph: '◎' },
  { id: 'settings', label: 'Settings', glyph: '⚙' },
  { id: 'camera', label: 'Camera', glyph: '◉' },
  { id: 'map', label: 'Map', glyph: '⌖' },
  { id: 'banking', label: 'Banking', glyph: '$' },
  { id: 'radio', label: 'Radio', glyph: '◌' },
  { id: 'gallery', label: 'Gallery', glyph: '▧' },
  { id: 'mail', label: 'Mail', glyph: '@' },
  { id: 'calendar', label: 'Calendar', glyph: '□' },
  { id: 'music', label: 'Music', glyph: '♫' },
]

const fallbackState: PhoneState = {
  phoneNumber: '', battery: 0, contacts: [], conversations: [],
  settings: { airplaneMode: false, wifiEnabled: true, bluetoothEnabled: true, darkMode: true, ringtone: 'Aurora' },
}

type Props = { nerve: NervePreviewAdapter }

export function PhoneScreen({ nerve }: Props) {
  const service = nerve.GetService<PreviewPhoneService>('PhoneService')
  const [state, setState] = useState<PhoneState>(fallbackState)
  const [activeApp, setActiveApp] = useState<PhoneApp>('messages')
  const [activeContactId, setActiveContactId] = useState('alex')
  const [messages, setMessages] = useState<PhoneMessage[]>([])
  const [draft, setDraft] = useState('')
  const [dialNumber, setDialNumber] = useState('')
  const [callState, setCallState] = useState<{ status: string; number: string } | null>(null)
  const [notice, setNotice] = useState('')

  const activeContact = useMemo(() => state.contacts.find((contact) => contact.id === activeContactId) ?? state.contacts[0], [activeContactId, state.contacts])

  const refresh = useCallback(() => {
    void service.GetPhoneState.request(undefined).then(([next]) => setState(next)).catch(() => setNotice('Unable to load phone data.'))
  }, [service])

  useEffect(() => {
    refresh()
    const messageConnection = service.MessageReceived.connect((number) => {
      if (activeContact?.number === number) void service.GetMessages.request(number).then(([next]) => setMessages(next))
      refresh()
    })
    const callConnection = service.CallStateChanged.connect((status, number) => setCallState(status === 'ended' ? null : { status, number }))
    const settingsConnection = service.PhoneSettingsChanged.connect((settings) => setState((current) => ({ ...current, settings })))
    return () => { messageConnection(); callConnection(); settingsConnection() }
  }, [activeContact?.number, refresh, service])

  useEffect(() => {
    if (!activeContact) return
    void service.GetMessages.request(activeContact.number).then(([next]) => setMessages(next))
  }, [activeContact, service])

  const launch = (app: PhoneApp) => {
    setNotice('')
    setActiveApp(app)
  }

  const selectContact = (contact: PhoneContact) => {
    setActiveContactId(contact.id)
    launch('messages')
  }

  const sendMessage = () => {
    if (!activeContact || !draft.trim()) return
    void service.SendMessage.request({ number: activeContact.number, body: draft }).then(([success, error]) => {
      if (!success) { setNotice(error ?? 'Message failed.'); return }
      setDraft('')
      void service.GetMessages.request(activeContact.number).then(([next]) => setMessages(next))
    })
  }

  const startCall = (number = dialNumber || activeContact?.number) => {
    if (!number) return
    void service.StartCall.request(number).then(([success, error]) => { if (!success) setNotice(error ?? 'Call failed.') })
  }

  const endCall = () => { void service.EndCall.request(undefined).then(([success, error]) => { if (!success) setNotice(error ?? 'No active call.') }) }

  const updatePhoneSetting = (key: keyof PhoneSettings, value: boolean | string) => {
    const settings = { ...state.settings, [key]: value }
    setState((current) => ({ ...current, settings }))
    void service.SavePhoneSettings.request(settings).then(([success, error]) => { if (!success) setNotice(error ?? 'Settings failed to save.') })
  }

  return <div className="phone-device" data-roblox-name="PhoneDevice" data-roblox-class="ScreenGui">
    <div className="phone-statusbar"><span>{state.settings.airplaneMode ? 'AIRPLANE MODE' : 'SUN CITY'}</span><span>{state.phoneNumber || 'CONNECTING'} · {state.battery}% ▰</span></div>
    <div className="phone-screen">
      {activeApp === 'home' ? <Home apps={apps} onLaunch={launch} /> : <>
        <div className="phone-appbar"><button type="button" onClick={() => launch('home')} aria-label="Home">⌂</button><strong>{apps.find((app) => app.id === activeApp)?.label ?? activeApp}</strong><span>{state.settings.wifiEnabled ? '◉' : '○'}</span></div>
        {activeApp === 'messages' && <Messages state={state} activeContact={activeContact} messages={messages} draft={draft} setDraft={setDraft} onSelect={(contact) => { setActiveContactId(contact.id); void service.GetMessages.request(contact.number).then(([next]) => setMessages(next)) }} onSend={sendMessage} onCall={() => startCall(activeContact?.number)} />}
        {activeApp === 'contacts' && <Contacts contacts={state.contacts} onSelect={selectContact} onCall={startCall} />}
        {activeApp === 'phone' && <Dialer value={dialNumber} setValue={setDialNumber} onCall={() => startCall()} callState={callState} onEnd={endCall} />}
        {activeApp === 'settings' && <PhoneSettings settings={state.settings} onChange={updatePhoneSetting} />}
        {(['camera', 'map', 'banking', 'radio', 'gallery', 'mail', 'calendar', 'music'] as PhoneApp[]).includes(activeApp) && <SimpleApp app={activeApp} />}
      </>}
      {notice && <button className="phone-notice" type="button" onClick={() => setNotice('')}>{notice}</button>}
    </div>
    <nav className="phone-dock" aria-label="Phone navigation"><button type="button" onClick={() => launch('phone')}>☎<small>Phone</small></button><button type="button" onClick={() => launch('messages')}>✉<small>Messages</small></button><button type="button" onClick={() => launch('contacts')}>◎<small>Contacts</small></button><button type="button" onClick={() => launch('settings')}>⚙<small>Settings</small></button></nav>
  </div>
}

function Home({ apps, onLaunch }: { apps: PhoneAppDefinition[]; onLaunch: (app: PhoneApp) => void }) {
  return <div className="phone-home"><div className="phone-wallpaper"><span>12:24</span><small>Sunday, September 6</small></div><div className="phone-app-grid">{apps.map((app) => <button type="button" key={app.id} onClick={() => onLaunch(app.id)}><i className={`phone-app-icon phone-app-${app.id}`}>{app.glyph}</i><span>{app.label}</span></button>)}</div></div>
}

function Messages({ state, activeContact, messages, draft, setDraft, onSelect, onSend, onCall }: { state: PhoneState; activeContact?: PhoneContact; messages: PhoneMessage[]; draft: string; setDraft: (value: string) => void; onSelect: (contact: PhoneContact) => void; onSend: () => void; onCall: () => void }) {
  return <div className="phone-messages"><aside className="phone-conversations city-message-list">{state.conversations.map((conversation) => { const contact = state.contacts.find((entry) => entry.id === conversation.contactId); if (!contact) return null; return <button type="button" key={contact.id} className={activeContact?.id === contact.id ? 'is-active' : ''} onClick={() => onSelect(contact)}><i>{contact.name[0]}</i><span><strong>{contact.name}</strong><small>{conversation.lastMessage}</small></span><time>{conversation.time}</time>{conversation.unread > 0 && <b>{conversation.unread}</b>}</button> })}</aside><section className="phone-thread city-conversation"><header><div><h2>{activeContact?.name ?? 'Select a contact'}</h2><small>{activeContact?.number}</small></div><button type="button" onClick={onCall} disabled={!activeContact}>☎</button></header><div className="phone-bubbles">{messages.map((message) => <p key={message.id} className={message.fromPlayer ? 'from-player' : ''}>{message.body}<time>{message.time}</time></p>)}</div><form onSubmit={(event) => { event.preventDefault(); onSend() }}><input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Message" aria-label="Message" /><button type="submit" disabled={!draft.trim() || !activeContact}>↑</button></form></section></div>
}

function Contacts({ contacts, onSelect, onCall }: { contacts: PhoneContact[]; onSelect: (contact: PhoneContact) => void; onCall: (number: string) => void }) {
  return <div className="phone-list-view"><p className="phone-kicker">CONTACTS</p>{contacts.map((contact) => <article className="phone-contact-row" key={contact.id}><i>{contact.name.split(' ').map((part) => part[0]).join('')}</i><div><strong>{contact.name}</strong><small>{contact.number}</small></div><button type="button" onClick={() => onCall(contact.number)}>☎</button><button type="button" onClick={() => onSelect(contact)}>✉</button></article>)}</div>
}

function Dialer({ value, setValue, onCall, callState, onEnd }: { value: string; setValue: (value: string) => void; onCall: () => void; callState: { status: string; number: string } | null; onEnd: () => void }) {
  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '#']
  return <div className="phone-dialer">{callState ? <div className="phone-call-active"><i>☎</i><strong>{callState.number}</strong><small>{callState.status.toUpperCase()}</small><button type="button" onClick={onEnd}>End call</button></div> : <><output>{value || 'Enter number'}</output><div className="phone-keypad">{keys.map((key) => <button type="button" key={key} onClick={() => setValue(value + key)}>{key}</button>)}</div><div className="phone-dial-actions"><button type="button" onClick={() => setValue(value.slice(0, -1))}>⌫</button><button type="button" className="phone-call-button" onClick={onCall}>☎</button><button type="button" onClick={() => setValue('')}>C</button></div></>}</div>
}

function PhoneSettings({ settings, onChange }: { settings: PhoneSettings; onChange: (key: keyof PhoneSettings, value: boolean | string) => void }) {
  const rows: Array<[keyof PhoneSettings, string]> = [['airplaneMode', 'Airplane mode'], ['wifiEnabled', 'Wi-Fi'], ['bluetoothEnabled', 'Bluetooth'], ['darkMode', 'Dark appearance']]
  return <div className="phone-list-view"><p className="phone-kicker">PHONE SETTINGS</p>{rows.map(([key, label]) => <label className="phone-setting-row" key={key}><span>{label}<small>{key === 'airplaneMode' ? 'Disable calls and wireless services' : 'Saved through PhoneService'}</small></span><input type="checkbox" checked={settings[key] as boolean} onChange={(event) => onChange(key, event.target.checked)} /></label>)}<label className="phone-setting-row"><span>Ringtone<small>Choose the incoming call sound</small></span><select value={settings.ringtone} onChange={(event) => onChange('ringtone', event.target.value)}><option>Aurora</option><option>Pulse</option><option>Classic</option></select></label></div>
}

function SimpleApp({ app }: { app: PhoneApp }) {
  const labels: Record<string, string> = { camera: 'Camera ready', map: 'Map centered on Downtown', banking: 'Account balance available', radio: 'Radio frequencies ready', gallery: 'No photos yet', mail: 'Inbox is up to date', calendar: 'No events today', music: 'Your playlist is empty' }
  return <div className="phone-simple-app"><i>{apps.find((entry) => entry.id === app)?.glyph}</i><h2>{labels[app]}</h2><p>This app is registered in the Roblox phone shell and ready for its game service.</p></div>
}
