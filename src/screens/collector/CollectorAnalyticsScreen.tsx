import React from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { useNavigation } from '@react-navigation/native'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { useAuthStore } from '../../store/useAuthStore'
import { MainStackParamList } from '../../navigators/MainStackNavigator'
import { useCollectorStore } from '../../store/useCollectorStore'
import CollectorStatCard from '../../components/collector/CollectorStatCard'
import AnalyticsCard from '../../components/collector/AnalyticsCard'

const chartData = [
  { label: 'Mon', value: 48 },
  { label: 'Tue', value: 62 },
  { label: 'Wed', value: 54 },
  { label: 'Thu', value: 78 },
  { label: 'Fri', value: 67 },
  { label: 'Sat', value: 82 },
  { label: 'Sun', value: 58 },
]

type Nav = NativeStackNavigationProp<MainStackParamList>

export default function CollectorAnalyticsScreen() {
  const navigation = useNavigation<Nav>()
  const insets = useSafeAreaInsets()
  const user = useAuthStore((state) => state.user)
  const analytics = useCollectorStore((state) => state.analytics)

  if (user?.role !== 'collector') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.accessWrap}>
          <MaterialIcons name="do-not-disturb-alt" size={42} color="#8B5A00" />
          <Text style={styles.accessTitle}>Collector access only</Text>
          <Text style={styles.accessText}>Analytics are reserved for the collector module.</Text>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={[styles.content, { paddingTop: Math.max(insets.top, 12) + 6 }]}>
        <View style={styles.heroCard}>
          <View style={styles.topRow}>
            <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={20} color="#8B5A00" />
            </Pressable>
            <Text style={styles.heroKicker}>Collector analytics</Text>
            <View style={styles.backButton} />
          </View>
          <Text style={styles.heroTitle}>A calm view of collections, recovery, and target progress.</Text>
          <Text style={styles.heroText}>Track how the yatra collection flow is moving through the month with a premium spiritual operations lens.</Text>
        </View>

        <View style={styles.grid}>
          <CollectorStatCard label="Total collections" value={analytics.collectedThisMonth} icon="savings" colors={['#7A4B00', '#B97712']} />
          <CollectorStatCard label="Pending recovery" value={analytics.pendingRecovery} icon="hourglass-empty" colors={['#9A5A00', '#D89B1D']} />
          <CollectorStatCard label="Monthly target" value={analytics.monthlyTarget} icon="flag" colors={['#5E3B00', '#A96B10']} />
          <CollectorStatCard label="Completion" value={analytics.collectionCompletion} suffix="%" icon="trending-up" colors={['#7A4B00', '#C87116']} />
        </View>

        <View style={styles.sectionBlock}>
          <AnalyticsCard
            title="Collection completion"
            value={`${analytics.collectionCompletion}%`}
            subtitle="Premium target progress for the current month"
            percentage={analytics.collectionCompletion}
            icon="donut-large"
          />
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Weekly trend</Text>
            <Text style={styles.sectionHint}>Smooth recovery curve</Text>
          </View>

          <View style={styles.chartCard}>
            {chartData.map((item) => (
              <View key={item.label} style={styles.chartColumn}>
                <View style={styles.chartTrack}>
                  <LinearGradient
                    colors={['#E8C78A', '#D89B1D', '#8B5A00']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[styles.chartFill, { height: `${Math.min(100, item.value)}%` }]}
                  />
                </View>
                <Text style={styles.chartLabel}>{item.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionBlock}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Recovery notes</Text>
            <Text style={styles.sectionHint}>Operational focus</Text>
          </View>
          <View style={styles.noteCard}>
            <Text style={styles.noteText}>• 3 sadhaks are overdue by more than 7 days.</Text>
            <Text style={styles.noteText}>• 7 fresh assignments arrived this morning.</Text>
            <Text style={styles.noteText}>• 2 payments were confirmed through UPI after follow-up.</Text>
            <Text style={styles.noteText}>• 1 traveler still needs selfie verification before final confirmation.</Text>
          </View>
        </View>
      </ScrollView>
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
    padding: 18,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  heroKicker: {
    color: '#8B5A00',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  heroTitle: {
    color: '#2C1D10',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '900',
  },
  heroText: {
    marginTop: 10,
    color: '#6E5A48',
    fontSize: 13,
    lineHeight: 21,
    fontWeight: '600',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 16,
  },
  sectionBlock: {
    marginTop: 18,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#6F4600',
    fontSize: 17,
    fontWeight: '900',
  },
  sectionHint: {
    color: '#8A7461',
    fontSize: 11,
    fontWeight: '700',
  },
  chartCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 10,
  },
  chartColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  chartTrack: {
    width: '100%',
    height: 140,
    borderRadius: 16,
    backgroundColor: 'rgba(139,90,0,0.06)',
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  chartFill: {
    width: '100%',
    borderRadius: 16,
  },
  chartLabel: {
    color: '#6E5A48',
    fontSize: 11,
    fontWeight: '700',
  },
  noteCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    gap: 8,
  },
  noteText: {
    color: '#3A2816',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
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
