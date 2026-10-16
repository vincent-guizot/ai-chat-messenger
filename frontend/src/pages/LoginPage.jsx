import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'motion/react';
import { ArrowRight, CircleAlert, Eye, EyeOff, LoaderCircle, Lock, Mail, UserRound } from 'lucide-react';
import AuthApi from '@/api/AuthApi';
import { useAuthStore } from '@/stores/authStore';
import AuthLayout from '@/layouts/AuthLayout';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import AppLogo from '@/components/shared/AppLogo';
import BrandName from '@/components/shared/BrandName';
import FormField from '@/components/shared/FormField';
import IconButton from '@/components/shared/IconButton';

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
    <div className="flex min-h-9 items-center gap-2">
      <Checkbox id="remember-me" checked={props.checked} onCheckedChange={props.onChange} />
      <Label htmlFor="remember-me" className="cursor-pointer text-[13px] font-normal">
        Remember me
      </Label>
    </div>
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
    <IconButton label={label} size="icon-sm" onClick={props.onToggle} tabIndex={-1}>
      <Icon className="size-[18px]" />
    </IconButton>
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
        className="rounded-xl border border-border bg-card px-5 py-6 shadow-lg sm:px-7 short:py-5"
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
          <h1 className="text-[22px] font-semibold leading-tight text-foreground short:text-xl">{text.title}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{text.subtitle}</p>
        </motion.div>

        <form onSubmit={form.handleSubmit(handleValidSubmit)} className="mt-5 space-y-3.5 short:mt-4 short:space-y-3" noValidate>
          {mode === MODE_SIGNUP && (
            <FormField
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

          <FormField
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

          <FormField
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
              <Button variant="link" size="sm" onClick={handleForgotPassword} className="h-9 px-0 text-[13px] dark:text-brand-300">
                Forgot password?
              </Button>
            )}
          </div>

          {errorMessage && (
            <div
              className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-[13px] text-destructive"
              role="alert"
            >
              <CircleAlert className="size-4 shrink-0" aria-hidden="true" />
              {errorMessage}
            </div>
          )}

          <Button type="submit" disabled={isLoading} className="w-full shadow-md">
            {isLoading && <LoaderCircle className="animate-spin" aria-hidden="true" />}
            {isLoading && text.submitting}
            {!isLoading && text.submit}
            {!isLoading && <ArrowRight aria-hidden="true" />}
          </Button>
        </form>

        <div className="my-4 flex items-center gap-3 short:my-2.5">
          <Separator className="flex-1" />
          <span className="text-xs text-muted-foreground">or continue with</span>
          <Separator className="flex-1" />
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {SOCIAL_PROVIDERS.map((provider) => (
            <Button
              key={provider.label}
              variant="outline"
              onClick={provider.onClick}
              disabled={isLoading}
              className="text-[13px] short:h-9"
            >
              {provider.label}
            </Button>
          ))}
        </div>

        <p className="mt-4 text-center text-[13px] text-muted-foreground short:mt-3">
          {text.switchQuestion}{' '}
          <Button variant="link" onClick={switchMode} className="h-auto p-0 text-[13px] dark:text-brand-300">
            {text.switchAction}
          </Button>
        </p>
      </motion.main>
    </AuthLayout>
  );
}
