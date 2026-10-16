/**
 * Layout halaman autentikasi (login / daftar).
 * Terpisah dari shell chat: latar canvas dengan hiasan gelombang biru di sudut,
 * dan konten ditaruh di tengah layar.
 */
function AuthDecoration() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <svg
        className="absolute -right-24 -top-28 h-[440px] w-[440px] opacity-90 dark:opacity-50"
        viewBox="0 0 440 440"
        fill="none"
      >
        <defs>
          <linearGradient id="auth-wave-a" x1="440" y1="0" x2="160" y2="300" gradientUnits="userSpaceOnUse">
            <stop stopColor="#17233F" />
            <stop offset="0.45" stopColor="#2160F5" />
            <stop offset="1" stopColor="#8EB2FB" stopOpacity="0.25" />
          </linearGradient>
          <linearGradient id="auth-wave-b" x1="440" y1="40" x2="200" y2="320" gradientUnits="userSpaceOnUse">
            <stop stopColor="#5A8CF8" stopOpacity="0.55" />
            <stop offset="1" stopColor="#DCE8FE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M440 0v250c-72-6-136-48-160-112C262 88 212 36 140 0Z" fill="url(#auth-wave-a)" />
        <path d="M440 60v300c-92-10-170-70-196-156-12-40-44-76-84-104Z" fill="url(#auth-wave-b)" />
      </svg>

      <svg
        className="absolute -left-32 -top-24 h-[380px] w-[380px] opacity-70 dark:opacity-40"
        viewBox="0 0 380 380"
        fill="none"
      >
        <defs>
          <linearGradient id="auth-wave-c" x1="0" y1="0" x2="260" y2="260" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2160F5" stopOpacity="0.5" />
            <stop offset="1" stopColor="#DCE8FE" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M0 0h200c-30 56-24 120-70 168C96 204 52 220 0 220Z" fill="url(#auth-wave-c)" />
      </svg>

      <svg
        className="absolute -bottom-20 -right-16 h-[300px] w-[420px] opacity-80 dark:opacity-40"
        viewBox="0 0 420 300"
        fill="none"
      >
        <defs>
          <linearGradient id="auth-wave-d" x1="420" y1="300" x2="120" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2160F5" />
            <stop offset="1" stopColor="#8EB2FB" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d="M420 300V70c-60 8-112 44-140 98-18 34-52 58-92 66-40 8-78 28-100 66Z" fill="url(#auth-wave-d)" />
      </svg>
    </div>
  );
}

export default function AuthLayout(props) {
  return (
    // h-dvh + overflow-hidden: halaman auth selalu pas satu layar, tidak pernah scroll.
    <div className="relative flex h-dvh items-center justify-center overflow-hidden bg-background px-4 py-4">
      <AuthDecoration />
      <div className="relative z-10 w-full max-w-[420px]">{props.children}</div>
    </div>
  );
}
