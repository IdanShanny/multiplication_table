import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Platform } from 'react-native';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';
import { CharacterColor, CharacterSkin } from '../types';
import { AvatarAppearance } from './catalog';

const SKIN_FILLS: Record<CharacterColor, string> = {
  white: '#FFE1C5',
  brown: '#6B4423',
  skin: '#D4A574',
};

const OUTFIT_COLORS: Record<CharacterSkin, { primary: string; accent: string }> = {
  winter: { primary: '#5DADE2', accent: '#2E86C1' },
  festive: { primary: '#E74C3C', accent: '#F1C40F' },
  summer: { primary: '#58D68D', accent: '#27AE60' },
};

interface Props {
  appearance: AvatarAppearance;
  size?: number;
  /** Bump to replay gesture animation */
  playToken?: number;
}

export const AvatarCanvas: React.FC<Props> = ({ appearance, size = 200, playToken = 0 }) => {
  const anim = useRef(new Animated.Value(0)).current;
  const gesture = appearance.gesture;
  const incomplete = appearance.incomplete || !appearance.skinTone;

  useEffect(() => {
    if (!gesture || incomplete) return;
    anim.setValue(0);
    Animated.timing(anim, {
      toValue: 1,
      duration: gesture === 'spin' ? 900 : 600,
      useNativeDriver: Platform.OS !== 'web',
    }).start();
  }, [playToken, gesture, incomplete, anim]);

  const skinFill = appearance.skinTone ? SKIN_FILLS[appearance.skinTone] : '#B0B0B0';
  const outfit = appearance.outfit ? OUTFIT_COLORS[appearance.outfit] : null;

  const translateY = gesture === 'jump' && !incomplete
    ? anim.interpolate({ inputRange: [0, 0.45, 1], outputRange: [0, -18, 0] })
    : 0;
  const rotate = gesture === 'spin' && !incomplete
    ? anim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] })
    : '0deg';
  const scale =
    gesture === 'smile' && !incomplete
      ? anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [1, 1.08, 1] })
      : 1;

  const mouthSmile = gesture === 'smile' && !incomplete;

  const svgBody = (
    <Svg width={size} height={size * 1.15} viewBox="0 0 200 230">
      <Ellipse cx="100" cy="218" rx="55" ry="10" fill="rgba(0,0,0,0.12)" />
      <G>
        <Ellipse cx="62" cy="175" rx="14" ry="32" fill={incomplete ? '#999' : skinFill} />
        <Ellipse cx="138" cy="175" rx="14" ry="32" fill={incomplete ? '#999' : skinFill} />
        <Ellipse cx="55" cy="200" rx="18" ry="11" fill="#4a4a4a" />
        <Ellipse cx="145" cy="200" rx="18" ry="11" fill="#4a4a4a" />

        <Rect x="68" y="118" width="64" height="72" rx="28" fill={incomplete ? '#aaa' : skinFill} />

        {outfit && appearance.outfit === 'summer' && (
          <Path
            d="M68 125 Q100 145 132 125 L132 165 Q100 155 68 165 Z"
            fill={outfit.primary}
          />
        )}

        {outfit && appearance.outfit === 'winter' && (
          <>
            <Path
              d="M55 118 L145 118 L155 175 Q100 168 45 175 Z"
              fill={outfit.primary}
            />
            <Rect x="90" y="118" width="20" height="58" fill={outfit.accent} opacity={0.85} />
          </>
        )}

        <Circle cx="100" cy="72" r="44" fill={incomplete ? '#999' : skinFill} />

        {outfit && appearance.outfit === 'festive' && (
          <>
            <Path d="M60 48 L100 20 L140 48 Z" fill={outfit.primary} />
            <Rect x="58" y="46" width="84" height="12" rx="4" fill="#333" />
            <Circle cx="100" cy="18" r="8" fill={outfit.accent} />
          </>
        )}

        <Circle cx="84" cy="68" r="5" fill="#333" />
        <Circle cx="116" cy="68" r="5" fill="#333" />
        {mouthSmile ? (
          <Path d="M82 88 Q100 102 118 88" stroke="#333" strokeWidth="3" fill="none" strokeLinecap="round" />
        ) : (
          <Ellipse cx="100" cy="88" rx="8" ry="4" fill="#333" opacity={0.35} />
        )}

        {outfit && appearance.outfit === 'winter' && (
          <Ellipse cx="62" cy="140" rx="18" ry="12" fill={outfit.primary} />
        )}
        {outfit && appearance.outfit === 'winter' && (
          <Ellipse cx="138" cy="140" rx="18" ry="12" fill={outfit.primary} />
        )}
      </G>
    </Svg>
  );

  const useMotion = !incomplete && !!gesture && playToken > 0;

  const inner = useMotion ? (
    <Animated.View
      style={{
        transform: [{ translateY }, { rotate }, { scale }],
      }}
    >
      {svgBody}
    </Animated.View>
  ) : (
    svgBody
  );

  return (
    <View style={[styles.wrap, { width: size, height: size * 1.15 }]}>
      {inner}
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});