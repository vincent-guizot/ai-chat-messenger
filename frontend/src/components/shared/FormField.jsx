import { forwardRef } from 'react';
import { CircleAlert } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

/**
 * Label + Input shadcn + ikon kiri + elemen tambahan kanan (mis. tombol lihat password) + pesan error.
 * Dipakai di form login/daftar.
 */
const FormField = forwardRef(function FormField(props, ref) {
  const { id, label, icon: Icon, trailing, error, className, ...inputProps } = props;

  let errorId;
  if (error) {
    errorId = `${id}-error`;
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>

      <div className="relative">
        {Icon && (
          <Icon
            className="pointer-events-none absolute left-3.5 top-1/2 size-[18px] -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
        )}

        <Input
          id={id}
          ref={ref}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn('h-11', Icon && 'pl-11', trailing && 'pr-11', className)}
          {...inputProps}
        />

        {trailing && <div className="absolute right-2 top-1/2 -translate-y-1/2">{trailing}</div>}
      </div>

      {error && (
        <p id={errorId} className="flex items-center gap-1.5 text-xs text-destructive">
          <CircleAlert className="size-3.5 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
});

export default FormField;
