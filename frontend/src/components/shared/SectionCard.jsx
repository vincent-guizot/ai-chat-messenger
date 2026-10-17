import { cn } from '@/lib/utils';

/**
 * Kartu bagian pada halaman detail: judul kecil + isi.
 */
export default function SectionCard(props) {
  return (
    <section className={cn('rounded-xl border border-border bg-card p-4 shadow-sm', props.className)}>
      {(props.title || props.action) && (
        <div className="mb-3 flex items-center justify-between gap-2">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{props.title}</h2>
          {props.action}
        </div>
      )}
      {props.children}
    </section>
  );
}
