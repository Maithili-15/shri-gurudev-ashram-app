import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { FadeInUp, runOnJS, useAnimatedReaction, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const COLORS = {
  ivory: '#F8F3EA',
  primary: '#8B5A00',
  text: '#3D2A17',
  muted: '#7A6653',
}

type CollectorStatCardProps = {
  label: string
  value: number
  suffix?: string
  icon: keyof typeof MaterialIcons.glyphMap
  colors?: [string, string]
}

export default function CollectorStatCard({ label, value, suffix, icon, colors = ['#7A4B00', '#D89B1D'] }: CollectorStatCardProps) {
  const animatedValue = useSharedValue(0)
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    animatedValue.value = 0
    animatedValue.value = withTiming(value, { duration: 900 })
  }, [animatedValue, value])

  useAnimatedReaction(
    () => Math.round(animatedValue.value),
    (next, previous) => {
      if (next !== previous) {
        runOnJS(setDisplayValue)(next)
      }
    },
    [],
  )

  const ringStyle = useAnimatedStyle(() => ({
    transform: [{ scale: 1 + Math.min(animatedValue.value / Math.max(value, 1), 1) * 0.02 }],
  }))

  return (
    <Animated.View entering={FadeInUp.duration(550)} style={styles.card}>
      <LinearGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.gradient}>
        <View style={styles.headerRow}>
          <View style={styles.iconWrap}>
            <MaterialIcons name={icon} size={20} color="#fff" />
          </View>
          <Animated.View style={[styles.ring, ringStyle]} />
        </View>

        <Text style={styles.value}>
          {displayValue.toLocaleString()}
          {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        </Text>
        <Text style={styles.label}>{label}</Text>
      </LinearGradient>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#2B1609',
    shadowOpacity: 0.18,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  gradient: {
    minHeight: 138,
    padding: 16,
    borderRadius: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  ring: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.26)',
  },
  value: {
    color: '#FFFFFF',
    fontSize: 27,
    fontWeight: '900',
    letterSpacing: 0.2,
  },
  suffix: {
    fontSize: 15,
    fontWeight: '800',
  },
  label: {
    marginTop: 6,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
})
