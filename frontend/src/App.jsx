import React, { useState } from 'react'

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Saya AI Chat Messenger. Tanyakan sesuatu.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  async function send() {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages })
      })
      const data = await resp.json()
      if (data.ok) {
        setMessages(m => [...m, { role: 'assistant', content: data.output }])
      } else {
        setMessages(m => [...m, { role: 'assistant', content: 'Error: ' + (data.error || 'unknown') }])
      }
    } catch (err) {
      setMessages(m => [...m, { role: 'assistant', content: 'Network error: ' + err.message }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <h1>AI Chat Messenger</h1>
      <div className="chat-window">
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            <strong>{m.role}:</strong>
            <div>{m.content}</div>
          </div>
        ))}
        {loading && <div className="msg assistant">Assistant: ...</div>}
      </div>
      <div className="composer">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && send()} placeholder="Ketik pesan..." />
        <button onClick={send} disabled={loading}>Kirim</button>
      </div>
    </div>
  )
}
