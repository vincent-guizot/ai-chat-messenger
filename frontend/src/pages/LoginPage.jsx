import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ArrowRight, Check, Eye, EyeOff, LoaderCircle, Lock, Mail, UserRound } from 'lucide-react';
import AuthApi from '../api/AuthApi';
import { useAuthStore } from '../stores/authStore';
import AppLogo from '../components/ui/AppLogo';
import Button from '../components/ui/Button';
import TextField from '../components/ui/TextField';
import { cn } from '../lib/cn';

const MODE_LOGIN = 'login';
const MODE_SIGNUP = 'signup';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2, 'Name must be at least 2 characters'),
});

const PAGE_TEXT = {
  [MODE_LOGIN]: {
    title: 'Welcome Back',
    subtitle: 'Sign in to your AI Chat Messenger account',
    submit: 'Sign In',
    submitting: 'Signing in...',
    switchQuestion: "Don't have an account?",
    switchAction: 'Create Account',
    passwordAutoComplete: 'current-password',
  },
  [MODE_SIGNUP]: {
    title: 'Create Account',
    subtitle: 'Join AI Chat Messenger in a few seconds',
    submit: 'Create Account',
    submitting: 'Creating account...',
    switchQuestion: 'Already have an account?',
    switchAction: 'Sign In',
    passwordAutoComplete: 'new-password',
  },
};

// --- Login pihak ketiga (OAuth) ----------------------------------------------
// Fungsinya sengaja dikosongkan dulu. Isi saat integrasi OAuth dibuat.

function handleGoogleLogin() {
  // TODO: arahkan ke endpoint OAuth Google di backend.
}

function handleGithubLogin() {
  // TODO: arahkan ke endpoint OAuth GitHub di backend.
}

function handleMicrosoftLogin() {
  // TODO: arahkan ke endpoint OAuth Microsoft di backend.
}

function handleForgotPassword() {
  // TODO: tampilkan form reset password.
}

const SOCIAL_PROVIDERS = [
  { label: 'Google', onClick: handleGoogleLogin },
  { label: 'GitHub', onClick: handleGithubLogin },
  { label: 'Microsoft', onClick: handleMicrosoftLogin },
];

// -----------------------------------------------------------------------------

function RememberMeCheckbox(props) {
  return (
    <label className="flex cursor-pointer select-none items-center gap-3 text-sm text-slate-200">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={props.checked}
        onChange={(event) => props.onChange(event.target.checked)}
      />
      <span
        className={cn(
          'flex h-5 w-5 items-center justify-center rounded-md border transition',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400',
          props.checked && 'border-brand-500 bg-brand-500',
          !props.checked && 'border-white/25 bg-white/5',
        )}
        aria-hidden="true"
      >
        {props.checked && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
      </span>
      Remember me
    </label>
  );
}

function PasswordVisibilityToggle(props) {
  let Icon = EyeOff;
  let label = 'Show password';

  if (props.isVisible) {
    Icon = Eye;
    label = 'Hide password';
  }

  return (
    <button
      type="button"
      onClick={props.onToggle}
      className="rounded-lg p-1 text-slate-400 transition hover:text-white"
      aria-label={label}
      title={label}
    >
      <Icon className="h-5 w-5" />
    </button>
  );
}

export default function LoginPage() {
  const setAuth = useAuthStore((state) => state.setAuth);

  const [mode, setMode] = useState(MODE_LOGIN);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  let schema = loginSchema;
  if (mode === MODE_SIGNUP) {
    schema = signupSchema;
  }

  const form = useForm({ resolver: zodResolver(schema) });
  const fieldErrors = form.formState.errors;
  const text = PAGE_TEXT[mode];

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

      setAuth(result.token, result.user, rememberMe);
    } catch (error) {
      setErrorMessage(error.message || 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  }

  function switchMode() {
    setErrorMessage(null);
    form.clearErrors();

    if (mode === MODE_LOGIN) {
      setMode(MODE_SIGNUP);
    } else {
      setMode(MODE_LOGIN);
    }
  }

  function getFieldError(fieldName) {
    if (fieldErrors[fieldName]) {
      return fieldErrors[fieldName].message;
    }

    return null;
  }

  let passwordInputType = 'password';
  if (isPasswordVisible) {
    passwordInputType = 'text';
  }

  return (
    <div className="auth-background flex min-h-full items-center justify-center px-4 py-10">
      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-[540px] rounded-[2rem] border border-brand-300/20 bg-gradient-to-b from-navy-700/60 to-navy-900/50 px-6 py-10 shadow-[0_30px_80px_-30px_rgba(4,10,41,0.9)] backdrop-blur-xl sm:px-14"
      >
        <div className="flex flex-col items-center text-center">
          <AppLogo variant="bot" size="lg" />

          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <h1 className="mt-7 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">{text.title}</h1>
            <p className="mt-3 text-[15px] text-slate-300">{text.subtitle}</p>
          </motion.div>
        </div>

        <form onSubmit={form.handleSubmit(handleValidSubmit)} className="mt-9 space-y-5" noValidate>
          {mode === MODE_SIGNUP && (
            <TextField
              id="name"
              label="Name"
              icon={UserRound}
              placeholder="Your full name"
              autoComplete="name"
              disabled={isLoading}
              error={getFieldError('name')}
              {...form.register('name')}
            />
          )}

          <TextField
            id="email"
            type="email"
            label="Email"
            icon={Mail}
            placeholder="you@example.com"
            autoComplete="email"
            disabled={isLoading}
            error={getFieldError('email')}
            {...form.register('email')}
          />

          <TextField
            id="password"
            type={passwordInputType}
            label="Password"
            icon={Lock}
            placeholder="Enter your password"
            autoComplete={text.passwordAutoComplete}
            disabled={isLoading}
            error={getFieldError('password')}
            trailing={
              <PasswordVisibilityToggle
                isVisible={isPasswordVisible}
                onToggle={() => setIsPasswordVisible(!isPasswordVisible)}
              />
            }
            {...form.register('password')}
          />

          <div className="flex items-center justify-between gap-4">
            <RememberMeCheckbox checked={rememberMe} onChange={setRememberMe} />

            {mode === MODE_LOGIN && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm font-medium text-brand-300 transition hover:text-brand-200"
              >
                Forgot password?
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-xl border border-rose-400/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200" role="alert">
              {errorMessage}
            </div>
          )}

          <Button type="submit" size="lg" fullWidth disabled={isLoading} className="mt-2">
            {isLoading && <LoaderCircle className="h-5 w-5 animate-spin" aria-hidden="true" />}
            {isLoading && text.submitting}
            {!isLoading && text.submit}
            {!isLoading && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
          </Button>
        </form>

        <div className="my-8 flex items-center gap-4">
          <span className="h-px flex-1 bg-white/10" />
          <span className="text-sm text-slate-400">or continue with</span>
          <span className="h-px flex-1 bg-white/10" />
        </div>

        <div className="grid grid-cols-3 gap-3">
          {SOCIAL_PROVIDERS.map((provider) => (
            <Button key={provider.label} variant="outline" size="md" onClick={provider.onClick} disabled={isLoading}>
              {provider.label}
            </Button>
          ))}
        </div>

        <p className="mt-9 text-center text-sm text-slate-300">
          {text.switchQuestion}{' '}
          <button type="button" onClick={switchMode} className="font-semibold text-brand-300 transition hover:text-brand-200">
            {text.switchAction}
          </button>
        </p>
      </motion.main>
    </div>
  );
}
