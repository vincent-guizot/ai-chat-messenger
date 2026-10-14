import React from 'react';

export default function SearchBar({ value, onChange, placeholder }) {
  return (
    <div className="p-2">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-md border bg-white/5 text-white placeholder:text-slate-300"
      />
    </div>
  );
}
