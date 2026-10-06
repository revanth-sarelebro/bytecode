import { useRef, useState } from 'react'
import { MessageCircle, X } from 'lucide-react'
import { chatApi, errorMessage } from '../services/api'
import { chatSchema, validate } from '../lib/schemas'

const COOLDOWN_MS = 1500

export default function ChatWidget() {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const lastSent = useRef(0)
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi, I can answer questions about clinic hours, booking and cancelling.' },
  ])

  const send = async (e) => {
    e.preventDefault()
    const { data } = validate(chatSchema, { message: text })
    if (!data || busy || Date.now() - lastSent.current < COOLDOWN_MS) return

    lastSent.current = Date.now()
    setMessages((m) => [...m, { from: 'me', text: data.message }])
    setText('')
    setBusy(true)
    try {
      const res = await chatApi.ask(data.message)
      setMessages((m) => [...m, { from: 'bot', text: String(res.reply) }])
    } catch (err) {
      setMessages((m) => [...m, { from: 'bot', text: errorMessage(err) }])
    } finally {
      setBusy(false)
    }
  }

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} className="btn no-print fixed bottom-5 right-5 gap-2 shadow-lg">
        <MessageCircle size={18} aria-hidden="true" /> Ask a question
      </button>
    )
  }

  return (
    <section aria-label="Clinic assistant" className="no-print fixed bottom-5 right-5 flex h-96 w-80 flex-col glass shadow-xl">
      <div className="flex items-center justify-between border-b border-line px-3 py-2">
        <h2 className="font-display font-bold">Clinic assistant</h2>
        <button onClick={() => setOpen(false)} aria-label="Close chat"><X size={18} /></button>
      </div>

      <div className="flex-1 space-y-2 overflow-y-auto p-3 text-sm" aria-live="polite">
        {messages.map((m, i) => (
          // React escapes text, so model output can never inject HTML here.
          <p key={i} className={`max-w-[85%] rounded px-3 py-2 ${m.from === 'me' ? 'ml-auto bg-clinic text-white' : 'bg-paper'}`}>
            {m.text}
          </p>
        ))}
        {busy && <p className="text-muted">Typing…</p>}
      </div>

      <form onSubmit={send} className="border-t border-line p-2">
        <input
          className="input" value={text} maxLength={300} onChange={(e) => setText(e.target.value)}
          placeholder="Type your question" aria-label="Your question"
        />
        <p className="mt-1 text-xs text-muted">Not for emergencies or medical advice. Call your local emergency number.</p>
      </form>
    </section>
  )
}
