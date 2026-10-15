import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ArrowRight, Check, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, UserRound } from 'lucide-react';
import AuthApi from '../api/AuthApi';
import { useAuthStore } from '../stores/authStore';
import AuthLayout from '../layouts/AuthLayout';
import AppLogo from '../components/ui/AppLogo';
import BrandName from '../components/ui/BrandName';
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
    subtitle: 'Sign in to your Chibi Room account',
    submit: 'Sign In',
    submitting: 'Signing in...',
    switchQuestion: "Don't have an account?",
    switchAction: 'Create Account',
    passwordAutoComplete: 'current-password',
  },
  [MODE_SIGNUP]: {
    title: 'Create Account',
    subtitle: 'Join Chibi Room in a few seconds',
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
    <label className="flex min-h-9 cursor-pointer select-none items-center gap-2 text-[13px] text-ink">
      <input
        type="checkbox"
        className="peer sr-only"
        checked={props.checked}
        onChange={(event) => props.onChange(event.target.checked)}
      />
      <span
        className={cn(
          'flex h-[18px] w-[18px] items-center justify-center rounded-[5px] border transition-colors',
          'peer-focus-visible:ring-2 peer-focus-visible:ring-brand-500 peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-surface',
          props.checked && 'border-brand-600 bg-brand-600',
          !props.checked && 'border-line bg-surface',
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
      className="rounded-sm p-1 text-ink-muted transition-colors hover:text-ink"
      aria-label={label}
      title={label}
    >
      <Icon className="h-[18px] w-[18px]" />
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
    <AuthLayout>
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="rounded-xl border border-line bg-surface px-5 py-6 shadow-lg sm:px-7 short:py-5"
      >
        {/* Brand: logo + nama satu baris agar hemat tinggi */}
        <div className="flex items-center justify-center gap-2.5">
          <AppLogo size="md" />
          <BrandName />
        </div>

        <motion.div
          key={mode}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25 }}
          className="mt-5 text-center short:mt-4"
        >
          <h1 className="text-[22px] font-semibold leading-tight text-ink short:text-xl">{text.title}</h1>
          <p className="mt-1 text-sm text-ink-muted">{text.subtitle}</p>
        </motion.div>

        <form onSubmit={form.handleSubmit(handleValidSubmit)} className="mt-5 space-y-3.5 short:mt-4 short:space-y-3" noValidate>
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
                className="min-h-9 text-[13px] font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300"
              >
                Forgot password?
              </button>
            )}
          </div>

          {errorMessage && (
            <div
              className="flex items-center gap-2 rounded-md border border-danger/30 bg-danger/10 px-3 py-2 text-[13px] text-danger"
              role="alert"
            >
              <CircleAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              {errorMessage}
            </div>
          )}

          <Button type="submit" size="sm" fullWidth disabled={isLoading} className="shadow-md">
            {isLoading && <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />}
            {isLoading && text.submitting}
            {!isLoading && text.submit}
            {!isLoading && <ArrowRight className="h-4 w-4" aria-hidden="true" />}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 short:my-2.5">
          <span className="h-px flex-1 bg-line" />
          <span className="text-xs text-ink-muted">or continue with</span>
          <span className="h-px flex-1 bg-line" />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {SOCIAL_PROVIDERS.map((provider) => (
            <Button
              key={provider.label}
              variant="outline"
              size="sm"
              onClick={provider.onClick}
              disabled={isLoading}
              className="h-10 text-[13px] short:h-9"
            >
              {provider.label}
            </Button>
          ))}
        </div>

        <p className="mt-4 text-center text-[13px] text-ink-muted short:mt-3">
          {text.switchQuestion}{' '}
          <button
            type="button"
            onClick={switchMode}
            className="font-semibold text-brand-600 transition-colors hover:text-brand-700 dark:text-brand-300"
          >
            {text.switchAction}
          </button>
        </p>
      </motion.main>
    </AuthLayout>
  );
}
