import React, { useMemo, useState } from 'react'
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { Image } from 'expo-image'
import { LinearGradient } from 'expo-linear-gradient'
import { BlurView } from 'expo-blur'
import Animated, {
  FadeInDown,
  FadeInUp,
  LinearTransition,
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated'
import { MaterialIcons } from '@expo/vector-icons'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { travelPackages } from '../../services/mockData'
import { TravelPackage } from '../../types/travel'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'mountain', label: 'Mountain' },
  { key: 'river', label: 'River' },
  { key: 'coastal', label: 'Coastal' },
  { key: 'heritage', label: 'Heritage' },
] as const

type FilterKey = (typeof FILTERS)[number]['key']
type TravelNav = NativeStackNavigationProp<TravelStackParamList, 'TravelList'>

type TravelCard = {
  packageItem: TravelPackage
  image: string
  badge: string
  secondaryBadge: string
  tags: string[]
  seatsLeft: number
  category: FilterKey
}

const TRAVEL_CARDS: TravelCard[] = travelPackages.map((packageItem, index) => {
  const cards: TravelCard[] = [
    {
      packageItem,
      image: 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=1400&auto=format&fit=crop',
      badge: '12 seats left',
      secondaryBadge: 'High demand',
      tags: ['Temple mornings', 'Seva support', 'Private stays'],
      seatsLeft: 12,
      category: 'coastal',
    },
    {
      packageItem,
      image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?q=80&w=1400&auto=format&fit=crop',
      badge: '8 seats left',
      secondaryBadge: 'Limited batch',
      tags: ['Meditation deck', 'Guided darshan', 'Himalayan views'],
      seatsLeft: 8,
      category: 'mountain',
    },
    {
      packageItem,
      image: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1400&auto=format&fit=crop',
      badge: '16 seats left',
      secondaryBadge: 'Curated route',
      tags: ['Backwater calm', 'Ayurvedic meals', 'Luxury houseboat'],
      seatsLeft: 16,
      category: 'river',
    },
    {
      packageItem,
      image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1400&auto=format&fit=crop',
      badge: '10 seats left',
      secondaryBadge: 'Signature journey',
      tags: ['Royal heritage', 'Evening aarti', 'Palace stays'],
      seatsLeft: 10,
      category: 'heritage',
    },
  ]

  return cards[index]
})

function TravelFilterChip({
  label,
  selected,
  onPress,
}: {
  label: string
  selected: boolean
  onPress: () => void
}) {
  const pressScale = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }))

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={() => {
        pressScale.value = withTiming(0.96, { duration: 120 })
      }}
      onPressOut={() => {
        pressScale.value = withTiming(1, { duration: 180 })
      }}
      style={[styles.filterChipOuter, animatedStyle]}
    >
      <LinearGradient
        colors={selected ? ['rgba(141,75,0,0.16)', 'rgba(216,155,29,0.08)'] : ['rgba(255,255,255,0.86)', 'rgba(255,255,255,0.72)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.filterChip, selected && styles.filterChipSelected]}
      >
        <Text style={[styles.filterChipText, selected && styles.filterChipTextSelected]}>{label}</Text>
      </LinearGradient>
    </AnimatedPressable>
  )
}

function PremiumTravelCard({
  item,
  index,
  onPress,
}: {
  item: TravelCard
  index: number
  onPress: () => void
}) {
  const pressScale = useSharedValue(1)

  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }))

  const imageStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: interpolate(pressScale.value, [0.94, 1], [2, 0]),
      },
    ],
  }))

  return (
    <Animated.View
      entering={FadeInDown.delay(80 * index).duration(650)}
      layout={LinearTransition.springify()}
      style={[styles.cardWrap, cardStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={() => {
          pressScale.value = withTiming(0.985, { duration: 120 })
        }}
        onPressOut={() => {
          pressScale.value = withTiming(1, { duration: 180 })
        }}
        style={styles.cardPressable}
      >
        <View style={styles.cardShell}>
          <Animated.View style={[styles.cardImageWrap, imageStyle]}>
            <Image source={{ uri: item.image }} style={styles.cardImage} contentFit="cover" transition={240} />

            <LinearGradient
              colors={["rgba(17,10,3,0.02)", "rgba(17,10,3,0.48)", "rgba(17,10,3,0.78)"]}
              locations={[0, 0.62, 1]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.cardTopRow}>
              <View style={styles.badgePill}>
                <MaterialIcons name="confirmation-number" size={12} color="#8B5A00" />
                <Text style={styles.badgeText}>{item.badge}</Text>
              </View>
              <View style={[styles.badgePill, styles.badgePillDark]}>
                <MaterialIcons name="whatshot" size={12} color="#fff" />
                <Text style={[styles.badgeText, styles.badgeTextDark]}>{item.secondaryBadge}</Text>
              </View>
            </View>

            <View style={styles.cardImageFooter}>
              <View style={styles.locationRow}>
                <MaterialIcons name="place" size={16} color="#F6E7CE" />
                <Text style={styles.locationText}>{item.packageItem.title}</Text>
              </View>

              <Text style={styles.heroDescription}>{item.packageItem.description}</Text>
            </View>
          </Animated.View>

          <View style={styles.cardBody}>
            <View style={styles.metaRow}>
              <View style={styles.metaChip}>
                <MaterialIcons name="event" size={14} color="#8B5A00" />
                <Text style={styles.metaText}>{item.packageItem.duration}</Text>
              </View>
              <View style={styles.metaChip}>
                <MaterialIcons name="hotel" size={14} color="#8B5A00" />
                <Text style={styles.metaText}>Luxury stay</Text>
              </View>
            </View>

            <View style={styles.tagsRow}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>

            <View style={styles.priceRow}>
              <View>
                <Text style={styles.startingFrom}>Starting from</Text>
                <Text style={styles.price}>{item.packageItem.price}</Text>
              </View>

              <View style={styles.ctaWrap}>
                <Pressable onPress={onPress}>
                  <LinearGradient
                    colors={['#7B4B00', '#B97512', '#E0A31F']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.ctaButton}
                  >
                    <MaterialIcons name="auto-awesome" size={14} color="#fff" />
                    <Text style={styles.ctaText}>Begin Yatra</Text>
                  </LinearGradient>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Pressable>
    </Animated.View>
  )
}

export default function TravelScreen() {
  const navigation = useNavigation<TravelNav>()
  const insets = useSafeAreaInsets()
  const visibleCards = TRAVEL_CARDS

  return (
    <SafeAreaView style={styles.container}>
      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: Math.max(insets.top, 12) }]}
      >
        <View style={styles.topSection}>
          <Text style={styles.topSectionTitle}>YATRA</Text>
          <View style={styles.actionCardsRow}>

            <Pressable
              onPress={() => navigation.navigate('BookingHistory')}
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
            >
              <MaterialIcons name="event-note" size={24} color="#8B5A00" />
              <Text style={styles.actionCardText}>My Bookings</Text>
            </Pressable>
            <Pressable
              onPress={() => {}}
              style={({ pressed }) => [styles.actionCard, pressed && styles.actionCardPressed]}
            >
              <MaterialIcons name="map" size={24} color="#8B5A00" />
              <Text style={styles.actionCardText}>Sacred Routes</Text>
            </Pressable>
          </View>
        </View>

        <Animated.View entering={FadeInUp.duration(500)} style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>⭐ 4.9/5</Text>
            <Text style={styles.statLabel}>Guest rating</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>🙏 10,000+</Text>
            <Text style={styles.statLabel}>Sadhaks served</Text>
          </View>
        </Animated.View>

        <View style={styles.cardsSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Featured yatras</Text>
            <View style={styles.sectionLine} />
          </View>

          {visibleCards.map((item, index) => (
            <PremiumTravelCard
              key={`${item.packageItem.id}-${item.category}`}
              item={item}
              index={index}
              onPress={() => navigation.navigate('BookingForm', { packageItem: item.packageItem })}
            />
          ))}

          {visibleCards.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="search-off" size={32} color="#8B5A00" />
              <Text style={styles.emptyTitle}>No journeys found</Text>
              <Text style={styles.emptyText}>Try another filter to explore more sacred travel routes.</Text>
            </View>
          ) : null}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F3EA',
  },
  scrollContent: {
    paddingBottom: 164,
  },
  topSection: {
    paddingHorizontal: 18,
    paddingTop: 12,
  },
  topSectionTitle: {
    fontSize: 48,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    fontWeight: '700',
    color: '#3A2412',
    letterSpacing: 1.2,
    marginBottom: 24,
  },
  actionCardsRow: {
    flexDirection: 'row',
    gap: 12,
    justifyContent: 'space-between',
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    shadowColor: '#2D1A0C',
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  actionCardPressed: {
    transform: [{ scale: 0.96 }],
    opacity: 0.9,
  },
  actionCardText: {
    color: '#6F4600',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'center',
  },
  statsRow: {
    marginTop: 18,
    paddingHorizontal: 18,
    flexDirection: 'row',
    gap: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    shadowColor: '#3A2412',
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
    alignItems: 'center',
  },
  statValue: {
    color: '#8B5A00',
    fontSize: 20,
    fontWeight: '800',
  },
  statLabel: {
    color: '#6B5A4A',
    fontSize: 11,
    marginTop: 4,
    fontWeight: '600',
  },
  sectionHeaderRow: {
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 14,
  },
  sectionTitle: {
    color: '#6F4600',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  sectionLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(139,90,0,0.12)',
  },
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterChipOuter: {
    borderRadius: 999,
  },
  filterChip: {
    minHeight: 42,
    paddingHorizontal: 16,
    borderRadius: 999,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.10)',
  },
  filterChipSelected: {
    borderColor: 'rgba(139,90,0,0.24)',
  },
  filterChipText: {
    color: '#6C5A48',
    fontSize: 13,
    fontWeight: '700',
  },
  filterChipTextSelected: {
    color: '#8B5A00',
  },
  cardsSection: {
    marginTop: 26,
    paddingBottom: 8,
  },
  cardWrap: {
    marginHorizontal: 18,
    marginBottom: 18,
  },
  cardPressable: {
    borderRadius: 30,
  },
  cardShell: {
    borderRadius: 30,
    overflow: 'hidden',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    shadowColor: '#2D1A0C',
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 14 },
    elevation: 6,
  },
  cardImageWrap: {
    minHeight: 280,
    justifyContent: 'space-between',
  },
  cardImage: {
    ...StyleSheet.absoluteFill,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    padding: 16,
  },
  badgePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(255,247,235,0.92)',
    maxWidth: '50%',
  },
  badgePillDark: {
    backgroundColor: 'rgba(17,10,3,0.56)',
  },
  badgeText: {
    color: '#8B5A00',
    fontSize: 11,
    fontWeight: '800',
  },
  badgeTextDark: {
    color: '#FFF2DB',
  },
  cardImageFooter: {
    paddingHorizontal: 16,
    paddingBottom: 18,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 10,
  },
  locationText: {
    color: '#F8ECDD',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  heroDescription: {
    color: 'rgba(255,255,255,0.84)',
    fontSize: 14,
    lineHeight: 22,
    maxWidth: 330,
  },
  cardBody: {
    padding: 18,
    backgroundColor: '#FFFDF9',
  },
  metaRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#F7EFE4',
  },
  metaText: {
    color: '#6E5742',
    fontSize: 12,
    fontWeight: '700',
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  tagPill: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 7,
    backgroundColor: 'rgba(139,90,0,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  tagText: {
    color: '#7B5B3A',
    fontSize: 11,
    fontWeight: '700',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: 14,
  },
  startingFrom: {
    color: '#867664',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  price: {
    color: '#8B5A00',
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '900',
  },
  ctaWrap: {
    flexShrink: 0,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    minWidth: 128,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 18,
    shadowColor: '#7B4B00',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  emptyState: {
    marginHorizontal: 18,
    borderRadius: 26,
    padding: 22,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.76)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  emptyTitle: {
    marginTop: 10,
    color: '#8B5A00',
    fontSize: 17,
    fontWeight: '800',
  },
  emptyText: {
    marginTop: 6,
    color: '#6B5A4A',
    fontSize: 13,
    lineHeight: 20,
    textAlign: 'center',
  },
})