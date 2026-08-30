import React from 'react';
import { JournalEntry } from '../types';
import {
  BarChart3,
  Flame,
  BookOpen,
  Sparkles,
  Tag,
  Smile,
  Heart,
  TrendingUp,
  Award,
} from 'lucide-react';

interface ReflectionInsightsProps {
  entries: JournalEntry[];
  onNewReflection: () => void;
}

export const ReflectionInsights: React.FC<ReflectionInsightsProps> = ({
  entries,
  onNewReflection,
}) => {
  const totalEntries = entries.length;
  const totalWords = entries.reduce((acc, e) => acc + (e.wordCount || 0), 0);
  const totalExchanges = entries.reduce(
    (acc, e) => acc + (e.messages ? e.messages.length : 0),
    0
  );

  // Sentiment counts
  const sentimentCounts = entries.reduce((acc, e) => {
    acc[e.sentiment] = (acc[e.sentiment] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Mode counts
  const modeCounts = entries.reduce((acc, e) => {
    acc[e.primaryMode] = (acc[e.primaryMode] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Tag frequency
  const tagCounts = entries.reduce((acc, e) => {
    if (Array.isArray(e.tags)) {
      e.tags.forEach((t) => {
        acc[t] = (acc[t] || 0) + 1;
      });
    }
    return acc;
  }, {} as Record<string, number>);

  const topTags = Object.entries(tagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8);

  return (
    <div className="mx-auto max-w-5xl py-6 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <h2 className="font-display text-2xl font-bold text-[#F3F4F6] sm:text-3xl">
          Mindfulness &amp; Reflection Insights
        </h2>
        <p className="text-xs text-[#71717A] mt-1">
          Patterns, metrics, and cognitive themes from your private journal archive
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-8">
        <div className="rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              Total Reflections
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-950/70 text-indigo-400 border border-indigo-700/30">
              <BookOpen className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-[#F3F4F6]">
            {totalEntries}
          </div>
          <p className="mt-1 text-[11px] text-[#71717A]">
            {totalExchanges} multi-turn AI exchanges with Gemini
          </p>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              Words Reflected
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-950/70 text-emerald-400 border border-emerald-700/30">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-[#F3F4F6]">
            {totalWords.toLocaleString()}
          </div>
          <p className="mt-1 text-[11px] text-[#71717A]">
            Avg. {totalEntries > 0 ? Math.round(totalWords / totalEntries) : 0} words per entry
          </p>
        </div>

        <div className="rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-[#71717A] uppercase tracking-wider">
              Reflection Habit
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-950/70 text-sky-400 border border-sky-700/30">
              <Flame className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 font-display text-3xl font-bold text-[#F3F4F6]">
            {totalEntries > 0 ? `${totalEntries} Active` : '0 Days'}
          </div>
          <p className="mt-1 text-[11px] text-[#71717A]">
            100% private to your Google account
          </p>
        </div>
      </div>

      {/* Breakdown Section */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Sentiment Distribution */}
        <div className="rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-xs">
          <h3 className="font-display text-base font-bold text-[#F3F4F6] flex items-center">
            <Smile className="mr-2 h-4 w-4 text-indigo-400" />
            Emotional Tone Distribution
          </h3>
          <p className="text-xs text-[#71717A] mt-0.5 mb-4">
            AI-extracted sentiment from your sessions
          </p>

          <div className="space-y-3">
            {['reflective', 'positive', 'celebratory', 'challenging', 'neutral'].map((tone) => {
              const count = sentimentCounts[tone] || 0;
              const pct = totalEntries > 0 ? Math.round((count / totalEntries) * 100) : 0;
              return (
                <div key={tone}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium capitalize text-[#D1D5DB]">{tone}</span>
                    <span className="text-[#71717A] font-mono">
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#18181B]">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Favorite Reflection Modes & Top Tags */}
        <div className="rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="font-display text-base font-bold text-[#F3F4F6] flex items-center">
              <Sparkles className="mr-2 h-4 w-4 text-indigo-400" />
              Top Reflection Themes &amp; Tags
            </h3>
            <p className="text-xs text-[#71717A] mt-0.5 mb-4">
              Recurring topics identified in your entries
            </p>

            {topTags.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {topTags.map(([tag, count]) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-xl border border-[#262626] bg-[#18181B] px-3 py-1 text-xs font-medium text-[#D1D5DB]"
                  >
                    #{tag}
                    <span className="ml-1.5 rounded-full bg-[#27272A] px-1.5 py-0.2 text-[10px] text-[#A1A1AA]">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#71717A] italic">
                No tags created yet. Write your first reflection to see theme clusters.
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-[#262626] flex items-center justify-between">
            <div className="text-xs text-[#71717A]">
              Ready to write your next reflection?
            </div>
            <button
              onClick={onNewReflection}
              className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
            >
              Start Reflection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
