import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import confetti from 'canvas-confetti';
import {
  Sparkles,
  Send,
  Save,
  Trash2,
  RefreshCw,
  Tag,
  Lightbulb,
  CheckCircle,
  AlertCircle,
  FileCheck,
  Zap,
  Smile,
  Compass,
  ListTodo,
  BookMarked,
  Layers,
  MapPin,
  Bell,
} from 'lucide-react';
import {
  JournalEntry,
  JournalLocation,
  JournalMessage,
  ReflectionMode,
  UserProfile,
} from '../types';
import { getNotificationConfig, saveEntry } from '../lib/firebase';
import { LocationPicker } from './LocationPicker';
import { NotificationSettingsModal } from './NotificationSettingsModal';

interface JournalEditorProps {
  user: UserProfile;
  initialEntry?: JournalEntry | null;
  onEntrySaved: (entry: JournalEntry) => void;
  onNewSession: () => void;
}

const STARTER_PROMPTS: Record<ReflectionMode, string[]> = {
  reflection: [
    "What's one thing that brought me unexpected clarity or friction today?",
    "How did I handle a challenging conversation recently, and what did I learn?",
    "What emotions have I been carrying lately that deserve space to be felt?",
  ],
  brainstorm: [
    "I have an idea for a new creative project or initiative—help me expand the possibilities.",
    "What are 4 alternative ways to approach my current work bottleneck?",
    "How can I restructure my daily routine to unlock more deep focus?",
  ],
  summary: [
    "Here is everything that happened in my week—help me synthesize the core lessons.",
    "Summarize my key takeaways from today's meetings and decisions.",
    "Extract the recurring emotional and mental patterns from my recent thoughts.",
  ],
  action_plan: [
    "I want to make steady progress on a major goal—break it down into 3 gentle, high-impact milestones.",
    "Help me turn this overwhelming project into clear, step-by-step next actions.",
    "What habits can I build this month to sustain my energy and clarity?",
  ],
  gratitude: [
    "What are 3 small, subtle moments today that made me smile or feel grounded?",
    "Who in my life made a positive impact this week, and how can I express appreciation?",
    "What internal strengths or resilience am I genuinely grateful for right now?",
  ],
};

export const JournalEditor: React.FC<JournalEditorProps> = ({
  user,
  initialEntry,
  onEntrySaved,
  onNewSession,
}) => {
  const [currentMode, setCurrentMode] = useState<ReflectionMode>(
    initialEntry?.primaryMode || 'reflection'
  );
  const [messages, setMessages] = useState<JournalMessage[]>(
    initialEntry?.messages || []
  );
  const [inputText, setInputText] = useState('');
  const [title, setTitle] = useState(initialEntry?.title || '');
  const [summary, setSummary] = useState(initialEntry?.summary || '');
  const [tags, setTags] = useState<string[]>(initialEntry?.tags || ['Reflection']);
  const [tagInput, setTagInput] = useState('');
  const [sentiment, setSentiment] = useState<JournalEntry['sentiment']>(
    initialEntry?.sentiment || 'reflective'
  );
  const [location, setLocation] = useState<JournalLocation | null>(
    initialEntry?.location || null
  );
  const [isLocationPickerOpen, setIsLocationPickerOpen] = useState(false);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const [isGenerating, setIsGenerating] = useState(false);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle');
  const [notificationDispatched, setNotificationDispatched] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [entryId, setEntryId] = useState<string>(
    initialEntry?.id || `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Sync if initialEntry prop changes
  useEffect(() => {
    if (initialEntry) {
      setEntryId(initialEntry.id);
      setTitle(initialEntry.title);
      setSummary(initialEntry.summary);
      setTags(initialEntry.tags);
      setSentiment(initialEntry.sentiment);
      setMessages(initialEntry.messages);
      setCurrentMode(initialEntry.primaryMode);
      setLocation(initialEntry.location || null);
    }
  }, [initialEntry]);

  // Calculate total words in the reflection
  const totalWords = messages.reduce((acc, msg) => {
    return acc + msg.text.trim().split(/\s+/).filter(Boolean).length;
  }, inputText.trim().split(/\s+/).filter(Boolean).length);

  // Helper to dispatch external notifications if criteria match
  const maybeDispatchNotification = async (entry: JournalEntry) => {
    try {
      const config = await getNotificationConfig(user.uid);
      if (!config || !config.enabled || !config.webhookUrl) return;

      const { celebratory, challenging, actionPlan } = config.triggers;
      const isCelebratoryMatch = celebratory && entry.sentiment === 'celebratory';
      const isChallengingMatch = challenging && entry.sentiment === 'challenging';
      const isActionPlanMatch = actionPlan && entry.primaryMode === 'action_plan';

      if (isCelebratoryMatch || isChallengingMatch || isActionPlanMatch) {
        const res = await fetch('/api/notifications/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            webhookUrl: config.webhookUrl,
            channel: config.channel,
            entry: {
              title: entry.title,
              summary: entry.summary || entry.messages[entry.messages.length - 1]?.text?.slice(0, 150),
              sentiment: entry.sentiment,
              tags: entry.tags,
              location: entry.location,
            },
          }),
        });
        if (res.ok) {
          setNotificationDispatched(`Dispatched to ${config.channel.toUpperCase()}`);
          setTimeout(() => setNotificationDispatched(null), 4000);
        }
      }
    } catch (err) {
      console.warn('External notification trigger error:', err);
    }
  };

  // Send message to Gemini API
  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = (customPrompt || inputText).trim();
    if (!textToSend || isGenerating) return;

    const userMessage: JournalMessage = {
      id: `msg_${Date.now()}_u`,
      role: 'user',
      text: textToSend,
      createdAt: Date.now(),
      mode: currentMode,
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputText('');
    setErrorMessage(null);
    setIsGenerating(true);

    try {
      // Call server endpoint with model fallback support
      const response = await fetch('/api/ai/reflect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textToSend,
          history: messages.map((m) => ({
            role: m.role,
            text: m.text,
          })),
          mode: currentMode,
          userDisplayName: user.displayName || 'Reflective Writer',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error while generating response.');
      }

      const modelMessage: JournalMessage = {
        id: `msg_${Date.now()}_m`,
        role: 'model',
        text: data.response,
        createdAt: Date.now(),
        modelUsed: data.modelUsed,
        mode: currentMode,
      };

      const updatedMessages = [...newMessages, modelMessage];
      setMessages(updatedMessages);

      // Auto-update summary and title if it's the first exchange and title is empty
      if (!title || title === 'Untitled Reflection') {
        const firstLine = textToSend.slice(0, 30) + '...';
        setTitle(`Reflection: ${firstLine}`);
      }

      // Auto-save entry with newly added message to prevent state loss
      await handleSaveEntry(updatedMessages);
    } catch (err: any) {
      console.error('Error generating AI reflection:', err);
      setErrorMessage(err.message || 'Failed to communicate with Gemini API. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Synthesize session (Auto-generate title, tags, sentiment, and takeaway)
  const handleSynthesizeSession = async () => {
    if (messages.length === 0 && !inputText) {
      setErrorMessage('Please write some reflection content before summarizing.');
      return;
    }

    setIsSynthesizing(true);
    setErrorMessage(null);

    const fullContent =
      messages.map((m) => `${m.role.toUpperCase()}: ${m.text}`).join('\n\n') +
      (inputText ? `\n\nUSER: ${inputText}` : '');

    try {
      const response = await fetch('/api/ai/summarize-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: fullContent }),
      });

      const data = await response.json();

      if (data.title) setTitle(data.title);
      if (data.keyTakeaway) setSummary(data.keyTakeaway);
      if (Array.isArray(data.tags)) setTags(data.tags);
      if (data.sentiment) setSentiment(data.sentiment);

      // Celebratory visual feedback
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#d97706', '#059669', '#2563eb', '#f59e0b'],
        });
      } catch {
        // Safe fallback
      }

      // Save updated metadata
      await handleSaveEntry(
        messages,
        data.title,
        data.keyTakeaway,
        data.tags,
        data.sentiment,
        location
      );
    } catch (err: any) {
      console.error('Error synthesizing session:', err);
      setErrorMessage('Failed to synthesize session insights.');
    } finally {
      setIsSynthesizing(false);
    }
  };

  // Save current entry to isolated Firestore path
  const handleSaveEntry = async (
    customMessages?: JournalMessage[],
    customTitle?: string,
    customSummary?: string,
    customTags?: string[],
    customSentiment?: JournalEntry['sentiment'],
    customLocation?: JournalLocation | null
  ) => {
    const messagesToSave = customMessages || messages;
    if (messagesToSave.length === 0 && !inputText.trim()) return;

    setIsSaving(true);
    setSaveStatus('idle');

    try {
      const entryToSave: JournalEntry = {
        id: entryId,
        userId: user.uid,
        title: customTitle || title || 'Untitled Reflection',
        summary: customSummary || summary || '',
        tags: customTags || tags,
        sentiment: customSentiment || sentiment,
        messages: messagesToSave,
        createdAt: initialEntry?.createdAt || Date.now(),
        updatedAt: Date.now(),
        wordCount: totalWords,
        primaryMode: currentMode,
        starred: initialEntry?.starred || false,
        location: customLocation !== undefined ? customLocation : location,
      };

      await saveEntry(user.uid, entryToSave);
      setSaveStatus('saved');
      onEntrySaved(entryToSave);

      // Check external notification triggers
      maybeDispatchNotification(entryToSave);

      setTimeout(() => {
        setSaveStatus((prev) => (prev === 'saved' ? 'idle' : prev));
      }, 3000);
    } catch (err: any) {
      console.error('Firestore save failed:', err);
      setSaveStatus('error');
      setErrorMessage(
        `Failed to save to Firestore: ${err.message || 'Permission or connection error'}. Click 'Save Entry' to retry.`
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (!tags.includes(newTag)) {
        setTags([...tags, newTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  return (
    <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 lg:px-8">
      {/* Session Header Card */}
      <div className="rounded-2xl border border-[#262626] bg-[#121212] p-5 shadow-sm sm:p-6 mb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex-1">
            <input
              id="entry-title-input"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Title your reflection or let Gemini generate one..."
              className="font-display w-full text-xl font-bold text-[#F3F4F6] placeholder:text-[#71717A] focus:outline-none sm:text-2xl bg-transparent"
            />
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#A1A1AA]">
              <span className="inline-flex items-center font-mono">
                <FileCheck className="mr-1 h-3.5 w-3.5 text-[#71717A]" />
                {totalWords} words
              </span>
              <span>•</span>
              <span className="inline-flex items-center">
                <Layers className="mr-1 h-3.5 w-3.5 text-[#71717A]" />
                {messages.length} exchanges
              </span>
              <span>•</span>
              <span className="text-indigo-300 bg-indigo-950/60 border border-indigo-700/30 px-2 py-0.5 rounded-md font-medium capitalize">
                {sentiment} tone
              </span>

              {/* Location Badge */}
              {location && (
                <button
                  onClick={() => setIsLocationPickerOpen(true)}
                  className="inline-flex items-center text-indigo-300 bg-indigo-950/60 border border-indigo-700/30 px-2 py-0.5 rounded-md font-medium hover:bg-indigo-900/60 transition"
                  title={location.address || 'Pinned Location'}
                >
                  <MapPin className="mr-1 h-3.5 w-3.5 text-indigo-400" />
                  {location.placeName}
                </button>
              )}

              {saveStatus === 'saved' && (
                <span className="inline-flex items-center text-emerald-400 bg-emerald-950/60 border border-emerald-700/30 px-2 py-0.5 rounded-md font-medium">
                  <CheckCircle className="mr-1 h-3.5 w-3.5 text-emerald-400" />
                  Saved to Cloud Firestore
                </span>
              )}
              {notificationDispatched && (
                <span className="inline-flex items-center text-amber-400 bg-amber-950/60 border border-amber-700/30 px-2 py-0.5 rounded-md font-medium">
                  <Bell className="mr-1 h-3.5 w-3.5 text-amber-400" />
                  {notificationDispatched}
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="inline-flex items-center text-rose-400 bg-rose-950/60 border border-rose-700/30 px-2 py-0.5 rounded-md font-medium">
                  <AlertCircle className="mr-1 h-3.5 w-3.5 text-rose-400" />
                  Save failed
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center flex-wrap gap-2">
            <button
              id="btn-pin-location"
              onClick={() => setIsLocationPickerOpen(true)}
              className={`inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-semibold shadow-xs transition ${
                location
                  ? 'border-indigo-500/50 bg-indigo-950/60 text-indigo-300'
                  : 'border-[#262626] bg-[#181818] text-[#A1A1AA] hover:bg-[#222222] hover:text-[#E0E0E0]'
              }`}
              title="Pin Google Maps location to this reflection"
            >
              <MapPin className="mr-1.5 h-3.5 w-3.5 text-indigo-400" />
              {location ? 'Edit Place' : 'Pin Place'}
            </button>

            <button
              id="btn-synthesize-session"
              onClick={handleSynthesizeSession}
              disabled={isSynthesizing || messages.length === 0}
              className="inline-flex items-center rounded-lg border border-indigo-500/40 bg-indigo-950/50 px-3 py-1.5 text-xs font-semibold text-indigo-300 shadow-xs transition hover:bg-indigo-900/60 disabled:opacity-50"
              title="Auto-extract title, tags, and summary takeaways"
            >
              <Sparkles className={`mr-1.5 h-3.5 w-3.5 text-indigo-400 ${isSynthesizing ? 'animate-spin' : ''}`} />
              {isSynthesizing ? 'Synthesizing...' : 'AI Insights'}
            </button>

            <button
              id="btn-save-firestore"
              onClick={() => handleSaveEntry()}
              disabled={isSaving}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500 disabled:opacity-50"
            >
              <Save className={`mr-1.5 h-3.5 w-3.5 ${isSaving ? 'animate-spin' : ''}`} />
              {isSaving ? 'Saving...' : 'Save Entry'}
            </button>

            <button
              id="btn-new-session"
              onClick={onNewSession}
              className="inline-flex items-center rounded-lg border border-[#262626] bg-[#18181B] px-3 py-1.5 text-xs font-medium text-[#D1D5DB] shadow-xs transition hover:bg-[#262626] hover:text-white"
            >
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 text-[#A1A1AA]" />
              New
            </button>
          </div>
        </div>

        {/* Summary Takeaway Banner */}
        {summary && (
          <div className="mt-4 rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3.5 text-xs text-[#E0E7FF]">
            <div className="flex items-start space-x-2">
              <Lightbulb className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-indigo-200">Key Takeaway: </span>
                <span>{summary}</span>
              </div>
            </div>
          </div>
        )}

        {/* Tags and Location Info Row */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pt-3 border-t border-[#262626]">
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="h-3.5 w-3.5 text-[#71717A] mr-1" />
            {tags.map((t) => (
              <span
                key={t}
                className="inline-flex items-center rounded-md bg-[#18181B] border border-[#27272A] px-2 py-0.5 text-xs font-medium text-[#D1D5DB]"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(t)}
                  className="ml-1 text-[#71717A] hover:text-white"
                >
                  ×
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              placeholder="+ tag (press enter)"
              className="rounded px-2 py-0.5 text-xs text-[#E0E0E0] placeholder:text-[#71717A] bg-transparent focus:bg-[#1A1A1A] focus:outline-none"
            />
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsNotificationModalOpen(true)}
              className="text-[11px] text-[#A1A1AA] hover:text-indigo-300 flex items-center transition"
            >
              <Bell className="mr-1 h-3 w-3 text-amber-400" />
              Webhook Alerts
            </button>
          </div>
        </div>
      </div>

      {/* Reflection Mode Selector Bar */}
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider mr-1">
          Reflection Mode:
        </span>
        <button
          onClick={() => setCurrentMode('reflection')}
          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            currentMode === 'reflection'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-[#121212] border border-[#262626] text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#E0E0E0]'
          }`}
        >
          <Compass className="mr-1.5 h-3.5 w-3.5" />
          Deep Reflection
        </button>

        <button
          onClick={() => setCurrentMode('brainstorm')}
          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            currentMode === 'brainstorm'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-[#121212] border border-[#262626] text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#E0E0E0]'
          }`}
        >
          <Lightbulb className="mr-1.5 h-3.5 w-3.5" />
          Brainstorming
        </button>

        <button
          onClick={() => setCurrentMode('action_plan')}
          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            currentMode === 'action_plan'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-[#121212] border border-[#262626] text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#E0E0E0]'
          }`}
        >
          <ListTodo className="mr-1.5 h-3.5 w-3.5" />
          Action Steps
        </button>

        <button
          onClick={() => setCurrentMode('summary')}
          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            currentMode === 'summary'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-[#121212] border border-[#262626] text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#E0E0E0]'
          }`}
        >
          <BookMarked className="mr-1.5 h-3.5 w-3.5" />
          Daily Summary
        </button>

        <button
          onClick={() => setCurrentMode('gratitude')}
          className={`inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-medium transition ${
            currentMode === 'gratitude'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-[#121212] border border-[#262626] text-[#A1A1AA] hover:bg-[#1A1A1A] hover:text-[#E0E0E0]'
          }`}
        >
          <Smile className="mr-1.5 h-3.5 w-3.5" />
          Gratitude
        </button>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="mb-4 rounded-xl border border-rose-800/60 bg-rose-950/60 p-4 text-xs text-rose-300">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-4 w-4 text-rose-400 shrink-0" />
              <span>{errorMessage}</span>
            </div>
            <button
              onClick={() => handleSaveEntry()}
              className="font-semibold underline hover:text-rose-100 ml-3"
            >
              Retry Save
            </button>
          </div>
        </div>
      )}

      {/* Conversation Thread */}
      <div className="space-y-4 rounded-2xl border border-[#262626] bg-[#0E0E0E] p-4 sm:p-6 min-h-[360px] max-h-[600px] overflow-y-auto">
        {messages.length === 0 && (
          <div className="py-10 text-center">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-indigo-950/70 text-indigo-400 border border-indigo-700/30">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="mt-3 font-display text-lg font-bold text-[#F3F4F6]">
              Start Your Reflection
            </h3>
            <p className="mx-auto mt-1 max-w-md text-xs text-[#9CA3AF]">
              Write freely about your day, a dilemma, an achievement, or a feeling. Choose one of the starter prompts below or write your own.
            </p>

            {/* Starter Prompt Pills */}
            <div className="mt-6 flex flex-col gap-2 max-w-xl mx-auto text-left">
              {STARTER_PROMPTS[currentMode].map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  className="rounded-xl border border-[#262626] bg-[#141414] p-3 text-xs text-[#D1D5DB] transition hover:border-indigo-500/50 hover:bg-[#1A1A1A] hover:text-white flex items-start space-x-2 group"
                >
                  <Zap className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <span>{prompt}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div className="flex items-center space-x-2 text-[11px] text-[#71717A] mb-1 px-1">
              <span className="font-medium text-[#A1A1AA]">
                {msg.role === 'user' ? (user.displayName || 'You') : 'Gemini 3.6 Flash'}
              </span>
              {msg.modelUsed && (
                <span className="rounded bg-[#1E1E1E] px-1 py-0.2 font-mono text-[9px] text-[#A1A1AA] border border-[#2A2A2A]">
                  {msg.modelUsed}
                </span>
              )}
              <span>•</span>
              <span>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>

            <div
              className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-indigo-950/80 border border-indigo-700/40 text-[#F3F4F6] rounded-br-xs'
                  : 'bg-[#141414] border border-[#262626] text-[#D1D5DB] shadow-xs rounded-bl-xs'
              }`}
            >
              {msg.role === 'user' ? (
                <p className="whitespace-pre-wrap">{msg.text}</p>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none text-[#D1D5DB]">
                  <ReactMarkdown>{msg.text}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}

        {isGenerating && (
          <div className="flex flex-col items-start">
            <div className="flex items-center space-x-2 text-[11px] text-[#71717A] mb-1 px-1">
              <span className="font-medium text-[#A1A1AA]">Gemini 3.6 Flash</span>
              <span>•</span>
              <span>Thinking &amp; Reflecting...</span>
            </div>
            <div className="rounded-2xl rounded-bl-xs border border-[#262626] bg-[#141414] p-4 shadow-xs">
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                <div className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                <span className="text-xs text-[#A1A1AA] ml-2 font-mono">
                  Synthesizing thoughtful reflection...
                </span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Composer */}
      <div className="mt-4 rounded-2xl border border-[#262626] bg-[#121212] p-3 shadow-xs">
        <textarea
          id="journal-input-textarea"
          ref={textareaRef}
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
          placeholder={`Write your reflection (${currentMode} mode)... Press Enter to send, Shift+Enter for new line`}
          rows={3}
          className="w-full resize-none border-0 bg-transparent text-sm text-[#E0E0E0] placeholder:text-[#71717A] focus:outline-none"
        />

        <div className="flex items-center justify-between border-t border-[#262626] pt-2.5">
          <div className="flex items-center space-x-2 text-[11px] text-[#71717A]">
            <span>Enter ↵ to send</span>
            <span>•</span>
            <span>Shift + Enter for new line</span>
          </div>

          <button
            id="btn-send-message"
            onClick={() => handleSendMessage()}
            disabled={isGenerating || !inputText.trim()}
            className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500 disabled:opacity-50"
          >
            <Send className="mr-1.5 h-3.5 w-3.5" />
            Send to Gemini
          </button>
        </div>
      </div>

      {/* Location Picker Modal */}
      <LocationPicker
        isOpen={isLocationPickerOpen}
        onClose={() => setIsLocationPickerOpen(false)}
        location={location}
        onChange={(newLoc) => {
          setLocation(newLoc);
          handleSaveEntry(messages, title, summary, tags, sentiment, newLoc);
        }}
      />

      {/* External Notification Settings Modal */}
      <NotificationSettingsModal
        isOpen={isNotificationModalOpen}
        onClose={() => setIsNotificationModalOpen(false)}
        user={user}
      />
    </div>
  );
};
