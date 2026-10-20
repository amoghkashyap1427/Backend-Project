import { useState } from 'react';
import Button from '../ui/Button';
import Toggle from '../ui/Toggle';
import TagBadge from '../ui/TagBadge';

/**
 * Formats a 'YYYY-MM-DD' or ISO date string as 'Mon YYYY' (e.g. 'Jun 2024').
 * Returns an empty string for missing values or the raw value for unparseable input.
 */
function formatDate(value) {
  if (!value) return '';
  if (typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  let date;
  const match = trimmed.match(/^(\d{4})-(\d{2})(?:-(\d{2}))?/);
  if (match) {
    const year = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const day = match[3] ? parseInt(match[3], 10) : 1;
    date = new Date(year, month, day);
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

/**
 * Returns true only when value is a string starting with http:// or https:// (case-insensitive).
 */
function isHttpUrl(value) {
  if (typeof value !== 'string') return false;
  return /^https?:\/\//i.test(value.trim());
}

const statusStyles = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  merged: 'bg-purple-50 text-purple-700 border-purple-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
};

const proficiencyStyles = {
  beginner: 'bg-slate-100 text-slate-700 border-slate-200',
  intermediate: 'bg-amber-50 text-amber-700 border-amber-200',
  advanced: 'bg-green-50 text-green-700 border-green-200',
};

function getItemHeader(item = {}, type) {
  switch (type) {
    case 'project':
      return {
        title: item.title || '',
        subtitle: '',
      };
    case 'experience':
      return {
        title: item.role || '',
        subtitle:
          item.company && item.location
            ? `${item.company} · ${item.location}`
            : item.company || item.location || '',
      };
    case 'openSource':
      return {
        title: item.prTitle || '',
        subtitle: item.repository || '',
      };
    case 'certification':
      return {
        title: item.title || '',
        subtitle: item.issuer || '',
      };
    case 'skill':
      return {
        title: item.name || '',
        subtitle: item.category || '',
      };
    default:
      return {
        title: item.title || item.name || item.role || item.prTitle || '',
        subtitle:
          item.company || item.repository || item.issuer || item.category || '',
      };
  }
}

export default function ItemCard({
  item = {},
  type,
  onEdit,
  onDelete,
  onTogglePublic,
  onTagClick,
}) {
  const [toggling, setToggling] = useState(false);
  const [toggleError, setToggleError] = useState('');

  const { title, subtitle } = getItemHeader(item, type);

  const handleToggle = async () => {
    setToggling(true);
    setToggleError('');
    try {
      if (onTogglePublic) {
        await onTogglePublic(item);
      }
    } catch {
      setToggleError('Could not update visibility.');
    } finally {
      setToggling(false);
    }
  };

  let dateLine = '';
  if (type === 'experience') {
    const start = formatDate(item.startDate);
    const isPresent = Boolean(item.isCurrent || !item.endDate);
    const end = isPresent ? 'Present' : formatDate(item.endDate);

    if (start && end) {
      dateLine = `${start} – ${end}`;
    } else if (start) {
      dateLine = start;
    } else if (end && !isPresent) {
      dateLine = end;
    } else if (isPresent && item.isCurrent) {
      dateLine = 'Present';
    }
  }

  const toggleAriaLabel = `Make "${title || 'item'}" ${
    item.isPublic ? 'private' : 'public'
  }`;

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md">
      <div className="space-y-4">
        {/* 1. Header row */}
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              {title && (
                <h3 className="text-base sm:text-lg font-semibold text-slate-900 line-clamp-2 break-words">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-sm text-slate-500 break-words mt-0.5">
                  {subtitle}
                </p>
              )}
            </div>
            <div className="shrink-0 pt-0.5">
              <Toggle
                checked={Boolean(item.isPublic)}
                onChange={handleToggle}
                disabled={toggling}
                showText
                label={toggleAriaLabel}
                aria-label={toggleAriaLabel}
              />
            </div>
          </div>
          {toggleError && (
            <p className="text-xs text-red-600 mt-1">{toggleError}</p>
          )}
        </div>

        {/* 2. Body, depending on type */}
        {type === 'project' && (
          <div className="space-y-3">
            {item.description && (
              <p className="text-sm text-slate-600 break-words whitespace-pre-line">
                {item.description}
              </p>
            )}
            {(isHttpUrl(item.repoUrl) || isHttpUrl(item.liveUrl)) && (
              <div className="flex flex-wrap items-center gap-3 text-sm">
                {isHttpUrl(item.repoUrl) && (
                  <a
                    href={item.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                  >
                    Repo
                  </a>
                )}
                {isHttpUrl(item.liveUrl) && (
                  <a
                    href={item.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                  >
                    Live
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {type === 'experience' && (
          <div className="space-y-2.5">
            {dateLine && (
              <p className="text-xs font-medium text-slate-500">{dateLine}</p>
            )}
            {Array.isArray(item.bullets) && item.bullets.length > 0 && (
              <ul className="list-disc pl-5 space-y-1 text-sm text-slate-600">
                {item.bullets.map((bullet, index) => (
                  <li key={index} className="break-words">
                    {bullet}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {type === 'openSource' && (
          <div className="space-y-3">
            {item.status && (
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize ${
                    statusStyles[item.status.toLowerCase()] ||
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.status}
                </span>
              </div>
            )}
            {item.description && (
              <p className="text-sm text-slate-600 break-words whitespace-pre-line">
                {item.description}
              </p>
            )}
            {isHttpUrl(item.prUrl) && (
              <div>
                <a
                  href={item.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                >
                  View PR
                </a>
              </div>
            )}
          </div>
        )}

        {type === 'certification' && (
          <div className="space-y-2">
            {item.completedOn && formatDate(item.completedOn) && (
              <p className="text-xs font-medium text-slate-500">
                Completed {formatDate(item.completedOn)}
              </p>
            )}
            {item.credentialId && (
              <p className="text-xs text-slate-600 break-words">
                Credential ID: {item.credentialId}
              </p>
            )}
            {isHttpUrl(item.verifyUrl) && (
              <div className="pt-0.5">
                <a
                  href={item.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                >
                  Verify
                </a>
              </div>
            )}
          </div>
        )}

        {type === 'skill' && (
          <div className="space-y-2">
            {item.proficiency && (
              <div>
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize ${
                    proficiencyStyles[item.proficiency.toLowerCase()] ||
                    'bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.proficiency}
                </span>
              </div>
            )}
          </div>
        )}

        {/* 3. Tags row */}
        {Array.isArray(item.tags) && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {item.tags.map((tag) => (
              <TagBadge
                key={tag}
                onClick={onTagClick ? () => onTagClick(tag) : undefined}
              >
                {tag}
              </TagBadge>
            ))}
          </div>
        )}
      </div>

      {/* 4. Footer row */}
      <div className="flex items-center gap-2 pt-3 border-t border-slate-100 mt-auto">
        <Button
          type="button"
          variant="secondary"
          onClick={() => onEdit?.(item)}
        >
          Edit
        </Button>
        <Button
          type="button"
          variant="danger"
          onClick={() => onDelete?.(item)}
        >
          Delete
        </Button>
      </div>
    </div>
  );
}
