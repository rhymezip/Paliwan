/** Build-safe product identity. app.config.ts imports this without loading assets. */
export const brandMeta = {
  name: 'Paliwan',
  descriptor: 'Food, understood.',
  colors: {
    green: '#008C4A',
    deepGreen: '#005C36',
    mint: '#E7F4EC',
    gold: '#D9A441',
  },
} as const;
