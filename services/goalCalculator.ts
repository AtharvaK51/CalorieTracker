type Gender = 'male' | 'female' | 'other';
type ActivityLevel =
  | 'sedentary'
  | 'light'
  | 'moderate'
  | 'active'
  | 'very_active';

const activityMultipliers: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export interface GoalResult {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

/**
 * Calculates TDEE using the Mifflin-St Jeor equation
 */
export function calculateGoals(
  weightKg: number,
  heightCm: number,
  age: number,
  gender: Gender,
  activityLevel: ActivityLevel
): GoalResult {
  // Mifflin-St Jeor BMR
  let bmr: number;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const tdee = Math.round(bmr * activityMultipliers[activityLevel]);

  // Macro split: 30% protein, 40% carbs, 30% fat
  const protein_g = Math.round((tdee * 0.3) / 4); // 4 cal per gram
  const carbs_g = Math.round((tdee * 0.4) / 4); // 4 cal per gram
  const fat_g = Math.round((tdee * 0.3) / 9); // 9 cal per gram

  return { calories: tdee, protein_g, carbs_g, fat_g };
}
