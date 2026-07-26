import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { useSevaStore } from '../../../store/useSevaStore'

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatDateDisplay(iso: string): string {
  if (!iso) return '—'
  const parts = iso.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return iso
  const d = new Date(parts[0], parts[1] - 1, parts[2])
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

function calculateEndDate(startIso: string): string {
  if (!startIso) return ''
  const parts = startIso.split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return ''
  const endDate = new Date(parts[0] + 1, parts[1] - 1, parts[2])
  const y = endDate.getFullYear()
  const m = String(endDate.getMonth() + 1).padStart(2, '0')
  const d = String(endDate.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

// ─── Props ────────────────────────────────────────────────────────────────────
type StepRecurringProps = {
  onNext: () => void
  onBack: () => void
}

export default function StepRecurring({ onNext, onBack: _onBack }: StepRecurringProps) {
  const selectedDate = useSevaStore((s) => s.selectedDate)
  const isRecurring = useSevaStore((s) => s.isRecurring)
  const setIsRecurring = useSevaStore((s) => s.setIsRecurring)
  const setRecurringDates = useSevaStore((s) => s.setRecurringDates)

  const endDate = calculateEndDate(selectedDate)

  const handleToggle = () => {
    const newValue = !isRecurring
    setIsRecurring(newValue)
    if (newValue && selectedDate) {
      setRecurringDates(selectedDate, endDate)
    } else {
      setRecurringDates('', '')
    }
  }

  return (
    <View style={styles.container}>
      {/* Date Confirmation */}
      <Animated.View entering={FadeInDown.duration(400)} style={styles.dateBanner}>
        <MaterialIcons name="event" size={18} color="#8B5A00" />
        <Text style={styles.dateBannerText}>
          Annadan on <Text style={styles.dateBannerDate}>{formatDateDisplay(selectedDate)}</Text>
        </Text>
      </Animated.View>

      {/* Book for Year Selectable Card */}
      <Animated.View entering={FadeInDown.delay(80).duration(400)}>
        <Pressable
          onPress={handleToggle}
          style={[
            styles.card,
            isRecurring ? styles.cardSelected : null
          ]}
        >
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconWrap, isRecurring ? styles.iconWrapActive : null]}>
              <MaterialIcons name="event-note" size={22} color={isRecurring ? '#fff' : '#8B5A00'} />
            </View>
            <Text style={styles.toggleTitle}>Book for the Entire Year</Text>
          </View>

          <Text style={styles.toggleDescription}>
            {"Reserve this Annadan date for the next 12 months. Once confirmed, this date will remain reserved for you throughout the booking period, so you won't need to book it again every month."}
          </Text>

          <View style={styles.checkboxDivider} />

          <View style={styles.checkboxRow}>
            <MaterialIcons
              name={isRecurring ? 'check-box' : 'check-box-outline-blank'}
              size={22}
              color={isRecurring ? '#B97512' : '#9E9080'}
            />
            <Text style={[styles.checkboxLabel, isRecurring ? styles.checkboxLabelActive : null]}>
              Enable Full-Year Booking
            </Text>
          </View>
        </Pressable>
      </Animated.View>

      {/* Booking Period Preview */}
      {isRecurring ? (
        <Animated.View entering={FadeInDown.duration(300)} style={styles.periodBox}>
          <View style={styles.periodRow}>
            <MaterialIcons name="date-range" size={16} color="#8B5A00" />
            <Text style={styles.periodLabel}>Booking Start Date</Text>
          </View>
          <Text style={styles.periodValue}>{formatDateDisplay(selectedDate)}</Text>

          <View style={styles.periodDivider} />

          <View style={styles.periodRow}>
            <MaterialIcons name="date-range" size={16} color="#8B5A00" />
            <Text style={styles.periodLabel}>Booking End Date</Text>
          </View>
          <Text style={styles.periodValue}>{formatDateDisplay(endDate)}</Text>

          <View style={styles.periodNote}>
            <MaterialIcons name="info-outline" size={14} color="#9E9080" />
            <Text style={styles.periodNoteText}>
              This Annadan date will remain reserved for you throughout the booking period.
            </Text>
          </View>
        </Animated.View>
      ) : null}

      {/* CTA */}
      <Pressable onPress={onNext}>
        <LinearGradient
          colors={['#7B4B00', '#B97512', '#E0A31F']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.ctaButton}
        >
          <Text style={styles.ctaText}>Continue →</Text>
        </LinearGradient>
      </Pressable>
    </View>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { gap: 16 },

  dateBanner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFF0D9', borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: '#EDD9B8',
  },
  dateBannerText: { color: '#7E7162', fontSize: 14, fontWeight: '600', flex: 1 },
  dateBannerDate: { color: '#8B5A00', fontWeight: '900' },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 20,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 16,
  },
  cardSelected: {
    borderColor: '#B97512',
    backgroundColor: '#FFFBF0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#FFF0D9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapActive: {
    backgroundColor: '#B97512',
  },
  toggleTitle: { color: '#2B231B', fontSize: 16, fontWeight: '800', flex: 1 },
  toggleDescription: { color: '#7E7162', fontSize: 13, lineHeight: 20 },
  checkboxDivider: {
    height: 1,
    backgroundColor: '#F0E7DD',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkboxLabel: {
    color: '#7E7162',
    fontSize: 14,
    fontWeight: '700',
  },
  checkboxLabelActive: {
    color: '#B97512',
  },

  periodBox: {
    backgroundColor: '#FAF6F0', borderRadius: 18, padding: 16,
    borderWidth: 1, borderColor: '#F0E7DD', gap: 8,
  },
  periodRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  periodLabel: { color: '#9E9080', fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.6 },
  periodValue: { color: '#2B231B', fontSize: 15, fontWeight: '800', marginLeft: 22 },
  periodDivider: { height: 1, backgroundColor: '#F0E7DD', marginVertical: 4 },
  periodNote: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 6,
    marginTop: 4,
  },
  periodNoteText: { color: '#9E9080', fontSize: 12, lineHeight: 18, flex: 1 },

  ctaButton: { height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  ctaText: { color: '#fff', fontSize: 15, fontWeight: '800' },
})
