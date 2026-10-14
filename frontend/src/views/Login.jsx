import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores/auth';

const apiBase = import.meta.env.VITE_API_BASE || '';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

export default function Login() {
  const { setAuth } = useAuthStore();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const { register, handleSubmit, reset } = useForm({ resolver: zodResolver(schema) });

  async function onSubmit(data) {
    setLoading(true);
    setError(null);

    try {
      const url = mode === 'login' ? `${apiBase}/api/auth/login` : `${apiBase}/api/auth/signup`;

      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await response.json();

      if (json.ok) {
        setAuth(json.token, json.user);
        reset();
      } else {
        setError(json.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-bg-orb orb-a" />
        <div className="auth-bg-orb orb-b" />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ marginBottom: 18 }}>
            <div className="brand-small">Welcome back</div>
            <h2 className="brand" style={{ fontSize: '2rem', marginTop: 6 }}>AI Chat Messenger</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="form-group">
              <label>Email</label>
              <input {...register('email')} className="input" placeholder="name@email.com" disabled={loading} />
            </div>

            <div className="form-group">
              <label>Password</label>
              <input {...register('password')} type="password" className="input" placeholder="••••••••" disabled={loading} />
            </div>

            {mode === 'signup' && (
              <div className="form-group">
                <label>Name</label>
                <input {...register('name')} className="input" placeholder="Your name" disabled={loading} />
              </div>
            )}

            {error && <div className="toast" style={{ marginBottom: 8 }}>{error}</div>}

            <div className="helper-row">
              <button type="submit" className="btn" style={{ flex: 1 }} disabled={loading}>{loading ? (mode === 'login' ? 'Logging...' : 'Creating...') : (mode === 'login' ? 'Login' : 'Create account')}</button>
            </div>

            <div className="helper-row">
              <button type="button" className="btn btn-secondary" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} style={{ width: '100%' }} disabled={loading}>
                {mode === 'login' ? 'Need an account?' : 'Already have an account?'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
