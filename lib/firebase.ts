import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInAnonymously, onAuthStateChanged, User } from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  query,
  orderBy,
  limit,
  onSnapshot,
  Firestore,
} from 'firebase/firestore';
import firebaseConfig from '@/firebase-applet-config.json';
import { LeaderboardEntry, ControlMode } from './types';

const app = !getApps().length
  ? initializeApp({
      apiKey: firebaseConfig.apiKey,
      authDomain: firebaseConfig.authDomain,
      projectId: firebaseConfig.projectId,
      storageBucket: firebaseConfig.storageBucket,
      messagingSenderId: firebaseConfig.messagingSenderId,
      appId: firebaseConfig.appId,
    })
  : getApp();

export const auth = getAuth(app);
export const db: Firestore = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);

/**
 * Returns a persistent, unique client identifier stored in localStorage.
 * Ensures each device/browser has its own independent identity even if
 * Firebase Anonymous Auth is restricted on the cloud project.
 */
export function getOrCreatePlayerId(): string {
  if (typeof window === 'undefined') return 'guest_player';
  try {
    const key = 'snake_360_player_id';
    let id = localStorage.getItem(key);
    if (!id || id.length < 8) {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        id = 'p_' + crypto.randomUUID().replace(/-/g, '').slice(0, 16);
      } else {
        id = 'p_' + Math.random().toString(36).substring(2, 12) + Date.now().toString(36);
      }
      localStorage.setItem(key, id);
    }
    return id;
  } catch {
    return 'guest_' + Math.random().toString(36).substring(2, 10);
  }
}

/**
 * Returns the active user ID, prioritizing auth.currentUser.uid if present,
 * or falling back to the persistent player ID.
 */
export function getEffectivePlayerId(): string {
  if (auth.currentUser?.uid) {
    return auth.currentUser.uid;
  }
  return getOrCreatePlayerId();
}

let currentAuthPromise: Promise<User | null> | null = null;

export async function ensureAnonymousAuth(): Promise<User | null> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (currentAuthPromise) {
    return currentAuthPromise;
  }
  currentAuthPromise = new Promise<User | null>((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        unsubscribe();
        currentAuthPromise = null;
        resolve(user);
      } else {
        try {
          const cred = await signInAnonymously(auth);
          unsubscribe();
          currentAuthPromise = null;
          resolve(cred.user);
        } catch {
          // If Anonymous Auth provider is restricted in Firebase console,
          // resolve with null so the app continues seamlessly with persistent player ID
          unsubscribe();
          currentAuthPromise = null;
          resolve(null);
        }
      }
    });
  });
  return currentAuthPromise;
}

export function getLeaderboardCollectionName(mode: ControlMode): string {
  return mode === 'DIRECT' ? 'leaderboard_direct' : 'leaderboard_follow';
}

/**
 * Submits player score to the specific mode's global leaderboard in Firestore.
 */
export async function submitPlayerScore(
  nickname: string,
  mode: ControlMode,
  stats: {
    score: number;
    length: number;
    maxCombo: number;
    timeSurvivedSeconds: number;
    themeId: string;
    snapshotUrl?: string;
  }
): Promise<{ isNewBest: boolean; previousBest: number }> {
  // Try ensuring auth in the background, but do not block on failure
  await ensureAnonymousAuth().catch(() => null);

  const collectionName = getLeaderboardCollectionName(mode);
  const playerId = getEffectivePlayerId();
  const playerDocRef = doc(db, collectionName, playerId);

  // Sanitize nickname (between 2 and 24 chars to pass Firestore rules)
  let safeNick = nickname.trim().slice(0, 24);
  if (safeNick.length < 2) {
    safeNick = safeNick.length === 1 ? safeNick + '_' : 'Jogador';
  }

  let isNewBest = true;
  let previousBest = 0;

  try {
    const snap = await getDoc(playerDocRef);

    if (snap.exists()) {
      const data = snap.data();
      previousBest = typeof data.score === 'number' ? data.score : 0;
      if (stats.score <= previousBest) {
        isNewBest = false;
        // Update nickname or theme while preserving existing high score
        await setDoc(playerDocRef, {
          nickname: safeNick,
          score: previousBest,
          length: typeof data.length === 'number' ? data.length : stats.length,
          maxCombo: typeof data.maxCombo === 'number' ? data.maxCombo : stats.maxCombo,
          timeSurvivedSeconds:
            typeof data.timeSurvivedSeconds === 'number'
              ? data.timeSurvivedSeconds
              : stats.timeSurvivedSeconds,
          themeId: stats.themeId,
          mode: mode,
          snapshotUrl: data.snapshotUrl || stats.snapshotUrl || '',
          updatedAt: data.updatedAt || Date.now(),
        });
        return { isNewBest, previousBest };
      }
    }

    // New record or first-time record for this mode
    await setDoc(playerDocRef, {
      nickname: safeNick,
      score: stats.score,
      length: stats.length,
      maxCombo: stats.maxCombo,
      timeSurvivedSeconds: stats.timeSurvivedSeconds,
      themeId: stats.themeId,
      mode: mode,
      snapshotUrl: stats.snapshotUrl || '',
      updatedAt: Date.now(),
    });

    return { isNewBest: true, previousBest };
  } catch (err) {
    console.error(`Failed to submit score to ${collectionName}:`, err);
    throw err;
  }
}

/**
 * Subscribes to real-time updates for a specific game mode's global leaderboard.
 */
export function subscribeLeaderboard(
  mode: ControlMode,
  callback: (entries: LeaderboardEntry[]) => void,
  limitCount = 50
) {
  const collectionName = getLeaderboardCollectionName(mode);
  const q = query(
    collection(db, collectionName),
    orderBy('score', 'desc'),
    limit(limitCount)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const list: LeaderboardEntry[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          nickname: data.nickname || 'Anônimo',
          score: typeof data.score === 'number' ? data.score : 0,
          length: typeof data.length === 'number' ? data.length : 0,
          maxCombo: typeof data.maxCombo === 'number' ? data.maxCombo : 1,
          timeSurvivedSeconds:
            typeof data.timeSurvivedSeconds === 'number'
              ? data.timeSurvivedSeconds
              : 0,
          themeId: data.themeId || 'emerald',
          mode: mode,
          snapshotUrl: data.snapshotUrl || '',
          updatedAt: data.updatedAt,
        });
      });
      callback(list);
    },
    (err) => {
      console.warn(`Leaderboard subscription warning (${collectionName}):`, err);
    }
  );
}
