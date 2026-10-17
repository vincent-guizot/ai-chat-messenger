import { ArrowLeft, Menu, Moon, Sun } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';
import IconButton from '@/components/shared/IconButton';
import NotificationBell from '@/components/notifications/NotificationBell';

/**
 * Header halaman (tinggi sama dengan ChatHeader supaya tidak "loncat" saat pindah halaman).
 *
 * Props:
 *   title, subtitle   teks judul & keterangan kecil di bawahnya
 *   leading           elemen di kiri judul (avatar)
 *   onBack            jika diisi, tombol panah kembali ditampilkan
 *   actions           elemen tambahan sebelum bel notifikasi (tombol aksi halaman)
 */
export default function PageHeader(props) {
  const theme = useUiStore((state) => state.theme);
  const toggleTheme = useUiStore((state) => state.toggleTheme);
  const setMobileSidebarOpen = useUiStore((state) => state.setMobileSidebarOpen);

  let ThemeIcon = Moon;
  let themeLabel = 'Switch to dark mode';
  if (theme === 'dark') {
    ThemeIcon = Sun;
    themeLabel = 'Switch to light mode';
  }

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      <IconButton label="Open menu" className="lg:hidden" onClick={() => setMobileSidebarOpen(true)}>
        <Menu className="size-[18px]" />
      </IconButton>

      {props.onBack && (
        <IconButton label="Back" variant="outline" onClick={props.onBack}>
          <ArrowLeft className="size-[18px]" />
        </IconButton>
      )}

      {props.leading}

      <div className="min-w-0 flex-1">
        <h1 className="truncate text-base font-semibold leading-tight text-foreground">{props.title}</h1>
        {props.subtitle && <p className="truncate text-xs text-muted-foreground">{props.subtitle}</p>}
      </div>

      {props.actions}

      <NotificationBell />

      <IconButton label={themeLabel} variant="outline" onClick={toggleTheme}>
        <ThemeIcon className="size-[18px]" />
      </IconButton>
    </header>
  );
}
