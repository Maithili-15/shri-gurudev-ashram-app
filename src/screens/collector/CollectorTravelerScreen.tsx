import React, { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { MainStackParamList } from '../../navigators/MainStackNavigator'
import { useAuthStore } from '../../store/useAuthStore'
import { useCollectorStore } from '../../store/useCollectorStore'
import InstallmentProgress from '../../components/collector/InstallmentProgress'
import VerificationStatus from '../../components/collector/VerificationStatus'
import PaymentCollectionModal from '../../components/collector/PaymentCollectionModal'
import CollectorStatCard from '../../components/collector/CollectorStatCard'

type Route = RouteProp<MainStackParamList, 'CollectorTraveler'>
type Nav = NativeStackNavigationProp<MainStackParamList>

export default function CollectorTravelerScreen() {
  const navigation = useNavigation<Nav>()
  const route = useRoute<Route>()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((state) => state.user)
  const travelers = useCollectorStore((state) => state.travelers)
  const paymentSheetTravelerId = useCollectorStore((state) => state.paymentSheetTravelerId)
  const openPaymentSheet = useCollectorStore((state) => state.openPaymentSheet)
  const closePaymentSheet = useCollectorStore((state) => state.closePaymentSheet)
  const collectPayment = useCollectorStore((state) => state.collectPayment)
  const traveler = useMemo(() => travelers.find((item) => item.id === route.params.travelerId) ?? null, [route.params.travelerId, travelers])

  if (user?.role !== 'collector') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessWrap}>
          <MaterialIcons name="do-not-disturb-alt" size={42} color="#8B5A00" />
          <Text style={styles.accessTitle}>Collector access only</Text>
          <Text style={styles.accessText}>This traveler detail view is restricted to collectors.</Text>
        </View>
      </SafeAreaView>
    )
  }

  if (!traveler) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessWrap}>
          <MaterialIcons name="search-off" size={42} color="#8B5A00" />
          <Text style={styles.accessTitle}>Traveler not found</Text>
          <Text style={styles.accessText}>The requested traveler could not be loaded from the collector module store.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <BlurView intensity={22} tint="light" style={styles.heroCard}>
          <View style={styles.topRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={20} color="#8B5A00" />
            </Pressable>
            <Pressable style={styles.secondaryPill} onPress={() => navigation.navigate('CollectorVerification', { bookingId: traveler.bookingId })}>
              <Text style={styles.secondaryPillText}>Verify traveler</Text>
            </Pressable>
          </View>

          <Text style={styles.kicker}>Collector traveler detail</Text>
          <Text style={styles.title}>{traveler.fullName}</Text>
          <Text style={styles.subtitle}>{traveler.yatraName}</Text>
          <Text style={styles.bookingId}>{traveler.bookingId}</Text>

          <View style={styles.metaRow}>
            <View style={styles.metaPill}><MaterialIcons name="phone" size={14} color="#8B5A00" /><Text style={styles.metaText}>{traveler.phone}</Text></View>
            <View style={styles.metaPill}><MaterialIcons name="schedule" size={14} color="#8B5A00" /><Text style={styles.metaText}>{traveler.dueDate}</Text></View>
          </View>

          <View style={styles.statRow}>
            <CollectorStatCard label="Paid" value={traveler.amountPaid} icon="payments" colors={['#7A4B00', '#B97712']} />
            <CollectorStatCard label="Remaining" value={traveler.dueAmount} icon="account-balance-wallet" colors={['#9A5A00', '#D89B1D']} />
          </View>
        </BlurView>

        <View style={styles.sectionGap} />

        <InstallmentProgress
          paidAmount={traveler.amountPaid}
          totalAmount={traveler.totalAmount}
          dueAmount={traveler.dueAmount}
          status={traveler.status}
          installments={traveler.installments}
        />

        <View style={styles.sectionGap} />
        <VerificationStatus
          aadhaarUploaded={traveler.aadhaarUploaded}
          selfieUploaded={traveler.selfieUploaded}
          travelerConfirmed={traveler.travelerConfirmed}
        />

        <View style={styles.sectionGap} />
        <View style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Collector notes</Text>
          <Text style={styles.notesText}>{traveler.notes}</Text>
          <Text style={styles.notesSub}>Use a calm, respectful tone when you follow up. Keep the call brief and service-oriented.</Text>
        </View>

        <View style={styles.actionsRow}>
          <Pressable style={styles.primaryAction} onPress={() => openPaymentSheet(traveler.id)}>
            <LinearGradient colors={['#7B4B00', '#B97712', '#E0A31F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryActionFill}>
              <MaterialIcons name="payments" size={18} color="#fff" />
              <Text style={styles.primaryActionText}>Collect payment</Text>
            </LinearGradient>
          </Pressable>
          <Pressable style={styles.secondaryAction} onPress={() => navigation.navigate('CollectorAnalytics')}>
            <Text style={styles.secondaryActionText}>Analytics</Text>
          </Pressable>
        </View>
      </ScrollView>

      <PaymentCollectionModal
        visible={paymentSheetTravelerId === traveler.id}
        traveler={traveler}
        onClose={closePaymentSheet}
        onSubmit={(payload) => collectPayment({ travelerId: traveler.id, ...payload })}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3EA',
  },
  content: {
    paddingHorizontal: 18,
    paddingBottom: 120,
  },
  heroCard: {
    borderRadius: 30,
    overflow: 'hidden',
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.62)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  secondaryPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  secondaryPillText: {
    color: '#8B5A00',
    fontSize: 12,
    fontWeight: '800',
  },
  kicker: {
    color: '#8B5A00',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    marginTop: 6,
    color: '#2C1D10',
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 6,
    color: '#6E5A48',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
  },
  bookingId: {
    marginTop: 6,
    color: '#8A7461',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  metaRow: {
    marginTop: 14,
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  metaPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: 'rgba(139,90,0,0.06)',
  },
  metaText: {
    color: '#6E5A48',
    fontSize: 12,
    fontWeight: '700',
  },
  statRow: {
    marginTop: 16,
    flexDirection: 'row',
    gap: 12,
  },
  sectionGap: {
    height: 16,
  },
  notesCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  sectionTitle: {
    color: '#6F4600',
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 10,
  },
  notesText: {
    color: '#2C1D10',
    fontSize: 14,
    lineHeight: 22,
    fontWeight: '600',
  },
  notesSub: {
    marginTop: 10,
    color: '#7A6653',
    fontSize: 12,
    lineHeight: 18,
  },
  actionsRow: {
    marginTop: 18,
    flexDirection: 'row',
    gap: 12,
  },
  primaryAction: {
    flex: 1,
    borderRadius: 18,
  },
  primaryActionFill: {
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
  secondaryAction: {
    width: 120,
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  secondaryActionText: {
    color: '#8B5A00',
    fontSize: 14,
    fontWeight: '900',
  },
  accessWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  accessTitle: {
    color: '#2C1D10',
    fontSize: 20,
    fontWeight: '900',
  },
  accessText: {
    color: '#6E5A48',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
})
