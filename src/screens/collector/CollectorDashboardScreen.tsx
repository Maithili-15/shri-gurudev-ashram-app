import React, { useMemo } from 'react'
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '../../store/useAuthStore'
import { MainStackParamList } from '../../navigators/MainStackNavigator'
import { useCollectorStore } from '../../store/useCollectorStore'
import CollectorStatCard from '../../components/collector/CollectorStatCard'
import NotificationCard from '../../components/collector/NotificationCard'
import TravelerCard from '../../components/collector/TravelerCard'
import PaymentCollectionModal from '../../components/collector/PaymentCollectionModal'
import { CollectorTraveler } from '../../types/collector'

type CollectorDashboardNav = NativeStackNavigationProp<MainStackParamList>

export default function CollectorDashboardScreen() {
  const navigation = useNavigation<CollectorDashboardNav>()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((state) => state.user)
  const travelers = useCollectorStore((state) => state.travelers)
  const notifications = useCollectorStore((state) => state.notifications)
  const analytics = useCollectorStore((state) => state.analytics)
  const paymentSheetTravelerId = useCollectorStore((state) => state.paymentSheetTravelerId)
  const openPaymentSheet = useCollectorStore((state) => state.openPaymentSheet)
  const closePaymentSheet = useCollectorStore((state) => state.closePaymentSheet)
  const collectPayment = useCollectorStore((state) => state.collectPayment)

  const paymentTraveler = useMemo(
    () => travelers.find((traveler) => traveler.id === paymentSheetTravelerId) ?? null,
    [paymentSheetTravelerId, travelers],
  )

  const latestTraveler = travelers[0]

  if (user?.role !== 'collector') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={[styles.accessWrap, { paddingTop: Math.max(insets.top, 24) + 18 }]}>
          <MaterialIcons name="do-not-disturb-alt" size={42} color="#8B5A00" />
          <Text style={styles.accessTitle}>Collector access only</Text>
          <Text style={styles.accessText}>This premium operations dashboard is visible only for users with the collector role.</Text>
          <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
            <Text style={styles.backButtonText}>Go back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  const header = (
    <View style={[styles.headerBlock, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
      <BlurView intensity={25} tint="light" style={styles.headerGlass}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.kicker}>Namaste, Collector</Text>
            <Text style={styles.title}>Premium spiritual operations</Text>
            <Text style={styles.subtitle}>Manage traveler collections, verification, and follow-ups with calm precision.</Text>
          </View>
          <Pressable style={styles.analyticsButton} onPress={() => navigation.navigate('CollectorAnalytics')}>
            <MaterialIcons name="timeline" size={20} color="#8B5A00" />
          </Pressable>
        </View>

        <View style={styles.quickStatsGrid}>
          <CollectorStatCard label="Assigned yatris" value={analytics.totalAssigned} icon="groups" colors={['#7A4B00', '#B97712']} />
          <CollectorStatCard label="Pending payments" value={analytics.totalPendingPayments} icon="hourglass-empty" colors={['#9A5A00', '#D89B1D']} />
          <CollectorStatCard label="Collected this month" value={analytics.collectedThisMonth} suffix="" icon="account-balance-wallet" colors={['#5E3B00', '#A96B10']} />
          <CollectorStatCard label="Upcoming dues" value={analytics.upcomingDues} icon="event-note" colors={['#7A4B00', '#C87116']} />
        </View>

        <View style={styles.summaryCard}>
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={styles.summaryLabel}>Daily collection summary</Text>
              <Text style={styles.summaryValue}>₹{analytics.pendingRecovery.toLocaleString()} recovery pending</Text>
            </View>
            <View style={styles.summaryPill}>
              <Text style={styles.summaryPillText}>{analytics.collectionCompletion}% complete</Text>
            </View>
          </View>
          <Text style={styles.summaryMeta}>Monthly target: ₹{analytics.monthlyTarget.toLocaleString()}</Text>
          <View style={styles.summaryBarTrack}>
            <LinearGradient
              colors={['#7B4B00', '#B97712', '#E0A31F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.summaryBarFill, { width: `${analytics.collectionCompletion}%` }]}
            />
          </View>
        </View>
      </BlurView>

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        <Pressable onPress={() => navigation.navigate('CollectorAnalytics')}>
          <Text style={styles.seeAll}>View analytics</Text>
        </Pressable>
      </View>

      <FlatList
        data={notifications}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.notificationRow}
        renderItem={({ item }) => <View style={styles.notificationWrap}><NotificationCard item={item} /></View>}
      />

      <View style={styles.sectionTitleRow}>
        <Text style={styles.sectionTitle}>Assigned travelers</Text>
        <Pressable onPress={() => navigation.navigate('CollectorTraveler', { travelerId: latestTraveler.id })}>
          <Text style={styles.seeAll}>Open first traveler</Text>
        </Pressable>
      </View>
    </View>
  )

  const footer = <View style={{ height: 24 }} />

  return (
    <SafeAreaView style={styles.container}>
      <FlatList<CollectorTraveler>
        data={travelers}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        renderItem={({ item, index }) => (
          <TravelerCard
            item={item}
            index={index}
            onPressDetails={() => navigation.navigate('CollectorTraveler', { travelerId: item.id })}
            onPressMarkPaid={() => openPaymentSheet(item.id)}
          />
        )}
      />

      <Pressable style={styles.fab} onPress={() => navigation.navigate('CollectorAnalytics')}>
        <LinearGradient colors={['#7B4B00', '#B97712', '#E0A31F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.fabFill}>
          <MaterialIcons name="analytics" size={24} color="#fff" />
        </LinearGradient>
      </Pressable>

      <PaymentCollectionModal
        visible={!!paymentTraveler}
        traveler={paymentTraveler}
        onClose={closePaymentSheet}
        onSubmit={(payload) => {
          if (!paymentTraveler) return
          collectPayment({ travelerId: paymentTraveler.id, ...payload })
        }}
      />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3EA',
  },
  listContent: {
    paddingBottom: 110,
  },
  headerBlock: {
    paddingHorizontal: 18,
    paddingBottom: 8,
  },
  headerGlass: {
    borderRadius: 34,
    padding: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.35)',
    backgroundColor: 'rgba(255,255,255,0.58)',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 16,
  },
  kicker: {
    color: '#8B5A00',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 6,
  },
  title: {
    color: '#2C1D10',
    fontSize: 26,
    lineHeight: 32,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 8,
    color: '#6E5A48',
    fontSize: 13,
    lineHeight: 20,
    maxWidth: 300,
  },
  analyticsButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216,155,29,0.14)',
  },
  quickStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  summaryCard: {
    marginTop: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  summaryLabel: {
    color: '#7A6653',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  summaryValue: {
    marginTop: 4,
    color: '#2C1D10',
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '900',
  },
  summaryPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(139,90,0,0.10)',
  },
  summaryPillText: {
    color: '#8B5A00',
    fontSize: 11,
    fontWeight: '800',
  },
  summaryMeta: {
    marginTop: 10,
    color: '#6E5A48',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryBarTrack: {
    marginTop: 12,
    height: 11,
    borderRadius: 999,
    overflow: 'hidden',
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  summaryBarFill: {
    height: '100%',
    borderRadius: 999,
  },
  sectionTitleRow: {
    marginTop: 16,
    marginBottom: 12,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  sectionTitle: {
    color: '#6F4600',
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  seeAll: {
    color: '#8B5A00',
    fontSize: 12,
    fontWeight: '800',
  },
  notificationRow: {
    paddingHorizontal: 18,
    gap: 12,
  },
  notificationWrap: {
    width: 280,
  },
  fab: {
    position: 'absolute',
    right: 18,
    bottom: 18,
    width: 62,
    height: 62,
    borderRadius: 31,
    shadowColor: '#2C1D10',
    shadowOpacity: 0.22,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  fabFill: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  accessWrap: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
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
  backButton: {
    marginTop: 6,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  backButtonText: {
    color: '#8B5A00',
    fontWeight: '800',
  },
})
