import React, { createContext, useContext, useState, useEffect } from 'react';
import ptBR from '../locales/pt-BR.json';
import enUS from '../locales/en-US.json';

export type Language = 'pt-BR' | 'en-US';

export interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const translations: Record<Language, Record<string, unknown>> = {
  'pt-BR': ptBR,
  'en-US': enUS,
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export interface LanguageProviderProps {
  children: React.ReactNode;
  defaultLanguage?: Language;
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({
  children,
  defaultLanguage,
}) => {
  const [language, setLanguage] = useState<Language>(() => {
    if (defaultLanguage) return defaultLanguage;
    if (typeof navigator !== 'undefined' && navigator.language) {
      return navigator.language.startsWith('pt') ? 'pt-BR' : 'en-US';
    }
    return 'pt-BR';
  });

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (keyPath: string, params?: Record<string, string | number>): string => {
    const keys = keyPath.split('.');
    let current: unknown = translations[language];

    for (const k of keys) {
      if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
        return keyPath;
      }
      if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, k)) {
        // nosemgrep: javascript.lang.security.audit.prototype-pollution.prototype-pollution-loop.prototype-pollution-loop
        current = (current as Record<string, unknown>)[k];
      } else {
        return keyPath;
      }
    }

    if (typeof current !== 'string') {
      return keyPath;
    }

    let result = current;
    if (params) {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

const defaultT = (keyPath: string, params?: Record<string, string | number>): string => {
  const keys = keyPath.split('.');
  let current: unknown = ptBR;

  for (const k of keys) {
    if (k === '__proto__' || k === 'constructor' || k === 'prototype') {
      return keyPath;
    }
    if (current && typeof current === 'object' && Object.prototype.hasOwnProperty.call(current, k)) {
      // nosemgrep: javascript.lang.security.audit.prototype-pollution.prototype-pollution-loop.prototype-pollution-loop
      current = (current as Record<string, unknown>)[k];
    } else {
      return keyPath;
    }
  }

  if (typeof current !== 'string') {
    return keyPath;
  }

  let result = current;
  if (params) {
    Object.entries(params).forEach(([paramKey, paramVal]) => {
      result = result.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), String(paramVal));
    });
  }

  return result;
};

const defaultContext: LanguageContextType = {
  language: 'pt-BR',
  setLanguage: () => {},
  t: defaultT,
};

export const useTranslation = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    return defaultContext;
  }
  return ctx;
};
