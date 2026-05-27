import React, { useMemo, useState } from 'react'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Alert, Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Animated, { FadeInDown } from 'react-native-reanimated'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'
import { getInstallmentBreakdown } from '../../utils/yatraPricing'

type PaymentRoute = RouteProp<TravelStackParamList, 'Payment'>
type PaymentNav = NativeStackNavigationProp<TravelStackParamList, 'Payment'>

const COLORS = {
  background: '#FAF6F0', // Sacred warm ivory background
  ivory: '#FCFAF6',
  surface: '#ffffff',
  warmSurface: '#FFF9F0', // Saffron cream glow
  primary: '#E65C00', // Saffron primary
  primaryDark: '#993D00', // Terracotta primary dark
  primaryLight: '#FF9933', // Soft saffron accent
  text: '#2B231B', // Deep rich brown charcoal
  muted: '#7E7162', // Warm earth tone
  softText: '#9E9080',
  border: '#F0E7DD',
  line: '#F5EDE4',
  chip: '#FFF0D9', // Soft orange tint
  chipMuted: '#F3ECE2',
  success: '#3E8E41',
  shadow: '#5B4636',
}

const PAYMENT_MODES = [
  { key: 'UPI', title: 'UPI Devotee Transfer', subtitle: 'Instant transfer via secure UPI apps (GPay, PhonePe)' },
  { key: 'Card', title: 'Debit / Credit Card', subtitle: 'Visa, Mastercard, RuPay cards supported' },
  { key: 'Net Banking', title: 'Net Banking Portals', subtitle: 'Direct portal transfer from major Indian banks' },
]

const PAYMENT_OPTIONS = [
  { value: 'full', title: 'Pay in full', subtitle: 'Reserve the yatra immediately with a single complete checkout.' },
  { value: 'installments', title: '3 Installments Plan', subtitle: 'Spread the sacred journey cost into three guided intervals.' },
]

export default function PaymentScreen() {
  const route = useRoute<PaymentRoute>()
  const navigation = useNavigation<PaymentNav>()
  const paymentPlan = useBookingDraftStore((state) => state.paymentPlan)
  const paymentMode = useBookingDraftStore((state) => state.paymentMode)
  const bookingReference = useBookingDraftStore((state) => state.bookingReference)
  const selectedPackage = useBookingDraftStore((state) => state.selectedPackage)
  const transportType = useBookingDraftStore((state) => state.transportType)
  const roomType = useBookingDraftStore((state) => state.roomType)
  const busType = useBookingDraftStore((state) => state.busType)
  const numberOfTravelers = useBookingDraftStore((state) => state.numberOfTravelers)
  const fullName = useBookingDraftStore((state) => state.fullName)
  const updateField = useBookingDraftStore((state) => state.updateField)

  const [processing, setProcessing] = useState(false)
  const [referenceId] = useState(() => bookingReference || `JY-${Date.now().toString().slice(-6)}`)

  const totalAmount = useMemo(() => {
    const raw = route.params.totalAmount.replace(/[^\d]/g, '')
    return Number(raw || '0')
  }, [route.params.totalAmount])

  const breakdown = useMemo(() => getInstallmentBreakdown(totalAmount), [totalAmount])

  const handlePay = async () => {
    setProcessing(true)

    try {
      updateField('bookingReference', referenceId)
      updateField('paymentMode', paymentMode)
      updateField('proofLabel', `${paymentMode} checkout processed`)
      
      // Simulate Razorpay short delay
      setTimeout(() => {
        setProcessing(false)
        navigation.navigate('Success')
      }, 1200)
    } catch {
      setProcessing(false)
      Alert.alert('Payment error', 'Please try again in a moment.')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Sacred Checkout</Text>
            <Text style={styles.headerTitle}>Secure Payment</Text>
          </View>
          <View style={styles.headerBadge}>
            <MaterialIcons name="security" size={14} color="#3E8E41" />
          </View>
        </View>

        {/* Detailed Cost Summary Section */}
        <Animated.View entering={FadeInDown.duration(250)} style={styles.summaryCard}>
          <Text style={styles.groupLabel}>Sadhak Reservation Summary</Text>
          <Text style={styles.packageName}>{selectedPackage?.title ?? route.params.packageName}</Text>
          
          <View style={styles.summaryRow}>
            <SummaryPill label="Travelers" value={`${numberOfTravelers || '1'} Sadhak(s)`} />
            <SummaryPill label="Transport" value={transportType || 'Flight'} />
            <SummaryPill label="Ashram Rest" value={roomType || 'AC Room'} />
          </View>
          
          {transportType === 'Train' ? (
            <Text style={styles.metaText}>• Coach comfort option: <Text style={styles.boldText}>{busType || 'AC Train'}</Text></Text>
          ) : null}
          <Text style={styles.metaText}>• Primary Devotee: <Text style={styles.boldText}>{fullName || 'Sadhak traveler'}</Text></Text>
        </Animated.View>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Choose payment rhythm</Text>
          <Text style={styles.sectionSubtitle}>
            Choose between paying in full immediately or opting for a 3-installment plan.
          </Text>
          <View style={styles.modeRow}>
            {PAYMENT_OPTIONS.map((option) => {
              const selected = paymentPlan === option.value
              return (
                <Pressable
                  key={option.value}
                  onPress={() => updateField('paymentPlan', option.value as any)}
                  style={[styles.modeCard, selected && styles.modeCardSelected]}
                >
                  <View style={styles.modeHeaderRow}>
                    <Text style={[styles.modeTitle, selected && styles.modeTitleSelected]}>{option.title}</Text>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </View>
                  <Text style={styles.modeSubtitle}>{option.subtitle}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Total Amount Due display */}
        <View style={styles.amountCard}>
          <View>
            <Text style={styles.amountLabel}>Total Sacred Cost</Text>
            <Text style={styles.amount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>
          <View style={styles.amountTag}>
            <Text style={styles.amountTagText}>
              {paymentPlan === 'full' ? 'Single Payment' : '3-Part Installments'}
            </Text>
          </View>
        </View>

        {/* Selection of Payment Mode */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Select Payment Mode</Text>
          <Text style={styles.sectionSubtitle}>
            Our booking panel is Razorpay-integrated, protecting your contributions securely.
          </Text>
          <View style={styles.modeRow}>
            {PAYMENT_MODES.map((option) => {
              const selected = paymentMode === option.key
              return (
                <Pressable
                  key={option.key}
                  onPress={() => updateField('paymentMode', option.key)}
                  style={[styles.modeCard, selected && styles.modeCardSelected]}
                >
                  <View style={styles.modeHeaderRow}>
                    <Text style={[styles.modeTitle, selected && styles.modeTitleSelected]}>{option.title}</Text>
                    <View style={[styles.radio, selected && styles.radioSelected]}>
                      {selected ? <View style={styles.radioInner} /> : null}
                    </View>
                  </View>
                  <Text style={styles.modeSubtitle}>{option.subtitle}</Text>
                </Pressable>
              )
            })}
          </View>
        </View>

        {/* Secure checkout info and installments breakdown */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Secure Payment Terminal</Text>
          <View style={styles.qrBox}>
            <Ionicons name="shield-checkmark" size={32} color={COLORS.success} />
            <Text style={styles.qrTitle}>Razorpay Sandbox Gateway Active</Text>
            <Text style={styles.qrSubtitle}>Reference ID: {referenceId}</Text>
          </View>
          
          <View style={styles.breakdownBox}>
            {paymentPlan === 'installments' ? (
              <View style={styles.installmentTimeline}>
                <Text style={styles.timelineTitle}>Installment Timeline</Text>
                <View style={styles.timelineVerticalLine} />
                {breakdown.map((item, index) => (
                  <View key={item.label} style={styles.breakdownRow}>
                    <View style={styles.breakdownLeft}>
                      <View style={[styles.breakdownDot, index === 0 && styles.breakdownDotActive]} />
                      <View>
                        <Text style={styles.breakdownLabel}>{item.label}</Text>
                        <Text style={styles.breakdownDue}>Due Date: {item.due}</Text>
                      </View>
                    </View>
                    <Text style={styles.breakdownAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.breakdownText}>
                Devotee choice: <Text style={styles.boldText}>Pay in full</Text>. Proceeding will trigger the single full payment transaction.
              </Text>
            )}
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.noteText}>
            Aadhaar and selfie records have been registered under this yatra profile. Seat reservation will be officially sent to WhatsApp after payment clearance.
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryButton, processing && styles.primaryButtonDisabled]}
          disabled={processing}
          onPress={handlePay}
        >
          <LinearGradient
            colors={['#E65C00', '#FF9933']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.primaryButtonText}>
              {processing ? 'Connecting to Razorpay...' : `Proceed and Pay ₹${totalAmount.toLocaleString('en-IN')}`}
            </Text>
            {!processing && <Ionicons name="shield-checkmark" size={16} color="#fff" />}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function SummaryPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryPill}>
      <Text style={styles.summaryPillLabel}>{label}</Text>
      <Text style={styles.summaryPillValue}>{value}</Text>
    </View>
  )
}

function LinearGradient({
  colors,
  style,
  children,
}: {
  colors: string[]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  style?: any
  children?: React.ReactNode
}) {
  const { LinearGradient: EXGradient } = require('expo-linear-gradient')
  return (
    <EXGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </EXGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  headerCopy: {
    flex: 1,
  },
  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  summaryCard: {
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    padding: 20,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 20,
    elevation: 3,
    gap: 12,
  },
  groupLabel: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  packageName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '900',
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  summaryPill: {
    flexGrow: 1,
    minWidth: '28%',
    borderRadius: 18,
    backgroundColor: COLORS.ivory,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
  },
  summaryPillLabel: {
    color: COLORS.softText,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '800',
  },
  summaryPillValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 6,
  },
  metaText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  boldText: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  amountCard: {
    borderRadius: 26,
    backgroundColor: COLORS.warmSurface,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 3,
  },
  amountLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  amount: {
    color: COLORS.primaryDark,
    fontSize: 34,
    fontWeight: '900',
    marginTop: 6,
  },
  amountTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  amountTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  card: {
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    padding: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    elevation: 4,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  modeRow: {
    gap: 12,
  },
  modeCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.ivory,
    padding: 16,
    gap: 6,
  },
  modeCardSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.warmSurface,
  },
  modeHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  modeTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  modeTitleSelected: {
    color: COLORS.primaryDark,
  },
  modeSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  qrBox: {
    borderRadius: 24,
    paddingVertical: 28,
    backgroundColor: COLORS.ivory,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    gap: 8,
  },
  qrTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '900',
  },
  qrSubtitle: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  breakdownBox: {
    gap: 12,
    marginTop: 6,
  },
  installmentTimeline: {
    gap: 12,
    paddingLeft: 12,
  },
  timelineTitle: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '800',
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 17,
    top: 36,
    bottom: 24,
    width: 2,
    backgroundColor: COLORS.line,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  breakdownLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  breakdownDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.border,
    zIndex: 10,
  },
  breakdownDotActive: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.2 }],
  },
  breakdownLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  breakdownDue: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  breakdownAmount: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '900',
  },
  breakdownText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 20,
    backgroundColor: COLORS.warmSurface,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    padding: 16,
  },
  noteText: {
    flex: 1,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  primaryButton: {
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.6,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
})
