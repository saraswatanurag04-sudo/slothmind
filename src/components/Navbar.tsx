import React from 'react';
import {
  Sparkles,
  Shield,
  CheckCircle2,
  LogOut,
  LogIn,
  BookOpen,
  Clock,
  BarChart3,
  ShieldAlert,
} from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: 'journal' | 'history' | 'insights' | 'security' | 'walkthrough' | 'admin';
  setActiveTab: (
    tab: 'journal' | 'history' | 'insights' | 'security' | 'walkthrough' | 'admin'
  ) => void;
  onLogin: () => void;
  onLogout: () => void;
  authLoading: boolean;
  serverHealth: { status: string; aiConfigured: boolean } | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  onLogin,
  onLogout,
  authLoading,
  serverHealth,
}) => {
  const isAdmin =
    user?.email === 'saraswatanurag04@gmail.com' ||
    user?.email?.endsWith('@admin.mindreflect.internal') ||
    user?.displayName?.includes('Admin');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-[#262626] bg-[#0D0D0D]/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/60 text-indigo-400 ring-1 ring-indigo-500/30">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-display text-lg font-bold tracking-tight text-[#F3F4F6]">
                MindReflect AI
              </span>
              <span className="inline-flex items-center rounded-md bg-[#18181B] px-1.5 py-0.5 text-[11px] font-medium text-[#A1A1AA] border border-[#27272A]">
                Gemini 3.6 + Firestore
              </span>
            </div>
            <p className="hidden text-xs text-[#9CA3AF] sm:block">
              Private, Isolated Reflection & Journaling
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Only when authenticated) */}
        {user && (
          <nav className="hidden items-center space-x-1 md:flex">
            <button
              id="nav-tab-journal"
              onClick={() => setActiveTab('journal')}
              className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'journal'
                  ? 'bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-[#9CA3AF] hover:bg-[#18181B] hover:text-[#E0E0E0]'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span>New Reflection</span>
            </button>

            <button
              id="nav-tab-history"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'history'
                  ? 'bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-[#9CA3AF] hover:bg-[#18181B] hover:text-[#E0E0E0]'
              }`}
            >
              <Clock className="h-4 w-4" />
              <span>Past Entries</span>
            </button>

            <button
              id="nav-tab-insights"
              onClick={() => setActiveTab('insights')}
              className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-[#9CA3AF] hover:bg-[#18181B] hover:text-[#E0E0E0]'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
              <span>Insights</span>
            </button>

            {/* Admin Hub Tab for authorized users */}
            {isAdmin && (
              <button
                id="nav-tab-admin"
                onClick={() => setActiveTab('admin')}
                className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                  activeTab === 'admin'
                    ? 'bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-500/30'
                    : 'text-indigo-400/90 hover:bg-[#18181B] hover:text-indigo-300'
                }`}
              >
                <ShieldAlert className="h-4 w-4 text-indigo-400" />
                <span>Admin Hub</span>
              </button>
            )}

            <button
              id="nav-tab-security"
              onClick={() => setActiveTab('security')}
              className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'security'
                  ? 'bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-[#9CA3AF] hover:bg-[#18181B] hover:text-[#E0E0E0]'
              }`}
            >
              <Shield className="h-4 w-4 text-emerald-400" />
              <span>Threat Model</span>
            </button>

            <button
              id="nav-tab-walkthrough"
              onClick={() => setActiveTab('walkthrough')}
              className={`inline-flex items-center space-x-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                activeTab === 'walkthrough'
                  ? 'bg-indigo-950/80 text-indigo-300 font-semibold border border-indigo-500/30'
                  : 'text-[#9CA3AF] hover:bg-[#18181B] hover:text-[#E0E0E0]'
              }`}
            >
              <CheckCircle2 className="h-4 w-4 text-sky-400" />
              <span>Test Matrix</span>
            </button>
          </nav>
        )}

        {/* Right side: Health, User Profile & Auth */}
        <div className="flex items-center space-x-3">
          {/* Server & AI Health Indicator */}
          {serverHealth && (
            <div className="hidden items-center space-x-1.5 rounded-full border border-[#262626] bg-[#141414] px-2.5 py-1 text-xs text-[#A1A1AA] lg:flex">
              <span
                className={`h-2 w-2 rounded-full ${
                  serverHealth.aiConfigured ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'
                }`}
              />
              <span className="font-mono text-[11px]">
                {serverHealth.aiConfigured ? 'Gemini 3.6 Active' : 'API Key Ready'}
              </span>
            </div>
          )}

          {user ? (
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User Avatar'}
                    referrerPolicy="no-referrer"
                    className="h-8 w-8 rounded-full border border-[#333333] object-cover"
                  />
                ) : (
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-900 text-xs font-bold text-indigo-200 border border-indigo-700/50">
                    {user.displayName ? user.displayName.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}
                <div className="hidden text-left sm:block">
                  <p className="text-xs font-semibold text-[#E0E0E0] leading-tight flex items-center">
                    {user.displayName || 'Authenticated User'}
                    {isAdmin && (
                      <span className="ml-1.5 rounded bg-indigo-900/80 px-1 py-0.2 text-[9px] font-mono text-indigo-300 border border-indigo-700/40">
                        ADMIN
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-[#71717A] truncate max-w-[120px]">
                    {user.email || 'Google Account'}
                  </p>
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={onLogout}
                title="Sign Out"
                className="inline-flex h-8 items-center justify-center rounded-lg border border-[#262626] bg-[#141414] px-2.5 text-xs font-medium text-[#D1D5DB] shadow-xs transition hover:bg-[#1E1E1E] hover:text-white"
              >
                <LogOut className="h-3.5 w-3.5 sm:mr-1.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            </div>
          ) : (
            <button
              id="btn-nav-login"
              onClick={onLogin}
              disabled={authLoading}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-medium text-white shadow-xs transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <LogIn className="mr-1.5 h-3.5 w-3.5" />
              {authLoading ? 'Signing In...' : 'Sign In with Google'}
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      {user && (
        <div className="flex overflow-x-auto border-t border-[#262626] bg-[#0A0A0A] px-4 py-2 md:hidden">
          <div className="flex space-x-2 text-xs">
            <button
              onClick={() => setActiveTab('journal')}
              className={`rounded-md px-2.5 py-1 ${
                activeTab === 'journal' ? 'bg-indigo-600 text-white font-medium' : 'text-[#9CA3AF]'
              }`}
            >
              Reflection
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`rounded-md px-2.5 py-1 ${
                activeTab === 'history' ? 'bg-indigo-600 text-white font-medium' : 'text-[#9CA3AF]'
              }`}
            >
              History
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`rounded-md px-2.5 py-1 ${
                activeTab === 'insights' ? 'bg-indigo-600 text-white font-medium' : 'text-[#9CA3AF]'
              }`}
            >
              Insights
            </button>
            {isAdmin && (
              <button
                onClick={() => setActiveTab('admin')}
                className={`rounded-md px-2.5 py-1 ${
                  activeTab === 'admin' ? 'bg-indigo-600 text-white font-medium' : 'text-indigo-400'
                }`}
              >
                Admin Hub
              </button>
            )}
            <button
              onClick={() => setActiveTab('security')}
              className={`rounded-md px-2.5 py-1 ${
                activeTab === 'security' ? 'bg-indigo-600 text-white font-medium' : 'text-[#9CA3AF]'
              }`}
            >
              Threat Model
            </button>
            <button
              onClick={() => setActiveTab('walkthrough')}
              className={`rounded-md px-2.5 py-1 ${
                activeTab === 'walkthrough' ? 'bg-indigo-600 text-white font-medium' : 'text-[#9CA3AF]'
              }`}
            >
              Test Matrix
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
