import { getDatabase } from './database';
import { generateId } from '../utils/uuid';
import { now } from '../utils/date';
import type { MealType } from '../constants/config';

export interface Meal {
  id: string;
  description: string;
  parsed_items: string | null;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  fiber_g: number | null;
  meal_type: MealType | null;
  logged_at: string;
  created_at: string;
  updated_at: string;
  sync_status: string;
}

export async function insertMeal(
  description: string,
  mealType: MealType | null,
  loggedAt?: string
): Promise<string> {
  const db = await getDatabase();
  const id = generateId();
  const timestamp = now();
  await db.runAsync(
    `INSERT INTO meals (id, description, meal_type, logged_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    id,
    description,
    mealType,
    loggedAt ?? timestamp,
    timestamp,
    timestamp
  );
  return id;
}

export async function updateMealNutrition(
  id: string,
  data: {
    parsed_items?: string;
    calories?: number;
    protein_g?: number;
    carbs_g?: number;
    fat_g?: number;
    fiber_g?: number;
  }
): Promise<void> {
  const db = await getDatabase();
  await db.runAsync(
    `UPDATE meals SET
      parsed_items = COALESCE(?, parsed_items),
      calories = COALESCE(?, calories),
      protein_g = COALESCE(?, protein_g),
      carbs_g = COALESCE(?, carbs_g),
      fat_g = COALESCE(?, fat_g),
      fiber_g = COALESCE(?, fiber_g),
      updated_at = ?
     WHERE id = ?`,
    data.parsed_items ?? null,
    data.calories ?? null,
    data.protein_g ?? null,
    data.carbs_g ?? null,
    data.fat_g ?? null,
    data.fiber_g ?? null,
    now(),
    id
  );
}

export async function updateMeal(
  id: string,
  data: Partial<Omit<Meal, 'id' | 'created_at' | 'sync_status'>>
): Promise<void> {
  const db = await getDatabase();
  const fields: string[] = [];
  const values: any[] = [];

  if (data.description !== undefined) {
    fields.push('description = ?');
    values.push(data.description);
  }
  if (data.meal_type !== undefined) {
    fields.push('meal_type = ?');
    values.push(data.meal_type);
  }
  if (data.calories !== undefined) {
    fields.push('calories = ?');
    values.push(data.calories);
  }
  if (data.protein_g !== undefined) {
    fields.push('protein_g = ?');
    values.push(data.protein_g);
  }
  if (data.carbs_g !== undefined) {
    fields.push('carbs_g = ?');
    values.push(data.carbs_g);
  }
  if (data.fat_g !== undefined) {
    fields.push('fat_g = ?');
    values.push(data.fat_g);
  }
  if (data.fiber_g !== undefined) {
    fields.push('fiber_g = ?');
    values.push(data.fiber_g);
  }
  if (data.parsed_items !== undefined) {
    fields.push('parsed_items = ?');
    values.push(data.parsed_items);
  }
  if (data.logged_at !== undefined) {
    fields.push('logged_at = ?');
    values.push(data.logged_at);
  }

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(now());
  values.push(id);

  await db.runAsync(
    `UPDATE meals SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
}

export async function deleteMeal(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM meals WHERE id = ?', id);
}

export async function getMealById(id: string): Promise<Meal | null> {
  const db = await getDatabase();
  return await db.getFirstAsync<Meal>('SELECT * FROM meals WHERE id = ?', id);
}

export async function getMealsForDate(date: string): Promise<Meal[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Meal>(
    `SELECT * FROM meals WHERE logged_at LIKE ? ORDER BY logged_at DESC`,
    `${date}%`
  );
}

export async function getMealsInRange(
  startDate: string,
  endDate: string
): Promise<Meal[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Meal>(
    `SELECT * FROM meals WHERE logged_at >= ? AND logged_at <= ? ORDER BY logged_at DESC`,
    startDate,
    endDate + 'T23:59:59'
  );
}

export async function getAllMeals(): Promise<Meal[]> {
  const db = await getDatabase();
  return await db.getAllAsync<Meal>(
    'SELECT * FROM meals ORDER BY logged_at DESC'
  );
}

export async function getMealsByType(
  mealType: MealType,
  startDate?: string
): Promise<Meal[]> {
  const db = await getDatabase();
  if (startDate) {
    return await db.getAllAsync<Meal>(
      'SELECT * FROM meals WHERE meal_type = ? AND logged_at >= ? ORDER BY logged_at DESC',
      mealType,
      startDate
    );
  }
  return await db.getAllAsync<Meal>(
    'SELECT * FROM meals WHERE meal_type = ? ORDER BY logged_at DESC',
    mealType
  );
}
