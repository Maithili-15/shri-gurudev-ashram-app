import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const COLORS = {
  primary: '#8B5A00',
  text: '#2F2013',
  muted: '#7A6653',
}

type Props = {
  title: string
  value: string
  subtitle: string
  percentage: number
  icon: keyof typeof MaterialIcons.glyphMap
}

export default function AnalyticsCard({ title, value, subtitle, percentage, icon }: Props) {
  const progress = useSharedValue(0)

  useEffect(() => {
    progress.value = withTiming(percentage, { duration: 900 })
  }, [percentage, progress])

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${progress.value * 3.6}deg` }],
  }))

  return (
    <View style={styles.card}>
      <View style={styles.leftCol}>
        <View style={styles.ringOuter}>
          <View style={styles.ringTrack} />
          <Animated.View style={[styles.ringFill, ringStyle]} />
          <View style={styles.ringCenter}>
            <MaterialIcons name={icon} size={18} color={COLORS.primary} />
          </View>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.value}>{value}</Text>
        <Text style={styles.subtitle}>{subtitle}</Text>
      </View>
      <View style={styles.percentPill}>
        <Text style={styles.percentText}>{percentage}%</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 24,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  leftCol: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringOuter: {
    width: 70,
    height: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringTrack: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 8,
    borderColor: 'rgba(139,90,0,0.10)',
  },
  ringFill: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 8,
    borderTopColor: '#D89B1D',
    borderRightColor: '#D89B1D',
    borderBottomColor: 'transparent',
    borderLeftColor: 'transparent',
  },
  ringCenter: {
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(216,155,29,0.12)',
  },
  body: {
    flex: 1,
  },
  title: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  value: {
    marginTop: 6,
    color: COLORS.text,
    fontSize: 24,
    fontWeight: '900',
  },
  subtitle: {
    marginTop: 4,
    color: '#6E5A48',
    fontSize: 12,
    lineHeight: 18,
  },
  percentPill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: 'rgba(139,90,0,0.08)',
  },
  percentText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '800',
  },
})
