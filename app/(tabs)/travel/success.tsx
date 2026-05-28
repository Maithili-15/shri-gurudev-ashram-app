import React from 'react';
import { Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import AppButton from '../../../src/components/AppButton';
import AppCard from '../../../src/components/AppCard';
import AppHeader from '../../../src/components/AppHeader';
import ScreenContainer from '../../../src/components/ScreenContainer';
import { theme } from '../../../src/constants/theme';
import { useBookingDraftStore } from '../../../src/store/useBookingDraftStore';

export default function SuccessRoute() {
  const router = useRouter();
  const { bookingReference } = useLocalSearchParams<{ bookingReference?: string }>();
  const resetDraft = useBookingDraftStore((state) => state.resetDraft);

  return (
    <ScreenContainer>
      <View style={{ flex: 1, padding: theme.spacing.lg, justifyContent: 'center' }}>
        <AppHeader title="Booking Submitted" subtitle="Your yatra booking request has been created." />
        <AppCard style={{ marginBottom: theme.spacing.lg }}>
          <Text style={{ color: theme.colors.textMuted }}>Booking Reference</Text>
          <Text style={{ marginTop: theme.spacing.xs, color: theme.colors.text, fontWeight: theme.typography.weights.bold }}>
            {bookingReference ?? 'Pending reference'}
          </Text>
          <Text style={{ marginTop: theme.spacing.md, color: theme.colors.textMuted, lineHeight: 20 }}>
            Your booking is pending admin verification. We will update the status after review.
          </Text>
        </AppCard>
        <AppButton
          title="Back to Home"
          onPress={() => {
            resetDraft();
            router.replace('/(tabs)/home' as never);
          }}
        />
      </View>
    </ScreenContainer>
  );
}
