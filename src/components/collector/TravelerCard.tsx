import React from 'react'
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, { FadeInDown, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { Image } from 'expo-image'
import { CollectorTraveler } from '../../types/collector'
import InstallmentProgress from './InstallmentProgress'

const AnimatedPressable = Animated.createAnimatedComponent(Pressable)

type Props = {
  item: CollectorTraveler
  index: number
  onPressDetails: () => void
  onPressMarkPaid: () => void
}

export default function TravelerCard({ item, index, onPressDetails, onPressMarkPaid }: Props) {
  const pressScale = useSharedValue(1)
  const cardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pressScale.value }],
  }))

  const openCall = () => Linking.openURL(`tel:${item.phone.replace(/[^\d+]/g, '')}`)
  const openWhatsApp = () => {
    const phone = item.whatsapp.replace(/[^\d]/g, '')
    Linking.openURL(`https://wa.me/${phone}`)
  }

  return (
    <Animated.View entering={FadeInDown.delay(index * 70).duration(600)} style={[styles.cardWrap, cardStyle]}>
      <AnimatedPressable
        onPress={onPressDetails}
        onPressIn={() => {
          pressScale.value = withTiming(0.985, { duration: 100 })
        }}
        onPressOut={() => {
          pressScale.value = withTiming(1, { duration: 160 })
        }}
        style={styles.card}
      >
        <View style={styles.headerRow}>
          <View style={styles.photoWrap}>
            <Image source={{ uri: item.photo }} style={styles.photo} contentFit="cover" transition={220} />
          </View>

          <View style={styles.headerBody}>
            <View style={styles.titleRow}>
              <Text style={styles.name}>{item.fullName}</Text>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            </View>
            <Text style={styles.subtitle}>{item.yatraName}</Text>
            <Text style={styles.bookingId}>{item.bookingId}</Text>

            <View style={styles.tagsRow}>
              {item.tags.map((tag) => (
                <View key={tag} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <InstallmentProgress
          paidAmount={item.amountPaid}
          totalAmount={item.totalAmount}
          dueAmount={item.dueAmount}
          status={item.status}
          installments={item.installments}
        />

        <View style={styles.footerRow}>
          <View>
            <Text style={styles.footerLabel}>Due date</Text>
            <Text style={styles.footerValue}>{item.dueDate}</Text>
          </View>
          <View style={styles.actionsRow}>
            <Pressable style={styles.actionChip} onPress={openCall}>
              <MaterialIcons name="call" size={16} color="#8B5A00" />
            </Pressable>
            <Pressable style={styles.actionChip} onPress={openWhatsApp}>
              <MaterialIcons name="chat" size={16} color="#8B5A00" />
            </Pressable>
            <Pressable style={[styles.actionChip, styles.primaryActionChip]} onPress={onPressMarkPaid}>
              <MaterialIcons name="payments" size={16} color="#fff" />
            </Pressable>
            <Pressable style={[styles.actionChip, styles.viewActionChip]} onPress={onPressDetails}>
              <MaterialIcons name="visibility" size={16} color="#fff" />
            </Pressable>
          </View>
        </View>
      </AnimatedPressable>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  cardWrap: {
    marginBottom: 18,
  },
  card: {
    borderRadius: 28,
    padding: 16,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    shadowColor: '#2C1B0D',
    shadowOpacity: 0.12,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    gap: 12,
  },
  photoWrap: {
    width: 72,
    height: 72,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: 'rgba(216,155,29,0.12)',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  headerBody: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  name: {
    flex: 1,
    color: '#2C1D10',
    fontSize: 17,
    fontWeight: '900',
  },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(216,155,29,0.12)',
  },
  statusText: {
    color: '#8B5A00',
    fontSize: 11,
    fontWeight: '800',
  },
  subtitle: {
    marginTop: 4,
    color: '#6D5745',
    fontSize: 13,
    fontWeight: '700',
  },
  bookingId: {
    marginTop: 3,
    color: '#8A7461',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 10,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: 'rgba(139,90,0,0.06)',
  },
  tagText: {
    color: '#6B573F',
    fontSize: 11,
    fontWeight: '700',
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  footerLabel: {
    color: '#866F5A',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  footerValue: {
    color: '#3A2816',
    fontSize: 14,
    fontWeight: '800',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionChip: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,90,0,0.06)',
  },
  primaryActionChip: {
    backgroundColor: '#8B5A00',
  },
  viewActionChip: {
    backgroundColor: '#D89B1D',
  },
})
