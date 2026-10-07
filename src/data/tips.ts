import type { Localized } from '@/i18n/types';

export const TIPS: readonly Localized[] = [
  {
    tk: 'Türgenleşikden öň, wagtynda we soň suw içiň.',
    ru: 'Пейте воду до, во время и после тренировки.',
    en: 'Drink water before, during and after training.',
  },
  {
    tk: '8–10 sagat ýatyň — myşsalar şol wagt ösýär we dikelýär.',
    ru: 'Спите 8–10 часов — именно тогда мышцы растут и восстанавливаются.',
    en: 'Sleep 8–10 hours — that’s when muscles grow and recover.',
  },
  {
    tk: 'Türgenleşikden 2–3 sagat öň uglewodly we belokly nahar iýiň.',
    ru: 'За 2–3 часа до тренировки поешьте углеводы и белок.',
    en: 'Eat a meal with carbs and protein 2–3 hours before training.',
  },
  {
    tk: 'Her türgenleşikden öň 10 minut gyzyşyň.',
    ru: 'Разминайтесь 10 минут перед каждой тренировкой.',
    en: 'Warm up for 10 minutes before every session.',
  },
  {
    tk: 'Dynç alyş güni — türgenleşigiň bir bölegi.',
    ru: 'День отдыха — это часть тренировки, а не перерыв в ней.',
    en: 'A rest day is part of training, not a break from it.',
  },
  {
    tk: 'Ara nahar üçin süýjüden gowusy — miwe we hoz.',
    ru: 'Фрукты и орехи — перекус лучше сладостей.',
    en: 'Fruit and nuts beat sweets as a snack.',
  },
  {
    tk: 'Her gün halys bolsaňyz, has köp iýmit ýa-da dynç alyş gerek bolmagy mümkin.',
    ru: 'Если вы устаёте каждый день, возможно, нужно больше еды или отдыха.',
    en: 'Tired every day? You may need more food or more rest.',
  },
  {
    tk: 'Türgenleşikden soň, myşsalar ýyly wagty olary süýndüriň.',
    ru: 'Растягивайтесь после тренировки, пока мышцы тёплые.',
    en: 'Stretch after training while your muscles are warm.',
  },
];

/** A stable tip per calendar day. */
export function tipForDate(localDate: string): Localized {
  const seed = localDate.split('-').reduce((sum, part) => sum + Number(part), 0);
  return TIPS[seed % TIPS.length]!;
}
