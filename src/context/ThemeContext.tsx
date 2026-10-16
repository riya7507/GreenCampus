import React, { createContext, useContext, useEffect, useState } from 'react';
import { Colors, ThemePalette, ThemeType } from '@/constants/theme';

interface ThemeContextType {
  colorScheme: ThemeType;
  theme: ThemePalette;
  toggleTheme: () => void;
  setColorScheme: (scheme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  colorScheme: 'light',
  theme: Colors.light,
  toggleTheme: () => {},
  setColorScheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [colorScheme, setColorScheme] = useState<ThemeType>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setColorScheme(e.matches ? 'dark' : 'light');
    };
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggleTheme = () => {
    setColorScheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const theme = Colors[colorScheme];

  useEffect(() => {
    if (colorScheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#000000';
      document.body.style.color = '#ffffff';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#ffffff';
      document.body.style.color = '#000000';
    }
  }, [colorScheme]);

  return (
    <ThemeContext.Provider value={{ colorScheme, theme, toggleTheme, setColorScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  return context.theme;
}

export function useAppColorScheme() {
  const context = useContext(ThemeContext);
  return {
    colorScheme: context.colorScheme,
    toggleTheme: context.toggleTheme,
    setColorScheme: context.setColorScheme,
  };
}
