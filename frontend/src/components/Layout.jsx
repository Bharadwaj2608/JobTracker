import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon, BriefcaseIcon, PlusCircleIcon, ArrowRightOnRectangleIcon,
  SunIcon, MoonIcon, Bars3Icon, XMarkIcon, UserCircleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';
import {
  ChatBubbleLeftRightIcon, DocumentMagnifyingGlassIcon
} from '@heroicons/react/24/outline';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', Icon: HomeIcon, end: false },
  { to: '/jobs', label: 'Applications', Icon: BriefcaseIcon, end: true },
  { to: '/jobs/add', label: 'Add New', Icon: PlusCircleIcon, end: true },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navItems = [
    { to: '/dashboard',       label: 'Dashboard',       Icon: HomeIcon,                    end: false },
    { to: '/jobs',            label: 'Applications',    Icon: BriefcaseIcon,               end: true  },
    { to: '/jobs/add',        label: 'Add New',         Icon: PlusCircleIcon,              end: true  },
    { to: '/ai-coach',        label: 'AI Coach',        Icon: ChatBubbleLeftRightIcon,     end: true  },
    { to: '/resume-analyser', label: 'Resume Analyser', Icon: DocumentMagnifyingGlassIcon, end: true  },
  ];

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      

      <aside
      
        className={`fixed lg:sticky lg:top-0 lg:h-screen inset-y-0 left-0 z-30 w-64 flex flex-col
  bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800
  transform transition-transform duration-300 ease-in-out flex-shrink-0
  ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}

      >
        
        {/* Logo */}
        <div className="flex items-center justify-between px-5 pt-6 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center">
              <BriefcaseIcon className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-lg text-gray-900 dark:text-white">JobTrackr</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-2 space-y-1">
          {navItems.map(({ to, label, Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150
                     ${isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-100'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-800 space-y-1">
          <button
            onClick={toggle}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            {dark ? 'Light Mode' : 'Dark Mode'}
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
              text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
            Logout
          </button>
        </div>

        {/* User info */}
        <div className="p-4 border-t border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
              {initials || <UserCircleIcon className="w-5 h-5" />}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 truncate">{user?.name}</p>
              <p className="text-xs text-gray-400 truncate">{user?.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar (mobile) */}
        <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-surface-900 border-b border-gray-100 dark:border-gray-800">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-600 dark:text-gray-300">
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="font-display font-bold text-base text-gray-900 dark:text-white">JobTrackr</span>
          <button onClick={toggle} className="text-gray-600 dark:text-gray-300">
            {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
