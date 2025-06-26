import OpenAI from 'openai';

interface TranslationEntry {
  key: string;
  english: string;
}

export type OpenAIModel = {
  id: string;
  name: string;
  maxTokens: number;
  description: string;
}

export const AVAILABLE_MODELS: OpenAIModel[] = [
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    maxTokens: 4000,
    description: "Good balance between performance and cost"
  },
  {
    id: "gpt-3.5-turbo-16k",
    name: "GPT-3.5 Turbo 16K",
    maxTokens: 16000,
    description: "Handles longer texts, more expensive"
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    maxTokens: 8000,
    description: "Most capable model, highest quality, most expensive"
  },
  {
    id: "gpt-4-turbo-preview",
    name: "GPT-4 Turbo",
    maxTokens: 128000,
    description: "Latest GPT-4 version, handles very long texts"
  }
];

export class AITranslationService {
  private openai: OpenAI;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async extractAndTranslate(html: string, prefix: string, modelId: string = "gpt-3.5-turbo"): Promise<{ [key: string]: string }> {
    try {
      console.log('Processing HTML with prefix:', prefix, 'using model:', modelId);
      
      // Clean and prepare the HTML
      const cleanHtml = html
        .replace(/\n/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();

      const selectedModel = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];

      // First, let's extract and translate all the text content
      const response = await this.openai.chat.completions.create({
        model: selectedModel.id,
        messages: [
          {
            role: "system",
            content: `You are an HTML text extractor and translator. Your task is to:
1. Extract all human-readable text from the HTML, including text content and relevant attributes like placeholder
2. Generate an appropriate translation key in SCREAMING_SNAKE_CASE
3. Translate the text to English
4. Return a JSON object where each key follows the pattern: "${prefix}.KEY_NAME"

Rules for key generation:
- Use semantic names that represent the content's meaning
- Use common patterns like STEP1_TITLE, STEP2_TITLE for sequential items
- Use NOT_SATISFIED, VERY_SATISFIED for ratings
- Use PLACEHOLDER for input placeholders
- Use THANKS for thank you messages
- Keep keys concise but meaningful

Example output format:
{
  "${prefix}.STEP1_TITLE": "1/2 How was your experience using our service?",
  "${prefix}.NOT_SATISFIED": "Not satisfied at all",
  "${prefix}.VERY_SATISFIED": "Very satisfied"
}

Important:
- Extract ALL text content from elements
- Include placeholder attributes from inputs
- Ignore any numbers-only content
- Return ONLY a valid JSON object with the translations
- Make sure all keys start with "${prefix}."

Example input -> output:
<div><b>¿Cómo fue tu experiencia?</b></div> ->
{
  "${prefix}.EXPERIENCE_QUESTION": "How was your experience?"
}`
          },
          {
            role: "user",
            content: `Extract text, generate keys and translate this HTML: ${cleanHtml}`
          }
        ],
        temperature: 0.1,
        max_tokens: Math.min(selectedModel.maxTokens, 4000),
        response_format: { type: "json_object" }
      });

      console.log('API Response:', response.choices[0].message.content);
      
      const result = response.choices[0].message.content?.trim() || '{}';
      
      try {
        const parsedResult = JSON.parse(result);
        console.log('Parsed result:', parsedResult);
        
        // Validate the result
        if (Object.keys(parsedResult).length === 0) {
          console.error('API returned empty translation object');
          throw new Error('No translations generated');
        }

        // Verify that all keys have the correct prefix
        const validatedResult: { [key: string]: string } = {};
        for (const [key, value] of Object.entries(parsedResult)) {
          const finalKey = key.startsWith(prefix) ? key : `${prefix}.${key}`;
          validatedResult[finalKey] = value as string;
        }

        return validatedResult;
      } catch (error) {
        console.error('Error parsing AI response:', error);
        console.error('Raw response:', result);
        throw new Error('Failed to parse translation response');
      }
    } catch (error: any) {
      console.error('Error in AI translation:', error);
      
      // Handle specific OpenAI API errors
      if (error?.status === 429) {
        const isRateLimit = error.message?.toLowerCase().includes('rate limit');
        if (isRateLimit) {
          throw new Error('Rate limit exceeded. For new accounts, you can only make 3 requests per minute. Please wait a moment and try again.');
        } else {
          throw new Error('OpenAI API quota exceeded. Please check:\n1. Your API key billing status\n2. Payment method\n3. Usage limits\nat https://platform.openai.com/account/billing');
        }
      } else if (error?.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key.');
      } else if (error?.status === 503) {
        throw new Error('OpenAI API is temporarily unavailable. Please try again later.');
      }
      
      throw error;
    }
  }
} 