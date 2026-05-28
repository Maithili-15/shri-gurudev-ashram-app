import React from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

const COLORS = {
  primary: '#8B5A00',
  inactive: '#999999',
  surface: '#ffffff',
  border: '#e8ddd2',
  shadow: '#5b4636',
}

const TAB_ITEMS = [
  { name: 'Home', label: 'Home', icon: 'home' as const },
  { name: 'Travel', label: 'Travel', icon: 'explore' as const },
  { name: 'Notifications', label: 'Alerts', icon: 'notifications-none' as const },
  { name: 'Profile', label: 'Profile', icon: 'person-outline' as const },
]

type AppTabBarProps = {
  state: {
    index: number
    routes: Array<{ name: string }>
  }
  navigation: {
    navigate: (name: string) => void
  }
}

export default function AppTabBar({ state, navigation }: AppTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <SafeAreaView edges={[ 'bottom' ]} style={[styles.safeArea, { paddingBottom: Math.max(insets.bottom, 10) }] }>
      <View style={styles.outerWrap}>
        <BlurView intensity={28} tint="light" style={styles.container}>
          <View style={styles.row}>
          {TAB_ITEMS.slice(0, 2).map((item) => {
            const route = state.routes.find((routeItem) => routeItem.name === item.name)
            const routeIndex = state.routes.findIndex((routeItem) => routeItem.name === item.name)
            const focused = state.index === routeIndex
            const color = focused ? COLORS.primary : COLORS.inactive

            if (!route) return null

            return (
              <Pressable
                key={item.name}
                onPress={() => navigation.navigate(item.name)}
                style={styles.tabButton}
              >
                <View style={[styles.iconShell, focused && styles.iconShellFocused]}>
                  <MaterialIcons name={item.icon} size={22} color={color} />
                </View>
                <Text style={[styles.label, { color }]}>{item.label}</Text>
              </Pressable>
            )
          })}

          <View style={styles.centerGap} />

          {TAB_ITEMS.slice(2).map((item) => {
            const routeIndex = state.routes.findIndex((routeItem) => routeItem.name === item.name)
            const focused = state.index === routeIndex
            const color = focused ? COLORS.primary : COLORS.inactive

            return (
              <Pressable
                key={item.name}
                onPress={() => navigation.navigate(item.name)}
                style={styles.tabButton}
              >
                <View style={[styles.iconShell, focused && styles.iconShellFocused]}>
                  <MaterialIcons name={item.icon} size={22} color={color} />
                </View>
                <Text style={[styles.label, { color }]}>{item.label}</Text>
              </Pressable>
            )
          })}

          </View>

          <Pressable style={styles.donateButton} onPress={() => navigation.navigate('Profile')}>
            <LinearGradient
              colors={['#7A4B00', '#B97712', '#E0A31F']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.donateButtonFill}
            >
              <MaterialIcons name="volunteer-activism" size={28} color="#ffffff" />
            </LinearGradient>
          </Pressable>
        </BlurView>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: 'transparent',
  },
  outerWrap: {
    marginHorizontal: 12,
    marginBottom: 10,
    borderRadius: 30,
    overflow: 'visible',
  },
  container: {
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.78)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.10)',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.16,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 16,
    paddingTop: 14,
    paddingHorizontal: 12,
    paddingBottom: 12,
    overflow: 'visible',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 2,
  },
  label: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  centerGap: {
    width: 64,
  },
  donateButton: {
    position: 'absolute',
    left: '50%',
    bottom: 22,
    marginLeft: -31,
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 12,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.96)',
  },
  donateButtonFill: {
    width: '100%',
    height: '100%',
    borderRadius: 31,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconShell: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,90,0,0.04)',
  },
  iconShellFocused: {
    backgroundColor: 'rgba(139,90,0,0.12)',
  },
})