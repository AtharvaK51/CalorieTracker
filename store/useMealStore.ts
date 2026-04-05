import { create } from 'zustand';
import {
  insertMeal,
  updateMealNutrition,
  updateMeal as dbUpdateMeal,
  deleteMeal as dbDeleteMeal,
  getMealsForDate,
  getMealById,
  type Meal,
} from '../db/meals';
import { markDayLogged } from '../db/streaks';
import { today } from '../utils/date';
import { analyzeMeal, parseAiResponse, type NutritionResult, type AiStatus } from '../services/ai';
import type { MealType } from '../constants/config';

interface MealState {
  todayMeals: Meal[];
  currentMeal: Meal | null;
  aiStatus: AiStatus;
  fallbackPrompt: string | null;
  loadTodayMeals: () => Promise<void>;
  loadMealsForDate: (date: string) => Promise<Meal[]>;
  addMeal: (
    description: string,
    mealType: MealType | null
  ) => Promise<string>;
  applyNutrition: (mealId: string, nutrition: NutritionResult) => Promise<void>;
  applyFallbackResponse: (mealId: string, responseText: string) => Promise<boolean>;
  updateMeal: (
    id: string,
    data: Partial<Omit<Meal, 'id' | 'created_at' | 'sync_status'>>
  ) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  getMeal: (id: string) => Promise<Meal | null>;
  resetAiStatus: () => void;
}

export const useMealStore = create<MealState>((set, get) => ({
  todayMeals: [],
  currentMeal: null,
  aiStatus: 'idle',
  fallbackPrompt: null,

  loadTodayMeals: async () => {
    const meals = await getMealsForDate(today());
    set({ todayMeals: meals });
  },

  loadMealsForDate: async (date: string) => {
    return await getMealsForDate(date);
  },

  addMeal: async (description, mealType) => {
    set({ aiStatus: 'analyzing' });

    const mealId = await insertMeal(description, mealType);
    await markDayLogged();

    // Try AI analysis
    const { result, fallbackPrompt, status } = await analyzeMeal(description);

    if (result) {
      await updateMealNutrition(mealId, {
        parsed_items: JSON.stringify(result.items),
        calories: result.total.calories,
        protein_g: result.total.protein_g,
        carbs_g: result.total.carbs_g,
        fat_g: result.total.fat_g,
        fiber_g: result.total.fiber_g,
      });
      if (result.title) {
        await dbUpdateMeal(mealId, { description: result.title });
      }
    }

    set({ aiStatus: status, fallbackPrompt });

    // Refresh today's meals
    const meals = await getMealsForDate(today());
    set({ todayMeals: meals });

    return mealId;
  },

  applyNutrition: async (mealId, nutrition) => {
    await updateMealNutrition(mealId, {
      parsed_items: JSON.stringify(nutrition.items),
      calories: nutrition.total.calories,
      protein_g: nutrition.total.protein_g,
      carbs_g: nutrition.total.carbs_g,
      fat_g: nutrition.total.fat_g,
      fiber_g: nutrition.total.fiber_g,
    });
    if (nutrition.title) {
      await dbUpdateMeal(mealId, { description: nutrition.title });
    }

    const meals = await getMealsForDate(today());
    set({ todayMeals: meals, aiStatus: 'success' });
  },

  applyFallbackResponse: async (mealId, responseText) => {
    const result = parseAiResponse(responseText);
    if (!result) return false;

    await get().applyNutrition(mealId, result);
    return true;
  },

  updateMeal: async (id, data) => {
    await dbUpdateMeal(id, data);
    const meals = await getMealsForDate(today());
    set({ todayMeals: meals });
  },

  deleteMeal: async (id) => {
    await dbDeleteMeal(id);
    const meals = await getMealsForDate(today());
    set({ todayMeals: meals });
  },

  getMeal: async (id) => {
    return await getMealById(id);
  },

  resetAiStatus: () => {
    set({ aiStatus: 'idle', fallbackPrompt: null });
  },
}));
