import OpenAI from 'openai';

export interface TranslationProvider {
  name: string;
  description: string;
  translateText(html: string, prefix: string, modelId?: string): Promise<{ [key: string]: string }>;
  translateTextMultiLanguage(html: string, prefix: string, languages: string[], modelId?: string): Promise<MultiLanguageTranslations>;
}

export interface MultiLanguageTranslations {
  spanish: { [key: string]: string };
  english: { [key: string]: string };
  french: { [key: string]: string };
  portuguese: { [key: string]: string };
}

export interface AIModel {
  id: string;
  name: string;
  maxTokens: number;
  description: string;
  provider: string;
}

// Función utilitaria para limpiar expresiones de AngularJS
export const cleanAngularExpressions = (html: string): string => {
  // Remover expresiones de AngularJS que están entre {{ }}
  return html.replace(/\{\{[^}]*\}\}/g, '');
};

export const AVAILABLE_MODELS: AIModel[] = [
  {
    id: "gpt-3.5-turbo",
    name: "GPT-3.5 Turbo",
    maxTokens: 4000,
    description: "Buena relación entre rendimiento y costo",
    provider: "openai"
  },
  {
    id: "gpt-3.5-turbo-16k",
    name: "GPT-3.5 Turbo 16K",
    maxTokens: 16000,
    description: "Maneja textos más largos, más costoso",
    provider: "openai"
  },
  {
    id: "gpt-4",
    name: "GPT-4",
    maxTokens: 8000,
    description: "Modelo más capaz, mayor calidad, más costoso",
    provider: "openai"
  },
  {
    id: "gpt-4-turbo-preview",
    name: "GPT-4 Turbo",
    maxTokens: 128000,
    description: "Última versión de GPT-4, maneja textos muy largos",
    provider: "openai"
  },
  {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    maxTokens: 30720,
    description: "Modelo más rápido de Google, optimizado para respuestas rápidas",
    provider: "google"
  }
];

export class OpenAIProvider implements TranslationProvider {
  private openai: OpenAI;
  name = "OpenAI";
  description = "Uses OpenAI's GPT models for translation";

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  }

  async translateText(html: string, prefix: string, modelId: string = "gpt-3.5-turbo"): Promise<{ [key: string]: string }> {
    try {
      // Limpiar expresiones de AngularJS antes de procesar
      const htmlWithoutAngular = cleanAngularExpressions(html);
      const cleanHtml = htmlWithoutAngular.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      const selectedModel = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];

      const response = await this.openai.chat.completions.create({
        model: selectedModel.id,
        messages: [
          {
            role: "system",
            content: `You are an HTML text extractor and translator. Your task is to:
1. Extract all human-readable text from the HTML
2. Generate an appropriate translation key in SCREAMING_SNAKE_CASE
3. Translate the text to English
4. Return a JSON object where each key follows the pattern: "${prefix}.KEY_NAME" and the value is the English translation

IMPORTANT: Only return the translated text as values, do not include the original text or create duplicate keys with "_TRANSLATION" suffix.`
          },
          {
            role: "user",
            content: `Extract text, generate keys and translate this HTML to English: ${cleanHtml}`
          }
        ],
        temperature: 0.1,
        max_tokens: Math.min(selectedModel.maxTokens, 4000),
        response_format: { type: "json_object" }
      });

      const result = response.choices[0].message.content?.trim() || '{}';
      return JSON.parse(result);
    } catch (error: any) {
      if (error?.status === 429) {
        const isRateLimit = error.message?.toLowerCase().includes('rate limit');
        if (isRateLimit) {
          throw new Error('Límite de velocidad de OpenAI excedido. Intenta de nuevo en un minuto o cambia a un proveedor diferente.');
        } else {
          throw new Error('Cuota de OpenAI excedida. Considera cambiar a un proveedor diferente o verifica tu estado de facturación.');
        }
      }
      throw error;
    }
  }

  async translateTextMultiLanguage(html: string, prefix: string, languages: string[], modelId?: string): Promise<MultiLanguageTranslations> {
    try {
      // Limpiar expresiones de AngularJS antes de procesar
      const htmlWithoutAngular = cleanAngularExpressions(html);
      const cleanHtml = htmlWithoutAngular.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();
      const selectedModel = AVAILABLE_MODELS.find(m => m.id === modelId) || AVAILABLE_MODELS[0];

      const response = await this.openai.chat.completions.create({
        model: selectedModel.id,
        messages: [
          {
            role: "system",
            content: `You are an HTML text extractor and translator. Your task is to:
1. Extract all human-readable text from the HTML
2. Generate an appropriate translation key in SCREAMING_SNAKE_CASE
3. Translate the text to Spanish, English, French, and Portuguese
4. Return a JSON object with the following structure:
{
  "spanish": { "KEY_NAME": "Spanish translation" },
  "english": { "KEY_NAME": "English translation" },
  "french": { "KEY_NAME": "French translation" },
  "portuguese": { "KEY_NAME": "Portuguese translation" }
}

IMPORTANT: 
- Only return the translated text as values, do not include the original text
- Use the same keys across all languages
- Each key should follow the pattern: "${prefix}.KEY_NAME"`
          },
          {
            role: "user",
            content: `Extract text, generate keys and translate this HTML to Spanish, English, French, and Portuguese: ${cleanHtml}`
          }
        ],
        temperature: 0.1,
        max_tokens: Math.min(selectedModel.maxTokens, 8000),
        response_format: { type: "json_object" }
      });

      const result = response.choices[0].message.content?.trim() || '{}';
      const parsedResult = JSON.parse(result);
      
      return {
        spanish: parsedResult.spanish || {},
        english: parsedResult.english || {},
        french: parsedResult.french || {},
        portuguese: parsedResult.portuguese || {}
      };
    } catch (error: any) {
      if (error?.status === 429) {
        const isRateLimit = error.message?.toLowerCase().includes('rate limit');
        if (isRateLimit) {
          throw new Error('Límite de velocidad de OpenAI excedido. Intenta de nuevo en un minuto o cambia a un proveedor diferente.');
        } else {
          throw new Error('Cuota de OpenAI excedida. Considera cambiar a un proveedor diferente o verifica tu estado de facturación.');
        }
      }
      throw error;
    }
  }
}

export class GoogleAIProvider implements TranslationProvider {
  private apiKey: string;
  name = "Google AI";
  description = "Uses Gemini 2.0 Flash for fast translations";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private cleanJsonResponse(text: string): string {
    // Remove markdown code blocks if present
    const markdownMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (markdownMatch) {
      return markdownMatch[1].trim();
    }
    return text.trim();
  }

  async translateText(html: string, prefix: string): Promise<{ [key: string]: string }> {
    try {
      // Limpiar expresiones de AngularJS antes de procesar
      const htmlWithoutAngular = cleanAngularExpressions(html);
      const cleanHtml = htmlWithoutAngular.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an HTML text extractor and translator. Your task is to:
1. Extract all human-readable text from the HTML
2. Generate an appropriate translation key in SCREAMING_SNAKE_CASE
3. Translate the text to English
4. Return a JSON object where each key follows the pattern: "${prefix}.KEY_NAME" and the value is the English translation

Rules for key generation:
- Use semantic names that represent the content's meaning
- Use common patterns like STEP1_TITLE, STEP2_TITLE for sequential items
- Use NOT_SATISFIED, VERY_SATISFIED for ratings
- Use PLACEHOLDER for input placeholders
- Use THANKS for thank you messages
- Keep keys concise but meaningful

IMPORTANT: Only return the translated text as values, do not include the original text or create duplicate keys with "_TRANSLATION" suffix.

Input HTML: ${cleanHtml}

IMPORTANT: Return a valid JSON object only, with no markdown formatting or backticks.`
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google AI API Error:', errorText);
        
        if (response.status === 403) {
          throw new Error('Clave API inválida o permisos insuficientes. Por favor verifica tu clave API en https://makersuite.google.com/app/apikey');
        } else if (response.status === 429) {
          throw new Error('Cuota de API excedida. Por favor verifica tu cuota en Google Cloud Console');
        } else {
          throw new Error(`Llamada a API falló: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      
      try {
        // Clean the response and try to parse it
        const cleanedJson = this.cleanJsonResponse(text);
        console.log('Cleaned JSON response:', cleanedJson);
        return JSON.parse(cleanedJson);
      } catch (parseError) {
        console.error('Error al analizar respuesta de Google AI:', text);
        throw new Error('Formato de respuesta inválido de Google AI - no es un JSON válido');
      }
    } catch (error: any) {
      console.error('Google AI Error details:', error);
      throw error;
    }
  }

  async translateTextMultiLanguage(html: string, prefix: string, languages: string[], modelId?: string): Promise<MultiLanguageTranslations> {
    try {
      // Limpiar expresiones de AngularJS antes de procesar
      const htmlWithoutAngular = cleanAngularExpressions(html);
      const cleanHtml = htmlWithoutAngular.replace(/\n/g, ' ').replace(/\s+/g, ' ').trim();

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an HTML text extractor and translator. Your task is to:
1. Extract all human-readable text from the HTML
2. Generate an appropriate translation key in SCREAMING_SNAKE_CASE
3. Translate the text to Spanish, English, French, and Portuguese
4. Return a JSON object with the following structure:
{
  "spanish": { "KEY_NAME": "Spanish translation" },
  "english": { "KEY_NAME": "English translation" },
  "french": { "KEY_NAME": "French translation" },
  "portuguese": { "KEY_NAME": "Portuguese translation" }
}

Rules for key generation:
- Use semantic names that represent the content's meaning
- Use common patterns like STEP1_TITLE, STEP2_TITLE for sequential items
- Use NOT_SATISFIED, VERY_SATISFIED for ratings
- Use PLACEHOLDER for input placeholders
- Use THANKS for thank you messages
- Keep keys concise but meaningful

IMPORTANT: 
- Only return the translated text as values, do not include the original text
- Use the same keys across all languages
- Each key should follow the pattern: "${prefix}.KEY_NAME"

Input HTML: ${cleanHtml}

IMPORTANT: Return a valid JSON object only, with no markdown formatting or backticks.`
                  }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Google AI API Error:', errorText);
        
        if (response.status === 403) {
          throw new Error('Clave API inválida o permisos insuficientes. Por favor verifica tu clave API en https://makersuite.google.com/app/apikey');
        } else if (response.status === 429) {
          throw new Error('Cuota de API excedida. Por favor verifica tu cuota en Google Cloud Console');
        } else {
          throw new Error(`Llamada a API falló: ${response.status} ${response.statusText}`);
        }
      }

      const result = await response.json();
      const text = result.candidates[0].content.parts[0].text;
      
      try {
        // Clean the response and try to parse it
        const cleanedJson = this.cleanJsonResponse(text);
        console.log('Cleaned JSON response:', cleanedJson);
        const parsedResult = JSON.parse(cleanedJson);
        
        return {
          spanish: parsedResult.spanish || {},
          english: parsedResult.english || {},
          french: parsedResult.french || {},
          portuguese: parsedResult.portuguese || {}
        };
      } catch (parseError) {
        console.error('Error al analizar respuesta de Google AI:', text);
        throw new Error('Formato de respuesta inválido de Google AI - no es un JSON válido');
      }
    } catch (error: any) {
      console.error('Google AI Error details:', error);
      throw error;
    }
  }
}

export const createTranslationProvider = (provider: string, apiKey: string): TranslationProvider => {
  switch (provider) {
    case 'openai':
      return new OpenAIProvider(apiKey);
    case 'google':
      return new GoogleAIProvider(apiKey);
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}; 