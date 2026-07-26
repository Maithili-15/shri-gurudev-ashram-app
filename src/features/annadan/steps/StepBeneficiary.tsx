import React, { useState } from 'react'
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSevaStore } from '../../../store/useSevaStore'
import { BENEFICIARY_LABELS } from '../constants'

type StepBeneficiaryProps = {
  onNext: () => void
  onBack: () => void
}

export default function StepBeneficiary({ onNext, onBack: _onBack }: StepBeneficiaryProps) {
  const bookingPurpose = useSevaStore((s) => s.bookingPurpose)
  const beneficiaryName = useSevaStore((s) => s.beneficiaryName)
  const setBeneficiaryName = useSevaStore((s) => s.setBeneficiaryName)

  const [touched, setTouched] = useState(false)

  const labels = bookingPurpose && bookingPurpose !== 'general'
    ? BENEFICIARY_LABELS[bookingPurpose]
    : null

  if (!labels) {
    // General Annadan — should not render this step, but guard anyway
    onNext()
    return null
  }

  const nameError = touched && beneficiaryName.trim().length < 2
    ? 'Please enter the full name (at least 2 characters).'
    : ''
  const isValid = beneficiaryName.trim().length >= 2

  const handleContinue = () => {
    setTouched(true)
    if (!isValid) return
    onNext()
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        {/* Card */}
        <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
          <View style={styles.iconRow}>
            <View style={styles.iconWrap}>
              <MaterialIcons
                name={bookingPurpose === 'birthday' ? 'cake' : 'brightness-5'}
                size={22}
                color="#8B5A00"
              />
            </View>
            <Text style={styles.heading}>{labels.heading}</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Full Name *</Text>
            <View style={[styles.inputWrap, nameError ? styles.inputError : null]}>
              <MaterialIcons name="person" size={18} color={nameError ? '#C04545' : '#9E9080'} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder={labels.placeholder}
                placeholderTextColor="#C4BAB0"
                value={beneficiaryName}
                onChangeText={setBeneficiaryName}
                onBlur={() => setTouched(true)}
                autoCapitalize="words"
                returnKeyType="done"
              />
            </View>
            {nameError ? <Text style={styles.errorText}>{nameError}</Text> : null}
          </View>

          <View style={styles.privacyNote}>
            <MaterialIcons name="lock-outline" size={14} color="#9E9080" />
            <Text style={styles.privacyText}>
              This name will appear on your Annadan receipt.
            </Text>
          </View>
        </Animated.View>

        {/* CTA */}
        <Pressable disabled={!isValid} onPress={handleContinue}>
          <LinearGradient
            colors={isValid ? ['#7B4B00', '#B97512', '#E0A31F'] : ['#D5CFC8', '#D5CFC8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>Continue →</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: { gap: 16 },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 18,
  },

  iconRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconWrap: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
  },
  heading: { color: '#2B231B', fontSize: 16, fontWeight: '800', flex: 1 },

  fieldGroup: { gap: 6 },
  fieldLabel: { color: '#5A4A42', fontSize: 13, fontWeight: '700' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF6F0', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8D5BE',
    overflow: 'hidden',
  },
  inputError: { borderColor: '#C04545' },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1, height: 52, paddingHorizontal: 12,
    color: '#2B231B', fontSize: 15, fontWeight: '600',
  },
  errorText: { color: '#C04545', fontSize: 12, fontWeight: '700' },

  privacyNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    paddingHorizontal: 4,
  },
  privacyText: { color: '#9E9080', fontSize: 12, lineHeight: 18, flex: 1 },

  ctaButton: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },
})
