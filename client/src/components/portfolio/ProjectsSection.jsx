import TagBadge from '../ui/TagBadge';
import { isHttpUrl } from '../../utils/format';

export default function ProjectsSection({ items = [] }) {
  const publicItems = Array.isArray(items)
    ? items.filter((item) => item?.isPublic !== false)
    : [];

  if (publicItems.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="portfolio-projects-heading" className="space-y-6">
      <h2
        id="portfolio-projects-heading"
        className="text-2xl font-bold text-slate-900 tracking-tight"
      >
        Projects
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {publicItems.map((project, idx) => {
          const firstMedia = Array.isArray(project?.media)
            ? project.media[0]
            : null;
          const hasImage = isHttpUrl(firstMedia);

          return (
            <div
              key={project?._id || idx}
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 sm:p-6 flex flex-col justify-between gap-4 transition-shadow hover:shadow-md"
            >
              <div className="space-y-4">
                {hasImage && (
                  <img
                    src={firstMedia}
                    alt={project.title || 'Project preview'}
                    loading="lazy"
                    className="w-full h-48 object-cover rounded-lg border border-slate-100"
                  />
                )}

                <div>
                  {project?.title && (
                    <h3 className="text-lg font-semibold text-slate-900 break-words">
                      {project.title}
                    </h3>
                  )}
                  {project?.description && (
                    <p className="mt-2 text-sm text-slate-600 break-words whitespace-pre-line">
                      {project.description}
                    </p>
                  )}
                </div>

                {project?.architecture && (
                  <div className="space-y-1 rounded-lg bg-slate-50 p-3 border border-slate-100">
                    <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                      Architecture
                    </span>
                    <p className="text-sm text-slate-600 break-words">
                      {project.architecture}
                    </p>
                  </div>
                )}

                {Array.isArray(project?.techStack) &&
                project.techStack.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.techStack.map((tech) => (
                      <span
                        key={tech}
                        className="inline-flex items-center rounded-md bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                ) : Array.isArray(project?.tags) &&
                  project.tags.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {project.tags.map((tag) => (
                      <TagBadge key={tag}>{tag}</TagBadge>
                    ))}
                  </div>
                ) : null}
              </div>

              {(isHttpUrl(project?.repoUrl) || isHttpUrl(project?.liveUrl)) && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100 text-sm">
                  {isHttpUrl(project?.repoUrl) && (
                    <a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                    >
                      Repo
                    </a>
                  )}
                  {isHttpUrl(project?.liveUrl) && (
                    <a
                      href={project.liveUrl}
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
          );
        })}
      </div>
    </section>
  );
}
