import React, { useEffect } from 'react'
import { Pressable, ScrollView, Share, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import SevaReceipt from '../../src/components/SevaReceipt'
import type { SevaType } from '../../src/constants/seva'
import { SEVA_LABELS, generateTransactionId } from '../../src/constants/seva'
import type { SevaReceiptData, AnnadanBookingPurpose } from '../../src/types/seva'
import { useSevaStore } from '../../src/store/useSevaStore'
import { PURPOSE_LABELS } from '../../src/features/annadan/constants'


// ─────────────────────────────────────────────────────────────────────────────
// UNIVERSAL SEVA SUCCESS SCREEN
// Params: sevaType, reference, transactionId, devotee, phone, sevaDate, amount
// ─────────────────────────────────────────────────────────────────────────────
function formatDateString(isoStr?: string): string {
  if (!isoStr) return '—'
  const parts = isoStr.split('T')[0].split('-').map(Number)
  if (parts.length !== 3 || parts.some(isNaN)) return isoStr
  const localDate = new Date(parts[0], parts[1] - 1, parts[2])
  return localDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

export default function SevaSuccessRoute() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const addToHistory = useSevaStore((s) => s.addToHistory)

  const {
    sevaType,
    reference,
    transactionId,
    devotee,
    phone,
    sevaDate,
    amount,
    // New fields
    bookingPurpose,
    beneficiaryName,
    identityType,
    identityNumberMasked,
    isRecurring,
    recurringPeriod,
    sponsorName,
    sponsorPhone,
  } = useLocalSearchParams<{
    sevaType: string
    reference: string
    transactionId: string
    devotee: string
    phone: string
    sevaDate: string
    amount: string
    bookingPurpose: string
    beneficiaryName: string
    identityType: string
    identityNumberMasked: string
    isRecurring: string
    recurringPeriod: string
    sponsorName: string
    sponsorPhone: string
  }>()

  const type = (sevaType as SevaType) ?? 'annadan'
  const label = SEVA_LABELS[type]
  const parsedAmount = amount ? Number(amount) : 0
  const finalTxnId = transactionId || generateTransactionId()

  const receiptData: SevaReceiptData = {
    receiptNumber: reference ?? 'PENDING',
    transactionId: finalTxnId,
    transactionDate: new Date().toISOString(),
    sevaType: type,
    sevaDate: sevaDate ?? new Date().toISOString(),
    devotee: devotee ?? '—',
    phone: phone ?? '—',
    amount: parsedAmount,
    paymentMethod: 'UPI / Online',
    status: 'paid',
    referenceNumber: reference ?? '—',
    // New fields
    bookingPurpose: bookingPurpose || undefined,
    beneficiaryName: beneficiaryName || undefined,
    sponsorName: sponsorName || undefined,
    sponsorPhone: sponsorPhone || undefined,
    identityType: identityType || undefined,
    identityNumberMasked: identityNumberMasked || undefined,
    isRecurring: isRecurring === 'true',
    recurringPeriod: recurringPeriod || undefined,
  }

  // Add to sevaHistory on mount so My Sevas screen can display it
  useEffect(() => {
    addToHistory({
      id: reference ?? `mock-${Date.now()}`,
      bookingReference: reference ?? '—',
      transactionId: finalTxnId,
      sevaType: type,
      sevaDate: sevaDate ?? '',
      fullName: devotee ?? '—',
      phoneNumber: phone ?? '—',
      totalAmount: parsedAmount,
      status: 'paid',
      createdAt: new Date().toISOString(),
      // New fields
      bookingPurpose: (bookingPurpose as any) || undefined,
      beneficiaryName: beneficiaryName || undefined,
      sponsorName: sponsorName || undefined,
      sponsorPhone: sponsorPhone || undefined,
      identityType: (identityType as any) || undefined,
      identityNumberMasked: identityNumberMasked || undefined,
      isRecurring: isRecurring === 'true',
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const shareReceipt = async () => {
    try {
      let message = `🙏 ${label.title} Receipt\n\n`
      if (bookingPurpose) {
        const purposeLabel = PURPOSE_LABELS[bookingPurpose as AnnadanBookingPurpose] || bookingPurpose
        message += `Purpose: ${purposeLabel}\n`
      }
      if (beneficiaryName) {
        message += `Beneficiary: ${beneficiaryName}\n`
      }
      message += `Sponsor: ${sponsorName || devotee}\n`
      message += `Phone: ${sponsorPhone || phone}\n`
      message += `Seva Date: ${formatDateString(sevaDate)}\n`
      if (isRecurring === 'true' && recurringPeriod) {
        message += `Annual Booking Period: ${recurringPeriod}\n`
      }
      if (identityType && identityNumberMasked) {
        const idLabel = identityType === 'aadhaar' ? 'Aadhaar' : 'PAN'
        message += `${idLabel}: ${identityNumberMasked}\n`
      }
      message += `Amount: ₹${parsedAmount.toLocaleString('en-IN')}\n`
      message += `Receipt No: ${reference}\n`
      message += `Transaction ID: ${finalTxnId}\n\n`
      message += `Issued by Shri Gurudev Ashram\n`
      message += `Haridwar Road, Rishikesh, Uttarakhand — 249201\n\n`
      message += `Jai Shri Gurudev! 🙏`

      await Share.share({
        title: `${label.title} Receipt — Shri Gurudev Ashram`,
        message,
      })
    } catch {
      // user cancelled share — no-op
    }
  }


  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Success icon */}
        <View style={styles.successIcon}>
          <LinearGradient
            colors={['#7B4B00', '#B97512', '#E0A31F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.successGradient}
          >
            <MaterialIcons name="check" size={42} color="#fff" />
          </LinearGradient>
        </View>

        <Text style={styles.kicker}>{label.subtitle} — Confirmed</Text>
        <Text style={styles.title}>Jai Shri Gurudev!</Text>
        <Text style={styles.subtitle}>
          Your {label.title} has been confirmed.{' '}
          {type === 'annadan'
            ? 'May the Mahaprasad seva bring abundant blessings to you and your family.'
            : 'May Guruji\'s blessings flow through you as you perform this sacred Aarti.'}
        </Text>

        {/* Receipt */}
        <SevaReceipt data={receiptData} />

        {/* Action buttons */}
        <Pressable onPress={() => router.push('/(tabs)/my-sevas' as never)}>
          <LinearGradient
            colors={['#7B4B00', '#B97512', '#E0A31F']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.primaryButton}
          >
            <Text style={styles.primaryButtonText}>View My Activity Dashboard →</Text>
          </LinearGradient>
        </Pressable>

        <View style={styles.secondaryRow}>
          {/* Share */}
          <Pressable style={[styles.secondaryButton, { flex: 1 }]} onPress={() => void shareReceipt()}>
            <MaterialIcons name="share" size={18} color="#8B5A00" />
            <Text style={styles.secondaryButtonText}>Share Receipt</Text>
          </Pressable>

          {/* Back to Home */}
          <Pressable
            style={[styles.secondaryButton, { flex: 1 }]}
            onPress={() => router.replace('/(tabs)/home' as never)}
          >
            <MaterialIcons name="home" size={18} color="#8B5A00" />
            <Text style={styles.secondaryButtonText}>Back to Home</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAF6F0' },
  content: { paddingHorizontal: 18, paddingBottom: 56, gap: 20, alignItems: 'stretch' },

  successIcon: {
    alignSelf: 'center',
    shadowColor: '#B97512', shadowOpacity: 0.28, shadowRadius: 20, shadowOffset: { width: 0, height: 10 },
    elevation: 8, marginTop: 8,
  },
  successGradient: {
    width: 90, height: 90, borderRadius: 45,
    alignItems: 'center', justifyContent: 'center',
  },

  kicker: { color: '#E65C00', textAlign: 'center', fontSize: 12, fontWeight: '900', textTransform: 'uppercase', letterSpacing: 1.4 },
  title: { color: '#2B231B', textAlign: 'center', fontSize: 30, fontWeight: '900', lineHeight: 36 },
  subtitle: { color: '#7E7162', textAlign: 'center', fontSize: 14, lineHeight: 22, paddingHorizontal: 16 },

  primaryButton: { minHeight: 58, borderRadius: 999, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: '900' },

  secondaryRow: { flexDirection: 'row', gap: 12 },
  secondaryButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    minHeight: 50, borderRadius: 999,
    borderWidth: 1.5, borderColor: '#E8D5BE', backgroundColor: '#fff',
  },
  secondaryButtonText: { color: '#8B5A00', fontSize: 14, fontWeight: '800' },
})
