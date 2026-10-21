import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../lib/api';
import { mockPublicProfile } from '../lib/mockData';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import ExperienceSection from '../components/portfolio/ExperienceSection';
import ProjectsSection from '../components/portfolio/ProjectsSection';
import OpenSourceSection from '../components/portfolio/OpenSourceSection';
import CertificationsSection from '../components/portfolio/CertificationsSection';
import SkillsSection from '../components/portfolio/SkillsSection';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export default function PublicPortfolio() {
  const { username } = useParams();
  const name = (username || '').toLowerCase();

  const [result, setResult] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Derived loading state: when result is null or name has changed
  const loading = result === null || result.name !== name;

  useEffect(() => {
    let ignore = false;

    if (USE_MOCK) {
      Promise.resolve().then(() => {
        if (!ignore) {
          const mockUsername = (
            mockPublicProfile.profile?.username ||
            mockPublicProfile.user?.username ||
            ''
          ).toLowerCase();
          if (name === mockUsername) {
            setResult({ name, status: 'ok', data: mockPublicProfile });
          } else {
            setResult({ name, status: 'notfound', data: null });
          }
        }
      });

      return () => {
        ignore = true;
      };
    }

    api
      .get(`/public/${encodeURIComponent(name)}`)
      .then((res) => {
        if (!ignore) {
          setResult({ name, status: 'ok', data: res.data });
        }
      })
      .catch((err) => {
        if (!ignore) {
          if (err.response?.status === 404) {
            setResult({ name, status: 'notfound', data: null });
          } else {
            setResult({ name, status: 'error', data: null });
          }
        }
      });

    return () => {
      ignore = true;
    };
  }, [name, reloadKey]);

  // Document title updater
  useEffect(() => {
    const profile = result?.data?.profile || result?.data?.user;
    if (result?.status === 'ok' && profile?.name) {
      const prevTitle = document.title;
      document.title = `${profile.name} | Career Tracker`;
      return () => {
        document.title = prevTitle;
      };
    }
  }, [result]);

  const handleRetry = () => {
    setResult(null);
    setReloadKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <Spinner />
      </main>
    );
  }

  if (result?.status === 'notfound') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full text-center bg-white rounded-xl border border-slate-200 shadow-sm p-8 space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">
            Profile not found
          </h1>
          <p className="text-sm text-slate-600">
            We couldn&apos;t find anyone with the username &quot;@{name}&quot;.
          </p>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center justify-center font-medium rounded-lg text-sm px-4 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 transition-colors shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
            >
              Go to the home page
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (result?.status === 'error') {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full text-center bg-white rounded-xl border border-red-200 shadow-sm p-8 space-y-4">
          <p className="text-base font-medium text-red-700">
            Something went wrong while loading this profile.
          </p>
          <Button variant="secondary" onClick={handleRetry}>
            Try again
          </Button>
        </div>
      </main>
    );
  }

  const data = result?.data || {};
  const profile = data.profile || data.user || {};
  const experience = Array.isArray(data?.experience) ? data.experience : [];
  const projects = Array.isArray(data?.projects) ? data.projects : [];
  const openSource = Array.isArray(data?.openSource) ? data.openSource : [];
  const certifications = Array.isArray(data?.certifications)
    ? data.certifications
    : [];
  const skills = Array.isArray(data?.skills) ? data.skills : [];

  const hasAnyPublicItems = [
    experience,
    projects,
    openSource,
    certifications,
    skills,
  ].some((list) => list.some((item) => item?.isPublic === true));

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
        {/* Profile Header */}
        <header className="border-b border-slate-200 pb-8 space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {profile.name}
          </h1>
          <p className="text-lg font-medium text-indigo-600">
            @{profile.username || name}
          </p>
          {profile.bio && (
            <p className="text-slate-600 text-base max-w-2xl leading-relaxed whitespace-pre-line">
              {profile.bio}
            </p>
          )}
        </header>

        {/* Portfolio Content or Empty State */}
        {hasAnyPublicItems ? (
          <div className="space-y-12">
            <ExperienceSection items={experience} />
            <ProjectsSection items={projects} />
            <OpenSourceSection items={openSource} />
            <CertificationsSection items={certifications} />
            <SkillsSection items={skills} />
          </div>
        ) : (
          <p className="text-slate-500 text-base italic py-8 text-center sm:text-left">
            Nothing to show here yet.
          </p>
        )}

        {/* Footer */}
        <footer className="border-t border-slate-200 pt-8 mt-16 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <span>Built with Career Tracker</span>
          <Link
            to="/register"
            className="font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
          >
            Create your own portfolio
          </Link>
        </footer>
      </div>
    </main>
  );
}
