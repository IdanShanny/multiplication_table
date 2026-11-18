import React, { useEffect, useRef } from 'react';
import { View, StyleSheet } from 'react-native';
import LottieView from 'lottie-react-native';
import { CharacterAnimation } from '../types';
import sparkle from '../../assets/lottie/sparkle.json';

/** Replace per-gesture JSON under assets/lottie/ when designer assets are ready. */
const SOURCES: Partial<
  Record<CharacterAnimation, string | { uri: string } | typeof sparkle>
> = {
  jump: sparkle,
  smile: sparkle,
  spin: sparkle,
};

interface Props {
  gesture?: CharacterAnimation;
  playToken: number;
  size?: number;
}

export const AvatarGestureLottie: React.FC<Props> = ({ gesture, playToken, size = 80 }) => {
  const ref = useRef<LottieView>(null);
  const source = gesture ? SOURCES[gesture] : undefined;

  useEffect(() => {
    if (!source || playToken === 0) return;
    ref.current?.reset?.();
    ref.current?.play?.();
  }, [playToken, source]);

  if (!source) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.overlay, { width: size, height: size }]}>
      <LottieView
        ref={ref}
        source={source}
        loop={false}
        style={{ width: size, height: size }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    bottom: 4,
    alignSelf: 'center',
    zIndex: 2,
  },
});