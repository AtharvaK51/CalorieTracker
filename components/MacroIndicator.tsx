import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { Colors } from '../constants/colors';

interface MacroIndicatorProps {
  label: string;
  current: number;
  goal: number;
  color: string;
  unit?: string;
}

export function MacroIndicator({
  label,
  current,
  goal,
  color,
  unit = 'g',
}: MacroIndicatorProps) {
  const size = 52;
  const strokeWidth = 4;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(current / goal, 1);
  const strokeDashoffset = circumference * (1 - progress);
  const isOver = current > goal;
  const diff = Math.abs(Math.round(goal - current));

  return (
    <View style={styles.container}>
      <View style={[styles.ringContainer, { width: size, height: size }]}>
        <Svg width={size} height={size}>
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={Colors.surfaceLight}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={isOver ? Colors.error : color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        </Svg>
      </View>
      <Text style={styles.value}>
        {diff}
        {unit}
      </Text>
      <Text style={styles.label}>
        {label} {isOver ? 'over' : 'left'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
  },
  ringContainer: {
    marginBottom: 6,
  },
  value: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  label: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
});
