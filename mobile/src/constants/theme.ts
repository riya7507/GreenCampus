/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#263238',
    background: '#F8FAF8',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E8F5E9',
    textSecondary: '#546E7A',
    primary: '#2E7D32',
    lightGreen: '#81C784',
    teal: '#00897B',
    blue: '#1976D2',
    amber: '#F9A825',
    white: '#FFFFFF',
    primaryLight: '#E8F5E9',
    tint: '#2E7D32',
  },
  dark: {
    text: '#FFFFFF',
    background: '#121815',
    backgroundElement: '#1B2420',
    backgroundSelected: '#23342B',
    textSecondary: '#90A4AE',
    primary: '#4CAF50',
    lightGreen: '#81C784',
    teal: '#26A69A',
    blue: '#42A5F5',
    amber: '#FBC02D',
    white: '#FFFFFF',
    primaryLight: '#1E3326',
    tint: '#81C784',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
