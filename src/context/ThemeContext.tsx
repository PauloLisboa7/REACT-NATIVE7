import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryLight: string;
  primaryDark: string;
  success: string;
  warning: string;
  danger: string;
  background: string;
  surface: string;
  surfaceSecondary: string;
  text: string;
  textSecondary: string;
  border: string;
  shadow: string;
}

interface ThemeContextType {
  isDark: boolean;
  theme: ThemeMode;
  colors: ThemeColors;
  toggleTheme: () => Promise<void>;
}

const lightColors: ThemeColors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceSecondary: '#F3F4F6',
  text: '#1F2937',
  textSecondary: '#6B7280',
  border: '#E5E7EB',
  shadow: '#000000',
};

const darkColors: ThemeColors = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#4F46E5',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#0F172A',
  surface: '#1E293B',
  surfaceSecondary: '#334155',
  text: '#F1F5F9',
  textSecondary: '#CBD5E1',
  border: '#475569',
  shadow: '#000000',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carregar tema salvo ao iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme === 'dark') {
          setIsDark(true);
        }
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTheme();
  }, []);

  const toggleTheme = async () => {
    try {
      const newTheme = !isDark;
      setIsDark(newTheme);
      await AsyncStorage.setItem('appTheme', newTheme ? 'dark' : 'light');
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  };

  const theme: ThemeMode = isDark ? 'dark' : 'light';
  const colors = isDark ? darkColors : lightColors;

  const value: ThemeContextType = {
    isDark,
    theme,
    colors,
    toggleTheme,
  };

  if (loading) {
    return null; // Ou um splash screen
  }

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

/**
 * Hook para usar o contexto de tema
 */
export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};
