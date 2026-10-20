import TagBadge from '../ui/TagBadge';
import { isHttpUrl, formatDate } from '../../utils/format';

export default function CertificationsSection({ items = [] }) {
  const publicItems = Array.isArray(items)
    ? items.filter((item) => item?.isPublic === true)
    : [];

  if (publicItems.length === 0) {
    return null;
  }

  const sortedItems = [...publicItems].sort((a, b) => {
    const aDate =
      typeof a?.completedOn === 'string' ? a.completedOn.trim() : '';
    const bDate =
      typeof b?.completedOn === 'string' ? b.completedOn.trim() : '';

    if (aDate && !bDate) return -1;
    if (!aDate && bDate) return 1;
    if (!aDate && !bDate) return 0;

    return bDate.localeCompare(aDate);
  });

  return (
    <section
      aria-labelledby="portfolio-certifications-heading"
      className="space-y-6"
    >
      <h2
        id="portfolio-certifications-heading"
        className="text-2xl font-bold text-slate-900 tracking-tight"
      >
        Certifications
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {sortedItems.map((cert, idx) => (
          <div
            key={cert?._id || idx}
            className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
          >
            <div className="space-y-2">
              <div>
                {cert?.title && (
                  <h3 className="text-base sm:text-lg font-semibold text-slate-900 break-words">
                    {cert.title}
                  </h3>
                )}
                {cert?.issuer && (
                  <p className="text-sm font-medium text-slate-500 break-words mt-0.5">
                    {cert.issuer}
                  </p>
                )}
              </div>

              {cert?.completedOn && formatDate(cert.completedOn) && (
                <p className="text-xs font-medium text-slate-500">
                  Completed {formatDate(cert.completedOn)}
                </p>
              )}

              {cert?.credentialId && (
                <p className="text-xs text-slate-600 break-words">
                  Credential ID: {cert.credentialId}
                </p>
              )}

              {Array.isArray(cert?.tags) && cert.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {cert.tags.map((tag) => (
                    <TagBadge key={tag}>{tag}</TagBadge>
                  ))}
                </div>
              )}
            </div>

            {isHttpUrl(cert?.verifyUrl) && (
              <div className="pt-3 border-t border-slate-100 text-sm">
                <a
                  href={cert.verifyUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                >
                  Verify
                </a>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
