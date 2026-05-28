import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { theme } from '../constants/theme';

type AppButtonProps = {
  title: string;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  loading?: boolean;
};

export default function AppButton({ title, onPress, style, variant = 'primary', disabled = false, loading = false }: AppButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <Pressable
      accessibilityState={{ disabled: isDisabled }}
      disabled={isDisabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        variant === 'secondary' && styles.secondary,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' ? theme.colors.primary : theme.colors.surface} />
      ) : (
        <Text style={[styles.text, variant === 'secondary' && styles.secondaryText]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.lg,
  },
  secondary: {
    backgroundColor: theme.colors.primarySoft,
  },
  pressed: {
    opacity: 0.92,
  },
  disabled: {
    opacity: 0.62,
  },
  text: {
    color: theme.colors.surface,
    fontSize: theme.typography.sizes.sm,
    fontWeight: theme.typography.weights.bold,
  },
  secondaryText: {
    color: theme.colors.primary,
  },
});
