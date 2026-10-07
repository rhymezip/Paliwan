import type { Block, Workout } from '@/data/programs';

/** One screen of the workout player. */
export type WorkoutStep =
  | { kind: 'ready'; seconds: number; block: Block }
  | { kind: 'work'; block: Block; set: number; seconds: number | null }
  | { kind: 'rest'; seconds: number; next: Block };

export const GET_READY_SECONDS = 5;

/**
 * Flattens a workout into the player's timeline: a short get-ready, then every
 * set of every block with its rest after it. No rest follows the final set.
 * Timed holds done "each side" last twice as long.
 */
export function buildWorkoutSteps(workout: Workout): WorkoutStep[] {
  const steps: WorkoutStep[] = [];
  const first = workout.blocks[0];
  if (!first) return steps;
  steps.push({ kind: 'ready', seconds: GET_READY_SECONDS, block: first });

  workout.blocks.forEach((block, blockIndex) => {
    for (let set = 1; set <= block.sets; set += 1) {
      const seconds = block.seconds !== undefined ? block.seconds * (block.perSide ? 2 : 1) : null;
      steps.push({ kind: 'work', block, set, seconds });

      const lastSet = set === block.sets;
      const lastBlock = blockIndex === workout.blocks.length - 1;
      if (block.rest > 0 && !(lastSet && lastBlock)) {
        const next = lastSet ? workout.blocks[blockIndex + 1] ?? block : block;
        steps.push({ kind: 'rest', seconds: block.rest, next });
      }
    }
  });
  return steps;
}

/** Seconds a step runs on its own, or null when the athlete taps "Done". */
export function stepSeconds(step: WorkoutStep): number | null {
  return step.seconds;
}
