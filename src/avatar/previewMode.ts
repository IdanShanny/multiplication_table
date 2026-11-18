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
  return new URLSearchParams(window.location.search).get('avatarPreview') === '1';
}

export function avatarPreviewAppUrl(origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/?avatarPreview=1`;
}

export function avatarPreviewPathUrl(origin?: string): string {
  const base = origin ?? (typeof window !== 'undefined' ? window.location.origin : '');
  return `${base}/preview/avatars`;
}