import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { getAppVersion } from '../version';

const bundleVersion = getAppVersion();

export const VersionFooter: React.FC = () => {
  const [version, setVersion] = useState(bundleVersion);

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/health');
        if (!res.ok) return;
        const data = await res.json();
        if (!cancelled && data?.version) {
          setVersion(String(data.version));
        }
      } catch {
        // Keep bundle version when offline or health unavailable
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <View style={styles.bar} accessibilityRole="text">
      <Text style={styles.text}>גרסה {version}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bar: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    alignItems: 'center',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(255, 255, 255, 0.25)',
    backgroundColor: 'rgba(0, 0, 0, 0.48)',
  },
  text: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.95)',
    writingDirection: 'rtl',
  },
});