import { Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import PublicPortfolio from './pages/PublicPortfolio';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './pages/dashboard/DashboardLayout';
import Overview from './pages/dashboard/Overview';
import Projects from './pages/dashboard/Projects';
import Experience from './pages/dashboard/Experience';
import OpenSource from './pages/dashboard/OpenSource';
import Certifications from './pages/dashboard/Certifications';
import Skills from './pages/dashboard/Skills';

export function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/u/:username" element={<PublicPortfolio />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="projects" element={<Projects />} />
        <Route path="experience" element={<Experience />} />
        <Route path="opensource" element={<OpenSource />} />
        <Route path="certifications" element={<Certifications />} />
        <Route path="skills" element={<Skills />} />
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
