import { forwardRef } from 'react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

/**
 * Tombol ikon = Button shadcn (size "icon") + Tooltip + aria-label.
 * `label` wajib diisi: dibaca screen reader dan ditampilkan sebagai tooltip.
 *
 * Props tambahan:
 *   label     teks tooltip / aria-label
 *   variant   varian Button ("ghost" bawaan, "outline" untuk tombol berbingkai di header)
 *   size      "icon" | "icon-sm" | "icon-lg"
 */
const IconButton = forwardRef(function IconButton(props, ref) {
  const { label, variant, size, children, ...otherProps } = props;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button ref={ref} variant={variant || 'ghost'} size={size || 'icon'} aria-label={label} {...otherProps}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
});

export default IconButton;
