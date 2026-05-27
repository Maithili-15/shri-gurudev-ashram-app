import React, { useEffect, useMemo, useState } from 'react'
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native'
import { MaterialIcons } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { CollectorTraveler, PaymentMode } from '../../types/collector'

const paymentModes: PaymentMode[] = ['UPI', 'Cash', 'Bank Transfer']

type Props = {
  visible: boolean
  traveler?: CollectorTraveler | null
  onClose: () => void
  onSubmit: (payload: { amount: number; mode: PaymentMode; receiptUri?: string; remarks?: string }) => void
}

export default function PaymentCollectionModal({ visible, traveler, onClose, onSubmit }: Props) {
  const sheetY = useSharedValue(1)
  const overlayOpacity = useSharedValue(0)
  const [amount, setAmount] = useState('')
  const [mode, setMode] = useState<PaymentMode>('UPI')
  const [receiptUri, setReceiptUri] = useState('')
  const [remarks, setRemarks] = useState('')

  useEffect(() => {
    if (visible) {
      setAmount(traveler ? String(Math.max(0, traveler.dueAmount)) : '')
      setMode('UPI')
      setReceiptUri('')
      setRemarks('')
      sheetY.value = withTiming(0, { duration: 260 })
      overlayOpacity.value = withTiming(1, { duration: 220 })
    } else {
      sheetY.value = withTiming(1, { duration: 220 })
      overlayOpacity.value = withTiming(0, { duration: 180 })
    }
  }, [overlayOpacity, sheetY, traveler, visible])

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: sheetY.value * 720 }],
  }))

  const backdropStyle = useAnimatedStyle(() => ({
    opacity: overlayOpacity.value * 0.42,
  }))

  const handleSubmit = () => {
    const parsedAmount = Number(amount)
    if (!parsedAmount || parsedAmount <= 0 || !traveler) return
    onSubmit({
      amount: parsedAmount,
      mode,
      receiptUri: receiptUri.trim() || undefined,
      remarks: remarks.trim() || undefined,
    })
    onClose()
  }

  const remaining = useMemo(() => traveler?.dueAmount ?? 0, [traveler])

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={onClose}>
      <View style={styles.modalRoot}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose}>
          <Animated.View style={[styles.backdrop, backdropStyle]} />
        </Pressable>

        <Animated.View style={[styles.sheet, sheetStyle]}>
          <View style={styles.handle} />
          <View style={styles.sheetHeader}>
            <View>
              <Text style={styles.kicker}>Collector action</Text>
              <Text style={styles.title}>Collect installment</Text>
            </View>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <MaterialIcons name="close" size={20} color="#8B5A00" />
            </Pressable>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Traveler</Text>
            <Text style={styles.summaryValue}>{traveler?.fullName ?? 'Select traveler'}</Text>
            <Text style={styles.summaryMeta}>{traveler?.yatraName ?? 'No traveler selected'}</Text>
            <Text style={styles.summaryRemaining}>Remaining balance: ₹{remaining.toLocaleString()}</Text>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Collect amount</Text>
            <TextInput
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              placeholder="Enter amount"
              placeholderTextColor="#B59C84"
              style={styles.input}
            />
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Payment mode</Text>
            <View style={styles.modeRow}>
              {paymentModes.map((paymentMode) => {
                const selected = mode === paymentMode
                return (
                  <Pressable key={paymentMode} onPress={() => setMode(paymentMode)} style={styles.modePressable}>
                    <LinearGradient
                      colors={selected ? ['rgba(139,90,0,0.16)', 'rgba(216,155,29,0.12)'] : ['rgba(255,255,255,0.94)', 'rgba(255,255,255,0.86)']}
                      style={[styles.modeChip, selected && styles.modeChipSelected]}
                    >
                      <Text style={[styles.modeText, selected && styles.modeTextSelected]}>{paymentMode}</Text>
                    </LinearGradient>
                  </Pressable>
                )
              })}
            </View>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Receipt screenshot</Text>
            <Pressable style={styles.uploadCard} onPress={() => setReceiptUri('receipt-attached-by-api') }>
              <MaterialIcons name="upload-file" size={20} color="#8B5A00" />
              <Text style={styles.uploadText}>{receiptUri ? 'Receipt attached' : 'Attach receipt screenshot'}</Text>
            </Pressable>
            <Text style={styles.helperText}>This is API-ready. Wire an image picker or backend upload when you connect storage.</Text>
          </View>

          <View style={styles.fieldBlock}>
            <Text style={styles.fieldLabel}>Remarks</Text>
            <TextInput
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Optional remarks for collector follow-up"
              placeholderTextColor="#B59C84"
              style={[styles.input, styles.textArea]}
              multiline
            />
          </View>

          <Pressable onPress={handleSubmit} style={styles.submitWrap}>
            <LinearGradient colors={['#7B4B00', '#B97712', '#E0A31F']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.submitButton}>
              <Text style={styles.submitText}>Confirm collection</Text>
            </LinearGradient>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: '#201409',
  },
  sheet: {
    backgroundColor: '#FFFDF9',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 18,
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    shadowColor: '#2D1A0C',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -10 },
    elevation: 16,
  },
  handle: {
    alignSelf: 'center',
    width: 54,
    height: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(139,90,0,0.14)',
    marginBottom: 12,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  kicker: {
    color: '#8B5A00',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    marginTop: 4,
    color: '#2C1D10',
    fontSize: 22,
    fontWeight: '900',
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(139,90,0,0.06)',
  },
  summaryCard: {
    padding: 14,
    borderRadius: 22,
    backgroundColor: 'rgba(139,90,0,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.08)',
    marginBottom: 14,
  },
  summaryLabel: {
    color: '#7A6653',
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  summaryValue: {
    marginTop: 4,
    color: '#2C1D10',
    fontSize: 17,
    fontWeight: '900',
  },
  summaryMeta: {
    marginTop: 4,
    color: '#6E5A48',
    fontSize: 12,
    fontWeight: '600',
  },
  summaryRemaining: {
    marginTop: 10,
    color: '#8B5A00',
    fontSize: 12,
    fontWeight: '800',
  },
  fieldBlock: {
    marginBottom: 14,
  },
  fieldLabel: {
    color: '#7A6653',
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  input: {
    backgroundColor: '#FFFDF9',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.10)',
    color: '#2C1D10',
    fontSize: 15,
    fontWeight: '600',
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
  },
  modePressable: {
    flex: 1,
  },
  modeChip: {
    minHeight: 46,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(139,90,0,0.10)',
  },
  modeChipSelected: {
    borderColor: 'rgba(139,90,0,0.24)',
  },
  modeText: {
    color: '#6B5A4A',
    fontSize: 13,
    fontWeight: '800',
  },
  modeTextSelected: {
    color: '#8B5A00',
  },
  uploadCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: 'rgba(139,90,0,0.18)',
    backgroundColor: 'rgba(139,90,0,0.04)',
  },
  uploadText: {
    color: '#2C1D10',
    fontSize: 13,
    fontWeight: '800',
  },
  helperText: {
    marginTop: 8,
    color: '#7A6653',
    fontSize: 11,
    lineHeight: 16,
  },
  submitWrap: {
    marginTop: 4,
  },
  submitButton: {
    paddingVertical: 15,
    borderRadius: 18,
    alignItems: 'center',
    shadowColor: '#7B4B00',
    shadowOpacity: 0.24,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  submitText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
})
