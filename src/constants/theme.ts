/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    primary: '#2962ff',
    primaryLight: '#e8f0fe',
    primaryDark: '#1a4bd6',
    text: '#222222',
    background: '#f4f5f8',
    backgroundElement: '#ffffff',
    backgroundSelected: '#e2e8f0',
    textSecondary: '#666666',
    textMuted: '#888888',
    border: '#e1e4e8',
    card: '#ffffff',
    tint: '#2962ff',
    tabIconDefault: '#888888',
    tabIconSelected: '#2962ff',
    success: '#00c853',
    warning: '#ff9800',
    error: '#f44336',
  },
  dark: {
    primary: '#3b82f6',
    primaryLight: '#1e3a8a',
    primaryDark: '#1d4ed8',
    text: '#f8fafc',
    background: '#0f172a',
    backgroundElement: '#1e293b',
    backgroundSelected: '#334155',
    textSecondary: '#94a3b8',
    border: '#334155',
    card: '#1e293b',
    tint: '#3b82f6',
    tabIconDefault: '#64748b',
    tabIconSelected: '#3b82f6',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
  },
} as const;

export const Currency = {
  code: 'GHS',
  symbol: '₵',
  name: 'Ghanaian Cedi',
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    sans: 'system-ui',
    serif: 'ui-serif',
    rounded: 'ui-rounded',
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'system-ui, sans-serif',
    serif: 'serif',
    rounded: 'sans-serif',
    mono: 'monospace',
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

