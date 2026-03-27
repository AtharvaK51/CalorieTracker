import { getDatabase } from './database';
import { daysAgo } from '../utils/date';

export interface DailyTotals {
  date: string;
  total_calories: number;
  total_protein_g: number;
  total_carbs_g: number;
  total_fat_g: number;
  total_fiber_g: number;
  meal_count: number;
}

export async function getDailyTotals(date: string): Promise<DailyTotals> {
  const db = await getDatabase();
  const result = await db.getFirstAsync<DailyTotals>(
    `SELECT
      ? as date,
      COALESCE(SUM(calories), 0) as total_calories,
      COALESCE(SUM(protein_g), 0) as total_protein_g,
      COALESCE(SUM(carbs_g), 0) as total_carbs_g,
      COALESCE(SUM(fat_g), 0) as total_fat_g,
      COALESCE(SUM(fiber_g), 0) as total_fiber_g,
      COUNT(*) as meal_count
     FROM meals WHERE logged_at LIKE ?`,
    date,
    `${date}%`
  );

  return (
    result ?? {
      date,
      total_calories: 0,
      total_protein_g: 0,
      total_carbs_g: 0,
      total_fat_g: 0,
      total_fiber_g: 0,
      meal_count: 0,
    }
  );
}

export async function getDailyTotalsRange(
  days: number
): Promise<DailyTotals[]> {
  const db = await getDatabase();
  const startDate = days > 0 ? daysAgo(days) : '2000-01-01';

  return await db.getAllAsync<DailyTotals>(
    `SELECT
      SUBSTR(logged_at, 1, 10) as date,
      COALESCE(SUM(calories), 0) as total_calories,
      COALESCE(SUM(protein_g), 0) as total_protein_g,
      COALESCE(SUM(carbs_g), 0) as total_carbs_g,
      COALESCE(SUM(fat_g), 0) as total_fat_g,
      COALESCE(SUM(fiber_g), 0) as total_fiber_g,
      COUNT(*) as meal_count
     FROM meals
     WHERE logged_at >= ?
     GROUP BY SUBSTR(logged_at, 1, 10)
     ORDER BY date ASC`,
    startDate
  );
}

export async function getAverageDailyCalories(days: number): Promise<number> {
  const db = await getDatabase();
  const startDate = days > 0 ? daysAgo(days) : '2000-01-01';

  const result = await db.getFirstAsync<{ avg_cal: number }>(
    `SELECT COALESCE(AVG(daily_total), 0) as avg_cal FROM (
      SELECT SUM(calories) as daily_total
      FROM meals
      WHERE logged_at >= ?
      GROUP BY SUBSTR(logged_at, 1, 10)
    )`,
    startDate
  );

  return result?.avg_cal ?? 0;
}

export async function getWaterTotalsRange(
  days: number
): Promise<{ date: string; total_ml: number }[]> {
  const db = await getDatabase();
  const startDate = days > 0 ? daysAgo(days) : '2000-01-01';

  return await db.getAllAsync(
    `SELECT
      SUBSTR(logged_at, 1, 10) as date,
      COALESCE(SUM(amount_ml), 0) as total_ml
     FROM water_intake
     WHERE logged_at >= ?
     GROUP BY SUBSTR(logged_at, 1, 10)
     ORDER BY date ASC`,
    startDate
  );
}
