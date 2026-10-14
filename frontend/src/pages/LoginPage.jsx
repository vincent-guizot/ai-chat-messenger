import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ArrowRight, Check, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, UserRound } from 'lucide-react';
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
    <label className="flex cursor-pointer select-none items-center gap-2 text-xs text-slate-300">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={props.checked}
        onChange={(event) => props.onChange(event.target.checked)}
      />
      <span
        className={cn(
          'flex h-4 w-4 items-center justify-center rounded border transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-400',
          props.checked && 'border-brand-600 bg-brand-600',
          !props.checked && 'border-navy-600 bg-navy-950',
        )}
        aria-hidden="true"
      >
        {props.checked && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
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
      className="rounded p-0.5 text-slate-500 transition-colors hover:text-white"
      aria-label={label}
      title={label}
    >
      <Icon className="h-4 w-4" />
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
    <div className="flex min-h-full items-center justify-center bg-navy-950 px-4 py-10">
      <motion.main
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className="w-full max-w-[400px] rounded-2xl border border-navy-700 bg-navy-900 px-6 py-8 shadow-popover sm:px-8"
      >
        <div className="flex flex-col items-center text-center">
          <AppLogo variant="bot" size="lg" />

          <motion.div key={mode} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.25 }}>
            <h1 className="mt-5 text-xl font-semibold text-white">{text.title}</h1>
            <p className="mt-1.5 text-sm text-slate-400">{text.subtitle}</p>
          </motion.div>
        </div>

        <form onSubmit={form.handleSubmit(handleValidSubmit)} className="mt-7 space-y-4" noValidate>
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

          <div className="flex items-center justify-between gap-3">
            <RememberMeCheckbox checked={rememberMe} onChange={setRememberMe} />

            {mode === MODE_LOGIN && (
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-xs font-medium text-brand-400 transition-colors hover:text-brand-300"
              >
                Forgot password?
              </button>
            )}
          </div>

          {errorMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-xs text-red-300" role="alert">
              <CircleAlert className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {errorMessage}
            </div>
          )}

          <Button type="submit" size="md" fullWidth disabled={isLoading} className="mt-1">
            {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isLoading && text.submitting}
            {!isLoading && text.submit}
            {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </form>

        <div className="my-6 flex items-center gap-3">
          <span className="h-px flex-1 bg-navy-700" />
          <span className="text-xs text-slate-500">or continue with</span>
          <span className="h-px flex-1 bg-navy-700" />
        </div>

        <div className="grid grid-cols-3 gap-2">
          {SOCIAL_PROVIDERS.map((provider) => (
            <Button key={provider.label} variant="outline" size="sm" onClick={provider.onClick} disabled={isLoading}>
              {provider.label}
            </Button>
          ))}
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          {text.switchQuestion}{' '}
          <button type="button" onClick={switchMode} className="font-medium text-brand-400 transition-colors hover:text-brand-300">
            {text.switchAction}
          </button>
        </p>
      </motion.main>
    </div>
  );
}
