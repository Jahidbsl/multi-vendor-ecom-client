'use client';
import { Bell, Search, Sun, Moon } from 'lucide-react';

export default function Header({ user, toggleTheme, isDark }) {
  return (
    <header className={`h-16 border-b flex items-center px-8 ${isDark ? 'bg-gray-950 border-gray-800' : 'bg-white border-gray-200'}`}>
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search products, orders..."
            className={`w-full pl-11 py-3 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 ${isDark ? 'bg-gray-900 border border-gray-700' : 'bg-gray-100 border border-gray-300'}`}
          />
        </div>
      </div>

      <div className="flex items-center gap-5 ml-auto">
        <button onClick={toggleTheme} className="p-2 rounded-xl hover:bg-gray-800">
          {isDark ? <Sun size={20} /> : <Moon size={20} />}
        </button>

        <button className="relative p-2">
          <Bell size={20} />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="font-medium">{user.name || user.email}</p>
            <p className="text-xs text-purple-500 capitalize">{user.role}</p>
          </div>
          <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-amber-500 rounded-2xl flex items-center justify-center text-white font-bold">
            {user.name?.[0] || 'S'}
          </div>
        </div>
      </div>
    </header>
  );
}