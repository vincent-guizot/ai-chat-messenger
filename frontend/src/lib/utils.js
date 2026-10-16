import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Menggabungkan class Tailwind dengan aman (konvensi shadcn/ui):
 * clsx menangani kondisi, twMerge menghapus class yang saling bertabrakan.
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
