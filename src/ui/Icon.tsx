import { MaterialCommunityIcons } from '@expo/vector-icons';

import type { IconName } from '@/data/icons';
import { useTheme } from '@/theme/ThemeProvider';

export function Icon({ name, size = 22, color }: { name: IconName; size?: number; color?: string }) {
  const theme = useTheme();
  return <MaterialCommunityIcons name={name} size={size} color={color ?? theme.colors.text} />;
}
