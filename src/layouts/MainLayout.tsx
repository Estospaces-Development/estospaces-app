import { useState, ReactNode } from 'react';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
// @ts-ignore
import DashboardFooter from '../components/Dashboard/DashboardFooter';

// @ts-ignore
import LakshmiAssistant from '../components/Dashboard/LakshmiAssistant';
// @ts-ignore
import { PropertiesProvider } from '../contexts/PropertiesContext';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <PropertiesProvider>
      <div className="min-h-screen bg-gray-50 dark:bg-black font-manager transition-colors duration-300">
        <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
        <div className={`flex flex-col min-h-screen transition-all duration-300 ${sidebarOpen ? 'ml-64' : 'ml-20'}`}>
          <Header onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 font-manager bg-gray-50 dark:bg-black transition-colors duration-300">
            <div className="mx-auto max-w-[1600px] w-full h-full animate-fadeIn">
              {children}
            </div>
          </main>
          <DashboardFooter />
        </div>
        <LakshmiAssistant />
      </div>
    </PropertiesProvider>
  );
};

export default MainLayout;
