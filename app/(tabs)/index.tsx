import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { useFocusEffect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Colors } from '../../constants/colors';
import { CalorieRing } from '../../components/CalorieRing';
import { MacroIndicator } from '../../components/MacroIndicator';
import { MealCard } from '../../components/MealCard';
import { WaterTracker } from '../../components/WaterTracker';
import { StreakBadge } from '../../components/StreakBadge';
import { useMealStore } from '../../store/useMealStore';
import { useWaterStore } from '../../store/useWaterStore';
import { useProfileStore } from '../../store/useProfileStore';
import { useStreakStore } from '../../store/useStreakStore';
import { getDailyTotals } from '../../db/queries';
import { today } from '../../utils/date';

export default function HomeScreen() {
  const { todayMeals, loadTodayMeals, deleteMeal } = useMealStore();
  const { todayTotal: waterTotal, loadToday: loadWater, add: addWater, undoLast: undoWater } = useWaterStore();
  const { profile } = useProfileStore();
  const { currentStreak, loadStreak } = useStreakStore();
  const [totals, setTotals] = React.useState({
    total_calories: 0,
    total_protein_g: 0,
    total_carbs_g: 0,
    total_fat_g: 0,
  });
  const [refreshing, setRefreshing] = React.useState(false);

  const loadData = useCallback(async () => {
    await Promise.all([loadTodayMeals(), loadWater(), loadStreak()]);
    const t = await getDailyTotals(today());
    setTotals(t);
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const calorieGoal = profile?.calorie_goal ?? 2000;
  const proteinGoal = profile?.protein_goal_g ?? 50;
  const carbsGoal = profile?.carbs_goal_g ?? 250;
  const fatGoal = profile?.fat_goal_g ?? 65;
  const waterGoal = profile?.water_goal_ml ?? 2500;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>CalorieTracker</Text>
            <Text style={styles.dateText}>Today</Text>
          </View>
          <StreakBadge streak={currentStreak} />
        </View>

        {/* Calorie Ring + Macros */}
        <View style={styles.calorieSection}>
          <View style={styles.ringRow}>
            <View style={styles.ringInfo}>
              <Text style={styles.consumedValue}>
                {Math.round(totals.total_calories)}
              </Text>
              <Text style={styles.consumedLabel}>consumed</Text>
              <Text style={styles.goalText}>of {calorieGoal} kcal</Text>
            </View>
            <CalorieRing consumed={totals.total_calories} goal={calorieGoal} />
          </View>

          <View style={styles.macroRow}>
            <MacroIndicator
              label="Protein"
              current={totals.total_protein_g}
              goal={proteinGoal}
              color={Colors.protein}
            />
            <MacroIndicator
              label="Carbs"
              current={totals.total_carbs_g}
              goal={carbsGoal}
              color={Colors.carbs}
            />
            <MacroIndicator
              label="Fat"
              current={totals.total_fat_g}
              goal={fatGoal}
              color={Colors.fat}
            />
          </View>
        </View>

        {/* Water Tracker */}
        <WaterTracker
          currentMl={waterTotal}
          goalMl={waterGoal}
          onAdd={async (ml) => {
            await addWater(ml);
            await loadData();
          }}
          onUndo={async () => {
            await undoWater();
            await loadData();
          }}
        />

        {/* Recent Meals */}
        <View style={styles.mealsSection}>
          <Text style={styles.sectionTitle}>Today's Meals</Text>
          {todayMeals.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No meals logged yet today.
              </Text>
              <Text style={styles.emptySubtext}>
                Tap the Add tab to log your first meal!
              </Text>
            </View>
          ) : (
            todayMeals.map((meal) => (
              <MealCard
                key={meal.id}
                meal={meal}
                onPress={() => router.push(`/meal/${meal.id}`)}
                onDelete={() => deleteMeal(meal.id)}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scroll: {
    padding: 16,
    paddingBottom: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  appName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  dateText: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  calorieSection: {
    backgroundColor: Colors.card,
    borderRadius: 18,
    padding: 20,
    marginBottom: 14,
  },
  ringRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  ringInfo: {},
  consumedValue: {
    fontSize: 36,
    fontWeight: '700',
    color: Colors.text,
  },
  consumedLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: -2,
  },
  goalText: {
    fontSize: 12,
    color: Colors.textMuted,
    marginTop: 4,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  mealsSection: {
    marginTop: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textMuted,
  },
});
