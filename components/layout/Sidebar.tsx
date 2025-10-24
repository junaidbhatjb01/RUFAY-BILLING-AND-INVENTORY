import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { DashboardIcon, InvoiceIcon, ProductIcon, PartyIcon, ExpenseIcon, ReportIcon, SettingsIcon, XIcon, MoneyIcon, PlaneIcon, TicketIcon, InformationCircleIcon } from '../ui/Icons';
import { useAuth } from '../../contexts/AuthContext';

interface SidebarProps {
  isSidebarOpen: boolean;
  setSidebarOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setSidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
      logout();
      navigate('/login');
  };
  
  const NavLinksContent: React.FC = () => {
    const { user } = useAuth();
    
    const navSections = [
        {
            links: [
                { to: '/', text: 'Dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
            ]
        },
        {
            title: "Online Booking",
            links: [
                { to: '/flight-search', text: 'Flight Search', icon: <PlaneIcon className="w-5 h-5" /> },
                { to: '/pending-bookings', text: 'Pending Bookings', icon: <TicketIcon className="w-5 h-5" /> },
                { to: '/confirmed-bookings', text: 'Confirmed Bookings', icon: <TicketIcon className="w-5 h-5" /> },
            ]
        },
        {
            title: "Sales",
            links: [
                { to: '/invoices', text: 'Billing / Invoices', icon: <InvoiceIcon className="w-5 h-5" /> },
                { to: '/sales-orders', text: 'Sales Orders', icon: <InvoiceIcon className="w-5 h-5" /> },
                { to: '/quotations', text: 'Quotations', icon: <InvoiceIcon className="w-5 h-5" /> },
            ]
        },
        {
            title: "Travel Inventory",
            links: [
                { to: '/bookings', text: 'Offline Bookings', icon: <TicketIcon className="w-5 h-5" /> },
                { to: '/series', text: 'Series (Tickets)', icon: <PlaneIcon className="w-5 h-5" /> },
            ]
        },
        {
            title: "Management",
            links: [
                { to: '/stock', text: 'Stock / Inventory', icon: <ProductIcon className="w-5 h-5" /> },
                { to: '/parties', text: 'Customers / Suppliers', icon: <PartyIcon className="w-5 h-5" /> },
                { to: '/expenses', text: 'Expenses', icon: <ExpenseIcon className="w-5 h-5" /> },
                { to: '/payments', text: 'Payments', icon: <MoneyIcon className="w-5 h-5" /> },
            ]
        },
        ...(user?.role === 'admin' ? [{
            title: "Admin",
            links: [
                { to: '/reports', text: 'Reports', icon: <ReportIcon className="w-5 h-5" /> },
                { to: '/settings', text: 'Settings', icon: <SettingsIcon className="w-5 h-5" /> },
            ]
        }] : []),
         {
            links: [
                 { to: '/about', text: 'About RuFay', icon: <InformationCircleIcon className="w-5 h-5" /> },
            ]
        }
    ];

    return (
        <nav className="mt-4 flex-1">
            {navSections.map((section, index) => (
                <div key={index} className="mb-4">
                    {section.title && <h3 className="px-4 mb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">{section.title}</h3>}
                    {section.links.map(link => (
                         <NavLink
                            key={link.to}
                            to={link.to}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) => 
                                `flex items-center px-4 py-2 mt-1 text-sm rounded transition-colors duration-200 ${
                                isActive 
                                    ? 'bg-teal-600 text-white' 
                                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                }`
                            }
                        >
                            {link.icon}
                            <span className="ml-3">{link.text}</span>
                        </NavLink>
                    ))}
                </div>
            ))}
        </nav>
    );
  };

  const sidebarContent = (
      <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <h2 className="text-xl font-bold text-teal-700 dark:text-teal-400">RuFay</h2>
              <button onClick={() => setSidebarOpen(false)} className="md:hidden"><XIcon className="w-6 h-6"/></button>
          </div>
          <div className="p-2 flex-1 flex flex-col overflow-y-auto">
              <NavLinksContent />
              <div className="mt-auto">
                   <p className="text-xs text-center text-gray-500 mb-2">Logged in as {user?.email}</p>
                   <button onClick={handleLogout} className="w-full text-center bg-red-500 text-white py-2 rounded-md hover:bg-red-600">
                      Logout
                   </button>
              </div>
          </div>
      </div>
  );

  return (
    <>
      {/* Mobile Sidebar */}
      <div 
        className={`fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity md:hidden print:hidden ${isSidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setSidebarOpen(false)}
      ></div>
      <div className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-800 transform md:hidden transition-transform duration-300 print:hidden ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-gray-800 border-r dark:border-gray-700 p-2 print:hidden">
         <div className="flex flex-col h-full">
            <div className="p-2">
                <h2 className="text-2xl font-bold text-teal-700 dark:text-teal-400 text-center">RuFay</h2>
                <p className="text-xs text-gray-500 text-center">Bill Fast. Grow Smart.</p>
            </div>
            <div className="overflow-y-auto">
                <NavLinksContent />
            </div>
            <div className="mt-auto p-2">
                <p className="text-xs text-center text-gray-500 mb-2">Logged in as {user?.email} ({user?.role})</p>
                <button onClick={handleLogout} className="w-full text-center bg-red-500 text-white py-2 rounded-md hover:bg-red-600">
                    Logout
                </button>
            </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;