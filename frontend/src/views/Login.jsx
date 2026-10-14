import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuthStore } from '../stores/auth'

const schema = z.object({ email: z.string().email(), password: z.string().min(6), name: z.string().optional() })

export default function Login(){
  const { setAuth } = useAuthStore()
  const [mode, setMode] = useState('login')
  const { register, handleSubmit } = useForm({ resolver: zodResolver(schema) })

  async function onSubmit(data){
    try{
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup'
      const resp = await fetch(url, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify(data) })
      const j = await resp.json()
      if (j.ok){
        setAuth(j.token, j.user)
      } else {
        alert(j.error || 'Auth failed')
      }
    }catch(err){
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-gradient-to-br from-slate-800/60 to-slate-900/60 p-6 rounded-xl shadow-xl">
        <h2 className="text-2xl font-semibold mb-4 brand">AI Chat Messenger</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
          <input {...register('email')} placeholder="Email" className="input" />
          <input {...register('password')} type="password" placeholder="Password" className="input" />
          {mode === 'signup' && <input {...register('name')} placeholder="Name (optional)" className="input" />}
          <div className="flex gap-2">
            <button type="submit" className="btn">{mode === 'login' ? 'Login' : 'Sign up'}</button>
            <button type="button" className="btn" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}>{mode === 'login' ? 'Create account' : 'Have an account?'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
