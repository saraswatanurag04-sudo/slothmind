import React from 'react';
import { Shield, Lock, Database, Key, Server, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ThreatModelZone } from '../types';

export const THREAT_MODEL_DATA: ThreatModelZone[] = [
  {
    zone: '1. Input Surfaces',
    threat: 'Prompt Injection / Malicious Multi-Turn Payloads (LLM01 / A03)',
    impact: 'Attempting to override AI system instructions, exfiltrate metadata, or force biased reflections.',
    mitigation: 'Strict server-side system persona framing; inputs treated strictly as user data rather than executable directives; defensive payload bounds & null-safe request sanitization.',
    owaspRef: 'OWASP LLM01 / A03:2021-Injection',
  },
  {
    zone: '2. Planning & Reasoning',
    threat: 'Model Hallucination & Service Outage (LLM09 / System Availability)',
    impact: 'API rate limits (429), service downtime (503), or invalid content crashing the user session.',
    mitigation: 'Resilient Model Fallback Ladder (Gemini 2.5 Flash -> 2.0 Flash -> 2.5 Pro -> 2.0 Pro Exp) with automatic error recovery and clean fallback error surfacing.',
    owaspRef: 'OWASP LLM04 / System Resilience',
  },
  {
    zone: '3. Tool & Server Execution',
    threat: 'Privilege Escalation & SSRF / Command Injection (A01 / A03)',
    impact: 'Unauthorized execution of system commands or arbitrary network fetching from server.',
    mitigation: 'No dynamic eval/child_process execution; all AI operations strictly routed through dedicated official @google/genai SDK with parameter serialization; top-level JSON body parsing.',
    owaspRef: 'OWASP A01:2021-Broken Access Control',
  },
  {
    zone: '4. Memory & State (Firestore)',
    threat: 'Cross-User Data Leakage / IDOR (A01 Broken Access Control)',
    impact: 'User B attempting to read or overwrite User A’s private reflections and chats.',
    mitigation: 'Strict owner-bound Firestore Security Rules (request.auth.uid == userId); documents partitioned under /users/{userId}/entries; client payload sanitizer strips undefined keys.',
    owaspRef: 'OWASP A01:2021-Broken Access Control',
  },
  {
    zone: '5. Inter-System Communication',
    threat: 'API Key & Token Leakage (A02 / LLM06)',
    impact: 'Gemini API keys or Cloud service credentials exposed in browser client source code.',
    mitigation: 'Zero client-side API key exposure; GEMINI_API_KEY injected server-side via Secret Manager / environment variables; federated Google OAuth handled via Firebase Auth popups.',
    owaspRef: 'OWASP A02:2021-Cryptographic Failures',
  },
];

export const ThreatModelModal: React.FC = () => {
  return (
    <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-2 text-indigo-400 mb-1">
          <Shield className="h-5 w-5" />
          <span className="text-xs font-bold uppercase tracking-wider">
            Agentic Threat Model &amp; Security Review
          </span>
        </div>
        <h2 className="font-display text-2xl font-bold text-[#F3F4F6] sm:text-3xl">
          Security Architecture &amp; The 5 Threat Zones
        </h2>
        <p className="text-xs text-[#71717A] mt-1">
          Engineered to comply with OWASP Top 10 (Web) and OWASP Top 10 for LLM Applications
        </p>
      </div>

      {/* Threat Summary Table */}
      <div className="overflow-hidden rounded-2xl border border-[#262626] bg-[#121212] shadow-xs mb-8">
        <div className="border-b border-[#262626] bg-[#161616] p-4">
          <h3 className="font-display text-base font-bold text-[#F3F4F6]">
            Threat Modeling Matrix (5 Threat Zones)
          </h3>
        </div>

        <div className="divide-y divide-[#262626]">
          {THREAT_MODEL_DATA.map((item, idx) => (
            <div key={idx} className="p-5 hover:bg-[#161616] transition">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <span className="inline-flex items-center rounded-md bg-[#1E1E1E] border border-[#333333] px-2 py-0.5 text-xs font-semibold text-[#D1D5DB]">
                    {item.zone}
                  </span>
                  <h4 className="mt-1 font-semibold text-[#F3F4F6] text-sm">
                    {item.threat}
                  </h4>
                </div>
                <span className="rounded bg-indigo-950/70 border border-indigo-700/30 px-2 py-0.5 text-[11px] font-mono text-indigo-300 self-start">
                  {item.owaspRef}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 text-xs">
                <div className="rounded-xl border border-rose-900/40 bg-rose-950/30 p-3 text-rose-200">
                  <span className="font-bold text-rose-400 flex items-center mb-1">
                    <AlertTriangle className="mr-1 h-3.5 w-3.5 text-rose-400" />
                    Potential Impact:
                  </span>
                  {item.impact}
                </div>

                <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/30 p-3 text-emerald-200">
                  <span className="font-bold text-emerald-400 flex items-center mb-1">
                    <CheckCircle2 className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                    Implemented Countermeasure:
                  </span>
                  {item.mitigation}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Code Proof Sections */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Firestore Security Rules Block */}
        <div className="rounded-2xl border border-[#262626] bg-[#121212] p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-[#E0E0E0] mb-3">
            <Database className="h-4 w-4 text-emerald-400" />
            <h4 className="font-display text-sm font-bold">Owner-Bound Firestore Rules</h4>
          </div>
          <pre className="rounded-xl bg-[#0A0A0A] border border-[#262626] p-4 font-mono text-[11px] text-emerald-400 overflow-x-auto leading-relaxed">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null 
        && request.auth.uid == userId;
      
      match /entries/{entryId} {
        allow read, write: if request.auth != null 
          && request.auth.uid == userId;
      }
    }
  }
}`}
          </pre>
        </div>

        {/* Model Resilience Fallback Ladder */}
        <div className="rounded-2xl border border-[#262626] bg-[#121212] p-5 shadow-xs">
          <div className="flex items-center space-x-2 text-[#E0E0E0] mb-3">
            <Server className="h-4 w-4 text-indigo-400" />
            <h4 className="font-display text-sm font-bold">Gemini Fallback &amp; Null-Safety</h4>
          </div>
          <pre className="rounded-xl bg-[#0A0A0A] border border-[#262626] p-4 font-mono text-[11px] text-indigo-300 overflow-x-auto leading-relaxed">
{`const MODEL_LADDER = [
  "gemini-3.6-flash",
  "gemini-3.1-flash-lite",
  "gemini-flash-latest",
  "gemini-3.7-flash"
];

// Error Recovery catches 503, 429, 404, 500
// Zero undefined properties allowed to DB
const clean = sanitizeForFirestore(payload);`}
          </pre>
        </div>
      </div>
    </div>
  );
};
