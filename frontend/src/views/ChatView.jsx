import React, { useEffect, useState, useRef } from 'react'
import { useAuthStore } from '../stores/auth'
import socketIO from '../socket'

export default function ChatView(){
  const { user, token, clearAuth } = useAuthStore()
  const [conversations, setConversations] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const messagesRef = useRef(null)

  useEffect(() => {
    if (!token) return
    socketIO.auth = { token }
    socketIO.connect()

    socketIO.on('connect', () => console.log('socket connected', socketIO.id))
    socketIO.on('message:new', (msg) => {
      setMessages(m => [...m, msg])
    })

    return () => {
      socketIO.disconnect()
    }
  }, [token])

  useEffect(() => { if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight }, [messages])

  function openConversation(conv){
    setActive(conv)
    setMessages([])
    // join room
    socketIO.emit('join', { conversationId: conv.id })
    // load last messages (fetch via REST later)
    fetch(`/api/conversations/${conv.id}/messages`).then(r=>r.json()).then(j=>{ if(j.ok) setMessages(j.messages) })
  }

  function send(){
    if (!input.trim() || !active) return
    socketIO.emit('message:create', { conversationId: active.id, content: input })
    setInput('')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="header"><div className="brand">AI Chat Messenger</div><div><button className="btn" onClick={clearAuth}>Logout</button></div></div>
        <div className="conversation-list">
          {conversations.length === 0 && <div className="text-sm text-slate-400">No conversations yet</div>}
          {conversations.map(c=> (
            <div key={c.id} className="conversation-item" onClick={()=>openConversation(c)}>{c.title || 'Conversation'}</div>
          ))}
        </div>
      </aside>

      <main className="chat-panel">
        {active ? (
          <>
            <div className="messages" ref={messagesRef}>
              {messages.map(m=> (
                <div key={m.id} className={`msg ${m.senderRole === 'user' ? 'user' : 'assistant'}`}>
                  <div>{m.content}</div>
                </div>
              ))}
            </div>
            <div className="composer">
              <input className="input" value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter' && send()} placeholder="Ketik pesan..." />
              <button className="btn" onClick={send}>Kirim</button>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-full text-slate-400">Pilih conversation atau buat baru</div>
        )}
      </main>
    </div>
  )
}
