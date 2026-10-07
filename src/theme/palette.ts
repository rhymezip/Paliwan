import { brandMeta } from '@/constants/brandMeta';

/**
 * Every colour in the app. Nothing outside this file holds a hex value.
 * Light and dark share one shape so screens never branch on the scheme.
 */

export interface Colors {
  /** Screen background. */
  background: string;
  /** Cards, sheets, rows. */
  surface: string;
  /** Inputs, chips, pressed rows, inner tiles. */
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  textFaint: string;
  primary: string;
  /** Tinted background behind primary content. */
  primarySoft: string;
  onPrimary: string;
  danger: string;
  dangerSoft: string;
  warning: string;
  success: string;
  /** Ring and accent colours per domain. */
  steps: string;
  water: string;
  food: string;
  activity: string;
  protein: string;
  carbs: string;
  fat: string;
  /** Behind sheets and the camera controls. */
  overlay: string;
  tabBar: string;
  /** Text and icons placed on a gradient or photo. */
  onMedia: string;
  onMediaMuted: string;
  skeleton: string;
}

export const lightColors: Colors = {
  background: '#F3F6F4',
  surface: '#FFFFFF',
  surfaceAlt: '#EDF2EF',
  border: '#E1E8E4',
  text: '#0F1B15',
  textMuted: '#5D6B64',
  textFaint: '#97A39D',
  primary: brandMeta.colors.green,
  primarySoft: '#E1F4E9',
  onPrimary: '#FFFFFF',
  danger: '#E5484D',
  dangerSoft: '#FDECEC',
  warning: '#F2A10F',
  success: '#16A34A',
  steps: '#FF7A1A',
  water: '#1E8CF0',
  food: brandMeta.colors.green,
  activity: '#E5487D',
  protein: '#EF6C4A',
  carbs: '#F2B233',
  fat: '#8B7CF6',
  overlay: 'rgba(8, 15, 11, 0.45)',
  tabBar: '#FFFFFF',
  onMedia: '#FFFFFF',
  onMediaMuted: 'rgba(255, 255, 255, 0.78)',
  skeleton: '#E6ECE9',
};

export const darkColors: Colors = {
  background: brandMeta.colors.night,
  surface: '#141E19',
  surfaceAlt: '#1B2722',
  border: '#25342D',
  text: '#ECF3EF',
  textMuted: '#9AADA4',
  textFaint: '#62756C',
  primary: '#2BD083',
  primarySoft: '#123526',
  onPrimary: '#04140B',
  danger: '#FF6B6F',
  dangerSoft: '#3A1719',
  warning: '#FFB443',
  success: '#2BD083',
  steps: '#FF8F3D',
  water: '#4AA8FF',
  food: '#2BD083',
  activity: '#FF6B9A',
  protein: '#FF8466',
  carbs: '#FFC857',
  fat: '#A397FF',
  overlay: 'rgba(0, 0, 0, 0.6)',
  tabBar: '#111A15',
  onMedia: '#FFFFFF',
  onMediaMuted: 'rgba(255, 255, 255, 0.74)',
  skeleton: '#1E2A24',
};

/** Two-stop gradients. Programs pick one by name. */
export type GradientName = 'hero' | 'orange' | 'indigo' | 'blue' | 'teal' | 'pink';

export const lightGradients: Record<GradientName, readonly [string, string]> = {
  hero: ['#00A35A', '#00703D'],
  orange: ['#FF9A3D', '#F0522B'],
  indigo: ['#6D6AF5', '#4338CA'],
  blue: ['#38A9FF', '#1565D8'],
  teal: ['#2CC8A8', '#0E8C74'],
  pink: ['#F7609A', '#B33CC4'],
};

export const darkGradients: Record<GradientName, readonly [string, string]> = {
  hero: ['#0F6B41', '#093F27'],
  orange: ['#C8622A', '#8E2F1A'],
  indigo: ['#4B48C4', '#2C2585'],
  blue: ['#1F72C4', '#0E3F82'],
  teal: ['#178F79', '#0A5446'],
  pink: ['#B8406F', '#73267F'],
};

/** Behind the live camera, whatever the theme. */
export const camera = {
  backdrop: '#000000',
  controlScrim: 'rgba(15, 20, 17, 0.5)',
  overlayScrim: 'rgba(15, 20, 17, 0.6)',
} as const;
