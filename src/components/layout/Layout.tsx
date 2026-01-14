import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import CommandPalette from '../CommandPalette';
import { useApp } from '../../context/AppContext';

export default function Layout() {
  const { sidebarCollapsed, currentUser } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-surface-100 flex items-center justify-center">
        <div className="card p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">F</span>
          </div>
          <h1 className="text-2xl font-bold text-text-primary mb-2">Welcome to Foxhole</h1>
          <p className="text-text-secondary mb-6">Enterprise Operating System for Neofox</p>
          <p className="text-sm text-text-muted">Please log in to continue</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface-100">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          sidebarCollapsed ? 'ml-20' : 'ml-64'
        }`}
      >
        <Header />
        <main className="p-6 min-h-[calc(100vh-4rem)]">
          <Outlet />
        </main>
      </div>
      {/* Command Palette - accessible via Cmd/Ctrl + K */}
      <CommandPalette />
    </div>
  );
}
