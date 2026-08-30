import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, loginWithGoogle, logoutUser, subscribeToEntries } from './lib/firebase';
import { JournalEntry, UserProfile } from './types';
import { Navbar } from './components/Navbar';
import { LandingView } from './components/LandingView';
import { JournalEditor } from './components/JournalEditor';
import { EntryHistory } from './components/EntryHistory';
import { ReflectionInsights } from './components/ReflectionInsights';
import { ThreatModelModal } from './components/ThreatModelModal';
import { WalkthroughModal } from './components/WalkthroughModal';
import { AdminDashboard } from './components/AdminDashboard';

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | null>(null);
  const [activeTab, setActiveTab] = useState<
    'journal' | 'history' | 'insights' | 'security' | 'walkthrough' | 'admin'
  >('journal');
  const [serverHealth, setServerHealth] = useState<{
    status: string;
    aiConfigured: boolean;
  } | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check server health
  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => {
        setServerHealth({
          status: data.status,
          aiConfigured: data.aiConfigured,
        });
      })
      .catch((err) => {
        console.warn('Server health check failed:', err);
      });
  }, []);

  // Listen to Firebase Authentication State Changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      if (user) {
        setCurrentUser({
          uid: user.uid,
          displayName: user.displayName,
          email: user.email,
          photoURL: user.photoURL,
        });
      } else {
        setCurrentUser(null);
        setEntries([]);
        setSelectedEntry(null);
      }
      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Subscribe to Cloud Firestore entries when user is authenticated
  useEffect(() => {
    if (!currentUser?.uid) return;

    const unsubscribeFirestore = subscribeToEntries(
      currentUser.uid,
      (userEntries) => {
        setEntries(userEntries);
      },
      (err) => {
        console.error('Firestore subscription error:', err);
      }
    );

    return () => unsubscribeFirestore();
  }, [currentUser?.uid]);

  // Handle Login via Google
  const handleLogin = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      await loginWithGoogle();
      setActiveTab('journal');
    } catch (err: any) {
      console.error('Authentication Error:', err);
      setAuthError(err.message || 'Failed to sign in with Google. Please try again.');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await logoutUser();
      setActiveTab('journal');
      setSelectedEntry(null);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  // Start a fresh reflection session
  const handleNewSession = () => {
    setSelectedEntry(null);
    setActiveTab('journal');
  };

  // Select an entry from history to view or continue
  const handleSelectEntry = (entry: JournalEntry) => {
    setSelectedEntry(entry);
    setActiveTab('journal');
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E0E0E0] flex flex-col selection:bg-indigo-900 selection:text-indigo-200">
      {/* Top Navigation */}
      <Navbar
        user={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogin={handleLogin}
        onLogout={handleLogout}
        authLoading={authLoading}
        serverHealth={serverHealth}
      />

      {/* Global Auth Error Banner */}
      {authError && (
        <div className="bg-rose-950/60 border-b border-rose-800/60 px-4 py-2.5 text-center text-xs text-rose-300">
          <span>{authError}</span>
          <button
            onClick={() => setAuthError(null)}
            className="ml-2 font-semibold underline hover:text-rose-100"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1">
        {authLoading ? (
          <div className="flex h-96 items-center justify-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="h-8 w-8 animate-spin rounded-full border-3 border-indigo-500 border-t-transparent" />
              <p className="text-xs font-mono text-[#A1A1AA]">
                Verifying secure session...
              </p>
            </div>
          </div>
        ) : !currentUser ? (
          <LandingView onLogin={handleLogin} authLoading={authLoading} />
        ) : (
          <div>
            {activeTab === 'journal' && (
              <JournalEditor
                user={currentUser}
                initialEntry={selectedEntry}
                onEntrySaved={(saved) => {
                  setSelectedEntry(saved);
                }}
                onNewSession={handleNewSession}
              />
            )}

            {activeTab === 'history' && (
              <EntryHistory
                user={currentUser}
                entries={entries}
                onSelectEntry={handleSelectEntry}
                onNewReflection={handleNewSession}
              />
            )}

            {activeTab === 'insights' && (
              <ReflectionInsights
                entries={entries}
                onNewReflection={handleNewSession}
              />
            )}

            {activeTab === 'admin' && <AdminDashboard user={currentUser} />}

            {activeTab === 'security' && <ThreatModelModal />}

            {activeTab === 'walkthrough' && <WalkthroughModal />}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#262626] bg-[#0D0D0D] py-6 text-center text-xs text-[#71717A]">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <span className="font-semibold text-[#E0E0E0]">MindReflect AI</span>
            <span>•</span>
            <span>Gemini 3.6 Flash Fallback Architecture</span>
          </div>
          <div className="text-[#71717A] text-[11px]">
            User-Isolated Cloud Firestore • Zero-Hardcoded Secrets • OWASP Top 10 Compliant
          </div>
        </div>
      </footer>
    </div>
  );
}
