import { View } from 'react-native';

import { makeStyles } from '@/theme/ThemeProvider';

export function ProgressBar({
  progress,
  color,
  height = 8,
}: {
  progress: number;
  color: string;
  height?: number;
}) {
  const styles = useStyles();
  const clamped = Number.isFinite(progress) ? Math.min(1, Math.max(0, progress)) : 0;
  return (
    <View style={[styles.track, { height, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color,
        }}
      />
    </View>
  );
}

const useStyles = makeStyles((t) => ({
  track: { backgroundColor: t.colors.surfaceAlt, overflow: 'hidden' },
}));
