import Avatar from '../common/Avatar';

const STATUS_DOT_CLASSES = {
  connected: 'bg-emerald-400',
  connecting: 'bg-yellow-400',
  disconnected: 'bg-red-400',
  error: 'bg-orange-400',
};

export default function SidebarHeader(props) {
  const statusDotClass = STATUS_DOT_CLASSES[props.connectionStatus] || 'bg-slate-400';

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/80">Workspace</div>
          <div className="bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">
            AI Messenger
          </div>
        </div>
        <div
          className={`h-3 w-3 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.4)] ${statusDotClass}`}
          title={props.connectionStatus}
        />
      </div>

      <div className="flex items-center gap-3">
        <Avatar size="small" label={props.userInitials} title={props.userInitials} />
        <button
          type="button"
          className="rounded-xl border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700/80"
          onClick={props.onLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}
