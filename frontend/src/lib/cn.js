import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Menggabungkan class Tailwind dengan aman.
 * clsx   -> mendukung class kondisional, contoh: cn('a', isActive && 'b')
 * twMerge -> class yang bentrok diselesaikan, contoh: cn('px-2', 'px-4') -> 'px-4'
 */
export function cn(...classNames) {
  return twMerge(clsx(classNames));
}
