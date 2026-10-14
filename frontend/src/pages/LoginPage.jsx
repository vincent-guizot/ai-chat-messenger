import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthStore } from '../stores/authStore';
import AuthApi from '../api/AuthApi';

const MODE_LOGIN = 'login';
const MODE_SIGNUP = 'signup';

const authFormSchema = z.object({
  email: z.string().email('Email is not valid'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().optional(),
});

const INPUT_CLASS = 'w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-3 text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30';
const LABEL_CLASS = 'text-[10px] font-medium uppercase tracking-[0.12em] text-slate-300';

function FieldError(props) {
  if (!props.error) {
    return null;
  }

  return <div className="text-xs text-red-300">{props.error.message}</div>;
}

function getSubmitLabel(mode, isLoading) {
  if (mode === MODE_LOGIN) {
    if (isLoading) {
      return 'Logging in...';
    }
    return 'Login';
  }

  if (isLoading) {
    return 'Creating account...';
  }
  return 'Create account';
}

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const [mode, setMode] = useState(MODE_LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const form = useForm({ resolver: zodResolver(authFormSchema) });
  const fieldErrors = form.formState.errors;

  async function handleValidSubmit(formValues) {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      let result;

      if (mode === MODE_LOGIN) {
        result = await AuthApi.login({ email: formValues.email, password: formValues.password });
      } else {
        result = await AuthApi.signup(formValues);
      }

      setAuth(result.token, result.user);
      form.reset();
    } catch (error) {
      setErrorMessage(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  function toggleMode() {
    setErrorMessage(null);

    if (mode === MODE_LOGIN) {
      setMode(MODE_SIGNUP);
    } else {
      setMode(MODE_LOGIN);
    }
  }

  let toggleLabel = 'Already have an account?';
  if (mode === MODE_LOGIN) {
    toggleLabel = 'Need an account?';
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-8 text-slate-100">
      <div className="relative w-full max-w-md overflow-hidden rounded-[28px] border border-slate-700/70 bg-slate-900/80 p-6 shadow-2xl backdrop-blur-xl">
        <div className="absolute -right-14 -top-14 h-48 w-48 rounded-full bg-violet-500/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-10 h-48 w-48 rounded-full bg-cyan-500/20 blur-3xl" />

        <div className="relative z-10">
          <div className="mb-6">
            <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/80">Welcome back</div>
            <h2 className="mt-2 bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-3xl font-extrabold tracking-tight text-transparent">
              AI Chat Messenger
            </h2>
          </div>

          <form onSubmit={form.handleSubmit(handleValidSubmit)} className="space-y-4">
            <div className="space-y-2">
              <label className={LABEL_CLASS}>Email</label>
              <input {...form.register('email')} className={INPUT_CLASS} placeholder="name@email.com" disabled={isLoading} />
              <FieldError error={fieldErrors.email} />
            </div>

            <div className="space-y-2">
              <label className={LABEL_CLASS}>Password</label>
              <input {...form.register('password')} type="password" className={INPUT_CLASS} placeholder="••••••••" disabled={isLoading} />
              <FieldError error={fieldErrors.password} />
            </div>

            {mode === MODE_SIGNUP && (
              <div className="space-y-2">
                <label className={LABEL_CLASS}>Name</label>
                <input {...form.register('name')} className={INPUT_CLASS} placeholder="Your name" disabled={isLoading} />
              </div>
            )}

            {errorMessage && (
              <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{errorMessage}</div>
            )}

            <button
              type="submit"
              className="w-full rounded-xl bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-500 px-4 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            >
              {getSubmitLabel(mode, isLoading)}
            </button>

            <button
              type="button"
              onClick={toggleMode}
              className="w-full rounded-xl border border-slate-600 bg-slate-800/60 px-4 py-3 font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700/70 disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isLoading}
            >
              {toggleLabel}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
