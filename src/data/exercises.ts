import type { IconName } from '@/data/icons';
import type { Localized } from '@/i18n/types';

export type ExerciseId =
  | 'jumping_jacks'
  | 'high_knees'
  | 'butt_kicks'
  | 'fast_feet'
  | 'skater_jumps'
  | 'squat_jumps'
  | 'lateral_shuffle'
  | 'mountain_climbers'
  | 'burpees'
  | 'jog_in_place'
  | 'jump_rope'
  | 'push_ups'
  | 'knee_push_ups'
  | 'squats'
  | 'lunges'
  | 'glute_bridge'
  | 'plank'
  | 'side_plank'
  | 'superman'
  | 'calf_raises'
  | 'wall_sit'
  | 'chair_dips'
  | 'dead_bug'
  | 'bird_dog'
  | 'single_leg_balance'
  | 'crunches'
  | 'hamstring_stretch'
  | 'quad_stretch'
  | 'hip_flexor_stretch'
  | 'cat_cow'
  | 'childs_pose'
  | 'arm_circles'
  | 'leg_swings';

export interface Exercise {
  name: Localized;
  cue: Localized;
  icon: IconName;
}

/** Bodyweight only — every exercise works at home or on a pitch, no equipment. */
export const EXERCISES: Record<ExerciseId, Exercise> = {
  jumping_jacks: {
    name: { tk: 'Ýyldyz bökmek', ru: 'Прыжки «звёздочка»', en: 'Jumping jacks' },
    cue: {
      tk: 'Aýaklary gapdala aýryp bökün, elleri kelläňizden ýokary galdyryň.',
      ru: 'Прыгайте, разводя ноги и поднимая руки над головой.',
      en: 'Jump your feet out while raising your arms overhead, then back.',
    },
    icon: 'human-handsup',
  },
  high_knees: {
    name: { tk: 'Dyzlary ýokary galdyryp ylgamak', ru: 'Бег с высоким подниманием бедра', en: 'High knees' },
    cue: {
      tk: 'Ýerinde ylgaň, dyzlary bil derejesine çenli galdyryň.',
      ru: 'Бегите на месте, поднимая колени до уровня пояса.',
      en: 'Run in place, driving your knees up to hip height.',
    },
    icon: 'run-fast',
  },
  butt_kicks: {
    name: { tk: 'Dabanlary yza degirmek', ru: 'Захлёст голени', en: 'Butt kicks' },
    cue: {
      tk: 'Ýerinde ylgaň, dabanlaryňyz arka degsin.',
      ru: 'Бегите на месте, касаясь пятками ягодиц.',
      en: 'Run in place, flicking your heels up to your glutes.',
    },
    icon: 'run',
  },
  fast_feet: {
    name: { tk: 'Çalt aýaklar', ru: 'Быстрые ноги', en: 'Fast feet' },
    cue: {
      tk: 'Barmaklaryňyzyň ujunda duruň we aýaklary mümkin boldugyça çalt hereketlendiriň.',
      ru: 'Стойте на носках и перебирайте ногами как можно быстрее.',
      en: 'Stay on the balls of your feet and move them as fast as you can.',
    },
    icon: 'shoe-print',
  },
  skater_jumps: {
    name: { tk: 'Konkiçi bökmesi', ru: 'Прыжки конькобежца', en: 'Skater jumps' },
    cue: {
      tk: 'Bir aýakdan beýlekisine gapdala bökün, ýumşak düşüň.',
      ru: 'Прыгайте в сторону с ноги на ногу, приземляйтесь мягко.',
      en: 'Leap sideways from one leg to the other and land softly.',
    },
    icon: 'run-fast',
  },
  squat_jumps: {
    name: { tk: 'Çömelip bökmek', ru: 'Выпрыгивания из приседа', en: 'Squat jumps' },
    cue: {
      tk: 'Çömeliň, soňra güýçli bökün. Dyzlary bükülen ýagdaýda ýumşak düşüň.',
      ru: 'Присядьте и мощно выпрыгните вверх. Приземляйтесь на согнутые ноги.',
      en: 'Squat down, then explode up. Land softly with bent knees.',
    },
    icon: 'arm-flex',
  },
  lateral_shuffle: {
    name: { tk: 'Gapdala süýşmek', ru: 'Приставной шаг в сторону', en: 'Lateral shuffle' },
    cue: {
      tk: 'Pes duruň we aýaklary çatyrmazdan gapdala süýşüň.',
      ru: 'Двигайтесь в стороны в низкой стойке, не скрещивая ноги.',
      en: 'Stay low and shuffle side to side without crossing your feet.',
    },
    icon: 'swap-horizontal',
  },
  mountain_climbers: {
    name: { tk: 'Daga çykyjy', ru: 'Скалолаз', en: 'Mountain climbers' },
    cue: {
      tk: 'Plank ýagdaýyndan dyzlary nobatma-nobat döşe çekiň.',
      ru: 'Из планки поочерёдно подтягивайте колени к груди.',
      en: 'From a plank, drive your knees to your chest one after another.',
    },
    icon: 'image-filter-hdr',
  },
  burpees: {
    name: { tk: 'Berpi', ru: 'Бёрпи', en: 'Burpees' },
    cue: {
      tk: 'Çömeliň, plank ýagdaýyna bökün, yzyna gaýdyň we ýokary bökün.',
      ru: 'Присед, прыжок в планку, обратно в присед и прыжок вверх.',
      en: 'Squat, jump back to a plank, jump forward and leap up.',
    },
    icon: 'lightning-bolt',
  },
  jog_in_place: {
    name: { tk: 'Ýerinde ylgamak', ru: 'Бег на месте', en: 'Jog in place' },
    cue: {
      tk: 'Rahat depgin bilen ýerinde ylgaň, deň dem alyň.',
      ru: 'Бегите на месте в спокойном темпе, дышите ровно.',
      en: 'Jog in place at an easy pace and breathe steadily.',
    },
    icon: 'run',
  },
  jump_rope: {
    name: { tk: 'Ýüp bökmek', ru: 'Скакалка', en: 'Jump rope' },
    cue: {
      tk: 'Ýüp bolmasa, ýüpsüz ýaly bökün — hereket şol bir.',
      ru: 'Нет скакалки — прыгайте так, будто она есть.',
      en: 'No rope? Jump as if you had one — same movement.',
    },
    icon: 'jump-rope',
  },
  push_ups: {
    name: { tk: 'Ýerden itilmek', ru: 'Отжимания', en: 'Push-ups' },
    cue: {
      tk: 'Bedeniňiz göni çyzykda, döşüňizi ýere ýakynlaşdyryň.',
      ru: 'Тело прямое, опускайте грудь почти до пола.',
      en: 'Keep your body straight and lower your chest close to the floor.',
    },
    icon: 'arm-flex',
  },
  knee_push_ups: {
    name: { tk: 'Dyzda itilmek', ru: 'Отжимания с колен', en: 'Knee push-ups' },
    cue: {
      tk: 'Dyzlaryňyza daýanyp, arkaňyzy göni saklaň.',
      ru: 'Упор на колени, спина прямая.',
      en: 'Rest on your knees and keep your back straight.',
    },
    icon: 'arm-flex-outline',
  },
  squats: {
    name: { tk: 'Çömelmek', ru: 'Приседания', en: 'Squats' },
    cue: {
      tk: 'Aýaklar egin giňliginde, yza oturan ýaly çömeliň, döş ýokarda.',
      ru: 'Ноги на ширине плеч, садитесь назад, грудь вверх.',
      en: 'Feet shoulder-width, sit back and down, chest up.',
    },
    icon: 'human',
  },
  lunges: {
    name: { tk: 'Öňe ädim', ru: 'Выпады', en: 'Lunges' },
    cue: {
      tk: 'Öňe ädim ätiň we iki dyzyňyz 90° bükülýänçä aşak düşüň.',
      ru: 'Шагните вперёд и опуститесь, пока оба колена не согнутся до 90°.',
      en: 'Step forward and lower until both knees bend to 90°.',
    },
    icon: 'walk',
  },
  glute_bridge: {
    name: { tk: 'Köpri', ru: 'Ягодичный мост', en: 'Glute bridge' },
    cue: {
      tk: 'Arkaňyza ýatyň, dabanlara basyp, bili göni bolýança galdyryň.',
      ru: 'Лёжа на спине, упритесь пятками и поднимите таз.',
      en: 'Lie on your back, push through your heels and lift your hips.',
    },
    icon: 'bridge',
  },
  plank: {
    name: { tk: 'Plank', ru: 'Планка', en: 'Plank' },
    cue: {
      tk: 'Tirsekler egniň aşagynda, beden göni, garyn myşsalaryny gysyň.',
      ru: 'Локти под плечами, тело прямое, живот напряжён.',
      en: 'Elbows under shoulders, body straight, squeeze your belly.',
    },
    icon: 'minus',
  },
  side_plank: {
    name: { tk: 'Gapdal plank', ru: 'Боковая планка', en: 'Side plank' },
    cue: {
      tk: 'Bir tirsege daýanyň, bedeniňiz başdan aýaga çenli göni bolsun.',
      ru: 'Упор на один локоть, тело — прямая линия.',
      en: 'Rest on one elbow, body in a straight line head to feet.',
    },
    icon: 'slash-forward',
  },
  superman: {
    name: { tk: 'Supermen', ru: 'Супермен', en: 'Superman' },
    cue: {
      tk: 'Ýüzüňize ýatyň, elleri we aýaklary galdyryň, saklaň we ýuwaşlyk bilen düşüriň.',
      ru: 'Лёжа на животе, поднимите руки и ноги, задержитесь, медленно опустите.',
      en: 'Lie face down, lift your arms and legs, hold, lower slowly.',
    },
    icon: 'airplane',
  },
  calf_raises: {
    name: { tk: 'Barmak ujuna galmak', ru: 'Подъёмы на носки', en: 'Calf raises' },
    cue: {
      tk: 'Barmaklaryňyzyň ujuna galyň, saklaň we ýuwaş düşüň.',
      ru: 'Поднимитесь на носки, задержитесь и медленно опуститесь.',
      en: 'Rise onto your toes, pause, then lower slowly.',
    },
    icon: 'chevron-double-up',
  },
  wall_sit: {
    name: { tk: 'Diwarda oturmak', ru: 'Стульчик у стены', en: 'Wall sit' },
    cue: {
      tk: 'Arkaňyz diwara, budlaryňyz ýere parallel bolsun.',
      ru: 'Спина у стены, бёдра параллельны полу.',
      en: 'Back against the wall, thighs parallel to the floor.',
    },
    icon: 'seat-outline',
  },
  chair_dips: {
    name: { tk: 'Oturgyçda itilmek', ru: 'Обратные отжимания от стула', en: 'Chair dips' },
    cue: {
      tk: 'Elleriňizi oturgyja goýuň, tirsekleri yza büküp aşak düşüň.',
      ru: 'Руки на стуле, опускайтесь, сгибая локти назад.',
      en: 'Hands on a chair, lower yourself by bending your elbows back.',
    },
    icon: 'chair-rolling',
  },
  dead_bug: {
    name: { tk: 'Arkan hereket', ru: 'Мёртвый жук', en: 'Dead bug' },
    cue: {
      tk: 'Arkaňyza ýatyň, garşylykly eli we aýagy ýuwaş uzadyň, bil ýerde.',
      ru: 'Лёжа на спине, медленно опускайте противоположные руку и ногу, поясница прижата.',
      en: 'On your back, slowly lower the opposite arm and leg, back flat.',
    },
    icon: 'bug-outline',
  },
  bird_dog: {
    name: { tk: 'Guş-it', ru: 'Птица-собака', en: 'Bird dog' },
    cue: {
      tk: 'Dört aýakda durup, garşylykly eli we aýagy uzadyň, 2 sekunt saklaň.',
      ru: 'На четвереньках вытяните противоположные руку и ногу, задержитесь на 2 с.',
      en: 'On hands and knees, extend the opposite arm and leg, hold 2 s.',
    },
    icon: 'dog-side',
  },
  single_leg_balance: {
    name: { tk: 'Bir aýakda durmak', ru: 'Баланс на одной ноге', en: 'Single-leg balance' },
    cue: {
      tk: 'Bir aýakda duruň, bedeniňizi deňagramlylykda saklaň.',
      ru: 'Стойте на одной ноге, удерживая равновесие.',
      en: 'Stand on one leg and hold your balance.',
    },
    icon: 'human-handsdown',
  },
  crunches: {
    name: { tk: 'Garyn üçin bükülmek', ru: 'Скручивания', en: 'Crunches' },
    cue: {
      tk: 'Arkaňyza ýatyň, egnleri ýerden galdyryp, garyn myşsalaryny gysyň.',
      ru: 'Лёжа на спине, отрывайте плечи от пола, напрягая пресс.',
      en: 'On your back, curl your shoulders off the floor using your abs.',
    },
    icon: 'rotate-left',
  },
  hamstring_stretch: {
    name: { tk: 'Budyň arkasyny süýndürmek', ru: 'Растяжка задней поверхности бедра', en: 'Hamstring stretch' },
    cue: {
      tk: 'Aýagyňyzy göni uzadyň we arkaňyzy göni saklap öňe egiliň.',
      ru: 'Выпрямите ногу и наклонитесь вперёд с прямой спиной.',
      en: 'Straighten one leg and lean forward with a straight back.',
    },
    icon: 'human-handsdown',
  },
  quad_stretch: {
    name: { tk: 'Budyň öňüni süýndürmek', ru: 'Растяжка передней поверхности бедра', en: 'Quad stretch' },
    cue: {
      tk: 'Aýagyňyzy yza büküp, dabanyňyzy ele alyň, dyzlar bile bolsun.',
      ru: 'Согните ногу назад и возьмитесь за стопу, колени вместе.',
      en: 'Bend one leg back and hold your foot, knees together.',
    },
    icon: 'human',
  },
  hip_flexor_stretch: {
    name: { tk: 'Bujagy süýndürmek', ru: 'Растяжка сгибателей бедра', en: 'Hip flexor stretch' },
    cue: {
      tk: 'Bir dyzda duruň, bili ýuwaşlyk bilen öňe süýşüriň.',
      ru: 'Встаньте на одно колено и мягко подайте таз вперёд.',
      en: 'Kneel on one knee and gently push your hips forward.',
    },
    icon: 'human-male',
  },
  cat_cow: {
    name: { tk: 'Pişik-sygyr', ru: 'Кошка-корова', en: 'Cat–cow' },
    cue: {
      tk: 'Dört aýakda arkaňyzy ýuwaşlyk bilen ýokary we aşak bükün.',
      ru: 'На четвереньках медленно округляйте и прогибайте спину.',
      en: 'On hands and knees, slowly round then arch your back.',
    },
    icon: 'cat',
  },
  childs_pose: {
    name: { tk: 'Çaga pozasy', ru: 'Поза ребёнка', en: 'Child’s pose' },
    cue: {
      tk: 'Dabanlaryňyza oturyň, elleri öňe uzadyň we dem alyň.',
      ru: 'Сядьте на пятки, вытяните руки вперёд и дышите.',
      en: 'Sit back on your heels, reach your arms forward and breathe.',
    },
    icon: 'meditation',
  },
  arm_circles: {
    name: { tk: 'Elleri aýlamak', ru: 'Вращения руками', en: 'Arm circles' },
    cue: {
      tk: 'Elleriňizi gapdala uzadyň we kiçi, soňra uly tegelek ýasaň.',
      ru: 'Вытяните руки в стороны и делайте круги — от малых к большим.',
      en: 'Arms out to the sides, make small then big circles.',
    },
    icon: 'rotate-3d-variant',
  },
  leg_swings: {
    name: { tk: 'Aýak yrgamak', ru: 'Махи ногами', en: 'Leg swings' },
    cue: {
      tk: 'Diwara daýanyp, aýagyňyzy öňe-yza erkin yrgaň.',
      ru: 'Держась за опору, свободно махайте ногой вперёд-назад.',
      en: 'Hold a wall and swing one leg freely forward and back.',
    },
    icon: 'swap-vertical',
  },
};
