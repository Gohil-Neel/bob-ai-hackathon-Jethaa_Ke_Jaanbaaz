import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopBar from './TopBar';

export default function AppShell() {
  return (
    <div className="bg-bg-app font-body-default text-body-default text-on-surface antialiased min-h-screen">
      <Sidebar />
      <div className="pl-[230px] flex flex-col min-h-screen">
        <TopBar />
        <main className="w-full pt-14 bg-bg-app px-6 py-6 min-h-screen">
          <div className="flex flex-col w-full gap-3 pb-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
