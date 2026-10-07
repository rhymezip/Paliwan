import { randomUUID } from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform, Share } from 'react-native';

import { brand } from '@/constants/brand';
import { exportHealth } from '@/db/health';
import { exportEverything } from '@/db/queries';
import { LATEST_VERSION } from '@/db/schema';

/**
 * Exports everything — profile, meals, water, activities and program progress —
 * as JSON through the system share sheet. The API key is never included.
 *
 * On iOS the bundle is written to a temporary file and shared by URL; on
 * Android, where the core `Share` API only takes a string, it is shared as a
 * message.
 */
export async function exportData(): Promise<boolean> {
  const bundle = { ...(await exportEverything(LATEST_VERSION)), ...(await exportHealth()) };
  const json = JSON.stringify(bundle, null, 2);
  const title = `${brand.name} data export`;

  if (Platform.OS === 'ios') {
    const file = new File(new Directory(Paths.cache), `${brand.name.toLowerCase()}-export-${randomUUID()}.json`);
    file.write(json);
    const result = await Share.share({ url: file.uri, title });
    return result.action !== Share.dismissedAction;
  }

  const result = await Share.share({ message: json, title });
  return result.action !== Share.dismissedAction;
}
