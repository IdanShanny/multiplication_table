import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppData, User } from './types';
import { countExercisesByGroup } from './exerciseStats';

const PLAYER_ID_KEY = 'multiplication_table_player_id';
const PENDING_SESSION_MS_KEY = 'multiplication_table_pending_session_ms';

let sessionStartedAt = Date.now();
let sessionFlushBound = false;

function analyticsEnabled(): boolean {
  return Platform.OS === 'web' && typeof fetch !== 'undefined';
}

async function apiPost<T>(path: string, body: object): Promise<T | null> {
  if (!analyticsEnabled()) return null;
  try {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      keepalive: true,
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function getStoredPlayerId(): Promise<string | null> {
  try {
    const id = await AsyncStorage.getItem(PLAYER_ID_KEY);
    return id && id.trim() ? id.trim() : null;
  } catch {
    return null;
  }
}

async function setStoredPlayerId(playerId: string): Promise<void> {
  await AsyncStorage.setItem(PLAYER_ID_KEY, playerId);
}

function readPendingSessionMs(): number | null {
  if (Platform.OS !== 'web' || typeof sessionStorage === 'undefined') return null;
  const raw = sessionStorage.getItem(PENDING_SESSION_MS_KEY);
  if (!raw) return null;
  const n = parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 0) return null;
  sessionStorage.removeItem(PENDING_SESSION_MS_KEY);
  return n;
}

function bindSessionFlush(): void {
  if (!analyticsEnabled() || sessionFlushBound || typeof document === 'undefined') return;
  sessionFlushBound = true;

  const flush = () => {
    const sessionMs = Math.max(0, Date.now() - sessionStartedAt);
    try {
      sessionStorage.setItem(PENDING_SESSION_MS_KEY, String(sessionMs));
    } catch {
      /* ignore */
    }
  };

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flush();
  });
  window.addEventListener('pagehide', flush);
}

async function resolveAppVersion(): Promise<string | null> {
  if (!analyticsEnabled()) return null;
  try {
    const res = await fetch('/api/health');
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data?.version === 'string' ? data.version : null;
  } catch {
    return null;
  }
}

export async function ensureAnalyticsPlayerId(): Promise<string | null> {
  if (!analyticsEnabled()) return null;

  bindSessionFlush();

  const existing = await getStoredPlayerId();
  const result = await apiPost<{ playerId: string; isNew: boolean }>('/api/players/ensure', {
    clientPlayerId: existing ?? undefined,
  });

  if (!result?.playerId) return existing;

  if (result.playerId !== existing) {
    await setStoredPlayerId(result.playerId);
  }

  return result.playerId;
}

export async function recordAnalyticsVisit(appData: AppData, playerId: string): Promise<void> {
  if (!analyticsEnabled() || !playerId) return;

  const counts = countExercisesByGroup(appData);
  const appVersion = await resolveAppVersion();
  const sessionMs = readPendingSessionMs();

  sessionStartedAt = Date.now();

  await apiPost('/api/visits', {
    playerId,
    name: appData.user?.name,
    gender: appData.user?.gender,
    ...counts,
    appVersion,
    sessionMs,
  });
}

export async function recordAnalyticsRegistration(user: User, playerId: string): Promise<void> {
  if (!analyticsEnabled() || !playerId) return;

  await apiPost('/api/registrations', {
    playerId,
    name: user.name,
    gender: user.gender,
  });
}

export async function syncAnalyticsOnAppLoad(appData: AppData): Promise<void> {
  const playerId = await ensureAnalyticsPlayerId();
  if (!playerId) return;
  await recordAnalyticsVisit(appData, playerId);
}

export async function syncAnalyticsOnRegister(user: User, appData: AppData): Promise<void> {
  const playerId = await ensureAnalyticsPlayerId();
  if (!playerId) return;
  await recordAnalyticsRegistration(user, playerId);
  await recordAnalyticsVisit(appData, playerId);
}