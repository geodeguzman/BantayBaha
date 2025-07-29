import { StyleSheet, Text, View } from 'react-native';

interface WaterLevelGaugeProps {
  level: number; // in feet
  max?: number; // default 8
}

export default function WaterLevelGauge({ level, max = 8 }: WaterLevelGaugeProps) {
  const percent = Math.min(level / max, 1);
  return (
    <View style={styles.gaugeContainer}>
      <View style={styles.ticks}>
        {[...Array(max + 1)].map((_, i) => (
          <Text key={i} style={styles.tickLabel}>{max - i} Feet</Text>
        ))}
      </View>
      <View style={styles.gaugeOuter}>
        <View style={styles.gaugeInner}>
          <View style={[styles.gaugeFill, { height: `${percent * 100}%` }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  gaugeContainer: { flexDirection: 'row', alignItems: 'flex-end', height: 220 },
  ticks: { marginRight: 12, justifyContent: 'space-between', height: '100%' },
  tickLabel: { color: '#fff', fontSize: 13, height: 20 },
  gaugeOuter: { justifyContent: 'flex-end', alignItems: 'center', height: '100%' },
  gaugeInner: { width: 48, height: 200, borderRadius: 24, backgroundColor: '#fff', overflow: 'hidden', justifyContent: 'flex-end', borderWidth: 2, borderColor: '#b3e0fc' },
  gaugeFill: { backgroundColor: '#4fc3f7', width: '100%', position: 'absolute', bottom: 0, borderBottomLeftRadius: 24, borderBottomRightRadius: 24 },
}); 