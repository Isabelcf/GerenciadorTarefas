import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'light' | 'dark';

interface ColorPalette {
  name: string;
  primary: string;
  primaryDark: string;
  secondary: string;
  secondaryDark: string;
  accent: string;
  accentDark: string;
  success: string;
  successDark: string;
  warning: string;
  warningDark: string;
  background: string;
  card: string;
  text: string;
  textMuted: string;
  border: string;
  shadow: string;
}

interface ThemeContextType {
  theme: Theme;
  colorName: string;
  palette: ColorPalette;
  setTheme: (theme: Theme) => void;
  setColorName: (name: string) => void;
  availableColors: string[];
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const palettes: Record<Theme, Record<string, ColorPalette>> = {
  light: {
    'Azul Céu': {
      name: 'Azul Céu',
      primary: '#7dd3fc', // Sky 300
      primaryDark: '#38bdf8', // Sky 400
      secondary: '#fdba74', // Orange 300
      secondaryDark: '#fb923c', // Orange 400
      accent: '#d8b4fe', // Purple 300
      accentDark: '#c084fc', // Purple 400
      success: '#86efac', // Green 300
      successDark: '#4ade80', // Green 400
      warning: '#fde047', // Yellow 300
      warningDark: '#facc15', // Yellow 400
      background: '#f8fafc', // Slate 50
      card: '#ffffff',
      text: '#0f172a', // Slate 900
      textMuted: '#64748b', // Slate 500
      border: '#e2e8f0', // Slate 200
      shadow: '#f1f5f9', // Slate 100
    },
    'Menta': {
      name: 'Menta',
      primary: '#86efac', // Green 300
      primaryDark: '#4ade80', // Green 400
      secondary: '#f9a8d4', // Pink 300
      secondaryDark: '#f472b6', // Pink 400
      accent: '#99f6e4', // Teal 300
      accentDark: '#2dd4bf', // Teal 400
      success: '#4ade80', // Green 400
      successDark: '#16a34a', // Green 600
      warning: '#fde047', // Yellow 300
      warningDark: '#facc15', // Yellow 400
      background: '#f0fdf4', // Green 50
      card: '#ffffff',
      text: '#064e3b', // Green 900
      textMuted: '#059669', // Green 600
      border: '#dcfce7', // Green 100
      shadow: '#f0fdf4',
    },
    'Lavanda': {
      name: 'Lavanda',
      primary: '#d8b4fe', // Purple 300
      primaryDark: '#c084fc', // Purple 400
      secondary: '#fde047', // Yellow 300
      secondaryDark: '#facc15', // Yellow 400
      accent: '#fda4af', // Rose 300
      accentDark: '#fb7185', // Rose 400
      success: '#86efac', // Green 300
      successDark: '#4ade80', // Green 400
      warning: '#fde047', // Yellow 300
      warningDark: '#facc15', // Yellow 400
      background: '#faf5ff', // Purple 50
      card: '#ffffff',
      text: '#3b0764', // Purple 900
      textMuted: '#7c3aed', // Purple 600
      border: '#f3e8ff', // Purple 100
      shadow: '#faf5ff',
    },
    'Pêssego': {
      name: 'Pêssego',
      primary: '#fdba74', // Orange 300
      primaryDark: '#fb923c', // Orange 400
      secondary: '#7dd3fc', // Sky 300
      secondaryDark: '#38bdf8', // Sky 400
      accent: '#fca5a5', // Red 300
      accentDark: '#f87171', // Red 400
      success: '#86efac', // Green 300
      successDark: '#4ade80', // Green 400
      warning: '#fde047', // Yellow 300
      warningDark: '#facc15', // Yellow 400
      background: '#fff7ed', // Orange 50
      card: '#ffffff',
      text: '#7c2d12', // Orange 900
      textMuted: '#ea580c', // Orange 600
      border: '#ffedd5', // Orange 100
      shadow: '#fff7ed',
    },
    'Rosa': {
      name: 'Rosa',
      primary: '#f9a8d4', // Pink 300
      primaryDark: '#f472b6', // Pink 400
      secondary: '#86efac', // Green 300
      secondaryDark: '#4ade80', // Green 400
      accent: '#d8b4fe', // Purple 300
      accentDark: '#c084fc', // Purple 400
      success: '#86efac', // Green 300
      successDark: '#4ade80', // Green 400
      warning: '#fde047', // Yellow 300
      warningDark: '#facc15', // Yellow 400
      background: '#fdf2f8', // Pink 50
      card: '#ffffff',
      text: '#831843', // Pink 900
      textMuted: '#db2777', // Pink 600
      border: '#fce7f3', // Pink 100
      shadow: '#fdf2f8',
    }
  },
  dark: {
    'Noite Azul': {
      name: 'Noite Azul',
      primary: '#0ea5e9', // Sky 500
      primaryDark: '#0284c7', // Sky 600
      secondary: '#f97316', // Orange 500
      secondaryDark: '#ea580c', // Orange 600
      accent: '#6366f1', // Indigo 500
      accentDark: '#4f46e5', // Indigo 600
      success: '#22c55e', // Green 500
      successDark: '#16a34a', // Green 600
      warning: '#eab308', // Yellow 500
      warningDark: '#ca8a04', // Yellow 600
      background: '#0f172a', // Slate 900
      card: '#1e293b', // Slate 800
      text: '#f8fafc', // Slate 50
      textMuted: '#94a3b8', // Slate 400
      border: '#334155', // Slate 700
      shadow: '#020617', // Slate 950
    },
    'Floresta': {
      name: 'Floresta',
      primary: '#22c55e', // Green 500
      primaryDark: '#16a34a', // Green 600
      secondary: '#ec4899', // Pink 500
      secondaryDark: '#db2777', // Pink 600
      accent: '#14b8a6', // Teal 500
      accentDark: '#0d9488', // Teal 600
      success: '#16a34a', // Green 600
      successDark: '#15803d', // Green 700
      warning: '#eab308', // Yellow 500
      warningDark: '#ca8a04', // Yellow 600
      background: '#064e3b', // Green 900
      card: '#065f46', // Green 800
      text: '#f0fdf4', // Green 50
      textMuted: '#34d399', // Green 400
      border: '#064e3b',
      shadow: '#022c22',
    },
    'Ametista': {
      name: 'Ametista',
      primary: '#a855f7', // Purple 500
      primaryDark: '#9333ea', // Purple 600
      secondary: '#eab308', // Yellow 500
      secondaryDark: '#ca8a04', // Yellow 600
      accent: '#f43f5e', // Rose 500
      accentDark: '#e11d48', // Rose 600
      success: '#22c55e', // Green 500
      successDark: '#16a34a', // Green 600
      warning: '#eab308', // Yellow 500
      warningDark: '#ca8a04', // Yellow 600
      background: '#3b0764', // Purple 900
      card: '#581c87', // Purple 800
      text: '#faf5ff', // Purple 50
      textMuted: '#c084fc', // Purple 400
      border: '#3b0764',
      shadow: '#2e1065',
    },
    'Vinho': {
      name: 'Vinho',
      primary: '#f43f5e', // Rose 500
      primaryDark: '#e11d48', // Rose 600
      secondary: '#10b981', // Emerald 500
      secondaryDark: '#059669', // Emerald 600
      accent: '#8b5cf6', // Violet 500
      accentDark: '#7c3aed', // Violet 600
      success: '#22c55e', // Green 500
      successDark: '#16a34a', // Green 600
      warning: '#eab308', // Yellow 500
      warningDark: '#ca8a04', // Yellow 600
      background: '#450a0a', // Red 900
      card: '#7f1d1d', // Red 800
      text: '#fef2f2', // Red 50
      textMuted: '#f87171', // Red 400
      border: '#450a0a',
      shadow: '#450a0a',
    }
  }
};

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('app-theme');
    return (saved as Theme) || 'light';
  });

  const [colorName, setColorName] = useState(() => {
    const saved = localStorage.getItem('app-color');
    const defaultColor = theme === 'light' ? 'Azul Céu' : 'Noite Azul';
    return saved || defaultColor;
  });

  const palette = palettes[theme][colorName] || palettes[theme][Object.keys(palettes[theme])[0]];

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    localStorage.setItem('app-color', colorName);
    
    const root = document.documentElement;
    root.style.setProperty('--primary', palette.primary);
    root.style.setProperty('--primary-dark', palette.primaryDark);
    root.style.setProperty('--secondary', palette.secondary);
    root.style.setProperty('--secondary-dark', palette.secondaryDark);
    root.style.setProperty('--accent', palette.accent);
    root.style.setProperty('--accent-dark', palette.accentDark);
    root.style.setProperty('--success', palette.success);
    root.style.setProperty('--success-dark', palette.successDark);
    root.style.setProperty('--warning', palette.warning);
    root.style.setProperty('--warning-dark', palette.warningDark);
    root.style.setProperty('--background', palette.background);
    root.style.setProperty('--card', palette.card);
    root.style.setProperty('--text', palette.text);
    root.style.setProperty('--text-muted', palette.textMuted);
    root.style.setProperty('--border', palette.border);
    root.style.setProperty('--shadow', palette.shadow);

    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme, colorName]);

  const availableColors = Object.keys(palettes[theme]);

  return (
    <ThemeContext.Provider value={{ theme, colorName, palette, setTheme, setColorName, availableColors }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
