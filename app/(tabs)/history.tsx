import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { Config, type MealType } from '../../constants/config';
import { MealCard } from '../../components/MealCard';
import { getAllMeals, getMealsByType, type Meal } from '../../db/meals';
import { useMealStore } from '../../store/useMealStore';
import { formatDate, isToday } from '../../utils/date';

type Filter = 'all' | MealType;

export default function HistoryScreen() {
  const { deleteMeal } = useMealStore();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [filter, setFilter] = useState<Filter>('all');

  const loadMeals = useCallback(async () => {
    const data =
      filter === 'all'
        ? await getAllMeals()
        : await getMealsByType(filter);
    setMeals(data);
  }, [filter]);

  useFocusEffect(
    useCallback(() => {
      loadMeals();
    }, [loadMeals])
  );

  const handleDelete = async (id: string) => {
    await deleteMeal(id);
    loadMeals();
  };

  // Group meals by date
  const grouped: { date: string; label: string; meals: Meal[] }[] = [];
  let currentDate = '';
  for (const meal of meals) {
    const date = meal.logged_at.split('T')[0];
    if (date !== currentDate) {
      currentDate = date;
      grouped.push({
        date,
        label: isToday(meal.logged_at) ? 'Today' : formatDate(meal.logged_at),
        meals: [],
      });
    }
    grouped[grouped.length - 1].meals.push(meal);
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <Text style={styles.title}>History</Text>

      {/* Filter Row */}
      <View style={styles.filterRow}>
        {(['all', ...Config.mealTypes] as Filter[]).map((f) => (
          <TouchableOpacity
            key={f}
            style={[styles.filterBtn, filter === f && styles.filterBtnActive]}
            onPress={() => setFilter(f)}
          >
            <Text
              style={[
                styles.filterText,
                filter === f && styles.filterTextActive,
              ]}
            >
              {f === 'all' ? 'All' : f}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.list}
        renderItem={({ item: group }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateLabel}>{group.label}</Text>
            {group.meals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => router.push(`/meal/${meal.id}`)}
                onDelete={() => handleDelete(meal.id)}
              />
            ))}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>No meals found</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    paddingHorizontal: 16,
    paddingTop: 8,
    marginBottom: 12,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 8,
    marginBottom: 12,
  },
  filterBtn: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  filterText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  filterTextActive: {
    color: Colors.primary,
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  dateGroup: {
    marginBottom: 8,
  },
  dateLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textMuted,
  },
});
