import { brandMeta } from '@/constants/brandMeta';

declare const require: (path: string) => number;

/**
 * Product identity lives here so the final app name can change in one place.
 */
export const brand = {
  ...brandMeta,
  logo: require('../../assets/logo.png'),
} as const;
