/**
 * Returns true only when value is a string that, after trim, starts with http:// or https:// (case-insensitive).
 */
export function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  return /^https?:\/\//i.test(value.trim());
}

/**
 * Formats a 'YYYY-MM-DD' or ISO string as 'Mon YYYY' (e.g. 'Jun 2024') in en-US.
 * Parses YYYY-MM-DD parts manually and builds the date from them so there is no timezone shift.
 * Returns an empty string for missing or non-string values, and the trimmed raw text if unparseable.
 */
export function formatDate(value) {
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  let date;
  const match = trimmed.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (match) {
    const year = parseInt(match[1], 10);
    const monthIndex = parseInt(match[2], 10) - 1;
    const day = match[3] ? parseInt(match[3], 10) : 1;
    date = new Date(year, monthIndex, day);
  } else {
    date = new Date(trimmed);
  }

  if (isNaN(date.getTime())) {
    return trimmed;
  }

  try {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return trimmed;
  }
}
