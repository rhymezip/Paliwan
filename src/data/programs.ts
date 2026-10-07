import type { ExerciseId } from '@/data/exercises';
import type { IconName } from '@/data/icons';
import type { Localized } from '@/i18n/types';
import type { GradientName } from '@/theme/palette';

export type ProgramId = 'speed' | 'strength' | 'endurance' | 'mobility' | 'core';

export interface Block {
  exercise: ExerciseId;
  sets: number;
  /** A block is either reps or a timed hold. */
  reps?: number;
  seconds?: number;
  /** Do the reps or the hold on each side. */
  perSide?: boolean;
  /** Rest after each set, in seconds. */
  rest: number;
}

export interface Workout {
  name: Localized;
  blocks: readonly Block[];
}

export interface Program {
  id: ProgramId;
  name: Localized;
  summary: Localized;
  icon: IconName;
  gradient: GradientName;
  /** MET used for the burn of a whole session, rests included. */
  met: number;
  /** Cycled A, B, C for four weeks. */
  workouts: readonly [Workout, Workout, Workout];
}

export const WEEKS = 4;
export const SESSIONS_PER_WEEK = 3;
export const SESSIONS_PER_PROGRAM = WEEKS * SESSIONS_PER_WEEK;

/** Seconds a rep-based set is assumed to take, for duration estimates. */
const SECONDS_PER_REP = 3;

export const PROGRAMS: readonly Program[] = [
  {
    id: 'speed',
    name: { tk: 'Tizlik we çalasyňlyk', ru: 'Скорость и ловкость', en: 'Speed & agility' },
    summary: {
      tk: 'Çalt aýaklar, ugur üýtgetmek we partlaýjy güýç — futbol, basketbol we tennis üçin.',
      ru: 'Быстрые ноги, смена направления и взрывная сила — для футбола, баскетбола и тенниса.',
      en: 'Quick feet, change of direction and explosive power — for football, basketball and tennis.',
    },
    icon: 'run-fast',
    gradient: 'orange',
    met: 7.0,
    workouts: [
      {
        name: { tk: 'Çalt aýaklar', ru: 'Быстрые ноги', en: 'Quick feet' },
        blocks: [
          { exercise: 'jumping_jacks', sets: 1, seconds: 45, rest: 15 },
          { exercise: 'high_knees', sets: 3, seconds: 20, rest: 20 },
          { exercise: 'fast_feet', sets: 3, seconds: 15, rest: 20 },
          { exercise: 'lateral_shuffle', sets: 3, seconds: 20, rest: 20 },
          { exercise: 'skater_jumps', sets: 3, reps: 10, rest: 30 },
          { exercise: 'squat_jumps', sets: 3, reps: 8, rest: 30 },
          { exercise: 'hamstring_stretch', sets: 1, seconds: 30, perSide: true, rest: 0 },
        ],
      },
      {
        name: { tk: 'Ugur üýtgetmek', ru: 'Смена направления', en: 'Change of direction' },
        blocks: [
          { exercise: 'arm_circles', sets: 1, seconds: 30, rest: 10 },
          { exercise: 'butt_kicks', sets: 2, seconds: 30, rest: 15 },
          { exercise: 'lateral_shuffle', sets: 3, seconds: 20, rest: 20 },
          { exercise: 'high_knees', sets: 4, seconds: 15, rest: 20 },
          { exercise: 'single_leg_balance', sets: 2, seconds: 30, perSide: true, rest: 10 },
          { exercise: 'mountain_climbers', sets: 3, seconds: 20, rest: 20 },
          { exercise: 'quad_stretch', sets: 1, seconds: 30, perSide: true, rest: 0 },
        ],
      },
      {
        name: { tk: 'Partlaýjy güýç', ru: 'Взрывная сила', en: 'Explosive power' },
        blocks: [
          { exercise: 'jumping_jacks', sets: 1, seconds: 60, rest: 15 },
          { exercise: 'skater_jumps', sets: 3, reps: 12, rest: 30 },
          { exercise: 'fast_feet', sets: 4, seconds: 10, rest: 20 },
          { exercise: 'squat_jumps', sets: 3, reps: 10, rest: 40 },
          { exercise: 'burpees', sets: 3, reps: 6, rest: 40 },
          { exercise: 'hip_flexor_stretch', sets: 1, seconds: 30, perSide: true, rest: 0 },
        ],
      },
    ],
  },
  {
    id: 'strength',
    name: { tk: 'Öz agramyň bilen güýç', ru: 'Сила с весом тела', en: 'Bodyweight strength' },
    summary: {
      tk: 'Enjamsyz güýç — göreş, dzýudo we gimnastika üçin berk esas.',
      ru: 'Сила без инвентаря — крепкая база для борьбы, дзюдо и гимнастики.',
      en: 'Strength with no equipment — a solid base for wrestling, judo and gymnastics.',
    },
    icon: 'arm-flex',
    gradient: 'indigo',
    met: 5.0,
    workouts: [
      {
        name: { tk: 'Bütin beden', ru: 'Всё тело', en: 'Full body' },
        blocks: [
          { exercise: 'arm_circles', sets: 1, seconds: 30, rest: 10 },
          { exercise: 'squats', sets: 3, reps: 12, rest: 45 },
          { exercise: 'push_ups', sets: 3, reps: 8, rest: 45 },
          { exercise: 'glute_bridge', sets: 3, reps: 12, rest: 30 },
          { exercise: 'plank', sets: 3, seconds: 30, rest: 30 },
          { exercise: 'superman', sets: 2, reps: 10, rest: 0 },
        ],
      },
      {
        name: { tk: 'Aýaklar we göwre', ru: 'Ноги и кор', en: 'Legs & core' },
        blocks: [
          { exercise: 'leg_swings', sets: 1, seconds: 30, perSide: true, rest: 10 },
          { exercise: 'lunges', sets: 3, reps: 8, perSide: true, rest: 45 },
          { exercise: 'wall_sit', sets: 3, seconds: 30, rest: 45 },
          { exercise: 'calf_raises', sets: 3, reps: 15, rest: 30 },
          { exercise: 'side_plank', sets: 2, seconds: 20, perSide: true, rest: 20 },
          { exercise: 'knee_push_ups', sets: 3, reps: 10, rest: 0 },
        ],
      },
      {
        name: { tk: 'Ýokarky beden', ru: 'Верх тела', en: 'Upper body' },
        blocks: [
          { exercise: 'jumping_jacks', sets: 1, seconds: 45, rest: 15 },
          { exercise: 'push_ups', sets: 4, reps: 8, rest: 45 },
          { exercise: 'chair_dips', sets: 3, reps: 10, rest: 45 },
          { exercise: 'squats', sets: 3, reps: 15, rest: 30 },
          { exercise: 'plank', sets: 2, seconds: 40, rest: 30 },
          { exercise: 'superman', sets: 2, reps: 12, rest: 0 },
        ],
      },
    ],
  },
  {
    id: 'endurance',
    name: { tk: 'Çydamlylyk', ru: 'Выносливость', en: 'Endurance base' },
    summary: {
      tk: 'Interwallar we ylgaw — tutuş oýna ýa-da ýaryşa ýeterlik dem.',
      ru: 'Интервалы и бег — дыхания хватит на всю игру или забег.',
      en: 'Intervals and running — enough breath for the whole match or race.',
    },
    icon: 'heart-pulse',
    gradient: 'blue',
    met: 7.5,
    workouts: [
      {
        name: { tk: 'Interwallar', ru: 'Интервалы', en: 'Intervals' },
        blocks: [
          { exercise: 'jog_in_place', sets: 1, seconds: 120, rest: 15 },
          { exercise: 'jumping_jacks', sets: 4, seconds: 40, rest: 20 },
          { exercise: 'mountain_climbers', sets: 4, seconds: 30, rest: 20 },
          { exercise: 'burpees', sets: 3, reps: 8, rest: 30 },
          { exercise: 'jog_in_place', sets: 1, seconds: 120, rest: 0 },
        ],
      },
      {
        name: { tk: 'Ýüp we ylgaw', ru: 'Скакалка и бег', en: 'Rope & run' },
        blocks: [
          { exercise: 'jog_in_place', sets: 1, seconds: 90, rest: 15 },
          { exercise: 'jump_rope', sets: 5, seconds: 60, rest: 30 },
          { exercise: 'high_knees', sets: 4, seconds: 30, rest: 20 },
          { exercise: 'squats', sets: 3, reps: 15, rest: 30 },
          { exercise: 'jog_in_place', sets: 1, seconds: 180, rest: 0 },
        ],
      },
      {
        name: { tk: 'Çydamlylyk tapgyry', ru: 'Функциональный круг', en: 'Conditioning' },
        blocks: [
          { exercise: 'jog_in_place', sets: 1, seconds: 90, rest: 15 },
          { exercise: 'burpees', sets: 4, reps: 8, rest: 30 },
          { exercise: 'skater_jumps', sets: 4, reps: 12, rest: 20 },
          { exercise: 'mountain_climbers', sets: 4, seconds: 30, rest: 20 },
          { exercise: 'jumping_jacks', sets: 2, seconds: 60, rest: 0 },
        ],
      },
    ],
  },
  {
    id: 'mobility',
    name: { tk: 'Hereketlilik we çeýelik', ru: 'Подвижность и гибкость', en: 'Mobility & flexibility' },
    summary: {
      tk: 'Süýndürmek we deňagramlylyk — dikelmek we şikesleriň öňüni almak üçin.',
      ru: 'Растяжка и баланс — для восстановления и профилактики травм.',
      en: 'Stretching and balance — for recovery and fewer injuries.',
    },
    icon: 'yoga',
    gradient: 'teal',
    met: 2.5,
    workouts: [
      {
        name: { tk: 'Bil we aýaklar', ru: 'Таз и ноги', en: 'Hips & legs' },
        blocks: [
          { exercise: 'arm_circles', sets: 1, seconds: 45, rest: 10 },
          { exercise: 'leg_swings', sets: 1, seconds: 30, perSide: true, rest: 10 },
          { exercise: 'cat_cow', sets: 2, seconds: 40, rest: 10 },
          { exercise: 'hamstring_stretch', sets: 2, seconds: 30, perSide: true, rest: 10 },
          { exercise: 'quad_stretch', sets: 2, seconds: 30, perSide: true, rest: 10 },
          { exercise: 'hip_flexor_stretch', sets: 2, seconds: 30, perSide: true, rest: 10 },
          { exercise: 'childs_pose', sets: 1, seconds: 60, rest: 0 },
        ],
      },
      {
        name: { tk: 'Arka we göwre', ru: 'Спина и кор', en: 'Back & core' },
        blocks: [
          { exercise: 'jumping_jacks', sets: 1, seconds: 45, rest: 10 },
          { exercise: 'cat_cow', sets: 2, seconds: 40, rest: 10 },
          { exercise: 'bird_dog', sets: 2, reps: 10, rest: 15 },
          { exercise: 'hip_flexor_stretch', sets: 2, seconds: 40, perSide: true, rest: 10 },
          { exercise: 'hamstring_stretch', sets: 2, seconds: 40, perSide: true, rest: 10 },
          { exercise: 'childs_pose', sets: 1, seconds: 60, rest: 0 },
        ],
      },
      {
        name: { tk: 'Doly akym', ru: 'Плавный комплекс', en: 'Full-body flow' },
        blocks: [
          { exercise: 'leg_swings', sets: 1, seconds: 30, perSide: true, rest: 10 },
          { exercise: 'quad_stretch', sets: 2, seconds: 40, perSide: true, rest: 10 },
          { exercise: 'single_leg_balance', sets: 2, seconds: 30, perSide: true, rest: 10 },
          { exercise: 'cat_cow', sets: 2, seconds: 40, rest: 10 },
          { exercise: 'hamstring_stretch', sets: 2, seconds: 40, perSide: true, rest: 10 },
          { exercise: 'childs_pose', sets: 1, seconds: 90, rest: 0 },
        ],
      },
    ],
  },
  {
    id: 'core',
    name: { tk: 'Göwre we goraýyş', ru: 'Кор и защита от травм', en: 'Core & injury prevention' },
    summary: {
      tk: 'Berk göwre we durnukly bogunlar — kontakt sportlarynda şikesden goraýar.',
      ru: 'Сильный кор и стабильные суставы — защита от травм в контактных видах спорта.',
      en: 'A strong core and stable joints — protection in contact sports.',
    },
    icon: 'shield-check-outline',
    gradient: 'pink',
    met: 4.0,
    workouts: [
      {
        name: { tk: 'Durnuklylyk', ru: 'Стабильность', en: 'Stability' },
        blocks: [
          { exercise: 'arm_circles', sets: 1, seconds: 30, rest: 10 },
          { exercise: 'plank', sets: 3, seconds: 30, rest: 30 },
          { exercise: 'dead_bug', sets: 3, reps: 10, rest: 30 },
          { exercise: 'bird_dog', sets: 3, reps: 10, rest: 30 },
          { exercise: 'side_plank', sets: 2, seconds: 20, perSide: true, rest: 20 },
          { exercise: 'glute_bridge', sets: 3, reps: 12, rest: 0 },
        ],
      },
      {
        name: { tk: 'Deňagramlylyk', ru: 'Баланс', en: 'Balance' },
        blocks: [
          { exercise: 'jumping_jacks', sets: 1, seconds: 45, rest: 10 },
          { exercise: 'crunches', sets: 3, reps: 15, rest: 30 },
          { exercise: 'superman', sets: 3, reps: 10, rest: 30 },
          { exercise: 'single_leg_balance', sets: 3, seconds: 30, perSide: true, rest: 15 },
          { exercise: 'side_plank', sets: 2, seconds: 25, perSide: true, rest: 20 },
          { exercise: 'calf_raises', sets: 3, reps: 15, rest: 0 },
        ],
      },
      {
        name: { tk: 'Berk göwre', ru: 'Сильный кор', en: 'Strong core' },
        blocks: [
          { exercise: 'high_knees', sets: 1, seconds: 30, rest: 10 },
          { exercise: 'plank', sets: 3, seconds: 40, rest: 30 },
          { exercise: 'dead_bug', sets: 3, reps: 12, rest: 30 },
          { exercise: 'glute_bridge', sets: 3, reps: 15, rest: 30 },
          { exercise: 'bird_dog', sets: 3, reps: 12, rest: 30 },
          { exercise: 'childs_pose', sets: 1, seconds: 60, rest: 0 },
        ],
      },
    ],
  },
];

export function programById(id: string): Program | undefined {
  return PROGRAMS.find((program) => program.id === id);
}

export function isProgramId(value: unknown): value is ProgramId {
  return typeof value === 'string' && PROGRAMS.some((program) => program.id === value);
}

/** Sessions cycle through the three workouts: A, B, C, A, B, C… */
export function workoutForSession(program: Program, sessionIndex: number): Workout {
  return program.workouts[sessionIndex % program.workouts.length]!;
}

/** Work seconds of one set: timed holds as given, reps at ~3 s each. */
export function setWorkSeconds(block: Block): number {
  const sides = block.perSide ? 2 : 1;
  const base = block.seconds ?? (block.reps ?? 0) * SECONDS_PER_REP;
  return base * sides;
}

export function workoutSeconds(workout: Workout): number {
  return workout.blocks.reduce(
    (total, block) => total + block.sets * (setWorkSeconds(block) + block.rest),
    0,
  );
}

export function workoutMinutes(workout: Workout): number {
  return Math.max(5, Math.round(workoutSeconds(workout) / 60));
}
