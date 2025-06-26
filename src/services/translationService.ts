import { parse } from 'node-html-parser';
import { createTranslationProvider, AVAILABLE_MODELS } from './translationProviders';
import type { MultiLanguageTranslations } from './translationProviders';

interface TranslationPair {
  key: string;
  spanish: string;
  english: string;
}

export const extractTranslations = async (
  html: string, 
  prefix: string = '', 
  apiKey: string = '',
  modelId: string = 'gpt-3.5-turbo'
): Promise<{ [key: string]: string }> => {
  if (!apiKey) {
    throw new Error('API key is required for translations');
  }

  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (!model) {
    throw new Error('Invalid model selected');
  }

  const provider = createTranslationProvider(model.provider, apiKey);
  return await provider.translateText(html, prefix, modelId);
};

export const extractMultiLanguageTranslations = async (
  html: string, 
  prefix: string = '', 
  apiKey: string = '',
  modelId: string = 'gpt-3.5-turbo'
): Promise<MultiLanguageTranslations> => {
  if (!apiKey) {
    throw new Error('API key is required for translations');
  }

  const model = AVAILABLE_MODELS.find(m => m.id === modelId);
  if (!model) {
    throw new Error('Invalid model selected');
  }

  const provider = createTranslationProvider(model.provider, apiKey);
  return await provider.translateTextMultiLanguage(html, prefix, ['spanish', 'english', 'french', 'portuguese'], modelId);
};

export const generateTranslationObject = (translations: TranslationPair[]): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  translations.forEach(({ key, english }) => {
    result[key] = english;
  });
  return result;
}; 