import React, { useMemo, useState } from 'react'
import { ScrollView, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import AppButton from '../../components/AppButton'
import AppCard from '../../components/AppCard'
import AppHeader from '../../components/AppHeader'
import AppInput from '../../components/AppInput'
import ScreenContainer from '../../components/ScreenContainer'
import { createBooking } from '../../services/bookings'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'

function formatAmount(amount: number) {
  return `INR ${amount.toLocaleString('en-IN')}`
}

function parseTravelerCount(value: string) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : 0
}

export default function BookingForm() {
  const router = useRouter()
  const selectedPackage = useBookingDraftStore((state) => state.selectedPackage)
  const numberOfTravelers = useBookingDraftStore((state) => state.numberOfTravelers)
  const specialNotes = useBookingDraftStore((state) => state.specialNotes)
  const updateField = useBookingDraftStore((state) => state.updateField)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  const travelerCount = useMemo(() => parseTravelerCount(numberOfTravelers), [numberOfTravelers])
  // TODO(production): Replace frontend-calculated totals with server-side pricing validation.
  const totalAmount = useMemo(() => (selectedPackage?.priceAmount ?? 0) * travelerCount, [selectedPackage?.priceAmount, travelerCount])

  const handleSubmit = async () => {
    if (!selectedPackage) {
      setErrorMessage('Please select a travel package before booking.')
      return
    }

    if (travelerCount < 1) {
      setErrorMessage('Enter at least one traveler.')
      return
    }

    if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
      setErrorMessage('This package does not have a valid price yet. Please try another package.')
      return
    }

    setIsSubmitting(true)
    setErrorMessage('')

    try {
      const booking = await createBooking({
        packageId: selectedPackage.id,
        travelerCount,
        specialNotes,
        totalAmount,
      })

      router.replace({
        pathname: '/(tabs)/travel/success',
        params: {
          bookingId: booking.id,
          bookingReference: booking.bookingReference,
        },
      } as never)
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Could not create booking. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!selectedPackage) {
    return (
      <ScreenContainer>
        <ScrollView contentInsetAdjustmentBehavior="automatic" className="flex-1">
          <View className="flex-1 p-6 gap-4">
            <AppHeader title="Booking" subtitle="Select a package first." />
            <AppButton title="Back to Travel" onPress={() => router.replace('/(tabs)/travel' as never)} />
          </View>
        </ScrollView>
      </ScreenContainer>
    )
  }

  return (
    <ScreenContainer>
      <ScrollView contentInsetAdjustmentBehavior="automatic" keyboardShouldPersistTaps="handled" className="flex-1">
        <View className="flex-1 p-6 gap-4">
          <AppHeader title="Booking" subtitle="Confirm your travel request." />

          <AppCard>
            <View className="gap-2">
              <Text className="text-base font-bold text-text-charcoal">{selectedPackage.title}</Text>
              <Text className="text-sm leading-5 text-text-charcoal/70">{selectedPackage.duration}</Text>
              <Text className="text-sm leading-5 text-text-charcoal/70">{selectedPackage.description}</Text>
              <Text className="text-sm font-bold text-primary">Package amount: {selectedPackage.price}</Text>
              <Text className="text-sm font-bold text-primary">Estimated total: {formatAmount(totalAmount)}</Text>
            </View>
          </AppCard>

          <AppInput
            label="Traveler Count"
            value={numberOfTravelers}
            onChangeText={(value) => updateField('numberOfTravelers', value.replace(/[^\d]/g, ''))}
            placeholder="1"
            keyboardType="number-pad"
          />
          <AppInput
            label="Special Notes"
            value={specialNotes}
            onChangeText={(value) => updateField('specialNotes', value)}
            placeholder="Dietary needs, accessibility requests, or other notes"
            multiline
            className="min-h-28 pt-4"
            textAlignVertical="top"
          />

          {errorMessage ? <Text className="text-sm leading-5 text-red-700">{errorMessage}</Text> : null}

          <View className="gap-4 mt-1">
            <AppButton
              title={isSubmitting ? 'Submitting Booking' : 'Submit Booking'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              loading={isSubmitting}
            />
            <AppButton title="Cancel" variant="secondary" disabled={isSubmitting} onPress={() => router.back()} />
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  )
}
