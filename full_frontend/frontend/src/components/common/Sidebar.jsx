import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../../features/auth/authSlice';

const MENU_ITEMS = [
  { label: 'Dashboard', path: '/', icon: '📊' },
  { label: 'Kanban', path: '/kanban', icon: '📋' },
  { label: 'Sprint', path: '/sprint', icon: '🏃' },
  { label: 'Backlog', path: '/backlog', icon: '📑' },
  { label: 'Bugs', path: '/bugs', icon: '🐛' },
  { label: 'Team', path: '/team', icon: '👥' },
];

export default function Sidebar() {
  const location = useLocation();
  const dispatch = useDispatch();
  const user = useSelector(s => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <aside className="w-64 bg-gradient-to-b from-slate-900 to-slate-800 text-white h-screen fixed left-0 top-0 overflow-y-auto shadow-2xl">
      {/* Logo */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-lg shadow-lg">
            CF
          </div>
          <div>
            <h1 className="text-xl font-bold">CollabFlow</h1>
            <p className="text-xs text-slate-400">v1.0</p>
          </div>
        </div>
      </div>

      {/* Menu */}
      <nav className="p-4 space-y-2">
        {MENU_ITEMS.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`block px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700 hover:text-white'
              }`}
            >
              <span className="mr-2">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User Section */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900 to-transparent p-4 border-t border-slate-700">
        <div className="mb-4">
          <div className="text-sm text-slate-400">Logged in as</div>
          <div className="font-semibold text-white truncate">{user?.name || 'User'}</div>
          <div className="text-xs text-slate-400 truncate">{user?.email}</div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full px-4 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white transition-all duration-300 text-sm font-medium"
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
