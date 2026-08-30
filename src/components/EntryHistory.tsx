import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import {
  Search,
  Calendar,
  Tag,
  Star,
  Trash2,
  BookOpen,
  ArrowUpRight,
  Filter,
  Copy,
  Check,
  Smile,
  Layers,
  X,
  MapPin,
} from 'lucide-react';
import { JournalEntry, UserProfile } from '../types';
import { deleteEntry, toggleStarred } from '../lib/firebase';

interface EntryHistoryProps {
  user: UserProfile;
  entries: JournalEntry[];
  onSelectEntry: (entry: JournalEntry) => void;
  onNewReflection: () => void;
}

export const EntryHistory: React.FC<EntryHistoryProps> = ({
  user,
  entries,
  onSelectEntry,
  onNewReflection,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSentiment, setSelectedSentiment] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<string>('all');
  const [activeModalEntry, setActiveModalEntry] = useState<JournalEntry | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filtered entries
  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      searchQuery === '' ||
      entry.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      entry.messages.some((m) => m.text.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSentiment =
      selectedSentiment === 'all' || entry.sentiment === selectedSentiment;

    const matchesMode =
      selectedMode === 'all' || entry.primaryMode === selectedMode;

    return matchesSearch && matchesSentiment && matchesMode;
  });

  const handleDelete = async (entryId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this reflection?')) return;

    setDeletingId(entryId);
    try {
      await deleteEntry(user.uid, entryId);
      if (activeModalEntry?.id === entryId) {
        setActiveModalEntry(null);
      }
    } catch (err) {
      console.error('Failed to delete entry:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStar = async (entry: JournalEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      await toggleStarred(user.uid, entry.id, Boolean(entry.starred));
    } catch (err) {
      console.error('Failed to star entry:', err);
    }
  };

  const handleCopyMarkdown = (entry: JournalEntry, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const md = `# ${entry.title}\n*Date: ${new Date(entry.createdAt).toLocaleDateString()}*\n\n` +
      `**Summary**: ${entry.summary}\n\n` +
      entry.messages.map((m) => `### ${m.role === 'user' ? 'Reflection Prompt' : 'Gemini Reflection'}\n${m.text}`).join('\n\n');

    navigator.clipboard.writeText(md);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 lg:px-8">
      {/* Header & Controls */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-[#F3F4F6] sm:text-3xl">
            Reflection History
          </h2>
          <p className="text-xs text-[#71717A] mt-1">
            {entries.length} saved {entries.length === 1 ? 'reflection' : 'reflections'} isolated in your private Cloud Firestore
          </p>
        </div>

        <button
          onClick={onNewReflection}
          className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition hover:bg-indigo-500 sm:w-auto"
        >
          <BookOpen className="mr-1.5 h-4 w-4" />
          Write New Reflection
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="mb-6 grid grid-cols-1 gap-3 rounded-2xl border border-[#262626] bg-[#121212] p-4 shadow-xs sm:grid-cols-12">
        {/* Search */}
        <div className="relative sm:col-span-6">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#71717A]" />
          <input
            id="input-search-history"
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search entries, thoughts, tags..."
            className="w-full rounded-xl border border-[#262626] bg-[#18181B] py-2 pl-9 pr-4 text-xs text-[#E0E0E0] placeholder:text-[#71717A] focus:bg-[#1E1E1E] focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        {/* Sentiment Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedSentiment}
            onChange={(e) => setSelectedSentiment(e.target.value)}
            className="w-full rounded-xl border border-[#262626] bg-[#18181B] py-2 px-3 text-xs text-[#E0E0E0] focus:bg-[#1E1E1E] focus:outline-none"
          >
            <option value="all">All Tones</option>
            <option value="positive">Positive</option>
            <option value="reflective">Reflective</option>
            <option value="challenging">Challenging</option>
            <option value="celebratory">Celebratory</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>

        {/* Mode Filter */}
        <div className="sm:col-span-3">
          <select
            value={selectedMode}
            onChange={(e) => setSelectedMode(e.target.value)}
            className="w-full rounded-xl border border-[#262626] bg-[#18181B] py-2 px-3 text-xs text-[#E0E0E0] focus:bg-[#1E1E1E] focus:outline-none"
          >
            <option value="all">All Modes</option>
            <option value="reflection">Deep Reflection</option>
            <option value="brainstorm">Brainstorming</option>
            <option value="action_plan">Action Steps</option>
            <option value="summary">Daily Summary</option>
            <option value="gratitude">Gratitude</option>
          </select>
        </div>
      </div>

      {/* Entries List */}
      {filteredEntries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#262626] bg-[#121212] py-16 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#18181B] text-[#71717A] border border-[#262626]">
            <BookOpen className="h-6 w-6" />
          </div>
          <h3 className="mt-4 font-display text-base font-semibold text-[#F3F4F6]">
            {entries.length === 0 ? 'No Reflections Saved Yet' : 'No Matching Reflections Found'}
          </h3>
          <p className="mt-1 text-xs text-[#9CA3AF] max-w-sm mx-auto">
            {entries.length === 0
              ? 'Begin your first conversation with Gemini to unpack your thoughts and create your personalized journal archive.'
              : 'Try adjusting your search query or sentiment filter to find past entries.'}
          </p>
          {entries.length === 0 && (
            <button
              onClick={onNewReflection}
              className="mt-5 inline-flex items-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
            >
              Start First Entry
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {filteredEntries.map((entry) => (
            <div
              key={entry.id}
              onClick={() => setActiveModalEntry(entry)}
              className="group relative cursor-pointer rounded-2xl border border-[#262626] bg-[#121212] p-5 shadow-xs transition hover:border-indigo-500/50 hover:bg-[#161616] flex flex-col justify-between"
            >
              <div>
                {/* Header info */}
                <div className="flex items-center justify-between text-xs text-[#71717A] mb-2">
                  <span className="flex items-center text-[#A1A1AA] font-mono">
                    <Calendar className="mr-1 h-3.5 w-3.5 text-[#71717A]" />
                    {new Date(entry.createdAt).toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={(e) => handleToggleStar(entry, e)}
                      className={`p-1 rounded transition ${
                        entry.starred ? 'text-amber-400' : 'text-[#71717A] hover:text-[#E0E0E0]'
                      }`}
                      title={entry.starred ? 'Starred' : 'Star entry'}
                    >
                      <Star className={`h-4 w-4 ${entry.starred ? 'fill-amber-400' : ''}`} />
                    </button>
                  </div>
                </div>

                {/* Title */}
                <h3 className="font-display text-base font-bold text-[#F3F4F6] group-hover:text-indigo-300 transition line-clamp-1">
                  {entry.title}
                </h3>

                {/* Summary / Snippet */}
                <p className="mt-2 text-xs leading-relaxed text-[#9CA3AF] line-clamp-3">
                  {entry.summary || (entry.messages[0]?.text ? entry.messages[0].text : 'No summary provided.')}
                </p>
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-[#262626] flex items-center justify-between">
                {/* Tags & Location */}
                <div className="flex flex-wrap items-center gap-1">
                  <span className="rounded bg-indigo-950/70 border border-indigo-700/30 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300 capitalize">
                    {entry.primaryMode.replace('_', ' ')}
                  </span>
                  {entry.location && (
                    <span className="inline-flex items-center rounded bg-indigo-950/60 border border-indigo-700/40 px-1.5 py-0.5 text-[10px] font-medium text-indigo-300">
                      <MapPin className="mr-0.5 h-2.5 w-2.5 text-indigo-400" />
                      {entry.location.placeName}
                    </span>
                  )}
                  {entry.tags.slice(0, 2).map((tag) => (
                    <span
                      key={tag}
                      className="rounded bg-[#18181B] border border-[#27272A] px-1.5 py-0.5 text-[10px] font-medium text-[#A1A1AA]"
                    >
                      #{tag}
                    </span>
                  ))}
                  {entry.tags.length > 2 && (
                    <span className="text-[10px] text-[#71717A]">+{entry.tags.length - 2}</span>
                  )}
                </div>

                {/* Action icons */}
                <div className="flex items-center space-x-1 opacity-80 group-hover:opacity-100">
                  <button
                    onClick={(e) => handleCopyMarkdown(entry, e)}
                    className="p-1 rounded text-[#71717A] hover:text-[#E0E0E0]"
                    title="Copy Markdown"
                  >
                    {copiedId === entry.id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                  <button
                    onClick={(e) => handleDelete(entry.id, e)}
                    className="p-1 rounded text-[#71717A] hover:text-rose-400"
                    title="Delete Entry"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Full Detail Modal */}
      {activeModalEntry && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-xs">
          <div className="relative max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-3xl border border-[#262626] bg-[#121212] shadow-2xl flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#262626] p-5 sm:p-6 bg-[#161616]">
              <div>
                <span className="rounded bg-indigo-950/70 border border-indigo-700/30 px-2 py-0.5 text-[11px] font-semibold text-indigo-300 uppercase">
                  {activeModalEntry.primaryMode.replace('_', ' ')} MODE
                </span>
                <h3 className="mt-1 font-display text-xl font-bold text-[#F3F4F6] sm:text-2xl">
                  {activeModalEntry.title}
                </h3>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[#71717A]">
                  <span>{new Date(activeModalEntry.createdAt).toLocaleString()}</span>
                  <span>•</span>
                  <span>{activeModalEntry.wordCount} total words</span>
                  <span>•</span>
                  <span className="capitalize text-indigo-300">{activeModalEntry.sentiment}</span>
                  {activeModalEntry.location && (
                    <>
                      <span>•</span>
                      <span className="inline-flex items-center text-indigo-300">
                        <MapPin className="mr-1 h-3 w-3 text-indigo-400" />
                        {activeModalEntry.location.placeName} ({activeModalEntry.location.address || `${activeModalEntry.location.lat.toFixed(2)}, ${activeModalEntry.location.lng.toFixed(2)}`})
                      </span>
                    </>
                  )}
                </div>
              </div>

              <button
                onClick={() => setActiveModalEntry(null)}
                className="rounded-full p-2 text-[#71717A] hover:bg-[#262626] hover:text-[#E0E0E0]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
              {activeModalEntry.summary && (
                <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/40 p-3.5 text-xs text-[#E0E7FF]">
                  <span className="font-bold text-indigo-200">Key Insight: </span>
                  {activeModalEntry.summary}
                </div>
              )}

              {/* Full Multi-Turn Messages */}
              <div className="space-y-4">
                {activeModalEntry.messages.map((m, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}
                  >
                    <div className="text-[11px] text-[#71717A] mb-1 px-1">
                      {m.role === 'user' ? (user.displayName || 'You') : 'Gemini 3.6 Flash'}
                    </div>
                    <div
                      className={`max-w-2xl rounded-2xl p-4 text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-indigo-950/80 border border-indigo-700/40 text-[#F3F4F6]'
                          : 'bg-[#161616] border border-[#262626] text-[#D1D5DB]'
                      }`}
                    >
                      {m.role === 'user' ? (
                        <p className="whitespace-pre-wrap">{m.text}</p>
                      ) : (
                        <div className="prose prose-invert prose-sm max-w-none text-[#D1D5DB]">
                          <ReactMarkdown>{m.text}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between border-t border-[#262626] p-4 bg-[#161616]">
              <button
                onClick={() => handleDelete(activeModalEntry.id)}
                className="inline-flex items-center text-xs font-semibold text-rose-400 hover:text-rose-300"
              >
                <Trash2 className="mr-1.5 h-4 w-4" />
                Delete Entry
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleCopyMarkdown(activeModalEntry)}
                  className="inline-flex items-center rounded-xl border border-[#262626] bg-[#18181B] px-3 py-1.5 text-xs font-medium text-[#D1D5DB] hover:bg-[#262626] hover:text-white"
                >
                  <Copy className="mr-1.5 h-3.5 w-3.5" />
                  {copiedId === activeModalEntry.id ? 'Copied!' : 'Copy Markdown'}
                </button>

                <button
                  onClick={() => {
                    onSelectEntry(activeModalEntry);
                    setActiveModalEntry(null);
                  }}
                  className="inline-flex items-center rounded-xl bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500"
                >
                  <ArrowUpRight className="mr-1.5 h-3.5 w-3.5" />
                  Continue Reflection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
