import { Link } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';

export default function Overview() {
  const { user } = useAuth();

  const firstName = user?.name?.trim()?.split(/\s+/)[0];
  const heading = firstName ? `Welcome back, ${firstName}` : 'Welcome back';

  const categories = [
    {
      title: 'Projects',
      to: '/dashboard/projects',
      description: 'Showcase your applications, architectures, and repositories.',
    },
    {
      title: 'Experience',
      to: '/dashboard/experience',
      description: 'Track your employment history, roles, and key achievements.',
    },
    {
      title: 'Open Source',
      to: '/dashboard/open-source',
      description: 'Highlight your pull requests, contributions, and community work.',
    },
    {
      title: 'Certifications',
      to: '/dashboard/certifications',
      description: 'Display your verified credentials, licenses, and course completions.',
    },
    {
      title: 'Skills',
      to: '/dashboard/skills',
      description: 'Organize your technical competencies, frameworks, and languages.',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          {heading}
        </h1>
        <p className="mt-1 text-sm sm:text-base text-slate-600">
          Manage your developer portfolio, projects, and career milestones from here.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((card) => (
          <Link
            key={card.to}
            to={card.to}
            className="group block p-6 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all"
          >
            <h2 className="text-lg font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {card.title}
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              {card.description}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
