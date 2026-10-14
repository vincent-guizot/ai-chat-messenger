import React from 'react';

export default function Header({ userInitials, onLogout, connectionStatus }) {
  return (
    <div className="header">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div>
          <div className="brand-small">Workspace</div>
          <div className="brand">AI Messenger</div>
        </div>
        <div className={`status-dot ${connectionStatus}`}></div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="avatar" title={userInitials}>{userInitials}</div>
        <button className="btn btn-secondary" onClick={onLogout}>Logout</button>
      </div>
    </div>
  );
}
