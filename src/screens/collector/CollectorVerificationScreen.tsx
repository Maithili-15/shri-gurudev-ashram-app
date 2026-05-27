import React, { useMemo } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import { MainStackParamList } from '../../navigators/MainStackNavigator'
import { useCollectorStore } from '../../store/useCollectorStore'
import VerificationStatus from '../../components/collector/VerificationStatus'

type CollectorVerificationRoute = RouteProp<MainStackParamList, 'CollectorVerification'>
type CollectorVerificationNav = NativeStackNavigationProp<MainStackParamList>

export default function CollectorVerificationScreen() {
  const route = useRoute<CollectorVerificationRoute>()
  const navigation = useNavigation<CollectorVerificationNav>()
  const insets = useSafeAreaInsets()
  const travelers = useCollectorStore((state) => state.travelers)
  const updateVerification = useCollectorStore((state) => state.updateVerification)
  const traveler = useMemo(() => travelers.find((item) => item.bookingId === route.params.bookingId) ?? null, [route.params.bookingId, travelers])

  if (!traveler) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyWrap}>
          <MaterialIcons name="search-off" size={42} color="#8B5A00" />
          <Text style={styles.emptyTitle}>Traveler not found</Text>
          <Text style={styles.emptyText}>The booking ID does not exist in the collector module store.</Text>
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
            <Text style={styles.heroKicker}>Traveler verification</Text>
            <View style={styles.backButton} />
          </View>

          <Text style={styles.title}>{traveler.fullName}</Text>
          <Text style={styles.subtitle}>{traveler.yatraName}</Text>
          <Text style={styles.bookingId}>{traveler.bookingId}</Text>

          <View style={styles.chipRow}>
            <View style={styles.chip}><Text style={styles.chipText}>{traveler.status}</Text></View>
            <View style={styles.chip}><Text style={styles.chipText}>Due {traveler.dueDate}</Text></View>
          </View>
        </View>

        <View style={styles.sectionGap} />

        <VerificationStatus
          aadhaarUploaded={traveler.aadhaarUploaded}
          selfieUploaded={traveler.selfieUploaded}
          travelerConfirmed={traveler.travelerConfirmed}
        />

        <View style={styles.sectionGap} />

        <View style={styles.actionCard}>
          <Text style={styles.sectionTitle}>Collector actions</Text>
          <Text style={styles.actionText}>Use these controls when the traveler uploads missing proof or when you want to finalize the travel confirmation.</Text>

          <View style={styles.actionButtonsRow}>
            <Pressable style={styles.actionButton} onPress={() => updateVerification(traveler.id, { aadhaarUploaded: true, verificationState: 'pending' })}>
              <Text style={styles.actionButtonText}>Aadhaar uploaded</Text>
            </Pressable>
            <Pressable style={styles.actionButton} onPress={() => updateVerification(traveler.id, { selfieUploaded: true, verificationState: 'pending' })}>
              <Text style={styles.actionButtonText}>Selfie uploaded</Text>
            </Pressable>
          </View>

          <View style={styles.actionButtonsRow}>
            <Pressable style={styles.actionButton} onPress={() => updateVerification(traveler.id, { travelerConfirmed: true, verificationState: 'approved' })}>
              <Text style={styles.actionButtonText}>Confirm traveler</Text>
            </Pressable>
            <Pressable style={styles.primaryButton} onPress={() => navigation.navigate('CollectorTraveler', { travelerId: traveler.id })}>
              <LinearGradient colors={['#7B4B00', '#B97712', '#E0A31F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.primaryButtonFill}>
                <MaterialIcons name="person-search" size={18} color="#fff" />
                <Text style={styles.primaryButtonText}>Traveler detail</Text>
              </LinearGradient>
            </Pressable>
          </View>
        </View>

        <View style={styles.sectionGap} />

        <View style={styles.notesCard}>
          <Text style={styles.sectionTitle}>Verification notes</Text>
          <Text style={styles.notesText}>Keep the tone calm and respectful. The collector role is about guiding yatris with service and clarity, not urgency.</Text>
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
    padding: 18,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.68)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  heroKicker: {
    color: '#8B5A00',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  title: {
    color: '#2C1D10',
    fontSize: 26,
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
  chipRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
    marginTop: 14,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  chipText: {
    color: '#8B5A00',
    fontSize: 12,
    fontWeight: '800',
  },
  sectionGap: {
    height: 16,
  },
  actionCard: {
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
  actionText: {
    color: '#6E5A48',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
    fontWeight: '600',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 10,
  },
  actionButton: {
    flex: 1,
    minHeight: 46,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 18,
    backgroundColor: 'rgba(139,90,0,0.06)',
  },
  actionButtonText: {
    color: '#8B5A00',
    fontSize: 12,
    fontWeight: '800',
  },
  primaryButton: {
    flex: 1,
    borderRadius: 18,
  },
  primaryButtonFill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minHeight: 46,
    borderRadius: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '900',
  },
  notesCard: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  notesText: {
    color: '#3A2816',
    fontSize: 13,
    lineHeight: 20,
    fontWeight: '600',
  },
  emptyWrap: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    color: '#2C1D10',
    fontSize: 20,
    fontWeight: '900',
  },
  emptyText: {
    color: '#6E5A48',
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
  },
})
