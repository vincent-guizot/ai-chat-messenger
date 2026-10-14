import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores/auth';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export default function Login() {
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState('login');
  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    try {
      const url = mode === 'login' ? '/api/auth/login' : '/api/auth/signup';
      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await resp.json();
      if (json.ok) {
        setAuth(json.token, json.user);
        reset();
      } else {
        alert(json.error || 'Authentication failed');
      }
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card" style={{ position: 'relative', overflow: 'hidden' }}>
        <div className="auth-bg-orb" style={{ width: 200, height: 200, background: 'rgba(168,85,247,.24)', top: -60, right: -40 }} />
        <div className="auth-bg-orb" style={{ width: 200, height: 200, background: 'rgba(34,211,238,.18)', left: -40, bottom: -50 }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 18 }}>
            <div className="brand-small">Welcome back</div>
            <h2 className="brand" style={{ fontSize: '2rem', marginTop: 6, marginBottom: 0 }}>AI Chat Messenger</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Email</label>
              <input {...register('email')} className="input" placeholder="name@email.com" />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" />
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label>Name</label>
                <input {...register('name')} className="input" placeholder="Your name" />
              </div>
            )}

            <div className="helper-row" style={{ marginBottom: 12 }}>
              <button type="submit" className="btn" style={{ flex: 1 }}>
                {mode === 'login' ? 'Login' : 'Create account'}
              </button>
            </div>

            <div className="helper-row">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
                style={{ width: '100%' }}
              >
                {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
