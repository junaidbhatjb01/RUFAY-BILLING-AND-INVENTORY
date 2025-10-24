
import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { SunIcon, MoonIcon, MenuIcon } from '../ui/Icons';
import { useData } from '../../contexts/DataContext';

interface HeaderProps {
  setSidebarOpen: (isOpen: boolean) => void;
}

const Header: React.FC<HeaderProps> = ({ setSidebarOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { settings } = useData();

  return (
    <header className="flex items-center justify-between px-4 py-2 bg-white dark:bg-gray-800 border-b dark:border-gray-700 print:hidden">
      <div className="flex items-center">
        <button onClick={() => setSidebarOpen(true)} className="text-gray-500 dark:text-gray-300 focus:outline-none md:hidden">
          <MenuIcon className="w-6 h-6" />
        </button>
        <h1 className="text-lg font-semibold text-teal-700 dark:text-teal-400 ml-2 md:ml-0">
          {settings.businessName}
        </h1>
      </div>
      <div className="flex items-center">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 focus:outline-none"
        >
          {theme === 'light' ? <MoonIcon className="w-5 h-5" /> : <SunIcon className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
};

export default Header;