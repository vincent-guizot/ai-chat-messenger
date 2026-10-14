import React, { useState, useEffect } from 'react'
import socket from './socket'

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Halo! Saya AI Chat Messenger. Tanyakan sesuatu.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    socket.on('connect', () => {
      console.log('connected to socket', socket.id)
    })

    socket.on('chat:response', (data) => {
      setLoading(false)
      if (data.ok) {
        setMessages(m => [...m, { role: 'assistant', content: data.output }])
      } else {
        setMessages(m => [...m, { role: 'assistant', content: 'Error: ' + (data.error || 'unknown') }])
      }
    })

    return () => {
      socket.off('chat:response')
    }
  }, [])

  function send() {
    if (!input.trim()) return
    const userMsg = { role: 'user', content: input }
    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    socket.emit('chat:message', { messages: newMessages })
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
