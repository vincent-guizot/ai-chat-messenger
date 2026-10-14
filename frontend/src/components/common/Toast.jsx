export default function Toast(props) {
  if (!props.message) {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 rounded-xl border border-violet-500/30 bg-slate-900/95 px-4 py-3 text-sm text-slate-100 shadow-2xl">
      {props.message}
    </div>
  );
}
