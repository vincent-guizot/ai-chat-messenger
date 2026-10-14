export default function SearchBar(props) {
  function handleChange(event) {
    props.onChange(event.target.value);
  }

  return (
    <div className="w-full">
      <input
        value={props.value}
        onChange={handleChange}
        placeholder={props.placeholder}
        className="w-full rounded-xl border border-slate-700 bg-slate-800/80 px-3 py-2.5 text-sm text-slate-100 placeholder:text-slate-400 focus:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500/20"
      />
    </div>
  );
}
