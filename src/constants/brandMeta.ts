import meta from './brandMeta.json';

/**
 * Build-safe product identity. It lives in JSON so `app.config.ts` can read it
 * on any Node version — Node only loads `.ts` files natively from 22.18 on.
 */
export const brandMeta = meta;
