import TagBadge from '../ui/TagBadge';

export default function TagFilter({
  tags = [],
  selected = [],
  onToggle,
  onClear,
}) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const hasSelection = selected.length > 0;

  return (
    <div
      role="group"
      aria-label="Filter by tag"
      className="flex flex-wrap items-center gap-2"
    >
      {tags.map((tag) => (
        <TagBadge
          key={tag}
          active={selected.includes(tag)}
          onClick={() => onToggle?.(tag)}
        >
          {tag}
        </TagBadge>
      ))}

      {hasSelection && onClear && (
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-indigo-600 hover:text-indigo-800 font-medium transition-colors ml-1 focus:outline-none focus:underline"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
