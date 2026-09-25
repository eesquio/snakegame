'use client';

import { useSyncExternalStore, useCallback } from 'react';
import { GameSettings } from '@/lib/types';

export const DEFAULT_SETTINGS: GameSettings = {
  controlMode: 'FOLLOW',
  themeId: 'emerald',
  soundEnabled: true,
  screenShake: true,
  speedMode: 'normal',
  particlesLevel: 'high',
};

const STORAGE_EVENT_NAME = 'snake_360_storage_event';

function notifyStorageChange() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(STORAGE_EVENT_NAME));
  }
}

function subscribe(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('storage', callback);
  window.addEventListener(STORAGE_EVENT_NAME, callback);
  return () => {
    window.removeEventListener('storage', callback);
    window.removeEventListener(STORAGE_EVENT_NAME, callback);
  };
}

// 1. High Score Hook
function getHighScoreSnapshot(): number {
  if (typeof window === 'undefined') return 0;
  try {
    const val = localStorage.getItem('snake_360_highscore');
    return val ? parseInt(val, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

function getHighScoreServerSnapshot(): number {
  return 0;
}

export function useHighScore() {
  const highScore = useSyncExternalStore(
    subscribe,
    getHighScoreSnapshot,
    getHighScoreServerSnapshot
  );

  const setHighScore = useCallback((newScore: number) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('snake_360_highscore', newScore.toString());
      notifyStorageChange();
    } catch {}
  }, []);

  return [highScore, setHighScore] as const;
}

export function useModeHighScore(mode: 'FOLLOW' | 'DIRECT') {
  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') return 0;
    try {
      const modeKey = `snake_360_highscore_${mode}`;
      const modeVal = localStorage.getItem(modeKey);
      if (modeVal !== null) {
        return parseInt(modeVal, 10) || 0;
      }
      const legacyVal = localStorage.getItem('snake_360_highscore');
      return legacyVal ? parseInt(legacyVal, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }, [mode]);

  const highScore = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getHighScoreServerSnapshot
  );

  const setHighScore = useCallback(
    (newScore: number) => {
      if (typeof window === 'undefined') return;
      try {
        const modeKey = `snake_360_highscore_${mode}`;
        localStorage.setItem(modeKey, newScore.toString());
        localStorage.setItem('snake_360_highscore', newScore.toString());
        notifyStorageChange();
      } catch {}
    },
    [mode]
  );

  return [highScore, setHighScore] as const;
}

// 2. Player Nickname Hook
function getNicknameSnapshot(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem('snake_360_nickname') || '';
  } catch {
    return '';
  }
}

function getNicknameServerSnapshot(): string {
  return '';
}

export function usePlayerNickname() {
  const nickname = useSyncExternalStore(
    subscribe,
    getNicknameSnapshot,
    getNicknameServerSnapshot
  );

  const setNickname = useCallback((name: string) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('snake_360_nickname', name);
      notifyStorageChange();
    } catch {}
  }, []);

  return [nickname, setNickname] as const;
}


// 2. Settings Hook
let cachedSettingsRaw: string | null = null;
let cachedSettingsObj: GameSettings = DEFAULT_SETTINGS;

function getSettingsSnapshot(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem('snake_360_settings');
    if (raw !== cachedSettingsRaw) {
      cachedSettingsRaw = raw;
      cachedSettingsObj = raw
        ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) }
        : DEFAULT_SETTINGS;
    }
    return cachedSettingsObj;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function getSettingsServerSnapshot(): GameSettings {
  return DEFAULT_SETTINGS;
}

function emptySubscribe() {
  return () => {};
}

export function useIsMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
}

export function useGameSettings() {
  const settings = useSyncExternalStore(
    subscribe,
    getSettingsSnapshot,
    getSettingsServerSnapshot
  );

  const updateSettings = useCallback((newPartial: Partial<GameSettings>) => {
    if (typeof window === 'undefined') return;
    try {
      const current = getSettingsSnapshot();
      const updated = { ...current, ...newPartial };
      localStorage.setItem('snake_360_settings', JSON.stringify(updated));
      notifyStorageChange();
    } catch {}
  }, []);

  return [settings, updateSettings] as const;
}
