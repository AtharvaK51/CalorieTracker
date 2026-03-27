import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/colors';

interface StreakBadgeProps {
  streak: number;
}

export function StreakBadge({ streak }: StreakBadgeProps) {
  if (streak === 0) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.icon}>🔥</Text>
      <Text style={styles.count}>{streak}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  icon: {
    fontSize: 16,
  },
  count: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.streak,
  },
});
