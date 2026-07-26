import React, { useState } from 'react'
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { useRouter } from 'expo-router'
import Animated, { FadeIn, SlideInRight, SlideOutLeft } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useSevaStore } from '../../../../src/store/useSevaStore'
import { PURPOSE_LABELS, getStepCount } from '../../../../src/features/annadan/constants'
import { useTabBarBottomPadding } from '../../../../src/hooks/useTabBarBottomPadding'

// ─── Step Components ──────────────────────────────────────────────────────────
import StepDate from '../../../../src/features/annadan/steps/StepDate'
import StepRecurring from '../../../../src/features/annadan/steps/StepRecurring'
import StepBeneficiary from '../../../../src/features/annadan/steps/StepBeneficiary'
import StepSponsor from '../../../../src/features/annadan/steps/StepSponsor'
import StepIdentity from '../../../../src/features/annadan/steps/StepIdentity'

// ─── Step Definitions ─────────────────────────────────────────────────────────
// General flow: Date → Recurring → Sponsor → Identity (skip Beneficiary)
// Other flows:  Date → Recurring → Beneficiary → Sponsor → Identity
type StepKey = 'date' | 'recurring' | 'beneficiary' | 'sponsor' | 'identity'

function getSteps(purpose: string | null): StepKey[] {
  if (purpose === 'general') {
    return ['date', 'recurring', 'sponsor', 'identity']
  }
  return ['date', 'recurring', 'beneficiary', 'sponsor', 'identity']
}

const STEP_LABELS: Record<StepKey, string> = {
  date: 'Select Date',
  recurring: 'Book for Year',
  beneficiary: 'Beneficiary',
  sponsor: 'Sponsor Details',
  identity: 'Government ID',
}

// ─────────────────────────────────────────────────────────────────────────────
export default function AnnadanDetailsRoute() {
  const router = useRouter()
  const bottomPadding = useTabBarBottomPadding()
  const bookingPurpose = useSevaStore((s) => s.bookingPurpose)

  const steps = getSteps(bookingPurpose)
  const [currentStepIndex, setCurrentStepIndex] = useState(0)

  const currentStep = steps[currentStepIndex]
  const totalSteps = steps.length
  const progressPercent = ((currentStepIndex + 1) / (totalSteps + 1)) * 100 // +1 for review

  const handleNext = () => {
    if (currentStepIndex < totalSteps - 1) {
      setCurrentStepIndex((i) => i + 1)
    } else {
      // All steps complete → go to review
      router.push('/(tabs)/seva/annadan/review' as never)
    }
  }

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex((i) => i - 1)
    } else {
      router.back()
    }
  }

  const purposeLabel = bookingPurpose ? PURPOSE_LABELS[bookingPurpose] : 'Annadan'

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 16, paddingBottom: bottomPadding }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={handleBack}>
            <MaterialIcons name="arrow-back" size={22} color="#8B5A00" />
          </Pressable>
          <View style={styles.headerTextWrap}>
            <Text style={styles.kicker}>{purposeLabel}</Text>
            <Text style={styles.title}>{STEP_LABELS[currentStep]}</Text>
          </View>
        </View>

        {/* Progress bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressTrack}>
            <Animated.View
              entering={FadeIn.duration(300)}
              style={[styles.progressFill, { width: `${progressPercent}%` as any }]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStepIndex + 2} of {totalSteps + 2}
          </Text>
        </View>

        {/* Step Content */}
        <View style={styles.stepWrapper}>
          {currentStep === 'date' && (
            <StepDate onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 'recurring' && (
            <StepRecurring onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 'beneficiary' && (
            <StepBeneficiary onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 'sponsor' && (
            <StepSponsor onNext={handleNext} onBack={handleBack} />
          )}
          {currentStep === 'identity' && (
            <StepIdentity onNext={handleNext} onBack={handleBack} />
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 56, gap: 20 },

  header: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  backButton: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: '#F0E7DD',
  },
  headerTextWrap: { flex: 1 },
  kicker: { color: '#E65C00', fontSize: 11, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.2 },
  title: { color: '#2B231B', fontSize: 22, fontWeight: '900', marginTop: 2 },

  progressContainer: { gap: 6 },
  progressTrack: {
    height: 6, borderRadius: 3,
    backgroundColor: '#E8D5BE', overflow: 'hidden',
  },
  progressFill: {
    height: '100%', borderRadius: 3,
    backgroundColor: '#B97512',
  },
  progressText: { color: '#9E9080', fontSize: 12, fontWeight: '700', textAlign: 'right' },

  stepWrapper: { flex: 1 },
})
