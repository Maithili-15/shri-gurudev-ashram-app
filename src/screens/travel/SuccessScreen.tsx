import React, { useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { Image } from 'expo-image'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'
import { getInstallmentBreakdown } from '../../utils/yatraPricing'

type SuccessNav = NativeStackNavigationProp<TravelStackParamList, 'Success'>

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

export default function SuccessScreen() {
  const navigation = useNavigation<SuccessNav>()
  const draft = useBookingDraftStore((state) => state)
  const resetDraft = useBookingDraftStore((state) => state.resetDraft)

  const totalAmount = useMemo(() => {
    const selected = draft.selectedPackage
    if (!selected) return 0
    const raw = selected.price.replace(/[^\d]/g, '')
    return Number(raw || '0')
  }, [draft.selectedPackage])

  const installmentBreakdown = useMemo(() => getInstallmentBreakdown(totalAmount), [totalAmount])
  const referenceId = draft.bookingReference || `JY-${Date.now().toString().slice(-6)}`

  const handleBackHome = () => {
    resetDraft()
    navigation.getParent()?.navigate('Home' as never)
  }

  const travellerName = draft.fullName || 'Sadhak traveler'
  const bookingPackage = draft.selectedPackage?.title || 'Sacred Yatra'

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        
        {/* Ticket Header & Glowing Complete Badge */}
        <View style={styles.heroCard}>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
            <Text style={styles.successBadgeText}>Reservation Secured</Text>
          </View>
          <Text style={styles.title}>Spiritual Sadhak Ticket</Text>
          <Text style={styles.subtitle}>
            Your sacred yatra registration is complete. A copy of this ticket has been sent to your WhatsApp number.
          </Text>

          <View style={styles.referenceCard}>
            <View>
              <Text style={styles.referenceLabel}>Yatra Booking Code</Text>
              <Text style={styles.referenceValue}>{referenceId}</Text>
            </View>
            <View style={styles.referenceMark}>
              <Ionicons name="qr-code-outline" size={26} color={COLORS.primaryDark} />
            </View>
          </View>
        </View>

        {/* Highlight Summary Grid */}
        <View style={styles.summaryGrid}>
          <SummaryTile label="Sadhak Devotee" value={travellerName} />
          <SummaryTile label="Sacred Destination" value={bookingPackage} />
          <SummaryTile label="Route Transit" value={draft.transportType || 'Flight'} />
          <SummaryTile label="Ashram Quarters" value={draft.roomType || 'AC Room'} />
        </View>

        {/* Detailed Payment Breakdowns */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Payment Receipt</Text>
          
          <View style={styles.amountRow}>
            <Text style={styles.amountLabel}>Total Sadhak Value</Text>
            <Text style={styles.amount}>₹{totalAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.infoRow}>
            <InfoPill label="Payment Mode" value={draft.paymentMode || 'UPI'} />
            <InfoPill label="Checkout Style" value={draft.paymentPlan === 'installments' ? '3 Installments' : 'Paid in Full'} />
            <InfoPill label="Sadhaks Count" value={draft.numberOfTravelers || '1'} />
          </View>

          {draft.paymentPlan === 'installments' ? (
            <View style={styles.installmentContainer}>
              <Text style={styles.timelineTitle}>Installment Timeline Breakout</Text>
              <View style={styles.timeline}>
                <View style={styles.timelineVerticalLine} />
                {installmentBreakdown.map((item, index) => (
                  <View key={item.label} style={styles.breakdownRow}>
                    <View style={styles.breakdownLeft}>
                      <View style={[styles.breakdownDot, index === 0 ? styles.breakdownDotActive : styles.breakdownDotPending]} />
                      <View>
                        <Text style={styles.breakdownLabel}>{item.label}</Text>
                        <Text style={styles.breakdownDue}>Due date: {item.due}</Text>
                      </View>
                    </View>
                    <Text style={styles.breakdownAmount}>₹{item.amount.toLocaleString('en-IN')}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <Text style={styles.breakdownNote}>
              • The complete yatra contribution has been settled against this reservation reference.
            </Text>
          )}
        </View>

        {/* Traveler Information Card */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Sadhak Particulars</Text>
          <View style={styles.detailsList}>
            <DetailItem icon="person-outline" label="Full Name" value={draft.fullName} />
            <DetailItem icon="calendar-outline" label="Date of Birth" value={`${draft.dob} (Age: ${draft.age || '—'})`} />
            <DetailItem icon="logo-whatsapp" label="WhatsApp Contact" value={draft.whatsappNumber} />
            <DetailItem icon="card-outline" label="Aadhaar Card Record" value={draft.aadhaarNumber} />
            {draft.specialNotes ? (
              <DetailItem icon="document-text-outline" label="Special Requests" value={draft.specialNotes} />
            ) : null}
          </View>
        </View>

        {/* Visual uploads previews */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>Registered Credentials</Text>
          <View style={styles.documentGrid}>
            <DocumentCard title="Aadhaar Scan Preview" subtitle={draft.aadhaarPhotoLabel || 'No Scan Added'} uri={draft.aadhaarPhotoUri} />
            <DocumentCard title="Devotee Selfie Verification" subtitle={draft.selfiePhotoLabel || 'No Selfie Added'} uri={draft.selfiePhotoUri} />
          </View>
        </View>

        <View style={styles.noteCard}>
          <Ionicons name="leaf-outline" size={20} color={COLORS.primary} />
          <Text style={styles.noteText}>
            We wish you a divine, peaceful, and blessed yatra. Please present this ticket code upon arriving at the ashram gates.
          </Text>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleBackHome}>
          <LinearGradient
            colors={['#E65C00', '#FF9933']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.buttonGradient}
          >
            <Text style={styles.primaryButtonText}>Return to Home</Text>
            <Ionicons name="home-outline" size={16} color="#fff" />
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryTileLabel}>{label}</Text>
      <Text style={styles.summaryTileValue}>{value}</Text>
    </View>
  )
}

function InfoPill({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.infoPill}>
      <Text style={styles.infoPillLabel}>{label}</Text>
      <Text style={styles.infoPillValue}>{value}</Text>
    </View>
  )
}

function DocumentCard({ title, subtitle, uri }: { title: string; subtitle: string; uri?: string }) {
  return (
    <View style={styles.documentCard}>
      <Text style={styles.documentTitle}>{title}</Text>
      {uri ? (
        <Image source={{ uri }} style={styles.documentImage} contentFit="cover" />
      ) : (
        <View style={styles.documentPlaceholder}>
          <Text style={styles.documentPlaceholderText}>Awaiting scan upload</Text>
        </View>
      )}
      <Text style={styles.documentSubtitle} numberOfLines={1}>{subtitle}</Text>
    </View>
  )
}

function DetailItem({ icon, label, value }: { icon: string; label: string; value?: string }) {
  return (
    <View style={styles.detailRow}>
      <Ionicons name={icon as any} size={18} color={COLORS.primary} style={styles.detailIcon} />
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value || '—'}</Text>
      </View>
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
  heroCard: {
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    padding: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    gap: 12,
  },
  successBadge: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.success,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  successBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  title: {
    color: COLORS.text,
    fontSize: 26,
    fontWeight: '900',
    lineHeight: 32,
  },
  subtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  referenceCard: {
    marginTop: 4,
    borderRadius: 24,
    backgroundColor: COLORS.warmSurface,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 2,
  },
  referenceLabel: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  referenceValue: {
    color: COLORS.primaryDark,
    fontSize: 22,
    fontWeight: '900',
    marginTop: 6,
  },
  referenceMark: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.chip,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  summaryTileLabel: {
    color: COLORS.softText,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '800',
  },
  summaryTileValue: {
    marginTop: 8,
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  card: {
    borderRadius: 30,
    backgroundColor: COLORS.surface,
    padding: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 14,
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
  amountRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  amountLabel: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  amount: {
    color: COLORS.primaryDark,
    fontSize: 28,
    fontWeight: '900',
  },
  infoRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 4,
  },
  infoPill: {
    minWidth: '30%',
    flexGrow: 1,
    borderRadius: 18,
    backgroundColor: COLORS.ivory,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    padding: 12,
  },
  infoPillLabel: {
    color: COLORS.softText,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.7,
    fontWeight: '800',
  },
  infoPillValue: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  breakdownNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  detailsList: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 4,
  },
  detailIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.chip,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 32,
  },
  detailLabel: {
    color: COLORS.softText,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 2,
  },
  documentGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  documentCard: {
    flex: 1,
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.ivory,
    padding: 12,
    gap: 8,
  },
  documentTitle: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  documentImage: {
    width: '100%',
    height: 110,
    borderRadius: 14,
    backgroundColor: COLORS.surface,
  },
  documentPlaceholder: {
    width: '100%',
    height: 110,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  documentPlaceholderText: {
    color: COLORS.softText,
    fontSize: 11,
    fontWeight: '700',
  },
  documentSubtitle: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
  },
  noteCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.warmSurface,
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
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
  },
  installmentContainer: {
    backgroundColor: COLORS.ivory,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
    marginTop: 8,
  },
  timelineTitle: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  timeline: {
    gap: 10,
    paddingLeft: 12,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 17,
    top: 10,
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
  breakdownDotPending: {
    backgroundColor: COLORS.border,
  },
  breakdownLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  breakdownDue: {
    color: COLORS.muted,
    fontSize: 11,
    marginTop: 2,
  },
  breakdownAmount: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '900',
  },
})
