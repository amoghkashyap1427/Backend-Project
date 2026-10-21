import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Landing() {
  const { user, loading } = useAuth();

  const currentYear = new Date().getFullYear();

  const features = [
    {
      title: 'Projects',
      description:
        'Showcase your full stack and frontend applications with live demo links, repository URLs, and architecture notes.',
    },
    {
      title: 'Experience',
      description:
        'Chronicle your professional work history, roles, internships, and key deliverables with bullet points.',
    },
    {
      title: 'Open Source',
      description:
        'Highlight your pull requests across open source repositories with status badges and PR links.',
    },
    {
      title: 'Certifications',
      description:
        'Document your verified industry credentials, issuing organizations, and credential verification links.',
    },
    {
      title: 'Skills',
      description:
        'Organize your technical proficiencies across languages, frameworks, robotics, and cloud DevOps.',
    },
    {
      title: 'Public or private',
      description:
        'Every item has its own visibility toggle and only public items appear on /u/your-username.',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Create your account',
      description:
        'Sign up in seconds and choose your personalized username to reserve your portfolio URL.',
    },
    {
      number: '2',
      title: 'Add your work and mark what to share',
      description:
        'Add projects, experience, PRs, certs, and skills with individual visibility toggles.',
    },
    {
      number: '3',
      title: 'Share your link at /u/your-username',
      description:
        'Share your public link with recruiters, engineering managers, and collaborators.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between">
      {/* Top Bar Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="text-xl font-bold text-slate-900 tracking-tight hover:text-indigo-600 transition-colors"
          >
            Career Tracker
          </Link>

          <nav aria-label="Main Navigation">
            {loading ? (
              <div className="h-9 w-32" aria-hidden="true" />
            ) : user ? (
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                Go to dashboard
              </Link>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-3.5 py-2 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Get started
                </Link>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 space-y-24">
          {/* Hero Section */}
          <section className="text-center max-w-3xl mx-auto space-y-6">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
              All your developer work, in one public portfolio
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 leading-relaxed">
              Track your internships, projects, open source contributions,
              certifications, and skills in one organized dashboard. You choose
              what is public, and share your clean portfolio with recruiters and
              peers.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
              {loading ? (
                <div className="h-11 w-44" aria-hidden="true" />
              ) : user ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center justify-center font-medium rounded-lg text-base px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                >
                  Go to dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center font-medium rounded-lg text-base px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                  >
                    Get started
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center justify-center font-medium rounded-lg text-base px-6 py-3 bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </section>

          {/* Features Section */}
          <section aria-labelledby="features-heading" className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2
                id="features-heading"
                className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
              >
                Everything you need to showcase your work
              </h2>
              <p className="text-slate-600 text-base">
                Curate every dimension of your technical journey in structured,
                scannable cards.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-2 hover:shadow-md transition-shadow"
                >
                  <h3 className="text-lg font-semibold text-slate-900">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* How It Works Section */}
          <section aria-labelledby="how-it-works-heading" className="space-y-8">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <h2
                id="how-it-works-heading"
                className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight"
              >
                How it works
              </h2>
              <p className="text-slate-600 text-base">
                From signup to a live public profile in three simple steps.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-4"
                >
                  <span className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-indigo-50 text-indigo-600 font-bold text-lg border border-indigo-200">
                    {step.number}
                  </span>
                  <h3 className="text-lg font-semibold text-slate-900">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <p className="font-medium text-slate-700">Career Tracker</p>
          <p>&copy; {currentYear} Career Tracker. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
