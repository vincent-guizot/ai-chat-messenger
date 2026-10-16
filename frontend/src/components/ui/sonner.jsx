import { Toaster as SonnerToaster } from 'sonner';
import { CircleAlert, CircleCheck, Info, LoaderCircle, TriangleAlert } from 'lucide-react';
import { useUiStore } from '@/stores/uiStore';

/**
 * Toast (sonner) dengan tema mengikuti saklar dark mode aplikasi.
 * Panggil `toast.success("...")` / `toast.error("...")` dari mana saja.
 */
function Toaster(props) {
  const theme = useUiStore((state) => state.theme);

  return (
    <SonnerToaster
      theme={theme}
      position="top-right"
      offset={16}
      closeButton={false}
      icons={{
        success: <CircleCheck className="size-4 text-success" />,
        info: <Info className="size-4 text-info" />,
        warning: <TriangleAlert className="size-4 text-warning" />,
        error: <CircleAlert className="size-4 text-destructive" />,
        loading: <LoaderCircle className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: 'rounded-lg! border-border! bg-card! text-foreground! shadow-popover! text-sm! font-sans!',
          description: 'text-muted-foreground!',
        },
      }}
      {...props}
    />
  );
}

export { Toaster };
