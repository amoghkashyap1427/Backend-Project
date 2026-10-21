import TagBadge from '../ui/TagBadge';
import { formatDate } from '../../utils/format';

export default function ExperienceSection({ items = [] }) {
  const publicItems = Array.isArray(items)
    ? items.filter((item) => item?.isPublic === true)
    : [];

  if (publicItems.length === 0) {
    return null;
  }

  const sortedItems = [...publicItems].sort((a, b) => {
    const aCurrent = Boolean(a?.isCurrent);
    const bCurrent = Boolean(b?.isCurrent);

    if (aCurrent && !bCurrent) return -1;
    if (!aCurrent && bCurrent) return 1;

    const aStart = typeof a?.startDate === 'string' ? a.startDate.trim() : '';
    const bStart = typeof b?.startDate === 'string' ? b.startDate.trim() : '';

    if (aStart && !bStart) return -1;
    if (!aStart && bStart) return 1;
    if (!aStart && !bStart) return 0;

    return bStart.localeCompare(aStart);
  });

  return (
    <section
      aria-labelledby="portfolio-experience-heading"
      className="space-y-6"
    >
      <h2
        id="portfolio-experience-heading"
        className="text-2xl font-bold text-slate-900 tracking-tight"
      >
        Experience
      </h2>

      <div className="space-y-6">
        {sortedItems.map((exp, idx) => {
          const companyLocation =
            exp?.company && exp?.location
              ? `${exp.company} · ${exp.location}`
              : exp?.company || exp?.location || '';

          let dateLine = '';
          const start = formatDate(exp?.startDate);
          if (exp?.isCurrent) {
            dateLine = start ? `${start} – Present` : 'Present';
          } else if (exp?.endDate) {
            const end = formatDate(exp?.endDate);
            dateLine = start && end ? `${start} – ${end}` : (start || end);
          } else if (start) {
            dateLine = start;
          }

          return (
            <div
              key={exp?._id || idx}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 space-y-4 transition-shadow hover:shadow-md"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-1">
                <div>
                  {exp?.role && (
                    <h3 className="text-lg font-semibold text-slate-900 break-words">
                      {exp.role}
                    </h3>
                  )}
                  {companyLocation && (
                    <p className="text-sm font-medium text-slate-600 break-words mt-0.5">
                      {companyLocation}
                    </p>
                  )}
                </div>

                {dateLine && (
                  <span className="text-xs font-medium text-slate-500 shrink-0">
                    {dateLine}
                  </span>
                )}
              </div>

              {Array.isArray(exp?.bullets) && exp.bullets.length > 0 && (
                <ul className="list-disc pl-5 space-y-1.5 text-sm text-slate-600">
                  {exp.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="break-words">
                      {bullet}
                    </li>
                  ))}
                </ul>
              )}

              {Array.isArray(exp?.tags) && exp.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {exp.tags.map((tag) => (
                    <TagBadge key={tag}>{tag}</TagBadge>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
