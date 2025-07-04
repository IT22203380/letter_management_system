import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations
import enTranslation from './locales/en/translation.json';
import siTranslation from './locales/si/translation.json';
import taTranslation from './locales/ta/translation.json';

const resources = {
  en: {
    translation: enTranslation
  },
  si: {
    translation: siTranslation
  },
  ta: {
    translation: taTranslation
  }
} as const;

i18n
  .use(LanguageDetector) // Detect user language
  .use(initReactI18next) // Pass the i18n instance to react-i18next
  .init({
    resources,
    fallbackLng: 'en', // Default language
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n;