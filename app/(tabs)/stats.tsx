import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LineChart } from 'react-native-chart-kit';
import { Colors } from '../../constants/colors';
import { Config } from '../../constants/config';
import { ChartCard } from '../../components/ChartCard';
import { getDailyTotalsRange, getAverageDailyCalories, type DailyTotals } from '../../db/queries';
import { getWaterTotalsRange } from '../../db/queries';
import { useProfileStore } from '../../store/useProfileStore';

const screenWidth = Dimensions.get('window').width - 64;

export default function StatsScreen() {
  const { profile } = useProfileStore();
  const [periodIndex, setPeriodIndex] = useState(0);
  const [data, setData] = useState<DailyTotals[]>([]);
  const [avgCalories, setAvgCalories] = useState(0);
  const [waterData, setWaterData] = useState<{ date: string; total_ml: number }[]>([]);

  const period = Config.analyticsPeriods[periodIndex];

  const loadData = useCallback(async () => {
    const days = period.days;
    const [totals, avg, water] = await Promise.all([
      getDailyTotalsRange(days),
      getAverageDailyCalories(days),
      getWaterTotalsRange(days),
    ]);
    setData(totals);
    setAvgCalories(avg);
    setWaterData(water);
  }, [period]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData])
  );

  const chartConfig = {
    backgroundGradientFrom: Colors.card,
    backgroundGradientTo: Colors.card,
    color: (opacity = 1) => `rgba(74, 222, 128, ${opacity})`,
    labelColor: () => Colors.textSecondary,
    strokeWidth: 2,
    propsForBackgroundLines: {
      stroke: Colors.border,
    },
    decimalPlaces: 0,
  };

  // Prepare calorie chart data
  const calorieLabels = data.length > 0
    ? data.filter((_, i) => i % Math.max(1, Math.floor(data.length / 6)) === 0)
        .map((d) => d.date.slice(5))
    : [''];
  const calorieValues = data.length > 0
    ? data.map((d) => d.total_calories)
    : [0];

  // Prepare protein chart data
  const proteinValues = data.length > 0
    ? data.map((d) => d.total_protein_g)
    : [0];

  // Summary stats
  const totalMeals = data.reduce((sum, d) => sum + d.meal_count, 0);
  const totalDays = data.length;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Analytics</Text>

        {/* Period Tabs */}
        <View style={styles.periodRow}>
          {Config.analyticsPeriods.map((p, i) => (
            <TouchableOpacity
              key={p.label}
              style={[
                styles.periodBtn,
                periodIndex === i && styles.periodBtnActive,
              ]}
              onPress={() => setPeriodIndex(i)}
            >
              <Text
                style={[
                  styles.periodText,
                  periodIndex === i && styles.periodTextActive,
                ]}
              >
                {p.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>
              {Math.round(avgCalories)}
            </Text>
            <Text style={styles.summaryLabel}>Avg Daily Cal</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalMeals}</Text>
            <Text style={styles.summaryLabel}>Total Meals</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>{totalDays}</Text>
            <Text style={styles.summaryLabel}>Days Tracked</Text>
          </View>
        </View>

        {/* Calorie Trend Chart */}
        {data.length > 1 && (
          <ChartCard title="Calorie Trend">
            <LineChart
              data={{
                labels: calorieLabels,
                datasets: [
                  { data: calorieValues },
                  ...(profile?.calorie_goal
                    ? [
                        {
                          data: Array(calorieValues.length).fill(
                            profile.calorie_goal
                          ),
                          color: () => Colors.error + '40',
                          strokeDashArray: [5, 5],
                          withDots: false,
                        },
                      ]
                    : []),
                ],
              }}
              width={screenWidth}
              height={200}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </ChartCard>
        )}

        {/* Protein Trend */}
        {data.length > 1 && (
          <ChartCard title="Protein Trend">
            <LineChart
              data={{
                labels: calorieLabels,
                datasets: [
                  {
                    data: proteinValues,
                    color: () => Colors.protein,
                  },
                ],
              }}
              width={screenWidth}
              height={180}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`,
              }}
              bezier
              style={styles.chart}
              withInnerLines={false}
              withOuterLines={false}
            />
          </ChartCard>
        )}

        {data.length <= 1 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>
              Log meals for at least 2 days to see trends
            </Text>
          </View>
        )}
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
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
  },
  periodRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 18,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  periodBtnActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary + '15',
  },
  periodText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
  },
  periodTextActive: {
    color: Colors.primary,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.text,
  },
  summaryLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  chart: {
    borderRadius: 10,
    marginLeft: -16,
  },
  emptyState: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});
