import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { CollectorInstallment } from '../../types/collector'

const COLORS = {
  primary: '#8B5A00',
  muted: '#786553',
  track: 'rgba(139,90,0,0.10)',
  paid: '#1E8E3E',
  current: '#D89B1D',
  upcoming: '#C8B8A5',
}

type Props = {
  paidAmount: number
  totalAmount: number
  dueAmount: number
  status: string
  installments?: CollectorInstallment[]
}

export default function InstallmentProgress({ paidAmount, totalAmount, dueAmount, status, installments = [] }: Props) {
  const progress = totalAmount <= 0 ? 0 : Math.min(1, paidAmount / totalAmount)
  const animatedWidth = useSharedValue(0)

  useEffect(() => {
    animatedWidth.value = withTiming(progress, { duration: 800 })
  }, [animatedWidth, progress])

  const fillStyle = useAnimatedStyle(() => ({
    width: `${Math.max(6, animatedWidth.value * 100)}%`,
  }))

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Total package</Text>
          <Text style={styles.value}>₹{totalAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.statusPill}>
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>

      <View style={styles.metricsRow}>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Paid</Text>
          <Text style={styles.metricValue}>₹{paidAmount.toLocaleString()}</Text>
        </View>
        <View style={styles.metric}>
          <Text style={styles.metricLabel}>Remaining</Text>
          <Text style={styles.metricValue}>₹{dueAmount.toLocaleString()}</Text>
        </View>
      </View>

      <View style={styles.barTrack}>
        <Animated.View style={[styles.barFill, fillStyle]} />
      </View>

      <View style={styles.timeline}>
        {installments.map((installment) => {
          const toneStyle =
            installment.status === 'paid'
              ? styles.paidTone
              : installment.status === 'current'
                ? styles.currentTone
                : styles.upcomingTone

          return (
            <View key={installment.id} style={styles.timelineItem}>
              <View style={[styles.dot, toneStyle]} />
              <Text style={styles.timelineLabel}>{installment.label}</Text>
              <Text style={styles.timelineAmount}>₹{installment.amount.toLocaleString()}</Text>
              <Text style={styles.timelineDate}>{installment.dueDate}</Text>
            </View>
          )
        })}
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
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  label: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  value: {
    color: COLORS.primary,
    fontSize: 24,
    fontWeight: '900',
  },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(216,155,29,0.12)',
  },
  statusText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  metric: {
    flex: 1,
    padding: 12,
    borderRadius: 18,
    backgroundColor: 'rgba(139,90,0,0.04)',
  },
  metricLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
  },
  metricValue: {
    color: '#3E2B19',
    fontSize: 15,
    fontWeight: '800',
  },
  barTrack: {
    height: 12,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: COLORS.track,
    marginTop: 16,
  },
  barFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: COLORS.current,
  },
  timeline: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 16,
    flexWrap: 'wrap',
  },
  timelineItem: {
    flexBasis: '31%',
    padding: 10,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginBottom: 8,
  },
  paidTone: { backgroundColor: COLORS.paid },
  currentTone: { backgroundColor: COLORS.current },
  upcomingTone: { backgroundColor: COLORS.upcoming },
  timelineLabel: {
    color: '#3A2816',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 4,
  },
  timelineAmount: {
    color: '#8B5A00',
    fontSize: 13,
    fontWeight: '800',
  },
  timelineDate: {
    color: COLORS.muted,
    fontSize: 10,
    marginTop: 3,
    fontWeight: '600',
  },
})
