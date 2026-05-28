import React from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { CollectorNotification } from '../../types/collector'

const COLORS = {
  alert: '#B42318',
  info: '#8B5A00',
  success: '#1E8E3E',
}

type Props = {
  item: CollectorNotification
}

export default function NotificationCard({ item }: Props) {
  const tone =
    item.tone === 'alert'
      ? { bg: 'rgba(180,35,24,0.08)', fg: COLORS.alert, icon: 'error-outline' as const }
      : item.tone === 'success'
        ? { bg: 'rgba(30,142,62,0.08)', fg: COLORS.success, icon: 'check-circle-outline' as const }
        : { bg: 'rgba(139,90,0,0.08)', fg: COLORS.info, icon: 'notifications-none' as const }

  return (
    <View style={styles.card}>
      <View style={[styles.iconWrap, { backgroundColor: tone.bg }]}>
        <MaterialIcons name={tone.icon} size={18} color={tone.fg} />
      </View>
      <View style={styles.body}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <Text style={styles.message}>{item.message}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: 22,
    backgroundColor: '#FFFDF9',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  body: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#2C1D10',
    fontSize: 13,
    fontWeight: '800',
  },
  time: {
    color: '#8A7461',
    fontSize: 11,
    fontWeight: '700',
  },
  message: {
    marginTop: 6,
    color: '#6E5A48',
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '500',
  },
})
