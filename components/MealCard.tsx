import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Colors } from '../constants/colors';
import { formatTime } from '../utils/date';
import type { Meal } from '../db/meals';

interface MealCardProps {
  meal: Meal;
  onPress?: () => void;
  onDelete?: () => void;
}

export function MealCard({ meal, onPress, onDelete }: MealCardProps) {
  const handleLongPress = () => {
    if (!onDelete) return;
    Alert.alert('Delete Meal', `Delete "${meal.description}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: onDelete },
    ]);
  };

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      onLongPress={handleLongPress}
      activeOpacity={0.7}
    >
      <View style={styles.left}>
        <Text style={styles.description} numberOfLines={1}>
          {meal.description}
        </Text>
        <View style={styles.metaRow}>
          {meal.meal_type && (
            <Text style={styles.mealType}>{meal.meal_type}</Text>
          )}
          <Text style={styles.time}>{formatTime(meal.logged_at)}</Text>
        </View>
      </View>
      <View style={styles.right}>
        {meal.calories != null ? (
          <>
            <Text style={styles.calories}>{Math.round(meal.calories)}</Text>
            <Text style={styles.kcalLabel}>kcal</Text>
            <View style={styles.macroRow}>
              <Text style={[styles.macroText, { color: Colors.protein }]}>
                {Math.round(meal.protein_g ?? 0)}p
              </Text>
              <Text style={[styles.macroText, { color: Colors.carbs }]}>
                {Math.round(meal.carbs_g ?? 0)}c
              </Text>
              <Text style={[styles.macroText, { color: Colors.fat }]}>
                {Math.round(meal.fat_g ?? 0)}f
              </Text>
            </View>
          </>
        ) : (
          <Text style={styles.pending}>Pending</Text>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    alignItems: 'center',
  },
  left: {
    flex: 1,
    marginRight: 12,
  },
  description: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  mealType: {
    fontSize: 12,
    color: Colors.primary,
    textTransform: 'capitalize',
    backgroundColor: Colors.surfaceLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    overflow: 'hidden',
  },
  time: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  right: {
    alignItems: 'flex-end',
  },
  calories: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.calories,
  },
  kcalLabel: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  macroRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  macroText: {
    fontSize: 11,
    fontWeight: '500',
  },
  pending: {
    fontSize: 13,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
});
