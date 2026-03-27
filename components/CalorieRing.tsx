import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface CalorieRingProps {
  consumed: number;
  goal: number;
  size?: number;
}

export function CalorieRing({ consumed, goal, size = 140 }: CalorieRingProps) {
  const strokeWidth = 12;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(consumed / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const remaining = Math.max(goal - consumed, 0);
  const isOver = consumed > goal;

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={Colors.surfaceLight}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Progress circle */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={isOver ? Colors.error : Colors.primary}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.textContainer}>
        <Text style={[styles.value, isOver && styles.overValue]}>
          {Math.round(remaining)}
        </Text>
        <Text style={styles.label}>
          {isOver ? 'over' : 'left'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    alignItems: 'center',
  },
  value: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.text,
  },
  overValue: {
    color: Colors.error,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
