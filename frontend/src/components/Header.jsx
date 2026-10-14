import React from 'react';

export default function Header({ userInitials, onLogout, connectionStatus }) {
  const statusClass = {
    connected: 'bg-emerald-400',
    connecting: 'bg-yellow-400',
    disconnected: 'bg-red-400',
    error: 'bg-orange-400',
  }[connectionStatus] || 'bg-slate-400';

  return (
    <div className="mb-4 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <div>
          <div className="text-[10px] font-medium uppercase tracking-[0.18em] text-violet-300/80">Workspace</div>
          <div className="bg-gradient-to-r from-violet-300 via-sky-300 to-emerald-300 bg-clip-text text-xl font-extrabold tracking-tight text-transparent">AI Messenger</div>
        </div>
        <div className={`h-3 w-3 rounded-full shadow-[0_0_18px_rgba(255,255,255,0.4)] ${statusClass}`} title={connectionStatus} />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-cyan-400 text-xs font-bold text-white" title={userInitials}>{userInitials}</div>
        <button className="rounded-xl border border-slate-600 bg-slate-800/70 px-3 py-2 text-sm font-medium text-slate-100 transition hover:border-slate-500 hover:bg-slate-700/80" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
