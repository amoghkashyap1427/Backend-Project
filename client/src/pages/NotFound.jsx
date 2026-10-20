import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-4">
        <p className="text-6xl sm:text-7xl font-extrabold text-indigo-600 tracking-tight">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
          Page not found
        </h1>
        <p className="text-sm sm:text-base text-slate-600">
          The page you are looking for does not exist or has moved.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
