export default function TagBadge({
  children,
  active = false,
  onClick,
  onRemove,
  className = '',
}) {
  const baseClasses =
    'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors select-none';
  const stateClasses = active
    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
    : 'bg-slate-100 text-slate-700 border border-transparent hover:bg-slate-200';

  const combinedClasses = `${baseClasses} ${stateClasses} ${
    onClick ? 'cursor-pointer' : ''
  } ${className}`;

  const handleRemove = (e) => {
    e.stopPropagation();
    if (onRemove) {
      onRemove();
    }
  };

  const removeButton = onRemove ? (
    <button
      type="button"
      aria-label={`Remove tag ${children}`}
      onClick={handleRemove}
      className="inline-flex items-center justify-center -mr-1 h-3.5 w-3.5 rounded-full hover:bg-slate-300/60 hover:text-slate-900 focus:outline-none"
    >
      <span className="leading-none text-sm">&times;</span>
    </button>
  ) : null;

  if (onClick) {
    return (
      <button
        type="button"
        aria-pressed={active}
        onClick={onClick}
        className={combinedClasses}
      >
        <span>{children}</span>
        {removeButton}
      </button>
    );
  }

  return (
    <span className={combinedClasses}>
      <span>{children}</span>
      {removeButton}
    </span>
  );
}
