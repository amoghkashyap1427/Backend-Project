import TagBadge from '../ui/TagBadge';
import { isHttpUrl } from '../../utils/format';

const statusStyles = {
  open: 'bg-blue-50 text-blue-700 border-blue-200',
  merged: 'bg-purple-50 text-purple-700 border-purple-200',
  closed: 'bg-slate-100 text-slate-700 border-slate-200',
};

export default function OpenSourceSection({ items = [] }) {
  const publicItems = Array.isArray(items)
    ? items.filter((item) => item?.isPublic !== false)
    : [];

  if (publicItems.length === 0) {
    return null;
  }

  return (
    <section
      aria-labelledby="portfolio-opensource-heading"
      className="space-y-6"
    >
      <h2
        id="portfolio-opensource-heading"
        className="text-2xl font-bold text-slate-900 tracking-tight"
      >
        Open Source
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {publicItems.map((item, idx) => (
          <div
            key={item?._id || idx}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {item?.prTitle && (
                    <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words line-clamp-2">
                      {item.prTitle}
                    </h3>
                  )}
                  {item?.repository && (
                    <p className="text-sm font-medium text-slate-500 break-words mt-0.5">
                      {item.repository}
                    </p>
                  )}
                </div>

                {item?.status && (
                  <span
                    className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border capitalize ${
                      statusStyles[item.status.toLowerCase()] ||
                      'bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    {item.status}
                  </span>
                )}
              </div>

              {item?.description && (
                <p className="text-sm text-slate-600 break-words whitespace-pre-line">
                  {item.description}
                </p>
              )}

              {Array.isArray(item?.tags) && item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {item.tags.map((tag) => (
                    <TagBadge key={tag}>{tag}</TagBadge>
                  ))}
                </div>
              )}
            </div>

            {isHttpUrl(item?.prUrl) && (
              <div className="pt-3 border-t border-slate-100 text-sm">
                <a
                  href={item.prUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                >
                  View PR
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
