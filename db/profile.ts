import { getDatabase } from './database';
import { generateId } from '../utils/uuid';
import { now } from '../utils/date';
import { Config } from '../constants/config';

export interface UserProfile {
  id: string;
  name: string | null;
  weight_kg: number | null;
  height_cm: number | null;
  age: number | null;
  gender: string | null;
  activity_level: string | null;
  calorie_goal: number;
  protein_goal_g: number;
  carbs_goal_g: number;
  fat_goal_g: number;
  water_goal_ml: number;
  onboarding_done: number;
  created_at: string;
  updated_at: string;
}

export async function getProfile(): Promise<UserProfile> {
  const db = await getDatabase();
  let profile = await db.getFirstAsync<UserProfile>(
    'SELECT * FROM user_profile LIMIT 1'
  );

  if (!profile) {
    const id = generateId();
    const timestamp = now();
    await db.runAsync(
      `INSERT INTO user_profile (id, calorie_goal, protein_goal_g, carbs_goal_g, fat_goal_g, water_goal_ml, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      id,
      Config.defaultCalorieGoal,
      Config.defaultProteinGoal,
      Config.defaultCarbsGoal,
      Config.defaultFatGoal,
      Config.defaultWaterGoal,
      timestamp,
      timestamp
    );
    profile = await db.getFirstAsync<UserProfile>(
      'SELECT * FROM user_profile LIMIT 1'
    );
  }

  return profile!;
}

export async function updateProfile(
  data: Partial<Omit<UserProfile, 'id' | 'created_at'>>
): Promise<void> {
  const db = await getDatabase();
  const profile = await getProfile();
  const fields: string[] = [];
  const values: any[] = [];

  const keys = Object.keys(data) as (keyof typeof data)[];
  for (const key of keys) {
    if (key === 'updated_at') continue;
    fields.push(`${key} = ?`);
    values.push(data[key]);
  }

  if (fields.length === 0) return;

  fields.push('updated_at = ?');
  values.push(now());
  values.push(profile.id);

  await db.runAsync(
    `UPDATE user_profile SET ${fields.join(', ')} WHERE id = ?`,
    ...values
  );
}

export async function isOnboardingDone(): Promise<boolean> {
  const profile = await getProfile();
  return profile.onboarding_done === 1;
}
