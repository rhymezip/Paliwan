import { useFocusEffect } from 'expo-router';
import { useCallback, useState } from 'react';

import { getMealsForDate } from '@/db/queries';
import { localDateString } from '@/logic/dates';
import { EMPTY_MACROS } from '@/logic/macros';
import { macrosOfMeals } from '@/logic/scaling';
import type { Macros } from '@/types';

/** Today's eaten totals, reloaded whenever the screen comes into focus. */
export function useTodayFood(): Macros {
  const [consumed, setConsumed] = useState<Macros>(EMPTY_MACROS);

  useFocusEffect(
    useCallback(() => {
      let active = true;
      getMealsForDate(localDateString())
        .then((meals) => {
          if (active) setConsumed(macrosOfMeals(meals));
        })
        .catch(() => undefined);
      return () => {
        active = false;
      };
    }, []),
  );

  return consumed;
}
