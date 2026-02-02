import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { translations, Language } from '../i18n/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('pt');
  const [isLoading, setIsLoading] = useState(true);

  // Carregar idioma salvo ou detectar automático
  useEffect(() => {
    loadLanguage();
  }, []);

  const loadLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('appLanguage');
      if (savedLanguage === 'en' || savedLanguage === 'pt' || savedLanguage === 'es') {
        setLanguageState(savedLanguage);
      } else {
        // Detectar idioma do dispositivo
        const deviceLanguage = Localization.getLocales()[0]?.languageCode;
        if (deviceLanguage === 'en') {
          setLanguageState('en');
        } else if (deviceLanguage === 'es') {
          setLanguageState('es');
        } else {
          setLanguageState('pt');
        }
      }
    } catch (error) {
      console.error('Erro ao carregar idioma:', error);
      setLanguageState('pt');
    } finally {
      setIsLoading(false);
    }
  };

  const setLanguage = async (newLanguage: Language) => {
    try {
      await AsyncStorage.setItem('appLanguage', newLanguage);
      setLanguageState(newLanguage);
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
      throw error;
    }
  };

  // Função para traduzir usando notação de ponto (ex: 'screens.home.title')
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = translations[language];

    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return key; // Retorna a chave se não encontrar
      }
    }

    return typeof value === 'string' ? value : key;
  };

  if (isLoading) {
    return null; // Ou um splash screen
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage deve ser usado dentro de LanguageProvider');
  }
  return context;
};
