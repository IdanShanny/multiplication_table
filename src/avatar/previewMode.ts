/** Browser client (works in mobile Safari/Chrome, not only when Platform.OS === 'web'). */
function isBrowserClient(): boolean {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
}

/** Web-only character showroom (?avatarPreview=1 or /preview/avatars). */
export function isAvatarPreviewMode(): boolean {
  if (!isBrowserClient()) {
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
  if (!isBrowserClient()) {
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