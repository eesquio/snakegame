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
import { LeaderboardEntry } from './types';

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

let currentAuthPromise: Promise<User> | null = null;

export async function ensureAnonymousAuth(): Promise<User> {
  if (auth.currentUser) {
    return auth.currentUser;
  }
  if (currentAuthPromise) {
    return currentAuthPromise;
  }
  currentAuthPromise = new Promise<User>((resolve, reject) => {
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
        } catch (err) {
          unsubscribe();
          currentAuthPromise = null;
          reject(err);
        }
      }
    });
  });
  return currentAuthPromise;
}

export async function submitPlayerScore(
  nickname: string,
  stats: {
    score: number;
    length: number;
    maxCombo: number;
    timeSurvivedSeconds: number;
    themeId: string;
  }
): Promise<{ isNewBest: boolean; previousBest: number }> {
  const user = await ensureAnonymousAuth();
  const playerDocRef = doc(db, 'leaderboard', user.uid);
  const snap = await getDoc(playerDocRef);

  let isNewBest = true;
  let previousBest = 0;

  if (snap.exists()) {
    const data = snap.data();
    previousBest = typeof data.score === 'number' ? data.score : 0;
    if (stats.score <= previousBest) {
      isNewBest = false;
      // Update nickname or theme even if score wasn't surpassed
      await setDoc(
        playerDocRef,
        {
          nickname: nickname.trim().slice(0, 24),
          themeId: stats.themeId,
        },
        { merge: true }
      );
      return { isNewBest, previousBest };
    }
  }

  await setDoc(playerDocRef, {
    nickname: nickname.trim().slice(0, 24),
    score: stats.score,
    length: stats.length,
    maxCombo: stats.maxCombo,
    timeSurvivedSeconds: stats.timeSurvivedSeconds,
    themeId: stats.themeId,
    updatedAt: Date.now(),
  });

  return { isNewBest: true, previousBest };
}

export function subscribeLeaderboard(
  callback: (entries: LeaderboardEntry[]) => void,
  limitCount = 50
) {
  const q = query(
    collection(db, 'leaderboard'),
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
          updatedAt: data.updatedAt,
        });
      });
      callback(list);
    },
    (err) => {
      console.warn('Leaderboard subscription warning:', err);
    }
  );
}
