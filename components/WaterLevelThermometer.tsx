import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface Props {
  levelMeters: number; // Current water level in meters
  maxMeters?: number;  // Max gauge height in meters (default: 2.5 for 8 feet)
}

const FEET_LABELS = [8, 6, 4, 2, 0];

export default function WaterLevelThermometer({ levelMeters, maxMeters = 2.5 }: Props) {
  // Clamp level to max
  const clampedLevel = Math.min(levelMeters, maxMeters);
  const fillPercent = (clampedLevel / maxMeters) * 100;

  // Color logic
  let fillColor = '#2196f3';
  if (clampedLevel >= 1.651) fillColor = '#e53935'; // Danger
  else if (clampedLevel >= 1.219) fillColor = '#fbc02d'; // Warning

  return (
    <View style={styles.container}>
      <View style={styles.gaugeWrapper}>
        <View style={styles.gauge}>
          <View style={[styles.gaugeFill, { height: `${fillPercent}%`, backgroundColor: fillColor }]} />
        </View>
        <View style={styles.labels}>
          {FEET_LABELS.map(feet => (
            <Text key={feet} style={styles.label}>{feet} Feet</Text>
          ))}
        </View>
      </View>
      <Text style={styles.levelText}>
        {`${(clampedLevel * 3.28084).toFixed(2)} ft (${clampedLevel.toFixed(3)} m)`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', marginLeft: 8 },
  gaugeWrapper: { flexDirection: 'row', alignItems: 'flex-end' },
  gauge: {
    width: 40,
    height: 220,
    backgroundColor: '#e3eafc',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#2196f3',
    position: 'relative',
  },
  gaugeFill: {
    position: 'absolute',
    left: 0,
    bottom: 0,
    width: '100%',
    borderRadius: 20,
  },
  labels: {
    height: 220,
    justifyContent: 'space-between',
    marginLeft: 10,
  },
  label: {
    color: '#1565c0',
    fontSize: 13,
    backgroundColor: 'rgba(255,255,255,0.7)',
    borderRadius: 4,
    paddingHorizontal: 2,
  },
  levelText: {
    marginTop: 8,
    color: '#23406e',
    fontWeight: 'bold',
    fontSize: 15,
  },
}); 