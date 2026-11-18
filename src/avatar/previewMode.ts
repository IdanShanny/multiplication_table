import { Platform } from 'react-native';

/** Web-only character showroom (?avatarPreview=1 or /preview/avatars). */
export function isAvatarPreviewMode(): boolean {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return false;
  }
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === '/preview/avatars') {
    return true;
  }
  const params = new URLSearchParams(window.location.search);
  if (params.get('avatarPreview') === '1') {
    return true;
  }
  // tolerate casing / duplicate params from redirects
  return window.location.search.toLowerCase().includes('avatarpreview=1');
}

export function normalizeAvatarPreviewUrl(): void {
  if (Platform.OS !== 'web' || typeof window === 'undefined') {
    return;
  }
  const path = window.location.pathname.replace(/\/$/, '') || '/';
  if (path === '/preview/avatars' && !window.location.search.includes('avatarPreview=1')) {
    window.history.replaceState(null, '', '/?avatarPreview=1');
  }
}

export function avatarPreviewAppUrl(origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/?avatarPreview=1`;
}

export function avatarPreviewPathUrl(origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/preview/avatars`;
}