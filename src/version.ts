import Constants from 'expo-constants';

/**
 * Release version: keep in sync with package.json and app.json (expo.version).
 * Bump both when shipping web/Android; Render /api/health uses package.json.
 */
export function getAppVersion(): string {
  const fromExpo = Constants.expoConfig?.version;
  if (typeof fromExpo === 'string' && fromExpo.length > 0) {
    return fromExpo;
  }
  return '0.0.0';
}