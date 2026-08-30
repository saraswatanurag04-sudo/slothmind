export type ReflectionMode = 'reflection' | 'brainstorm' | 'summary' | 'action_plan' | 'gratitude';

export interface JournalMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  createdAt: number;
  modelUsed?: string;
  mode?: ReflectionMode;
}

export interface JournalLocation {
  placeName: string;
  address?: string;
  lat: number;
  lng: number;
  placeId?: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  summary: string;
  tags: string[];
  sentiment: 'positive' | 'neutral' | 'reflective' | 'challenging' | 'celebratory';
  messages: JournalMessage[];
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  primaryMode: ReflectionMode;
  starred?: boolean;
  location?: JournalLocation | null;
}

export type UserRole = 'user' | 'admin' | 'superadmin';

export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  role?: UserRole;
}

export interface NotificationTriggers {
  celebratory: boolean;
  challenging: boolean;
  actionPlan: boolean;
  milestonesOnly: boolean;
}

export interface NotificationChannelConfig {
  enabled: boolean;
  channel: 'slack' | 'discord' | 'email_webhook';
  webhookUrl: string;
  triggers: NotificationTriggers;
  updatedAt?: number;
}

export interface AdminSystemMetrics {
  totalUsersCount: number;
  totalEntriesCount: number;
  totalAiExchanges: number;
  activeFallbackLadder: string[];
  systemStatus: 'healthy' | 'degraded' | 'maintenance';
  uptimeSeconds: number;
  sentimentBreakdown: Record<string, number>;
  notificationDispatches: number;
  activeAdminsCount: number;
}

export interface AdminAuditRecord {
  id: string;
  operatorEmail: string;
  action: string;
  target: string;
  details: string;
  timestamp: number;
  status: 'success' | 'blocked' | 'warning';
}

export interface ThreatModelZone {
  zone: string;
  threat: string;
  impact: string;
  mitigation: string;
  owaspRef: string;
}

export interface WalkthroughTestCase {
  id: string;
  category: string;
  title: string;
  steps: string[];
  expectedResult: string;
}

