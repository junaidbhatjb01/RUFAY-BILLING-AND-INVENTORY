
import React, { ReactNode, useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { useData } from '../../contexts/DataContext';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const { settings } = useData();

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200">
      <Sidebar isSidebarOpen={isSidebarOpen} setSidebarOpen={setSidebarOpen} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header setSidebarOpen={setSidebarOpen} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 dark:bg-gray-900 p-4 md:p-6">
          {children}
          <footer className="text-center text-xs text-gray-500 mt-8 print:hidden">
            <p>{settings.businessName} – Bill Fast. Grow Smart.</p>
          </footer>
        </main>
      </div>
    </div>
  );
};

export default Layout;