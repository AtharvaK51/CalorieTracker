import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../constants/colors';
import { Config } from '../constants/config';

interface WaterTrackerProps {
  currentMl: number;
  goalMl: number;
  onAdd: (ml: number) => void;
  onUndo: () => void;
}

export function WaterTracker({
  currentMl,
  goalMl,
  onAdd,
  onUndo,
}: WaterTrackerProps) {
  const progress = Math.min(currentMl / goalMl, 1);
  const cups = (currentMl / 250).toFixed(1);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.icon}>💧</Text>
        <View style={styles.headerText}>
          <Text style={styles.value}>
            {Math.round(currentMl)} <Text style={styles.unit}>ml</Text>
          </Text>
          <Text style={styles.subtext}>
            {cups} cups / {(goalMl / 1000).toFixed(1)}L goal
          </Text>
        </View>
      </View>

      {/* Progress bar */}
      <View style={styles.progressBg}>
        <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAdd(Config.waterStepSmall)}
        >
          <Text style={styles.addBtnText}>+{Config.waterStepSmall}ml</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => onAdd(Config.waterStepLarge)}
        >
          <Text style={styles.addBtnText}>+{Config.waterStepLarge}ml</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.undoBtn} onPress={onUndo}>
          <Text style={styles.undoBtnText}>Undo</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  icon: {
    fontSize: 24,
    marginRight: 10,
  },
  headerText: {
    flex: 1,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.water,
  },
  unit: {
    fontSize: 13,
    fontWeight: '400',
    color: Colors.textSecondary,
  },
  subtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 1,
  },
  progressBg: {
    height: 6,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 3,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.water,
    borderRadius: 3,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: 'center',
  },
  addBtnText: {
    color: Colors.water,
    fontSize: 13,
    fontWeight: '600',
  },
  undoBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  undoBtnText: {
    color: Colors.textSecondary,
    fontSize: 13,
  },
});
