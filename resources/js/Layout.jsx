import React from 'react';
import { Link } from '@inertiajs/react';

export default function Layout({ children, userRole, onLogout }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/" className="text-xl font-bold text-gray-900">FlatEase</Link>
              {userRole && <span className="text-sm text-gray-500">{userRole}</span>}
            </div>
            <div className="flex items-center gap-3">
              <Link href="/" className="text-sm text-gray-600 hover:text-gray-900">Home</Link>
              <button
                onClick={onLogout}
                className="text-sm text-red-600 hover:text-red-800"
                type="button"
              >
                Log out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  );
}
