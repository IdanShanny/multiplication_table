import { CharacterAnimation, CharacterColor, CharacterSkin } from '../types';

export interface AvatarAppearance {
  skinTone?: CharacterColor;
  outfit?: CharacterSkin;
  gesture?: CharacterAnimation;
  /** Stage 0 = gray silhouette only */
  incomplete?: boolean;
}

export const SKIN_TONE_OPTIONS: { id: CharacterColor; labelHe: string }[] = [
  { id: 'white', labelHe: 'לבן' },
  { id: 'brown', labelHe: 'שחום' },
  { id: 'skin', labelHe: 'צבע גוף' },
];

export const OUTFIT_OPTIONS: { id: CharacterSkin; labelHe: string }[] = [
  { id: 'winter', labelHe: 'חורפי' },
  { id: 'festive', labelHe: 'חגיגי' },
  { id: 'summer', labelHe: 'קיצי' },
];

export const GESTURE_OPTIONS: { id: CharacterAnimation; labelHe: string }[] = [
  { id: 'jump', labelHe: 'ניתור' },
  { id: 'smile', labelHe: 'חיוך' },
  { id: 'spin', labelHe: 'סיבוב' },
];

export function appearanceFromStage(
  skinTone?: CharacterColor,
  outfit?: CharacterSkin,
  gesture?: CharacterAnimation,
  stage?: number
): AvatarAppearance {
  if (stage === 0 || (!skinTone && !outfit && !gesture && stage === undefined)) {
    return { incomplete: true };
  }
  return {
    skinTone,
    outfit,
    gesture,
    incomplete: false,
  };
}

/** Every combination kids can build (3×3×3). */
export function enumerateFullAppearances(): AvatarAppearance[] {
  const list: AvatarAppearance[] = [];
  for (const s of SKIN_TONE_OPTIONS) {
    for (const o of OUTFIT_OPTIONS) {
      for (const g of GESTURE_OPTIONS) {
        list.push({ skinTone: s.id, outfit: o.id, gesture: g.id, incomplete: false });
      }
    }
  }
  return list;
}

export function appearanceLabel(a: AvatarAppearance): string {
  if (a.incomplete) return 'דמות אפורה (התחלה)';
  const skin = SKIN_TONE_OPTIONS.find((x) => x.id === a.skinTone)?.labelHe ?? '?';
  const out = OUTFIT_OPTIONS.find((x) => x.id === a.outfit)?.labelHe ?? '?';
  const ges = GESTURE_OPTIONS.find((x) => x.id === a.gesture)?.labelHe ?? '?';
  return `${skin} · ${out} · ${ges}`;
}