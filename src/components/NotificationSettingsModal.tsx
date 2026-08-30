import React, { useState, useEffect } from 'react';
import {
  Bell,
  X,
  Send,
  CheckCircle,
  AlertCircle,
  ShieldCheck,
  Zap,
  MessageSquare,
  Sparkles,
  HeartHandshake,
  Check,
} from 'lucide-react';
import { NotificationChannelConfig, UserProfile } from '../types';
import { getNotificationConfig, saveNotificationConfig } from '../lib/firebase';

interface NotificationSettingsModalProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationSettingsModal: React.FC<NotificationSettingsModalProps> = ({
  user,
  isOpen,
  onClose,
}) => {
  const [config, setConfig] = useState<NotificationChannelConfig>({
    enabled: false,
    channel: 'discord',
    webhookUrl: '',
    triggers: {
      celebratory: true,
      challenging: true,
      actionPlan: true,
      milestonesOnly: false,
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  // Load user notification config on open
  useEffect(() => {
    if (!isOpen || !user?.uid) return;

    setIsLoading(true);
    getNotificationConfig(user.uid)
      .then((saved) => {
        if (saved) {
          setConfig(saved);
        }
      })
      .catch((err) => console.warn('Failed to load notification config:', err))
      .finally(() => setIsLoading(false));
  }, [isOpen, user?.uid]);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!user?.uid) return;
    setIsSaving(true);
    setSaveStatus(null);
    setTestResult(null);

    try {
      await saveNotificationConfig(user.uid, config);
      setSaveStatus('Notification settings saved successfully to Cloud Firestore.');
      setTimeout(() => setSaveStatus(null), 4000);
    } catch (err: any) {
      setSaveStatus(`Failed to save: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  };

  const handleTestNotification = async () => {
    if (!config.webhookUrl) {
      setTestResult({
        success: false,
        message: 'Please enter a valid webhook URL first.',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          webhookUrl: config.webhookUrl,
          channel: config.channel,
          testMode: true,
          entry: {
            title: '✨ MindReflect Test Dispatch',
            summary: 'Your external webhook connection is working seamlessly! You will receive updates for selected reflection types.',
            sentiment: 'celebratory',
            tags: ['MindReflect', 'NotificationTest'],
            location: { placeName: 'MindReflect AI Hub' },
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Delivery failed');
      }

      setTestResult({
        success: true,
        message: `Successfully delivered test notification to ${config.channel.toUpperCase()}!`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to dispatch test notification.',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl rounded-2xl border border-[#262626] bg-[#121212] p-6 shadow-2xl text-[#E0E0E0] my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#262626] pb-4 mb-5">
          <div className="flex items-center space-x-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-950/60 border border-amber-700/40 text-amber-400">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold text-[#F3F4F6]">
                External Notifications & Webhooks
              </h3>
              <p className="text-xs text-[#A1A1AA]">
                Receive instant alerts on Slack, Discord, or custom relays when reflections are parsed.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#71717A] hover:bg-[#1E1E1E] hover:text-[#E0E0E0] transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Master Enable Switch */}
        <div className="mb-5 flex items-center justify-between rounded-xl border border-[#262626] bg-[#181818] p-4">
          <div>
            <div className="text-sm font-semibold text-[#F3F4F6]">Enable External Notifications</div>
            <div className="text-xs text-[#A1A1AA]">
              Dispatches encrypted webhook payloads when criteria match.
            </div>
          </div>
          <button
            type="button"
            onClick={() => setConfig({ ...config, enabled: !config.enabled })}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              config.enabled ? 'bg-indigo-600' : 'bg-[#333333]'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                config.enabled ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Channel Selection */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">
            Notification Destination
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'discord', label: 'Discord Webhook', desc: 'Rich embed cards' },
              { id: 'slack', label: 'Slack Channel', desc: 'Formatted block kit' },
              { id: 'email_webhook', label: 'Custom Relay', desc: 'JSON API webhook' },
            ].map((item) => {
              const isSelected = config.channel === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setConfig({ ...config, channel: item.id as any })}
                  className={`rounded-xl border p-3 text-left transition ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-950/40 text-indigo-200'
                      : 'border-[#262626] bg-[#161616] text-[#A1A1AA] hover:bg-[#1C1C1C]'
                  }`}
                >
                  <div className="font-semibold text-xs text-[#F3F4F6]">{item.label}</div>
                  <div className="text-[11px] text-[#71717A] mt-0.5">{item.desc}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Webhook URL Input */}
        <div className="mb-5">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">
            Target Webhook URL
          </label>
          <input
            type="url"
            value={config.webhookUrl}
            onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
            placeholder={
              config.channel === 'discord'
                ? 'https://discord.com/api/webhooks/...'
                : config.channel === 'slack'
                ? 'https://hooks.slack.com/services/...'
                : 'https://api.yourdomain.com/webhook'
            }
            className="w-full rounded-xl border border-[#262626] bg-[#181818] px-3.5 py-2.5 text-xs text-[#F3F4F6] placeholder-[#71717A] focus:border-indigo-500 focus:outline-none"
          />
          <div className="mt-1.5 flex items-center text-[11px] text-[#71717A]">
            <ShieldCheck className="mr-1 h-3.5 w-3.5 text-emerald-400" />
            Protected by SSRF firewall. Internal/localhost IP addresses are blocked.
          </div>
        </div>

        {/* Trigger Filters */}
        <div className="mb-6">
          <label className="block text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2">
            Event Trigger Criteria
          </label>
          <div className="space-y-2.5 rounded-xl border border-[#262626] bg-[#161616] p-3.5">
            {[
              {
                key: 'celebratory',
                label: 'Celebratory & Breakthrough Milestones',
                desc: 'Dispatches when Gemini tags an entry with joyful or milestone sentiment.',
                icon: Sparkles,
                color: 'text-amber-400',
              },
              {
                key: 'challenging',
                label: 'Challenging & Support-Needed Reflections',
                desc: 'Alerts when processing emotional friction or high-stress situations.',
                icon: HeartHandshake,
                color: 'text-rose-400',
              },
              {
                key: 'actionPlan',
                label: 'New Action Checklists Generated',
                desc: 'Notifies when an actionable plan or structured goal checklist is created.',
                icon: Zap,
                color: 'text-indigo-400',
              },
            ].map((trigger) => {
              const Icon = trigger.icon;
              const isChecked = Boolean(config.triggers[trigger.key as keyof typeof config.triggers]);
              return (
                <label
                  key={trigger.key}
                  className="flex items-start space-x-3 cursor-pointer select-none rounded-lg p-2 hover:bg-[#1E1E1E] transition"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        triggers: {
                          ...config.triggers,
                          [trigger.key]: e.target.checked,
                        },
                      })
                    }
                    className="mt-0.5 h-4 w-4 rounded border-[#333333] bg-[#222222] text-indigo-600 focus:ring-0"
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-1.5 text-xs font-semibold text-[#F3F4F6]">
                      <Icon className={`h-3.5 w-3.5 ${trigger.color}`} />
                      <span>{trigger.label}</span>
                    </div>
                    <div className="text-[11px] text-[#A1A1AA]">{trigger.desc}</div>
                  </div>
                </label>
              );
            })}
          </div>
        </div>

        {/* Feedback Message */}
        {testResult && (
          <div
            className={`mb-4 flex items-center space-x-2 rounded-xl p-3 text-xs border ${
              testResult.success
                ? 'bg-emerald-950/50 border-emerald-800/60 text-emerald-300'
                : 'bg-rose-950/50 border-rose-800/60 text-rose-300'
            }`}
          >
            {testResult.success ? (
              <CheckCircle className="h-4 w-4 flex-shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="h-4 w-4 flex-shrink-0 text-rose-400" />
            )}
            <span>{testResult.message}</span>
          </div>
        )}

        {saveStatus && (
          <div className="mb-4 rounded-xl bg-indigo-950/50 border border-indigo-800/60 p-3 text-xs text-indigo-300">
            {saveStatus}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between border-t border-[#262626] pt-4">
          <button
            type="button"
            onClick={handleTestNotification}
            disabled={isTesting || !config.webhookUrl}
            className="inline-flex items-center rounded-xl border border-[#333333] bg-[#1E1E1E] px-4 py-2 text-xs font-semibold text-[#E0E0E0] hover:bg-[#282828] transition disabled:opacity-50"
          >
            <Send className={`mr-1.5 h-3.5 w-3.5 text-indigo-400 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Testing Dispatch...' : 'Send Test Notification'}
          </button>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#333333] bg-[#1E1E1E] px-4 py-2 text-xs font-semibold text-[#E0E0E0] hover:bg-[#282828] transition"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving}
              className="inline-flex items-center rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-md hover:bg-indigo-500 transition disabled:opacity-50"
            >
              <Check className="mr-1.5 h-3.5 w-3.5" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
