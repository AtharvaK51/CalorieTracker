import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface NutritionBarProps {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

export function NutritionBar({
  calories,
  protein,
  carbs,
  fat,
  fiber,
}: NutritionBarProps) {
  const total = protein + carbs + fat;
  const proteinPct = total > 0 ? (protein / total) * 100 : 33;
  const carbsPct = total > 0 ? (carbs / total) * 100 : 33;
  const fatPct = total > 0 ? (fat / total) * 100 : 34;

  return (
    <View style={styles.container}>
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barSegment,
            { width: `${proteinPct}%`, backgroundColor: Colors.protein },
          ]}
        />
        <View
          style={[
            styles.barSegment,
            { width: `${carbsPct}%`, backgroundColor: Colors.carbs },
          ]}
        />
        <View
          style={[
            styles.barSegment,
            { width: `${fatPct}%`, backgroundColor: Colors.fat },
          ]}
        />
      </View>
      <View style={styles.legendRow}>
        <LegendItem color={Colors.protein} label="Protein" value={`${Math.round(protein)}g`} />
        <LegendItem color={Colors.carbs} label="Carbs" value={`${Math.round(carbs)}g`} />
        <LegendItem color={Colors.fat} label="Fat" value={`${Math.round(fat)}g`} />
        {fiber != null && fiber > 0 && (
          <LegendItem
            color={Colors.fiber}
            label="Fiber"
            value={`${Math.round(fiber)}g`}
          />
        )}
      </View>
    </View>
  );
}

function LegendItem({
  color,
  label,
  value,
}: {
  color: string;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.legendLabel}>{label}</Text>
      <Text style={styles.legendValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  barContainer: {
    flexDirection: 'row',
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: Colors.surfaceLight,
    marginBottom: 10,
  },
  barSegment: {
    height: '100%',
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  legendItem: {
    alignItems: 'center',
    gap: 2,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  legendValue: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.text,
  },
});
