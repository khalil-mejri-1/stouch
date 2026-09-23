import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

export type ThemeMode = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceSecondary: string;
  surfaceElevated: string;
  border: string;
  borderLight: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  incomeBg: string;
  incomeBorder: string;
  incomeText: string;
  expenseBg: string;
  expenseBorder: string;
  expenseText: string;
  cardHighlight: string;
  navBg: string;
  navBorder: string;
  searchBg: string;
  searchBorder: string;
  inputBg: string;
  inputBorder: string;
  modalOverlay: string;
}

const darkColors: ThemeColors = {
  background: '#080C15',
  surface: '#182236',          // درجة أفتح وفخمة (Midnight Sapphire Obsidian) لقسمي Activité و Raccourcis
  surfaceSecondary: '#222F46', // متناسق لطبقات الأزرار الداخلية
  surfaceElevated: '#283854',
  border: 'rgba(255, 255, 255, 0.09)',
  borderLight: 'rgba(255, 255, 255, 0.05)',
  textPrimary: '#F8FAFC',
  textSecondary: '#94A3B8',
  textMuted: '#64748B',
  accent: '#10B981',
  incomeBg: 'rgba(16, 185, 129, 0.12)',
  incomeBorder: 'rgba(52, 211, 153, 0.35)',
  incomeText: '#34D399',
  expenseBg: 'rgba(239, 68, 68, 0.12)',
  expenseBorder: 'rgba(248, 113, 113, 0.35)',
  expenseText: '#F87171',
  cardHighlight: 'rgba(255, 255, 255, 0.04)',
  navBg: '#0F172A',
  navBorder: 'rgba(255, 255, 255, 0.1)',
  searchBg: '#1D2A42',
  searchBorder: 'rgba(255, 255, 255, 0.08)',
  inputBg: '#1D2A42',
  inputBorder: 'rgba(255, 255, 255, 0.1)',
  modalOverlay: 'rgba(0, 0, 0, 0.75)',
};

const lightColors: ThemeColors = {
  background: '#f1f1f1ff',      // اللون المطلوب بدقة من المستخدم
  surface: '#FFFFFF',         // بطاقات بيضاء ناصعة تبرز بوضوح فوق الخلفية
  surfaceSecondary: '#E5E7EB',
  surfaceElevated: '#FFFFFF',
  border: '#CBD5E1',          // Well-defined, tactile light slate border
  borderLight: '#E2E8F0',
  textPrimary: '#0F172A',     // Deep obsidian black - maximum legibility and authority
  textSecondary: '#475569',   // Balanced slate - crisp and easily readable
  textMuted: '#64748B',       // Muted slate
  accent: '#0D9488',
  incomeBg: '#F0FDF4',
  incomeBorder: '#86EFAC',    // Clear, vibrant emerald border
  incomeText: '#059669',      // Rich, vibrant, authoritative emerald green
  expenseBg: '#FEF2F2',
  expenseBorder: '#FECACA',   // Clear, vibrant ruby border
  expenseText: '#DC2626',     // Rich, vibrant, authoritative ruby red
  cardHighlight: '#FFFFFF',
  navBg: '#FFFFFF',
  navBorder: '#CBD5E1',
  searchBg: '#FFFFFF',        // Pure white search bar that pops on the #EDF2F7 background
  searchBorder: '#CBD5E1',
  inputBg: '#FFFFFF',
  inputBorder: '#CBD5E1',
  modalOverlay: 'rgba(15, 23, 42, 0.60)',
};

interface ThemeContextType {
  theme: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@stouch_theme_mode';

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  // Default to 'dark' mode as requested by user
  const [theme, setThemeState] = useState<ThemeMode>('dark');

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const storedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (storedTheme === 'dark' || storedTheme === 'light') {
          setThemeState(storedTheme);
        } else {
          // If no stored preference, keep dark as default
          setThemeState('dark');
        }
      } catch (e) {
        console.error('Failed to load theme preference', e);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (newTheme: ThemeMode) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
    } catch (e) {
      console.error('Failed to save theme preference', e);
    }
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
  };

  const isDark = theme === 'dark';
  const colors = isDark ? darkColors : lightColors;

  return (
    <ThemeContext.Provider
      value={{
        theme,
        isDark,
        colors,
        toggleTheme,
        setTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
