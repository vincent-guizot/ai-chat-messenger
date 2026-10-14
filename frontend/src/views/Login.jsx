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
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const json = await response.json();

      if (json.ok) {
        setAuth(json.token, json.user);
        reset();
      } else {
        setError(json.error || 'Authentication failed');
      }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/80">Welcome back</div>
            <h2 className="mt-2 bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">AI Chat Messenger</h2>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-300">Email</label>
              <input {...register('email')} className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-3 text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="name@email.com" disabled={loading} />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-300">Password</label>
              <input {...register('password')} type="password" className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-3 text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="••••••••" disabled={loading} />
            </div>

            {mode === 'signup' && (
              <div className="space-y-2">
                <label className="text-[10px] font-medium uppercase tracking-[0.12em] text-slate-300">Name</label>
                <input {...register('name')} className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-3 text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="Your name" disabled={loading} />
              </div>
            )}

            {error && <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</div>}

            <button type="submit" className="w-full rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{loading ? (mode === 'login' ? 'Logging in...' : 'Creating account...') : (mode === 'login' ? 'Login' : 'Create account')}</button>

            <button type="button" onClick={() => setMode(mode === 'login' ? 'signup' : 'login')} className="w-full rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-3 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-60" disabled={loading}>{mode === 'login' ? 'Need an account?' : 'Already have an account?'}</button>
          </form>
        </div>
      </div>
    </div>
  );
}
