import type { IconName } from '@/data/icons';
import type { Localized } from '@/i18n/types';
import type { MeasureUnit } from '@/types';

export interface Food {
  id: string;
  name: Localized;
  /** What one portion looks like, e.g. "1 plate (300 g)". */
  portion: Localized;
  icon: IconName;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/**
 * Local and everyday foods with typical values for one portion. Home cooking
 * varies a lot, so these are estimates — the screen says so.
 */
export const FOODS: readonly Food[] = [
  {
    id: 'palaw',
    name: { tk: 'Palaw', ru: 'Плов', en: 'Palaw (plov)' },
    portion: { tk: '1 tabak (300 g)', ru: '1 тарелка (300 г)', en: '1 plate (300 g)' },
    icon: 'rice',
    kcal: 620, proteinG: 21, carbsG: 72, fatG: 27,
  },
  {
    id: 'dograma',
    name: { tk: 'Dograma', ru: 'Дограма', en: 'Dograma' },
    portion: { tk: '1 käse (350 g)', ru: '1 миска (350 г)', en: '1 bowl (350 g)' },
    icon: 'bowl-mix',
    kcal: 480, proteinG: 26, carbsG: 48, fatG: 20,
  },
  {
    id: 'corba',
    name: { tk: 'Çorba', ru: 'Чорба (суп)', en: 'Çorba (meat soup)' },
    portion: { tk: '1 käse (350 g)', ru: '1 миска (350 г)', en: '1 bowl (350 g)' },
    icon: 'pot-steam',
    kcal: 250, proteinG: 14, carbsG: 18, fatG: 13,
  },
  {
    id: 'gutap',
    name: { tk: 'Etli gutap', ru: 'Гутап с мясом', en: 'Gutap with meat' },
    portion: { tk: '1 sany (120 g)', ru: '1 шт. (120 г)', en: '1 piece (120 g)' },
    icon: 'food-croissant',
    kcal: 330, proteinG: 10, carbsG: 35, fatG: 17,
  },
  {
    id: 'somsa',
    name: { tk: 'Somsa', ru: 'Самса', en: 'Somsa' },
    portion: { tk: '1 sany (120 g)', ru: '1 шт. (120 г)', en: '1 piece (120 g)' },
    icon: 'food-croissant',
    kcal: 350, proteinG: 12, carbsG: 33, fatG: 19,
  },
  {
    id: 'islekli',
    name: { tk: 'Işlekli', ru: 'Ишлекли', en: 'Işlekli (meat pie)' },
    portion: { tk: '1 dilim (200 g)', ru: '1 кусок (200 г)', en: '1 slice (200 g)' },
    icon: 'pizza',
    kcal: 520, proteinG: 22, carbsG: 45, fatG: 28,
  },
  {
    id: 'manty',
    name: { tk: 'Manty', ru: 'Манты', en: 'Manty' },
    portion: { tk: '5 sany (250 g)', ru: '5 шт. (250 г)', en: '5 pieces (250 g)' },
    icon: 'food-variant',
    kcal: 450, proteinG: 24, carbsG: 45, fatG: 19,
  },
  {
    id: 'borek',
    name: { tk: 'Börek', ru: 'Бёрек (пельмени)', en: 'Börek (dumplings)' },
    portion: { tk: '1 käse (300 g)', ru: '1 миска (300 г)', en: '1 bowl (300 g)' },
    icon: 'bowl-mix-outline',
    kcal: 380, proteinG: 18, carbsG: 42, fatG: 15,
  },
  {
    id: 'gowurdak',
    name: { tk: 'Gowurdak', ru: 'Говурдак', en: 'Gowurdak (fried meat)' },
    portion: { tk: '200 g', ru: '200 г', en: '200 g' },
    icon: 'food-steak',
    kcal: 480, proteinG: 30, carbsG: 6, fatG: 38,
  },
  {
    id: 'shashlyk',
    name: { tk: 'Şaşlyk', ru: 'Шашлык', en: 'Shashlik' },
    portion: { tk: '200 g', ru: '200 г', en: '200 g' },
    icon: 'food-drumstick',
    kcal: 450, proteinG: 40, carbsG: 2, fatG: 31,
  },
  {
    id: 'corek',
    name: { tk: 'Çörek', ru: 'Лепёшка (чорек)', en: 'Çörek (flatbread)' },
    portion: { tk: '¼ çörek (100 g)', ru: '¼ лепёшки (100 г)', en: '¼ loaf (100 g)' },
    icon: 'bread-slice',
    kcal: 260, proteinG: 8, carbsG: 52, fatG: 2,
  },
  {
    id: 'pisme',
    name: { tk: 'Pişme', ru: 'Пишме', en: 'Pişme (fried dough)' },
    portion: { tk: '3 sany (90 g)', ru: '3 шт. (90 г)', en: '3 pieces (90 g)' },
    icon: 'cookie',
    kcal: 330, proteinG: 6, carbsG: 38, fatG: 17,
  },
  {
    id: 'chal',
    name: { tk: 'Çal', ru: 'Чал', en: 'Chal (camel milk)' },
    portion: { tk: '1 stakan (250 ml)', ru: '1 стакан (250 мл)', en: '1 glass (250 ml)' },
    icon: 'cup',
    kcal: 140, proteinG: 8, carbsG: 10, fatG: 8,
  },
  {
    id: 'gatyk',
    name: { tk: 'Gatyk', ru: 'Катык', en: 'Gatyk (yogurt)' },
    portion: { tk: '200 g', ru: '200 г', en: '200 g' },
    icon: 'cup-outline',
    kcal: 120, proteinG: 7, carbsG: 9, fatG: 6,
  },
  {
    id: 'gok_chay',
    name: { tk: 'Gök çaý', ru: 'Зелёный чай', en: 'Green tea' },
    portion: { tk: '1 käse', ru: '1 пиала', en: '1 cup' },
    icon: 'tea',
    kcal: 2, proteinG: 0, carbsG: 0, fatG: 0,
  },
  {
    id: 'tea_sugar',
    name: { tk: 'Şekerli gara çaý', ru: 'Чёрный чай с сахаром', en: 'Black tea with sugar' },
    portion: { tk: '1 käse + 2 çaý çemçesi', ru: '1 чашка + 2 ч. л.', en: '1 cup + 2 tsp' },
    icon: 'tea-outline',
    kcal: 32, proteinG: 0, carbsG: 8, fatG: 0,
  },
  {
    id: 'eggs',
    name: { tk: 'Ýumurtga', ru: 'Яйца', en: 'Eggs' },
    portion: { tk: '2 sany (100 g)', ru: '2 шт. (100 г)', en: '2 eggs (100 g)' },
    icon: 'egg',
    kcal: 155, proteinG: 13, carbsG: 1, fatG: 11,
  },
  {
    id: 'chicken',
    name: { tk: 'Towuk göwsi', ru: 'Куриная грудка', en: 'Chicken breast' },
    portion: { tk: '150 g', ru: '150 г', en: '150 g' },
    icon: 'food-drumstick-outline',
    kcal: 248, proteinG: 46, carbsG: 0, fatG: 5,
  },
  {
    id: 'rice',
    name: { tk: 'Tüwi (bişen)', ru: 'Рис (варёный)', en: 'Rice (cooked)' },
    portion: { tk: '200 g', ru: '200 г', en: '200 g' },
    icon: 'rice',
    kcal: 260, proteinG: 5, carbsG: 57, fatG: 1,
  },
  {
    id: 'buckwheat',
    name: { tk: 'Greçka (bişen)', ru: 'Гречка (варёная)', en: 'Buckwheat (cooked)' },
    portion: { tk: '200 g', ru: '200 г', en: '200 g' },
    icon: 'grain',
    kcal: 184, proteinG: 7, carbsG: 40, fatG: 1,
  },
  {
    id: 'pasta',
    name: { tk: 'Makaron (bişen)', ru: 'Макароны (варёные)', en: 'Pasta (cooked)' },
    portion: { tk: '200 g', ru: '200 г', en: '200 g' },
    icon: 'noodles',
    kcal: 314, proteinG: 11, carbsG: 61, fatG: 2,
  },
  {
    id: 'oatmeal',
    name: { tk: 'Süýtli suly bulamajy', ru: 'Овсянка на молоке', en: 'Oatmeal with milk' },
    portion: { tk: '1 käse (250 g)', ru: '1 миска (250 г)', en: '1 bowl (250 g)' },
    icon: 'bowl-outline',
    kcal: 250, proteinG: 10, carbsG: 35, fatG: 8,
  },
  {
    id: 'cottage_cheese',
    name: { tk: 'Tworog', ru: 'Творог 5 %', en: 'Cottage cheese' },
    portion: { tk: '150 g', ru: '150 г', en: '150 g' },
    icon: 'cheese',
    kcal: 180, proteinG: 25, carbsG: 5, fatG: 8,
  },
  {
    id: 'milk',
    name: { tk: 'Süýt', ru: 'Молоко', en: 'Milk' },
    portion: { tk: '1 stakan (250 ml)', ru: '1 стакан (250 мл)', en: '1 glass (250 ml)' },
    icon: 'cup-water',
    kcal: 130, proteinG: 8, carbsG: 12, fatG: 6,
  },
  {
    id: 'banana',
    name: { tk: 'Banan', ru: 'Банан', en: 'Banana' },
    portion: { tk: '1 sany (120 g)', ru: '1 шт. (120 г)', en: '1 banana (120 g)' },
    icon: 'fruit-cherries',
    kcal: 107, proteinG: 1, carbsG: 27, fatG: 0,
  },
  {
    id: 'apple',
    name: { tk: 'Alma', ru: 'Яблоко', en: 'Apple' },
    portion: { tk: '1 sany (180 g)', ru: '1 шт. (180 г)', en: '1 apple (180 g)' },
    icon: 'food-apple',
    kcal: 94, proteinG: 0.5, carbsG: 25, fatG: 0.3,
  },
  {
    id: 'melon',
    name: { tk: 'Gawun', ru: 'Дыня', en: 'Melon' },
    portion: { tk: '1 dilim (300 g)', ru: '1 ломоть (300 г)', en: '1 slice (300 g)' },
    icon: 'fruit-citrus',
    kcal: 102, proteinG: 2.5, carbsG: 24, fatG: 0.6,
  },
  {
    id: 'watermelon',
    name: { tk: 'Garpyz', ru: 'Арбуз', en: 'Watermelon' },
    portion: { tk: '1 dilim (300 g)', ru: '1 ломоть (300 г)', en: '1 slice (300 g)' },
    icon: 'fruit-watermelon',
    kcal: 90, proteinG: 1.8, carbsG: 23, fatG: 0.5,
  },
  {
    id: 'grapes',
    name: { tk: 'Üzüm', ru: 'Виноград', en: 'Grapes' },
    portion: { tk: '150 g', ru: '150 г', en: '150 g' },
    icon: 'fruit-grapes',
    kcal: 104, proteinG: 1, carbsG: 27, fatG: 0,
  },
  {
    id: 'dried_fruit',
    name: { tk: 'Kişmiş we gaýsy', ru: 'Изюм и курага', en: 'Raisins & dried apricots' },
    portion: { tk: '40 g', ru: '40 г', en: '40 g' },
    icon: 'seed',
    kcal: 115, proteinG: 1.5, carbsG: 28, fatG: 0.2,
  },
  {
    id: 'walnuts',
    name: { tk: 'Hoz', ru: 'Грецкие орехи', en: 'Walnuts' },
    portion: { tk: '30 g', ru: '30 г', en: '30 g' },
    icon: 'peanut',
    kcal: 196, proteinG: 4.6, carbsG: 4, fatG: 19.5,
  },
  {
    id: 'salad',
    name: { tk: 'Pomidor-hyýar salady', ru: 'Салат из помидоров и огурцов', en: 'Tomato & cucumber salad' },
    portion: { tk: '200 g', ru: '200 г', en: '200 g' },
    icon: 'leaf',
    kcal: 120, proteinG: 2, carbsG: 8, fatG: 9,
  },
];

export interface HiddenIngredient {
  id: string;
  name: Localized;
  quantity: number;
  unit: MeasureUnit;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/** The calories a camera cannot see: oils, sugar, sauces. */
export const HIDDEN_INGREDIENTS: readonly HiddenIngredient[] = [
  { id: 'cooking_oil', name: { tk: 'Ösümlik ýagy', ru: 'Растительное масло', en: 'Cooking oil' }, quantity: 1, unit: 'tbsp', kcal: 119, proteinG: 0, carbsG: 0, fatG: 14 },
  { id: 'olive_oil', name: { tk: 'Zeýtun ýagy', ru: 'Оливковое масло', en: 'Olive oil' }, quantity: 1, unit: 'tbsp', kcal: 119, proteinG: 0, carbsG: 0, fatG: 14 },
  { id: 'butter', name: { tk: 'Sary ýag', ru: 'Сливочное масло', en: 'Butter' }, quantity: 1, unit: 'tbsp', kcal: 102, proteinG: 0.1, carbsG: 0, fatG: 11.5 },
  { id: 'ghee', name: { tk: 'Eredilen ýag', ru: 'Топлёное масло', en: 'Ghee' }, quantity: 1, unit: 'tbsp', kcal: 123, proteinG: 0, carbsG: 0, fatG: 14 },
  { id: 'sugar', name: { tk: 'Şeker', ru: 'Сахар', en: 'Sugar' }, quantity: 1, unit: 'tsp', kcal: 16, proteinG: 0, carbsG: 4.2, fatG: 0 },
  { id: 'honey', name: { tk: 'Bal', ru: 'Мёд', en: 'Honey' }, quantity: 1, unit: 'tbsp', kcal: 64, proteinG: 0.1, carbsG: 17.3, fatG: 0 },
  { id: 'mayonnaise', name: { tk: 'Maýonez', ru: 'Майонез', en: 'Mayonnaise' }, quantity: 1, unit: 'tbsp', kcal: 94, proteinG: 0.1, carbsG: 0.1, fatG: 10.3 },
  { id: 'cream', name: { tk: 'Kaýmak', ru: 'Сливки', en: 'Cream' }, quantity: 2, unit: 'tbsp', kcal: 103, proteinG: 0.6, carbsG: 0.8, fatG: 11 },
  { id: 'cheese', name: { tk: 'Peýnir', ru: 'Сыр', en: 'Cheese' }, quantity: 30, unit: 'g', kcal: 120, proteinG: 7, carbsG: 0.4, fatG: 10 },
  { id: 'dressing', name: { tk: 'Salat sousy', ru: 'Заправка для салата', en: 'Salad dressing' }, quantity: 2, unit: 'tbsp', kcal: 145, proteinG: 0.2, carbsG: 2.4, fatG: 15 },
];

/** Matches a model suggestion ("cooking oil", "масло") to a quick-pick, in any language. */
export function matchHiddenIngredient(suggestion: string): HiddenIngredient | undefined {
  const needle = suggestion.trim().toLowerCase();
  if (!needle) return undefined;
  return HIDDEN_INGREDIENTS.find((ingredient) =>
    Object.values(ingredient.name).some((name) => {
      const candidate = name.toLowerCase();
      return needle.includes(candidate) || candidate.includes(needle);
    }),
  );
}
