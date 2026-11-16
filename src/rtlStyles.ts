import type { TextStyle, ViewStyle } from 'react-native';

/** Hebrew body copy and labels */
export const rtlText: TextStyle = {
  textAlign: 'right',
  writingDirection: 'rtl',
};

/** Text fields with Hebrew placeholders */
export const rtlInput: TextStyle = {
  textAlign: 'right',
  writingDirection: 'rtl',
};

/** Screen headers: back/action on the right in Hebrew */
export const rtlHeaderRow: ViewStyle = {
  flexDirection: 'row-reverse',
};