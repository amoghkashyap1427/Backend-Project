import { NavLink } from 'react-router-dom';
import useAuth from '../../hooks/useAuth';
import Button from '../ui/Button';

export default function Sidebar() {
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Overview', to: '/dashboard', end: true },
    { name: 'Projects', to: '/dashboard/projects' },
    { name: 'Experience', to: '/dashboard/experience' },
    { name: 'Open Source', to: '/dashboard/open-source' },
    { name: 'Certifications', to: '/dashboard/certifications' },
    { name: 'Skills', to: '/dashboard/skills' },
  ];

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Silently ignore logout errors; ProtectedRoute handles redirect
    }
  };

  return (
    <aside className="w-full md:w-64 md:shrink-0 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col justify-between">
      <div>
        <div className="p-4 md:px-6 md:py-5 border-b md:border-b-0 border-slate-100">
          <span className="text-xl font-bold tracking-tight text-slate-900">
            Career Tracker
          </span>
        </div>

        <nav className="flex flex-row md:flex-col gap-1 overflow-x-auto p-2 md:px-4 md:py-2">
          {navLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center px-3 py-2 text-sm rounded-lg transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 font-medium'
                }`
              }
            >
              {item.name}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-200 p-4 mt-auto">
        <div className="mb-2">
          <p className="text-sm font-semibold text-slate-800 truncate">
            {user?.name || 'Developer'}
          </p>
          {user?.username && (
            <p className="text-xs text-slate-500 truncate">@{user.username}</p>
          )}
        </div>

        {user?.username && (
          <div className="mb-3">
            <a
              href={`/u/${user.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-indigo-600 hover:text-indigo-500 underline"
            >
              View public page
            </a>
          </div>
        )}

        <Button
          variant="secondary"
          onClick={handleLogout}
          className="w-full text-xs py-1.5"
        >
          Log out
        </Button>
      </div>
    </aside>
  );
}
