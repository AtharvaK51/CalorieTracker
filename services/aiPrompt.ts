import { Config } from '../constants/config';

export interface NutritionResult {
  title?: string;
  items: {
    name: string;
    quantity: string;
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  }[];
  total: {
    calories: number;
    protein_g: number;
    carbs_g: number;
    fat_g: number;
    fiber_g: number;
  };
}

export function generatePrompt(mealDescription: string): string {
  return Config.aiPromptTemplate(mealDescription);
}

export function parseAiResponse(responseText: string): NutritionResult | null {
  try {
    // Try to extract JSON from the response (handles markdown code blocks)
    let jsonStr = responseText.trim();

    // Remove markdown code blocks if present
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Try to find JSON object in the text
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    const parsed = JSON.parse(jsonStr);

    // Validate structure
    if (!parsed.total || typeof parsed.total.calories !== 'number') {
      return null;
    }

    return {
      title: typeof parsed.title === 'string' ? parsed.title.trim() : undefined,
      items: parsed.items ?? [],
      total: {
        calories: parsed.total.calories ?? 0,
        protein_g: parsed.total.protein_g ?? 0,
        carbs_g: parsed.total.carbs_g ?? 0,
        fat_g: parsed.total.fat_g ?? 0,
        fiber_g: parsed.total.fiber_g ?? 0,
      },
    };
  } catch {
    return null;
  }
}
