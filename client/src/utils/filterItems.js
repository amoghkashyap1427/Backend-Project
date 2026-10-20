/**
 * Returns a sorted array of unique lowercase tags across all items.
 * Missing or non-array tags fields are treated as empty.
 */
export function getAllTags(items = []) {
  const tagSet = new Set();

  for (const item of items) {
    if (Array.isArray(item?.tags)) {
      for (const tag of item.tags) {
        if (typeof tag === 'string') {
          const clean = tag.trim().toLowerCase();
          if (clean) {
            tagSet.add(clean);
          }
        }
      }
    }
  }

  return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
}

const SEARCH_FIELDS = [
  'title',
  'description',
  'company',
  'role',
  'issuer',
  'repository',
  'prTitle',
  'name',
];

/**
 * Filter items by tags and text search.
 * Tag match choice:
 * - 'any' keeps items with at least one selected tag (union)
 * - 'all' requires items to have every selected tag (intersection)
 */
export function filterItems(
  items = [],
  { tags = [], search = '', match = 'any' } = {}
) {
  const selectedTags = tags
    .filter((t) => typeof t === 'string')
    .map((t) => t.trim().toLowerCase())
    .filter(Boolean);

  const query = typeof search === 'string' ? search.trim().toLowerCase() : '';

  return items.filter((item) => {
    // Tag filter
    if (selectedTags.length > 0) {
      const itemTags = Array.isArray(item?.tags)
        ? item.tags
            .filter((t) => typeof t === 'string')
            .map((t) => t.trim().toLowerCase())
        : [];

      if (match === 'all') {
        const hasAllTags = selectedTags.every((t) => itemTags.includes(t));
        if (!hasAllTags) return false;
      } else {
        const hasAnyTag = selectedTags.some((t) => itemTags.includes(t));
        if (!hasAnyTag) return false;
      }
    }

    // Search filter
    if (query) {
      const matchesSearch = SEARCH_FIELDS.some((field) => {
        const val = item?.[field];
        return typeof val === 'string' && val.toLowerCase().includes(query);
      });

      if (!matchesSearch) return false;
    }

    return true;
  });
}
