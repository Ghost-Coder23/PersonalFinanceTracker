import { Appearance } from 'react-native';

export const themes = {
  light: {
    background: '#fff',
    text: '#222',
    primary: '#1976d2',
    card: '#f5f5f5',
  },
  dark: {
    background: '#121212',
    text: '#fff',
    primary: '#90caf9',
    card: '#1e1e1e',
  },
};

export function getSystemTheme() {
  return Appearance.getColorScheme() || 'light';
}
