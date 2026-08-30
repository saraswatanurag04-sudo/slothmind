import React, { useState } from 'react';
import { CheckCircle2, Circle, ListChecks, Play, ShieldCheck } from 'lucide-react';
import { WalkthroughTestCase } from '../types';

export const WALKTHROUGH_CASES: WalkthroughTestCase[] = [
  {
    id: 'tc-01',
    category: 'Authentication & Session',
    title: 'Google Sign-In & User Identity Establishment',
    steps: [
      '1. Open application landing page while unauthenticated.',
      '2. Verify that no private data or input fields are exposed on the unauthenticated landing view.',
      '3. Click "Sign In with Google to Start" button.',
      '4. Complete federated authentication popup with Google.',
      '5. Observe user avatar, name, and email populated in the top navigation bar.',
      '6. Verify redirect to the private Journal Reflection dashboard.',
    ],
    expectedResult: 'Firebase Auth establishes the user session and extracts uid for strict data isolation.',
  },
  {
    id: 'tc-02',
    category: 'AI Reflection & Multi-Turn Chat',
    title: 'Multi-Turn Conversational Journaling with Gemini',
    steps: [
      '1. Select reflection mode (e.g. Deep Reflection, Brainstorming, Action Steps, Daily Summary, Gratitude).',
      '2. Click a starter prompt pill or type a personal thought in the text input.',
      '3. Press Enter or click "Send to Gemini".',
      '4. Observe the animated Gemini thinking indicator.',
      '5. Verify Gemini responds with an empathetic, formatted markdown response.',
      '6. Send a follow-up response in the same session and verify multi-turn context is maintained.',
    ],
    expectedResult: 'Gemini 3.6 Flash generates high-quality multi-turn reflections using server-side proxy with fallback ladder.',
  },
  {
    id: 'tc-03',
    category: 'AI Insights & Synthesis',
    title: 'Auto-Title, Tags, & Key Takeaway Extraction',
    steps: [
      '1. Have at least one message exchange in the reflection editor.',
      '2. Click the "AI Insights" (Sparkles) button in the top action bar.',
      '3. Verify automated extraction of evocative title, tone sentiment, and summary takeaway.',
      '4. Confirm celebratory sparkle confetti triggers upon successful synthesis.',
    ],
    expectedResult: 'Gemini summarizes the reflection and returns structured metadata with clean JSON deserialization.',
  },
  {
    id: 'tc-04',
    category: 'Firestore Persistence & Zero Undefineds',
    title: 'Isolated Database Write & Real-Time Sync',
    steps: [
      '1. Click "Save Entry" or observe auto-save after message exchange.',
      '2. Verify "Saved to Cloud Firestore" badge appears in emerald green.',
      '3. Verify data is saved under /users/{userId}/entries/{entryId} in Firestore.',
      '4. Switch to "Past Entries" tab and verify the new entry appears with correct title, word count, and tags.',
    ],
    expectedResult: 'Payload is sanitized through sanitizeForFirestore and persisted strictly within the user’s Firestore path.',
  },
  {
    id: 'tc-05',
    category: 'History & Management',
    title: 'Search, Filter, Export & Safe Deletion',
    steps: [
      '1. In "Past Entries", type a keyword into the search bar to filter by title or content.',
      '2. Filter entries by Sentiment dropdown and Mode dropdown.',
      '3. Click an entry card to open the Full Detail Modal.',
      '4. Click "Copy Markdown" to copy the entry to clipboard.',
      '5. Click "Delete Entry", confirm the confirmation prompt, and verify the entry is removed from Firestore and UI.',
    ],
    expectedResult: 'Real-time Firestore listener updates list, search filtering works instantaneously, and deletion succeeds.',
  },
  {
    id: 'tc-06',
    category: 'Security & Sign-Out',
    title: 'Session Termination & Isolation Verification',
    steps: [
      '1. Click "Sign Out" in the top navigation bar.',
      '2. Verify user is returned to the Landing View.',
      '3. Confirm all private entries are immediately cleared from active memory.',
      '4. Attempting to sign in with a different user account reveals only that second user’s isolated entries.',
    ],
    expectedResult: 'Zero data leakage across user boundaries; complete state teardown on sign out.',
  },
];

export const WalkthroughModal: React.FC = () => {
  const [completedTests, setCompletedTests] = useState<Record<string, boolean>>({});

  const toggleTest = (id: string) => {
    setCompletedTests((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const completedCount = Object.values(completedTests).filter(Boolean).length;
  const progressPct = Math.round((completedCount / WALKTHROUGH_CASES.length) * 100);

  return (
    <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 mb-1">
            <ListChecks className="h-5 w-5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              Functional Stability &amp; Walkthrough
            </span>
          </div>
          <h2 className="font-display text-2xl font-bold text-[#F3F4F6] sm:text-3xl">
            Interactive Test Verification Matrix
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            Standard test cases covering every user interaction and system boundary
          </p>
        </div>

        {/* Progress Badge */}
        <div className="rounded-2xl border border-[#262626] bg-[#121212] p-4 shadow-xs sm:w-64">
          <div className="flex items-center justify-between text-xs font-semibold text-[#D1D5DB] mb-1.5">
            <span>Verification Progress</span>
            <span className="font-mono text-indigo-300">{completedCount}/{WALKTHROUGH_CASES.length} Verified</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-[#18181B]">
            <div
              className="h-full rounded-full bg-indigo-500 transition-all duration-300"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Test Cases Grid */}
      <div className="space-y-4">
        {WALKTHROUGH_CASES.map((tc) => {
          const isDone = Boolean(completedTests[tc.id]);
          return (
            <div
              key={tc.id}
              onClick={() => toggleTest(tc.id)}
              className={`cursor-pointer rounded-2xl border p-5 transition shadow-xs ${
                isDone
                  ? 'border-emerald-600/50 bg-emerald-950/20'
                  : 'border-[#262626] bg-[#121212] hover:border-indigo-500/50'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <button
                    type="button"
                    className={`mt-0.5 p-0.5 rounded-full transition ${
                      isDone ? 'text-emerald-400' : 'text-[#52525B] hover:text-[#A1A1AA]'
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-5 w-5 fill-emerald-950/60" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  <div>
                    <span className="rounded bg-[#1E1E1E] border border-[#333333] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#D1D5DB] uppercase">
                      {tc.category}
                    </span>
                    <h3
                      className={`mt-1 font-display text-base font-bold transition ${
                        isDone ? 'text-emerald-300 line-through' : 'text-[#F3F4F6]'
                      }`}
                    >
                      {tc.title}
                    </h3>
                  </div>
                </div>

                <span className="text-[11px] font-mono text-[#71717A]">
                  {tc.id.toUpperCase()}
                </span>
              </div>

              {/* Steps */}
              <div className="mt-4 pl-8">
                <div className="rounded-xl border border-[#262626] bg-[#161616] p-3.5 space-y-1.5 text-xs text-[#D1D5DB]">
                  <span className="font-semibold text-[#F3F4F6] block mb-1">
                    Steps to Execute:
                  </span>
                  {tc.steps.map((step, idx) => (
                    <p key={idx} className="leading-relaxed">
                      {step}
                    </p>
                  ))}
                </div>

                <div className="mt-2.5 flex items-center space-x-2 text-xs text-emerald-400">
                  <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>
                    <strong>Expected Outcome: </strong>
                    {tc.expectedResult}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
