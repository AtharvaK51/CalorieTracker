export const Config = {
  // Water tracking
  waterStepSmall: 250,  // ml
  waterStepLarge: 500,  // ml
  defaultWaterGoal: 2500, // ml

  // Default goals (used before onboarding)
  defaultCalorieGoal: 2000,
  defaultProteinGoal: 50,  // grams
  defaultCarbsGoal: 250,   // grams
  defaultFatGoal: 65,      // grams

  // Analytics periods
  analyticsPeriods: [
    { label: '90 Days', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
    { label: 'All time', days: 0 },
  ] as const,

  // Meal types
  mealTypes: ['breakfast', 'lunch', 'dinner', 'snack'] as const,

  // AI prompt template
  aiPromptTemplate: (meal: string) =>
    `Analyze this meal and return ONLY a JSON object (no markdown, no explanation):

Meal: "${meal}"

Return this exact JSON structure:
{
  "items": [
    {
      "name": "item name",
      "quantity": "estimated quantity",
      "calories": 0,
      "protein_g": 0,
      "carbs_g": 0,
      "fat_g": 0,
      "fiber_g": 0
    }
  ],
  "total": {
    "calories": 0,
    "protein_g": 0,
    "carbs_g": 0,
    "fat_g": 0,
    "fiber_g": 0
  }
}

Use standard Indian serving sizes where applicable. Be accurate with calorie estimates.`,

  // App info
  appName: 'CalorieTracker',
  appVersion: '1.0.0',
};

export type MealType = (typeof Config.mealTypes)[number];
