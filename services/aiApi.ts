import { generatePrompt, parseAiResponse, type NutritionResult } from './aiPrompt';

interface AiConfig {
  apiKey: string;
  provider: 'gemini' | 'openai';
  model?: string;
}

export async function analyzeWithApi(
  mealDescription: string,
  config: AiConfig
): Promise<NutritionResult | null> {
  const prompt = generatePrompt(mealDescription);

  try {
    let responseText: string;

    if (config.provider === 'gemini') {
      responseText = await callGemini(prompt, config.apiKey, config.model);
    } else {
      responseText = await callOpenAI(prompt, config.apiKey, config.model);
    }

    return parseAiResponse(responseText);
  } catch (error) {
    console.error('AI API call failed:', error);
    return null;
  }
}

async function callGemini(
  prompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const modelId = model || 'gemini-2.0-flash';
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelId}:generateContent?key=${apiKey}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.1,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`Gemini API error: ${response.status}`);
  }

  const data = await response.json();
  return data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
}

async function callOpenAI(
  prompt: string,
  apiKey: string,
  model?: string
): Promise<string> {
  const modelId = model || 'gpt-4o-mini';
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: modelId,
      messages: [
        {
          role: 'system',
          content:
            'You are a nutritional analysis assistant. Always respond with valid JSON only.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.1,
      max_tokens: 1024,
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices?.[0]?.message?.content ?? '';
}
