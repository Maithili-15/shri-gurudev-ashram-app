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
import { isValidAadhaarNumber, isValidPanNumber } from '../../../utils/validation'
import { maskAadhaar, maskPan } from '../../../utils/mask'

type IdentityTypeOption = 'aadhaar' | 'pan'

type StepIdentityProps = {
  onNext: () => void
  onBack: () => void
}

export default function StepIdentity({ onNext, onBack: _onBack }: StepIdentityProps) {
  const identityType = useSevaStore((s) => s.identityType)
  const identityNumber = useSevaStore((s) => s.identityNumber)
  const setIdentityType = useSevaStore((s) => s.setIdentityType)
  const setIdentityNumber = useSevaStore((s) => s.setIdentityNumber)

  const [touched, setTouched] = useState(false)

  const isAadhaar = identityType === 'aadhaar'
  const isPan = identityType === 'pan'

  const numberError = touched && identityType
    ? isAadhaar && !isValidAadhaarNumber(identityNumber)
      ? 'Please enter a valid 12-digit Aadhaar number.'
      : isPan && !isValidPanNumber(identityNumber)
        ? 'Please enter a valid PAN (e.g. ABCDE1234F).'
        : ''
    : ''

  const isValid = identityType !== null &&
    ((isAadhaar && isValidAadhaarNumber(identityNumber)) ||
     (isPan && isValidPanNumber(identityNumber)))

  const handleSelectType = (type: IdentityTypeOption) => {
    setIdentityType(type) // resets identityNumber via store
    setTouched(false)
  }

  const handleChange = (text: string) => {
    if (isAadhaar) {
      setIdentityNumber(text.replace(/\D/g, '').slice(0, 12))
    } else {
      setIdentityNumber(text.toUpperCase().slice(0, 10))
    }
  }

  const handleContinue = () => {
    setTouched(true)
    if (!isValid) return
    onNext()
  }

  const maskedPreview = isValid
    ? isAadhaar
      ? maskAadhaar(identityNumber)
      : maskPan(identityNumber)
    : null

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.container}>
        <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
          <Text style={styles.cardTitle}>Government Identity</Text>
          <Text style={styles.cardHint}>
            Provide either Aadhaar or PAN for the Annadan receipt. Only one is required.
          </Text>

          {/* Type Selector */}
          <View style={styles.typeRow}>
            <Pressable
              style={[styles.typeChip, isAadhaar && styles.typeChipActive]}
              onPress={() => handleSelectType('aadhaar')}
            >
              <MaterialIcons name="fingerprint" size={18} color={isAadhaar ? '#fff' : '#8B5A00'} />
              <Text style={[styles.typeChipText, isAadhaar && styles.typeChipTextActive]}>Aadhaar</Text>
            </Pressable>
            <Pressable
              style={[styles.typeChip, isPan && styles.typeChipActive]}
              onPress={() => handleSelectType('pan')}
            >
              <MaterialIcons name="credit-card" size={18} color={isPan ? '#fff' : '#8B5A00'} />
              <Text style={[styles.typeChipText, isPan && styles.typeChipTextActive]}>PAN Card</Text>
            </Pressable>
          </View>

          {/* Number Input */}
          {identityType ? (
            <Animated.View entering={FadeInDown.duration(300)} style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>
                {isAadhaar ? 'Aadhaar Number' : 'PAN Number'} *
              </Text>
              <View style={[styles.inputWrap, numberError ? styles.inputError : null]}>
                <MaterialIcons
                  name={isAadhaar ? 'fingerprint' : 'credit-card'}
                  size={18}
                  color={numberError ? '#C04545' : '#9E9080'}
                  style={styles.inputIcon}
                />
                <TextInput
                  style={styles.input}
                  placeholder={isAadhaar ? '1234 5678 9012' : 'ABCDE1234F'}
                  placeholderTextColor="#C4BAB0"
                  value={identityNumber}
                  onChangeText={handleChange}
                  onBlur={() => setTouched(true)}
                  keyboardType={isAadhaar ? 'number-pad' : 'default'}
                  maxLength={isAadhaar ? 12 : 10}
                  autoCapitalize="characters"
                  returnKeyType="done"
                />
              </View>
              {numberError ? <Text style={styles.errorText}>{numberError}</Text> : null}

              {/* Masked Preview */}
              {maskedPreview ? (
                <View style={styles.previewRow}>
                  <MaterialIcons name="visibility" size={14} color="#9E9080" />
                  <Text style={styles.previewText}>
                    Will appear on receipt as: <Text style={styles.previewValue}>{maskedPreview}</Text>
                  </Text>
                </View>
              ) : null}
            </Animated.View>
          ) : null}

          {/* Security note */}
          <View style={styles.securityNote}>
            <MaterialIcons name="shield" size={16} color="#2F7132" />
            <Text style={styles.securityText}>
              Your identity number is encrypted at rest and will only appear in masked form on the receipt.
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
            <Text style={styles.ctaText}>Continue to Review →</Text>
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
  cardTitle: { color: '#2B231B', fontSize: 17, fontWeight: '900' },
  cardHint: { color: '#9E9080', fontSize: 13, lineHeight: 20 },

  typeRow: { flexDirection: 'row', gap: 12 },
  typeChip: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 52, borderRadius: 16,
    backgroundColor: '#FAF6F0', borderWidth: 1.5, borderColor: '#E8D5BE',
  },
  typeChipActive: { backgroundColor: '#8B5A00', borderColor: '#8B5A00' },
  typeChipText: { color: '#8B5A00', fontSize: 14, fontWeight: '800' },
  typeChipTextActive: { color: '#fff' },

  fieldGroup: { gap: 6 },
  fieldLabel: { color: '#5A4A42', fontSize: 13, fontWeight: '700' },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#FAF6F0', borderRadius: 14,
    borderWidth: 1.5, borderColor: '#E8D5BE', overflow: 'hidden',
  },
  inputError: { borderColor: '#C04545' },
  inputIcon: { paddingLeft: 14 },
  input: {
    flex: 1, height: 52, paddingHorizontal: 12,
    color: '#2B231B', fontSize: 15, fontWeight: '600',
  },
  errorText: { color: '#C04545', fontSize: 12, fontWeight: '700' },

  previewRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4, paddingLeft: 2 },
  previewText: { color: '#9E9080', fontSize: 12, lineHeight: 18 },
  previewValue: { color: '#8B5A00', fontWeight: '800' },

  securityNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    backgroundColor: '#EEF8EF', borderRadius: 14, padding: 12,
    borderWidth: 1, borderColor: '#D0E8D2',
  },
  securityText: { color: '#2F7132', fontSize: 12, lineHeight: 18, flex: 1, fontWeight: '600' },

  ctaButton: { minHeight: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
})
