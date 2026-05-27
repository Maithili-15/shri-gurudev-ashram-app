import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const COLORS = {
  primary: '#8B5A00',
  success: '#1E8E3E',
  warning: '#C87000',
  danger: '#B42318',
  muted: '#786553',
}

type Props = {
  aadhaarUploaded: boolean
  selfieUploaded: boolean
  travelerConfirmed: boolean
}

export default function VerificationStatus({ aadhaarUploaded, selfieUploaded, travelerConfirmed }: Props) {
  const rows = [
    { label: 'Aadhaar uploaded', value: aadhaarUploaded },
    { label: 'Selfie uploaded', value: selfieUploaded },
    { label: 'Traveler confirmed', value: travelerConfirmed },
  ]

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Verification status</Text>
      <View style={styles.rowGroup}>
        {rows.map((row) => {
          const tone = row.value ? styles.ok : styles.warn
          return (
            <View key={row.label} style={[styles.pill, tone]}>
              <View style={[styles.dot, row.value ? styles.dotOk : styles.dotWarn]} />
              <Text style={[styles.pillText, row.value ? styles.pillTextOk : styles.pillTextWarn]}>{row.label}</Text>
            </View>
          )
        })}
      </View>

      <View style={styles.helperRow}>
        {!aadhaarUploaded ? <Text style={styles.helperText}>Aadhaar document still pending.</Text> : null}
        {!selfieUploaded ? <Text style={styles.helperText}>Selfie upload required for entry confirmation.</Text> : null}
        {!travelerConfirmed ? <Text style={styles.helperText}>Traveler confirmation is still awaiting collector check.</Text> : null}
        {aadhaarUploaded && selfieUploaded && travelerConfirmed ? <Text style={styles.helperSuccess}>All traveler verification checks are complete.</Text> : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFDF9',
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  title: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 12,
  },
  rowGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
  },
  ok: {
    backgroundColor: 'rgba(30,142,62,0.08)',
    borderColor: 'rgba(30,142,62,0.18)',
  },
  warn: {
    backgroundColor: 'rgba(196,107,0,0.08)',
    borderColor: 'rgba(196,107,0,0.18)',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotOk: { backgroundColor: COLORS.success },
  dotWarn: { backgroundColor: COLORS.warning },
  pillText: {
    fontSize: 12,
    fontWeight: '800',
  },
  pillTextOk: { color: COLORS.success },
  pillTextWarn: { color: COLORS.warning },
  helperRow: {
    marginTop: 12,
    gap: 6,
  },
  helperText: {
    color: COLORS.warning,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '600',
  },
  helperSuccess: {
    color: COLORS.success,
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '700',
  },
})
