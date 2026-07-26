import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSevaStore } from '../../../store/useSevaStore'
import { checkAnnadanAvailability, fetchSevaMonthlyAvailability, DateAvailabilityInfo } from '../../../services/seva'

// ─── Calendar helpers ─────────────────────────────────────────────────────────
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const MONTHS = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December',
]

function toIso(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function formatDateString(isoStr: string): string {
  if (!isoStr) return ''
  const parts = isoStr.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return isoStr
  const localDate = new Date(parts[0], parts[1] - 1, parts[2])
  return localDate.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

function buildCalendar(year: number, month: number): (Date | null)[] {
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (Date | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

// ─── Props ────────────────────────────────────────────────────────────────────
type StepDateProps = {
  onNext: () => void
  onBack: () => void
}

export default function StepDate({ onNext, onBack: _onBack }: StepDateProps) {
  const selectedDate = useSevaStore((s) => s.selectedDate)
  const setSelectedDate = useSevaStore((s) => s.setSelectedDate)

  const today = new Date()
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())
  const [checking, setChecking] = useState(false)
  const [availabilityMsg, setAvailabilityMsg] = useState<{ available: boolean; reason?: string } | null>(null)
  const [monthlyAvailability, setMonthlyAvailability] = useState<Record<string, DateAvailabilityInfo>>({})
  const [loadingMonth, setLoadingMonth] = useState(false)

  useEffect(() => {
    const monthStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}`
    setLoadingMonth(true)
    fetchSevaMonthlyAvailability('annadan', monthStr)
      .then((map) => setMonthlyAvailability(map))
      .catch(() => {})
      .finally(() => setLoadingMonth(false))
  }, [viewYear, viewMonth])

  const cells = buildCalendar(viewYear, viewMonth)
  const isPast = (date: Date) => {
    const d = new Date(date); d.setHours(0,0,0,0)
    const t = new Date(today); t.setHours(0,0,0,0)
    return d < t
  }

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11) }
    else setViewMonth((m) => m - 1)
    setSelectedDate(''); setAvailabilityMsg(null)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0) }
    else setViewMonth((m) => m + 1)
    setSelectedDate(''); setAvailabilityMsg(null)
  }

  const onSelectDate = async (date: Date) => {
    const iso = toIso(date)
    setSelectedDate(iso)
    setAvailabilityMsg(null)
    setChecking(true)
    try {
      const result = await checkAnnadanAvailability(iso)
      setAvailabilityMsg(result)
    } finally {
      setChecking(false)
    }
  }

  const onContinue = () => {
    if (!selectedDate || !availabilityMsg?.available) return
    onNext()
  }

  const formattedSelected = formatDateString(selectedDate)

  return (
    <View style={styles.container}>
      {/* Calendar Card */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.card}>
        <Text style={styles.cardTitle}>Select Annadan Date</Text>
        <Text style={styles.cardSubtitle}>
          Choose a date to sponsor. Each date can only have one patron.
        </Text>

        {/* Month nav */}
        <View style={styles.monthNav}>
          <TouchableOpacity onPress={prevMonth} style={styles.navBtn}>
            <MaterialIcons name="chevron-left" size={24} color="#8B5A00" />
          </TouchableOpacity>
          <Text style={styles.monthLabel}>{MONTHS[viewMonth]} {viewYear}</Text>
          <TouchableOpacity onPress={nextMonth} style={styles.navBtn}>
            <MaterialIcons name="chevron-right" size={24} color="#8B5A00" />
          </TouchableOpacity>
        </View>

        {/* Weekday headers */}
        <View style={styles.weekRow}>
          {WEEKDAYS.map((d) => (
            <Text key={d} style={styles.weekDay}>{d}</Text>
          ))}
        </View>

        {/* Grid */}
        {loadingMonth ? (
          <View style={{ padding: 24, alignItems: 'center' }}>
            <ActivityIndicator color="#8B5A00" />
          </View>
        ) : (
          <View style={styles.grid}>
            {cells.map((date, i) => {
              if (!date) return <View key={`empty-${i}`} style={styles.cell} />
              const iso = toIso(date)
              const past = isPast(date)
              const selected = iso === selectedDate
              const dayInfo = monthlyAvailability[iso]
              const booked = past ? false : (dayInfo ? !dayInfo.available : false)
              const dotColor = past ? '#C04545' : booked ? '#F5C242' : '#2F7132'
              return (
                <TouchableOpacity
                  key={iso}
                  style={[
                    styles.cell,
                    selected && styles.cellSelected,
                    (past || booked) && styles.cellPast,
                    booked && !past && styles.cellBooked,
                  ]}
                  disabled={past || booked}
                  onPress={() => void onSelectDate(date)}
                  activeOpacity={0.75}
                >
                  <Text style={[
                    styles.cellText,
                    selected && styles.cellTextSelected,
                    (past || booked) && styles.cellTextPast,
                  ]}>
                    {date.getDate()}
                  </Text>
                  <View style={[styles.bookedDot, { backgroundColor: selected ? '#fff' : dotColor }]} />
                </TouchableOpacity>
              )
            })}
          </View>
        )}

        {/* Legend */}
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#2F7132' }]} />
            <Text style={styles.legendText}>Available</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#F5C242' }]} />
            <Text style={styles.legendText}>Already Sponsored</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#C04545' }]} />
            <Text style={styles.legendText}>Closed</Text>
          </View>
        </View>
      </Animated.View>

      {/* Availability result */}
      {checking ? (
        <View style={styles.availRow}>
          <ActivityIndicator size="small" color="#B97512" />
          <Text style={styles.availChecking}>Checking availability…</Text>
        </View>
      ) : availabilityMsg ? (
        <View style={[styles.availRow, availabilityMsg.available ? styles.availOk : styles.availNo]}>
          <MaterialIcons
            name={availabilityMsg.available ? 'check-circle' : 'cancel'}
            size={16}
            color={availabilityMsg.available ? '#2F7132' : '#C04545'}
          />
          <Text style={[styles.availText, { color: availabilityMsg.available ? '#2F7132' : '#C04545' }]}>
            {availabilityMsg.available
              ? `${formattedSelected} is available. You can sponsor this day.`
              : availabilityMsg.reason ?? 'This date is not available.'}
          </Text>
        </View>
      ) : null}

      {/* CTA */}
      <Pressable
        disabled={!selectedDate || !availabilityMsg?.available}
        onPress={onContinue}
      >
        <LinearGradient
          colors={
            selectedDate && availabilityMsg?.available
              ? ['#7B4B00', '#B97512', '#E0A31F']
              : ['#D5CFC8', '#D5CFC8']
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>
            {selectedDate && availabilityMsg?.available ? 'Continue →' : 'Select a Date to Continue'}
          </Text>
        </LinearGradient>
      </Pressable>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { gap: 16 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 10,
  },
  cardTitle: { color: '#2B231B', fontSize: 17, fontWeight: '900' },
  cardSubtitle: { color: '#7E7162', fontSize: 13, lineHeight: 20 },

  monthNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  navBtn: {
    width: 36, height: 36, borderRadius: 18,
    backgroundColor: '#FFF0D9', alignItems: 'center', justifyContent: 'center',
  },
  monthLabel: { color: '#2B231B', fontSize: 16, fontWeight: '800' },
  weekRow: { flexDirection: 'row', marginTop: 4 },
  weekDay: { flex: 1, textAlign: 'center', color: '#9E9080', fontSize: 11, fontWeight: '700' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: '14.28%', height: 44,
    alignItems: 'center', justifyContent: 'center', borderRadius: 10,
  },
  cellSelected: { backgroundColor: '#8B5A00' },
  cellPast: { opacity: 0.35 },
  cellBooked: { opacity: 1 },
  cellText: { color: '#2B231B', fontSize: 15, fontWeight: '600' },
  cellTextSelected: { color: '#fff', fontWeight: '900' },
  cellTextPast: { color: '#B9B1A9' },
  bookedDot: {
    position: 'absolute', bottom: 4,
    width: 5, height: 5, borderRadius: 2.5, backgroundColor: '#F5C242',
  },
  legendRow: { flexDirection: 'row', gap: 14, justifyContent: 'center', marginTop: 8 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { color: '#9E9080', fontSize: 11, fontWeight: '600' },

  availRow: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 8,
    borderRadius: 14, padding: 12,
  },
  availOk: { backgroundColor: '#EEF8EF' },
  availNo: { backgroundColor: '#FDECEA' },
  availChecking: { color: '#9E9080', fontSize: 13, fontWeight: '600' },
  availText: { fontSize: 13, fontWeight: '700', flex: 1, lineHeight: 20 },

  ctaButton: { minHeight: 60, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '900' },
})
