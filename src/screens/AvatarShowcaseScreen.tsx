import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  enumerateFullAppearances,
  appearanceLabel,
  appearanceFromStage,
  AvatarAppearance,
} from '../avatar/catalog';
import { AvatarCanvas } from '../avatar/AvatarCanvas';
import { AvatarGestureLottie } from '../avatar/AvatarGestureLottie';
import { avatarPreviewAppUrl } from '../avatar/previewMode';
import { rtlText } from '../rtlStyles';

export const AvatarShowcaseScreen: React.FC = () => {
  const combos = useMemo(() => {
    const gray = appearanceFromStage(undefined, undefined, undefined, 0);
    return [gray, ...enumerateFullAppearances()];
  }, []);

  const [playTokens, setPlayTokens] = useState<Record<number, number>>({});

  const replay = (index: number) => {
    setPlayTokens((prev) => ({ ...prev, [index]: (prev[index] ?? 0) + 1 }));
  };

  const openApp = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  return (
    <LinearGradient colors={['#5b2c8f', '#8e44ad']} style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>תצוגת דמויות — כל העיצובים</Text>
        <Text style={styles.subtitle}>
          לחיצה על כרטיס מפעילה שוב את המחווה. אין צורך לשחק או לצבור נקודות.
        </Text>
        {Platform.OS === 'web' && (
          <Text style={styles.hint}>
            קישור ישיר: {avatarPreviewAppUrl()}
          </Text>
        )}

        <View style={styles.grid}>
          {combos.map((appearance, index) => (
            <ShowcaseCard
              key={index}
              appearance={appearance}
              label={appearanceLabel(appearance)}
              playToken={playTokens[index] ?? 0}
              onPress={() => replay(index)}
            />
          ))}
        </View>

        <TouchableOpacity style={styles.backButton} onPress={openApp}>
          <Text style={styles.backText}>חזרה לאפליקציה</Text>
        </TouchableOpacity>
      </ScrollView>
    </LinearGradient>
  );
};

const ShowcaseCard: React.FC<{
  appearance: AvatarAppearance;
  label: string;
  playToken: number;
  onPress: () => void;
}> = ({ appearance, label, playToken, onPress }) => {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <View style={styles.cardInner}>
        <AvatarCanvas appearance={appearance} size={120} playToken={playToken} />
        <AvatarGestureLottie gesture={appearance.gesture} playToken={playToken} size={90} />
      </View>
      <Text style={styles.cardLabel}>{label}</Text>
      <Text style={styles.cardTap}>לחץ להפעלת מחווה</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: {
    padding: 20,
    paddingTop: Platform.OS === 'web' ? 28 : 48,
    paddingBottom: 48,
  },
  title: {
    color: 'white',
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    ...rtlText,
  },
  subtitle: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
    ...rtlText,
  },
  hint: {
    color: 'rgba(255,255,255,0.75)',
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 20,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
  },
  card: {
    width: 168,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: 12,
    alignItems: 'center',
  },
  cardInner: {
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    ...rtlText,
  },
  cardTap: {
    fontSize: 11,
    color: '#8e44ad',
    marginTop: 4,
    ...rtlText,
  },
  backButton: {
    marginTop: 28,
    alignSelf: 'center',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 24,
  },
  backText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#8e44ad',
    ...rtlText,
  },
});