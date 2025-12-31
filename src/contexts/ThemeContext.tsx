import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'modern' | 'glassmorphism' | 'high-contrast';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    // Load theme from localStorage or default to 'light'
    const stored = localStorage.getItem('theme');
    return (stored as Theme) || 'light';
  });

  useEffect(() => {
    // Save theme to localStorage
    localStorage.setItem('theme', theme);
    
    // Apply theme class to document root
    document.documentElement.setAttribute('data-theme', theme);
    
    // Apply theme-specific styles
    const root = document.documentElement;
    root.classList.remove('theme-light', 'theme-dark', 'theme-modern', 'theme-glassmorphism', 'theme-high-contrast', 'dark');
    
    // Add theme class
    root.classList.add(`theme-${theme}`);
    
    // Add dark class for Tailwind dark mode when theme is dark
    if (theme === 'dark') {
      root.classList.add('dark');
    }
  }, [theme]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

