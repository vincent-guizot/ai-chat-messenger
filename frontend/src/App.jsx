import React from 'react'
import { useAuthStore } from './stores/auth'
import ChatView from './views/ChatView'
import Login from './views/Login'

export default function App(){
  const { token } = useAuthStore();
  return (
    <div>
      {token ? <ChatView/> : <Login/>}
    </div>
  )
}
