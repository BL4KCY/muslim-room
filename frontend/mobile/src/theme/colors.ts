import { Platform } from 'react-native';

export const COLORS = {
  bgDeep: '#0A221C',
  bgSanctuary: '#0E2A23',
  bgCard: '#133A30',
  bgCardElevated: '#174438',
  borderGold: 'rgba(197, 160, 89, 0.25)',
  borderSubtle: 'rgba(255, 255, 255, 0.08)',
  goldPrimary: '#C5A059',
  goldBright: '#F0CE63',
  goldLight: '#FFF3B8',
  goldDribbble: '#D4AF37',
  sageMuted: '#6B8E7C',
  tealLive: '#2DD4BF',
  textIvory: '#FFFFFF',
  textSage: '#8A9E96',
  danger: '#F87171',
} as const;

export const FONTS = {
  tajawal: 'Tajawal',
  tajawalRegular: 'Tajawal-Regular',
  tajawalMedium: 'Tajawal-Medium',
  tajawalBold: 'Tajawal-Bold',
  tajawalLight: 'Tajawal-Light',
  tajawalExtraBold: 'Tajawal-ExtraBold',
  amiri: 'Amiri',
  amiriRegular: 'Amiri-Regular',
  amiriBold: 'Amiri-Bold',
  amiriItalic: 'Amiri-Italic',
  cinzel: Platform.select({ ios: 'Cinzel', android: 'serif', default: 'serif' }) as string,
} as const;
