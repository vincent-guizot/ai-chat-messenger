import { TriangleAlert } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

/**
 * Dialog konfirmasi aksi berbahaya (hapus pesan / hapus chat), dibangun di atas AlertDialog shadcn/ui.
 *
 * Props:
 *   isOpen, title, description, confirmLabel, isLoading, onConfirm, onCancel
 */
export default function ConfirmDialog(props) {
  function handleOpenChange(isOpen) {
    if (!isOpen) {
      props.onCancel();
    }
  }

  function handleConfirm(event) {
    // Dialog ditutup oleh induknya setelah aksi selesai, bukan otomatis saat tombol diklik.
    event.preventDefault();
    props.onConfirm();
  }

  return (
    <AlertDialog open={props.isOpen} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <div className="flex items-start gap-3">
          <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <TriangleAlert className="size-5" aria-hidden="true" />
          </span>

          <AlertDialogHeader className="min-w-0 text-left">
            <AlertDialogTitle>{props.title}</AlertDialogTitle>
            <AlertDialogDescription>{props.description}</AlertDialogDescription>
          </AlertDialogHeader>
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={props.isLoading}>Cancel</AlertDialogCancel>
          <AlertDialogAction variant="destructive" onClick={handleConfirm} disabled={props.isLoading}>
            {props.confirmLabel || 'Delete'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
