import type { IconName } from '@/data/icons';
import type { Localized } from '@/i18n/types';
import type { ActivityTypeId } from '@/types';

export interface ActivityType {
  id: ActivityTypeId;
  name: Localized;
  icon: IconName;
  /**
   * Metabolic equivalent, from the Compendium of Physical Activities (general
   * or moderate-pace entries). Adult-derived, so burns for children are
   * estimates — which is how the app labels them.
   */
  met: number;
}

export const ACTIVITY_TYPES: readonly ActivityType[] = [
  { id: 'running', name: { tk: 'Ylgamak', ru: 'Бег', en: 'Running' }, icon: 'run', met: 8.3 },
  { id: 'walking', name: { tk: 'Ýöremek', ru: 'Ходьба', en: 'Walking' }, icon: 'walk', met: 3.5 },
  { id: 'football', name: { tk: 'Futbol', ru: 'Футбол', en: 'Football' }, icon: 'soccer', met: 7.0 },
  { id: 'wrestling', name: { tk: 'Göreş', ru: 'Борьба', en: 'Wrestling' }, icon: 'kabaddi', met: 6.0 },
  { id: 'boxing', name: { tk: 'Boks', ru: 'Бокс', en: 'Boxing' }, icon: 'boxing-glove', met: 7.8 },
  { id: 'judo', name: { tk: 'Dzýudo', ru: 'Дзюдо', en: 'Judo' }, icon: 'karate', met: 7.0 },
  { id: 'swimming', name: { tk: 'Ýüzmek', ru: 'Плавание', en: 'Swimming' }, icon: 'swim', met: 5.8 },
  { id: 'basketball', name: { tk: 'Basketbol', ru: 'Баскетбол', en: 'Basketball' }, icon: 'basketball', met: 6.5 },
  { id: 'volleyball', name: { tk: 'Woleýbol', ru: 'Волейбол', en: 'Volleyball' }, icon: 'volleyball', met: 4.0 },
  { id: 'tennis', name: { tk: 'Tennis', ru: 'Теннис', en: 'Tennis' }, icon: 'tennis', met: 7.3 },
  { id: 'gymnastics', name: { tk: 'Gimnastika', ru: 'Гимнастика', en: 'Gymnastics' }, icon: 'gymnastics', met: 3.8 },
  { id: 'cycling', name: { tk: 'Welosiped', ru: 'Велосипед', en: 'Cycling' }, icon: 'bike', met: 7.5 },
  { id: 'strength', name: { tk: 'Güýç türgenleşigi', ru: 'Силовая', en: 'Strength' }, icon: 'weight-lifter', met: 5.0 },
  { id: 'jump_rope', name: { tk: 'Ýüp bökmek', ru: 'Скакалка', en: 'Jump rope' }, icon: 'jump-rope', met: 11.8 },
  { id: 'yoga', name: { tk: 'Ýoga', ru: 'Йога', en: 'Yoga' }, icon: 'yoga', met: 2.5 },
  { id: 'dance', name: { tk: 'Tans', ru: 'Танцы', en: 'Dance' }, icon: 'dance-ballroom', met: 5.0 },
  { id: 'horse_riding', name: { tk: 'At münmek', ru: 'Верховая езда', en: 'Horse riding' }, icon: 'horse-human', met: 5.5 },
  { id: 'training', name: { tk: 'Türgenleşik', ru: 'Тренировка', en: 'Workout' }, icon: 'dumbbell', met: 6.0 },
  { id: 'other', name: { tk: 'Başga', ru: 'Другое', en: 'Other' }, icon: 'lightning-bolt', met: 5.0 },
];

/** Types offered in the "Log activity" grid — a workout comes from a program. */
export const LOGGABLE_ACTIVITY_TYPES = ACTIVITY_TYPES.filter((type) => type.id !== 'training');

export function activityType(id: ActivityTypeId): ActivityType {
  return ACTIVITY_TYPES.find((type) => type.id === id) ?? ACTIVITY_TYPES[ACTIVITY_TYPES.length - 1]!;
}
