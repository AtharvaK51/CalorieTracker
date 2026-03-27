import { analyzeWithApi } from './aiApi';
import { generatePrompt, parseAiResponse, type NutritionResult } from './aiPrompt';
import * as SecureStore from 'expo-secure-store';

export type { NutritionResult } from './aiPrompt';

export type AiStatus = 'idle' | 'analyzing' | 'fallback' | 'success' | 'error';

interface AiSettings {
  apiKey: string | null;
  provider: 'gemini' | 'openai';
  model?: string;
}

const SETTINGS_KEY = 'ai_settings';

export async function getAiSettings(): Promise<AiSettings> {
  try {
    const raw = await SecureStore.getItemAsync(SETTINGS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { apiKey: null, provider: 'gemini' };
}

export async function saveAiSettings(settings: AiSettings): Promise<void> {
  await SecureStore.setItemAsync(SETTINGS_KEY, JSON.stringify(settings));
}

export async function analyzeMeal(
  mealDescription: string
): Promise<{
  result: NutritionResult | null;
  fallbackPrompt: string | null;
  status: AiStatus;
}> {
  const settings = await getAiSettings();

  // Tier 1: Try API if key is configured
  if (settings.apiKey) {
    const result = await analyzeWithApi(mealDescription, {
      apiKey: settings.apiKey,
      provider: settings.provider,
      model: settings.model,
    });

    if (result) {
      return { result, fallbackPrompt: null, status: 'success' };
    }
  }

  // Tier 2: Fallback — generate prompt for user to copy
  const fallbackPrompt = generatePrompt(mealDescription);
  return { result: null, fallbackPrompt, status: 'fallback' };
}

export { parseAiResponse };
