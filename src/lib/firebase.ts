import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { JournalEntry, NotificationChannelConfig } from '../types';
import { sanitizeForFirestore } from './sanitizer';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firebase Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

// Initialize Cloud Firestore with dedicated Database ID if specified
export const db: Firestore = firebaseConfig.firestoreDatabaseId
  ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
  : getFirestore(app);

// Authentication helper methods
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error('Firebase Auth Popup Error:', error);
    throw error;
  }
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Check if user is an administrator
export async function checkIsAdmin(user: { uid: string; email?: string | null }): Promise<boolean> {
  if (!user?.uid) return false;
  if (user.email === 'saraswatanurag04@gmail.com') return true;

  try {
    const adminDocRef = doc(db, 'admins', user.uid);
    const snap = await getDoc(adminDocRef);
    return snap.exists();
  } catch (err) {
    console.warn('Admin check error:', err);
    return false;
  }
}

// User-Isolated Firestore Entry CRUD operations:
// Path pattern: /users/{userId}/entries/{entryId}

export function subscribeToEntries(
  userId: string,
  onUpdate: (entries: JournalEntry[]) => void,
  onError?: (err: Error) => void
) {
  if (!userId) return () => {};

  const entriesRef = collection(db, 'users', userId, 'entries');
  const q = query(entriesRef, orderBy('createdAt', 'desc'));

  return onSnapshot(
    q,
    (snapshot) => {
      const entries: JournalEntry[] = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data();
        return {
          id: docSnapshot.id,
          userId: data.userId || userId,
          title: data.title || 'Untitled Reflection',
          summary: data.summary || '',
          tags: Array.isArray(data.tags) ? data.tags : [],
          sentiment: data.sentiment || 'reflective',
          messages: Array.isArray(data.messages) ? data.messages : [],
          createdAt: typeof data.createdAt === 'number' ? data.createdAt : Date.now(),
          updatedAt: typeof data.updatedAt === 'number' ? data.updatedAt : Date.now(),
          wordCount: typeof data.wordCount === 'number' ? data.wordCount : 0,
          primaryMode: data.primaryMode || 'reflection',
          starred: Boolean(data.starred),
          location: data.location
            ? {
                placeName: data.location.placeName || '',
                address: data.location.address || '',
                lat: typeof data.location.lat === 'number' ? data.location.lat : 0,
                lng: typeof data.location.lng === 'number' ? data.location.lng : 0,
                placeId: data.location.placeId || '',
              }
            : null,
        };
      });
      onUpdate(entries);
    },
    (err) => {
      console.error('Error fetching user entries:', err);
      if (onError) onError(err);
    }
  );
}

export async function saveEntry(userId: string, entry: JournalEntry): Promise<void> {
  if (!userId) throw new Error('Cannot save entry: No authenticated user.');

  const entryRef = doc(db, 'users', userId, 'entries', entry.id);
  // Guarantee undefined-stripping
  const cleanPayload = sanitizeForFirestore({
    id: entry.id,
    userId,
    title: entry.title || 'Untitled Reflection',
    summary: entry.summary || '',
    tags: entry.tags || [],
    sentiment: entry.sentiment || 'reflective',
    messages: entry.messages || [],
    createdAt: entry.createdAt || Date.now(),
    updatedAt: Date.now(),
    wordCount: entry.wordCount || 0,
    primaryMode: entry.primaryMode || 'reflection',
    starred: Boolean(entry.starred),
    location: entry.location
      ? {
          placeName: entry.location.placeName,
          address: entry.location.address || '',
          lat: entry.location.lat,
          lng: entry.location.lng,
          placeId: entry.location.placeId || '',
        }
      : null,
  });

  await setDoc(entryRef, cleanPayload, { merge: true });
}

export async function deleteEntry(userId: string, entryId: string): Promise<void> {
  if (!userId) throw new Error('Cannot delete entry: No authenticated user.');
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await deleteDoc(entryRef);
}

export async function toggleStarred(
  userId: string,
  entryId: string,
  currentStarred: boolean
): Promise<void> {
  if (!userId) return;
  const entryRef = doc(db, 'users', userId, 'entries', entryId);
  await updateDoc(entryRef, {
    starred: !currentStarred,
    updatedAt: Date.now(),
  });
}

// Notification preferences per user
export async function getNotificationConfig(userId: string): Promise<NotificationChannelConfig | null> {
  if (!userId) return null;
  try {
    const configDoc = await getDoc(doc(db, 'users', userId, 'settings', 'notifications'));
    if (configDoc.exists()) {
      return configDoc.data() as NotificationChannelConfig;
    }
    return null;
  } catch (err) {
    console.warn('Failed to fetch notification config:', err);
    return null;
  }
}

export async function saveNotificationConfig(
  userId: string,
  config: NotificationChannelConfig
): Promise<void> {
  if (!userId) throw new Error('No user for notification settings');
  const configRef = doc(db, 'users', userId, 'settings', 'notifications');
  const cleanPayload = sanitizeForFirestore({
    ...config,
    updatedAt: Date.now(),
  });
  await setDoc(configRef, cleanPayload, { merge: true });
}

