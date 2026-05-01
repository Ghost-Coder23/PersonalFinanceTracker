import { StyleSheet, Platform } from 'react-native';
import { COLORS } from './colors';

export const STANDARD_FONT = Platform.OS === 'ios' ? 'System' : 'Roboto';

export const standardStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: 16,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 12,
    fontFamily: STANDARD_FONT,
  },
  label: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 4,
    fontFamily: STANDARD_FONT,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
    fontFamily: STANDARD_FONT,
    backgroundColor: COLORS.input,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    padding: 14,
    alignItems: 'center',
    marginVertical: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    fontFamily: STANDARD_FONT,
  },
});
