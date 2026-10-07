import type { MaterialCommunityIcons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';

/** Any MaterialCommunityIcons glyph name — the app's one icon set. */
export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];
