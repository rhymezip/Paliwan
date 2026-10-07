import type { IconName } from '@/data/icons';
import type { ProgramId } from '@/data/programs';
import type { Localized } from '@/i18n/types';
import type { ActivityTypeId, SportId } from '@/types';

export interface Sport {
  id: SportId;
  name: Localized;
  icon: IconName;
  /** Pre-selected in "Log activity" for this athlete. */
  activity: ActivityTypeId;
  /** Programs flagged as a good fit on the Training tab. */
  programs: readonly ProgramId[];
}

export const SPORTS: readonly Sport[] = [
  { id: 'football', name: { tk: 'Futbol', ru: 'Футбол', en: 'Football' }, icon: 'soccer', activity: 'football', programs: ['speed', 'endurance'] },
  { id: 'wrestling', name: { tk: 'Göreş', ru: 'Борьба', en: 'Wrestling' }, icon: 'kabaddi', activity: 'wrestling', programs: ['strength', 'core'] },
  { id: 'boxing', name: { tk: 'Boks', ru: 'Бокс', en: 'Boxing' }, icon: 'boxing-glove', activity: 'boxing', programs: ['endurance', 'strength'] },
  { id: 'judo', name: { tk: 'Dzýudo', ru: 'Дзюдо', en: 'Judo' }, icon: 'karate', activity: 'judo', programs: ['strength', 'core'] },
  { id: 'swimming', name: { tk: 'Ýüzmek', ru: 'Плавание', en: 'Swimming' }, icon: 'swim', activity: 'swimming', programs: ['endurance', 'mobility'] },
  { id: 'athletics', name: { tk: 'Ýeňil atletika', ru: 'Лёгкая атлетика', en: 'Athletics' }, icon: 'run-fast', activity: 'running', programs: ['speed', 'endurance'] },
  { id: 'basketball', name: { tk: 'Basketbol', ru: 'Баскетбол', en: 'Basketball' }, icon: 'basketball', activity: 'basketball', programs: ['speed', 'strength'] },
  { id: 'volleyball', name: { tk: 'Woleýbol', ru: 'Волейбол', en: 'Volleyball' }, icon: 'volleyball', activity: 'volleyball', programs: ['speed', 'core'] },
  { id: 'gymnastics', name: { tk: 'Gimnastika', ru: 'Гимнастика', en: 'Gymnastics' }, icon: 'gymnastics', activity: 'gymnastics', programs: ['mobility', 'strength'] },
  { id: 'tennis', name: { tk: 'Tennis', ru: 'Теннис', en: 'Tennis' }, icon: 'tennis', activity: 'tennis', programs: ['speed', 'core'] },
  { id: 'cycling', name: { tk: 'Welosiped sporty', ru: 'Велоспорт', en: 'Cycling' }, icon: 'bike', activity: 'cycling', programs: ['endurance', 'core'] },
  { id: 'other', name: { tk: 'Başga', ru: 'Другое', en: 'Other' }, icon: 'lightning-bolt', activity: 'other', programs: ['strength', 'mobility'] },
];

export function sportById(id: SportId): Sport {
  return SPORTS.find((sport) => sport.id === id) ?? SPORTS[SPORTS.length - 1]!;
}
