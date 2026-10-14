import { useState } from 'react';

export default function MessageInput(props) {
  const [text, setText] = useState('');

  function submit() {
    if (props.disabled || text.trim() === '') {
      return;
    }

    props.onSend(text);
    setText('');
  }

  function handleChange(event) {
    setText(event.target.value);
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter') {
      submit();
    }
  }

  return (
    <div className="mt-4 flex gap-3 border-t border-slate-700/80 pt-4">
      <input
        className="flex-1 rounded-2xl border border-slate-700 bg-slate-800/90 px-4 py-3 text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Write a message..."
        disabled={props.disabled}
      />
      <button
        type="button"
        className="rounded-2xl bg-gradient-to-r from-violet-500 to-cyan-500 px-5 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:translate-y-[-1px] disabled:cursor-not-allowed disabled:opacity-60"
        onClick={submit}
        disabled={props.disabled}
      >
        Send
      </button>
    </div>
  );
}
