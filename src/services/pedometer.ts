import { Pedometer } from 'expo-sensors';
import { Platform } from 'react-native';

/**
 * The phone's step counter (Core Motion on iOS, the step sensor on Android).
 * Every call degrades to "unavailable" instead of throwing — web, simulators
 * and phones without the sensor simply show no steps.
 */

export type StepPermission = 'granted' | 'denied' | 'undetermined' | 'unavailable';

/** iOS keeps 7 days of step history; Android only reports live steps. */
export const STEP_HISTORY_SUPPORTED = Platform.OS === 'ios';

function asPermission(status: string): StepPermission {
  return status === 'granted' || status === 'denied' ? status : 'undetermined';
}

export async function stepPermission(): Promise<StepPermission> {
  try {
    if (!(await Pedometer.isAvailableAsync())) return 'unavailable';
    const { status } = await Pedometer.getPermissionsAsync();
    return asPermission(status);
  } catch {
    return 'unavailable';
  }
}

export async function requestStepPermission(): Promise<StepPermission> {
  try {
    if (!(await Pedometer.isAvailableAsync())) return 'unavailable';
    const { status } = await Pedometer.requestPermissionsAsync();
    return asPermission(status);
  } catch {
    return 'unavailable';
  }
}

/** Steps between two instants, from the OS history. iOS only; null elsewhere. */
export async function stepsBetween(start: Date, end: Date): Promise<number | null> {
  if (!STEP_HISTORY_SUPPORTED) return null;
  try {
    const { steps } = await Pedometer.getStepCountAsync(start, end);
    return steps;
  } catch {
    return null;
  }
}

/** Live steps counted since the subscription started. Returns an unsubscribe. */
export function watchSteps(onSteps: (stepsSinceStart: number) => void): () => void {
  try {
    const subscription = Pedometer.watchStepCount((result) => onSteps(result.steps));
    return () => subscription.remove();
  } catch {
    return () => undefined;
  }
}
