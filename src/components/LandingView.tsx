import React from 'react';
import { Sparkles, Shield, Lock, Brain, Database, ArrowRight, CheckCircle2, FileText, HeartHandshake } from 'lucide-react';

interface LandingViewProps {
  onLogin: () => void;
  authLoading: boolean;
}

export const LandingView: React.FC<LandingViewProps> = ({ onLogin, authLoading }) => {
  return (
    <div className="relative overflow-hidden py-12 sm:py-16 lg:py-20">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        {/* Main Hero Card */}
        <div className="relative rounded-3xl border border-[#262626] bg-gradient-to-b from-[#141414] via-[#101010] to-[#0D0D0D] p-8 shadow-xl sm:p-12 md:p-16">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="inline-flex items-center space-x-2 rounded-full border border-indigo-500/30 bg-indigo-950/50 px-3.5 py-1 text-xs font-medium text-indigo-300 mb-6">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span>Multi-Turn Journaling with Gemini 3.6 Flash & Cloud Firestore</span>
            </div>

            {/* Main Headline */}
            <h1 className="font-display text-4xl font-bold tracking-tight text-[#F3F4F6] sm:text-5xl md:text-6xl">
              A private space for <span className="italic text-indigo-400">clear thinking</span> and deeper reflection.
            </h1>

            <p className="mt-6 text-lg leading-relaxed text-[#9CA3AF]">
              Converse with Gemini to unpack your thoughts, brainstorm ideas, generate action plans, and synthesize daily reflections. Every entry is isolated in Cloud Firestore strictly bound to your authenticated identity.
            </p>

            {/* Call to Action Buttons */}
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button
                id="btn-hero-login"
                onClick={onLogin}
                disabled={authLoading}
                className="inline-flex w-full items-center justify-center rounded-xl bg-indigo-600 px-6 py-3.5 text-base font-semibold text-white shadow-lg transition hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-[#0D0D0D] disabled:opacity-60 sm:w-auto"
              >
                <Lock className="mr-2 h-4 w-4" />
                {authLoading ? 'Signing In...' : 'Sign In with Google to Start'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </button>
            </div>

            <p className="mt-3 text-xs text-[#71717A]">
              No passwords stored. Federated Google OAuth authentication directly via Firebase Auth.
            </p>
          </div>

          {/* Feature Architecture Grid */}
          <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {/* Feature 1 */}
            <div className="rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-xs transition hover:border-indigo-500/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-950/70 text-indigo-400 border border-indigo-700/30">
                <Brain className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#F3F4F6]">
                Gemini 3.6 Flash Engine
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                Multi-turn conversational reflections, thoughtful inquiry, brainstorming synthesis, and structured action takeaways with automated model fallbacks.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-xs transition hover:border-emerald-500/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-950/70 text-emerald-400 border border-emerald-700/30">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#F3F4F6]">
                Isolated Firestore Storage
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                Zero cross-user data leakage. All reflections are stored under <code className="rounded bg-[#1E1E1E] px-1 py-0.5 text-xs text-emerald-300 border border-[#333333]">/users/$uid/entries</code> with strict security rules.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-xs transition hover:border-sky-500/50">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-950/70 text-sky-400 border border-sky-700/30">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="mt-4 font-display text-lg font-semibold text-[#F3F4F6]">
                Threat-Modeled Security
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#9CA3AF]">
                Engineered with OWASP Top 10 defenses, zero hardcoded secrets, payload sanitization, and server-side secret management.
              </p>
            </div>
          </div>
        </div>

        {/* User Flow Step Breakdown */}
        <div className="mt-12">
          <div className="text-center">
            <h2 className="font-display text-2xl font-bold text-[#F3F4F6]">
              How MindReflect Works
            </h2>
            <p className="mt-1 text-sm text-[#71717A]">
              A 4-step verified workflow designed for cognitive clarity
            </p>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-[#262626] bg-[#121212] p-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                1
              </span>
              <h4 className="mt-3 font-semibold text-[#E0E0E0]">Authenticate</h4>
              <p className="mt-1 text-xs text-[#9CA3AF] leading-relaxed">
                Sign in securely with Google Auth to establish your private session.
              </p>
            </div>

            <div className="rounded-xl border border-[#262626] bg-[#121212] p-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                2
              </span>
              <h4 className="mt-3 font-semibold text-[#E0E0E0]">Reflect &amp; Converse</h4>
              <p className="mt-1 text-xs text-[#9CA3AF] leading-relaxed">
                Write journal reflections and converse multi-turn with Gemini across 5 tailored reflection modes.
              </p>
            </div>

            <div className="rounded-xl border border-[#262626] bg-[#121212] p-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                3
              </span>
              <h4 className="mt-3 font-semibold text-[#E0E0E0]">Synthesize</h4>
              <p className="mt-1 text-xs text-[#9CA3AF] leading-relaxed">
                Gemini automatically creates an evocative title, sentiment tags, and summary takeaways.
              </p>
            </div>

            <div className="rounded-xl border border-[#262626] bg-[#121212] p-5">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
                4
              </span>
              <h4 className="mt-3 font-semibold text-[#E0E0E0]">Private Isolation</h4>
              <p className="mt-1 text-xs text-[#9CA3AF] leading-relaxed">
                All interactions are persisted to your personal Firestore collection with real-time sync.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
