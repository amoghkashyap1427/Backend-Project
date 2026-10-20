export default function SearchBar({
  value = '',
  onChange,
  placeholder = 'Search...',
  className = '',
}) {
  return (
    <div className={`relative w-full ${className}`}>
      <label htmlFor="dashboard-search-input" className="sr-only">
        Search
      </label>
      <input
        id="dashboard-search-input"
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-3 pr-9 text-sm text-slate-900 placeholder-slate-400 shadow-sm transition-colors focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {value ? (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange?.('')}
          className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
        >
          <span className="text-lg leading-none">&times;</span>
        </button>
      ) : null}
    </div>
  );
}
