import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/dashboard/Sidebar';

export default function DashboardLayout() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      <Sidebar />
      <main className="flex-1 p-6 md:p-8 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
