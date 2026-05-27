import React, { useEffect, useMemo, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import Animated, { FadeIn, FadeInDown, FadeOut, Layout } from 'react-native-reanimated'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'
import {
  BusType,
  PaymentPlanType,
  RoomType,
  TransportType,
  getInstallmentBreakdown,
  getYatraPrice,
} from '../../utils/yatraPricing'

const COLORS = {
  background: '#FAF6F0', // Sacred warm ivory background
  ivory: '#FCFAF6',
  surface: '#ffffff',
  warmSurface: '#FFF9F0', // Saffron cream glow
  primary: '#E65C00', // Saffron primary
  primaryDark: '#993D00', // Terracotta primary dark
  primaryLight: '#FF9933', // Soft saffron accent
  text: '#2B231B', // Deep rich brown charcoal
  muted: '#7E7162', // Warm earth tone
  softText: '#9E9080',
  border: '#F0E7DD',
  line: '#F5EDE4',
  chip: '#FFF0D9', // Soft orange tint
  chipMuted: '#F3ECE2',
  success: '#3E8E41',
  shadow: '#5B4636',
}

const bookingSchema = z.object({
  fullName: z.string().min(2, 'Enter the traveler name'),
  phoneNumber: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit phone number'),
  whatsappNumber: z.string().regex(/^\d{10}$/, 'Enter a valid 10-digit WhatsApp number'),
  address: z.string().min(10, 'Enter a complete address'),
  dob: z.string().min(1, 'Select date of birth'),
  numberOfTravelers: z.string().min(1, 'Enter traveler count'),
  specialNotes: z.string().optional(),
})

type BookingFormValues = z.infer<typeof bookingSchema>
type BookingRoute = RouteProp<TravelStackParamList, 'BookingForm'>
type BookingNav = NativeStackNavigationProp<TravelStackParamList, 'BookingForm'>

type ImageTarget = 'aadhaar' | 'selfie'
type StepKey = 'transport' | 'stay' | 'traveler'

const STEP_TITLES: Array<{ key: StepKey; label: string; title: string }> = [
  { key: 'transport', label: '1', title: 'Route style' },
  { key: 'stay', label: '2', title: 'Comfort tier' },
  { key: 'traveler', label: '3', title: 'Enter Your Personal Information' },
]

const TRANSPORT_OPTIONS: Array<{ value: TransportType; title: string; description: string; icon: string }> = [
  { value: 'Flight', title: 'Himalayan Flight Arrival', description: 'Serene mountain flights with high-end transfers.', icon: 'flight' },
  { value: 'Train', title: 'Sacred Rail Journey', description: 'Overland railway travel with scenic pacing.', icon: 'train' },
]

const TRAIN_OPTIONS: Array<{ value: BusType; title: string; description: string }> = [
  { value: 'AC Train', title: 'Premium AC Coach', description: 'Air-cooled luxury travel with elevated panoramic views.' },
  { value: 'Non-AC Train', title: 'Standard Sacred Coach', description: 'Classic natural-air travel with fellow pilgrims.' },
]

const ROOM_OPTIONS: Array<{ value: RoomType; title: string; description: string }> = [
  { value: 'AC Room', title: 'Sacred AC Suite', description: 'Serene, cooled private rest space for peaceful meditation.' },
  { value: 'Non-AC Room', title: 'Traditional Cottage', description: 'Immersive spiritual simplicity with comfortable natural ventilation.' },
]

const PAYMENT_OPTIONS: Array<{ value: PaymentPlanType; title: string; description: string }> = [
  { value: 'full', title: 'Pay in full', description: 'Reserve the yatra immediately with a single complete checkout.' },
  { value: 'installments', title: '3 Installments Plan', description: 'Spread the sacred journey cost into three guided intervals.' },
]

const PAYMENT_MODE_OPTIONS = ['UPI', 'Card', 'Net Banking']

function formatDate(date: Date) {
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

function calculateAge(dateString: string) {
  if (!dateString) return ''

  const birthDate = new Date(dateString)
  if (Number.isNaN(birthDate.getTime())) return ''

  const now = new Date()
  let age = now.getFullYear() - birthDate.getFullYear()
  const monthDelta = now.getMonth() - birthDate.getMonth()

  if (monthDelta < 0 || (monthDelta === 0 && now.getDate() < birthDate.getDate())) {
    age -= 1
  }

  return String(Math.max(age, 0))
}

function getReferenceCode() {
  return `JY-${Date.now().toString().slice(-6)}`
}

function ChoiceCard({
  title,
  description,
  icon,
  selected,
  onPress,
}: {
  title: string
  description: string
  icon?: string
  selected: boolean
  onPress: () => void
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.choiceCard,
        selected && styles.choiceCardSelected,
        pressed && styles.choiceCardPressed,
      ]}
    >
      <View style={styles.choiceRow}>
        <View style={[styles.choiceIcon, selected && styles.choiceIconSelected]}>
          {icon ? (
            <MaterialIcons name={icon as any} size={20} color={selected ? '#ffffff' : COLORS.primary} />
          ) : (
            <Ionicons name="sparkles" size={18} color={selected ? '#ffffff' : COLORS.primary} />
          )}
        </View>
        <View style={styles.choiceCopy}>
          <Text style={[styles.choiceTitle, selected && styles.choiceTitleSelected]}>{title}</Text>
          <Text style={styles.choiceDescription}>{description}</Text>
        </View>
        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioInner} /> : null}
        </View>
      </View>
    </Pressable>
  )
}

export default function BookingFormScreen() {
  const route = useRoute<BookingRoute>()
  const navigation = useNavigation<BookingNav>()
  const packageItem = route.params.packageItem

  const selectedPackage = useBookingDraftStore((state) => state.selectedPackage)
  const updateField = useBookingDraftStore((state) => state.updateField)
  const setSelectedPackage = useBookingDraftStore((state) => state.setSelectedPackage)
  const draft = useBookingDraftStore((state) => state)

  const [stepIndex, setStepIndex] = useState(0)
  const [showDatePicker, setShowDatePicker] = useState(false)

  const transportType = draft.transportType || 'Flight'
  const busType = draft.busType || 'AC Train'
  const roomType = draft.roomType || 'AC Room'
  const paymentPlan = draft.paymentPlan || 'full'
  const paymentMode = draft.paymentMode || 'UPI'

  const pricing = useMemo(
    () => getYatraPrice(transportType as TransportType, roomType as RoomType, busType as BusType),
    [transportType, roomType, busType],
  )
  const installmentBreakdown = useMemo(() => getInstallmentBreakdown(pricing.amount), [pricing.amount])
  const step = STEP_TITLES[stepIndex]

  const { control, handleSubmit, setValue, trigger, watch, formState: { errors } } = useForm<BookingFormValues>({
    defaultValues: {
      fullName: draft.fullName,
      phoneNumber: draft.phoneNumber,
      whatsappNumber: draft.whatsappNumber,
      address: draft.address,
      dob: draft.dob,
      numberOfTravelers: draft.numberOfTravelers || '1',
      specialNotes: draft.specialNotes,
    },
    resolver: zodResolver(bookingSchema),
    mode: 'onChange',
  })

  const dobValue = watch('dob')
  const ageValue = useMemo(() => calculateAge(dobValue), [dobValue])
  const aadhaarPhotoUri = draft.aadhaarPhotoUri
  const selfiePhotoUri = draft.selfiePhotoUri
  const aadhaarPhotoLabel = draft.aadhaarPhotoLabel
  const selfiePhotoLabel = draft.selfiePhotoLabel

  useEffect(() => {
    if (!selectedPackage || selectedPackage.id !== packageItem.id) {
      setSelectedPackage(packageItem)
    }
  }, [packageItem, selectedPackage, setSelectedPackage])

  useEffect(() => {
    if (dobValue) {
      updateField('age', ageValue)
    }
  }, [ageValue, dobValue, updateField])

  useEffect(() => {
    updateField('transportType', transportType)
  }, [transportType, updateField])

  useEffect(() => {
    updateField('busType', busType)
  }, [busType, updateField])

  useEffect(() => {
    updateField('roomType', roomType)
  }, [roomType, updateField])

  useEffect(() => {
    updateField('paymentPlan', paymentPlan)
  }, [paymentPlan, updateField])

  useEffect(() => {
    updateField('paymentMode', paymentMode)
  }, [paymentMode, updateField])

  const handleContinueFromTraveler = handleSubmit((values) => {
    updateField('fullName', values.fullName)
    updateField('phoneNumber', values.phoneNumber)
    updateField('whatsappNumber', values.whatsappNumber)
    updateField('address', values.address)
    updateField('dob', values.dob)
    updateField('age', calculateAge(values.dob))
    updateField('numberOfTravelers', values.numberOfTravelers)
    updateField('specialNotes', values.specialNotes ?? '')

    const bookingReference = draft.bookingReference || getReferenceCode()
    updateField('bookingReference', bookingReference)
    navigation.navigate('UploadDocuments', { bookingId: bookingReference })
  })

  const today = new Date()
  const minimumDate = new Date(today.getFullYear() - 110, today.getMonth(), today.getDate())

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={20} color={COLORS.primaryDark} />
          </TouchableOpacity>
          <View style={styles.headerCopy}>
            <Text style={styles.headerEyebrow}>Sadhak Registration</Text>
            <Text style={styles.headerTitle}>{packageItem.title}</Text>
          </View>
          <View style={styles.headerBadge}>
            <MaterialIcons name="spa" size={14} color={COLORS.primaryDark} />
          </View>
        </View>

        {/* Real-time Dynamic Package Pricing Summary */}
        <View style={styles.heroCard}>
          <View style={styles.heroTop}>
            <View>
              <Text style={styles.heroLabel}>YATRA COST</Text>
              <Text style={styles.heroAmount}>₹{pricing.amount.toLocaleString('en-IN')}</Text>
            </View>
            <View style={styles.heroPill}>
              <MaterialIcons name="schedule" size={14} color={COLORS.primaryDark} />
              <Text style={styles.heroPillText}>{selectedPackage?.duration ?? packageItem.duration}</Text>
            </View>
          </View>
          <View style={styles.heroConfigSummary}>
            <Text style={styles.heroConfigText}>
              Configured: <Text style={styles.boldText}>{transportType}</Text>
              {transportType === 'Train' && ` (${busType})`} • <Text style={styles.boldText}>{roomType}</Text>
            </Text>
          </View>
          <View style={styles.inclusionsRow}>
            {pricing.inclusions.map((inclusion) => (
              <View key={inclusion} style={styles.inclusionBadge}>
                <Ionicons name="checkmark-circle-outline" size={12} color={COLORS.primary} />
                <Text style={styles.inclusionText}>{inclusion}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Custom Premium Horizontal Progress Tracker */}
        <View style={styles.stepperContainer}>
          <View style={styles.stepperProgressLine}>
            <View style={[styles.stepperProgressFill, { width: `${(stepIndex / (STEP_TITLES.length - 1)) * 100}%` }]} />
          </View>
          <View style={styles.stepperNodesRow}>
            {STEP_TITLES.map((item, index) => {
              const active = index === stepIndex
              const completed = index < stepIndex
              return (
                <View key={item.key} style={styles.stepperNodeWrap}>
                  <View
                    style={[
                      styles.stepperNode,
                      active && styles.stepperNodeActive,
                      completed && styles.stepperNodeCompleted,
                    ]}
                  >
                    {completed ? (
                      <Ionicons name="checkmark" size={12} color="#ffffff" />
                    ) : (
                      <Text style={[styles.stepperNodeText, active && styles.stepperNodeTextActive]}>{item.label}</Text>
                    )}
                  </View>
                  <Text style={[styles.stepperNodeLabel, active && styles.stepperNodeLabelActive]}>{item.title}</Text>
                </View>
              )
            })}
          </View>
        </View>

        {/* Step Contents Container */}
        <Animated.View
          key={step.key}
          entering={FadeInDown.duration(350)}
          exiting={FadeOut.duration(200)}
          layout={Layout.springify()}
          style={styles.card}
        >
          {step.key === 'transport' ? (
            <View style={styles.sectionGap}>
              <View>
                <Text style={styles.sectionTitle}>Choose transport that suits you well</Text>
                <Text style={styles.sectionSubtitle}>
                  Select the sacred route arrival options for this yatra.
                </Text>
              </View>
              <View style={styles.choiceList}>
                {TRANSPORT_OPTIONS.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    description={option.description}
                    icon={option.icon}
                    selected={transportType === option.value}
                    onPress={() => {
                      updateField('transportType', option.value)
                      if (option.value === 'Flight') {
                        updateField('busType', '')
                      }
                    }}
                  />
                ))}
              </View>
              <TouchableOpacity
                style={[styles.primaryButton, !transportType && styles.primaryButtonDisabled]}
                disabled={!transportType}
                onPress={() => setStepIndex(1)}
              >
                <LinearGradient
                  colors={['#E65C00', '#FF9933']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={styles.buttonGradient}
                >
                  <Text style={styles.primaryButtonText}>Continue</Text>
                  <Ionicons name="arrow-forward" size={16} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          ) : null}

          {step.key === 'stay' ? (
            <View style={styles.sectionGap}>
              <View>
                <Text style={styles.sectionTitle}>Select journey comfort</Text>
                <Text style={styles.sectionSubtitle}>
                  Select the level of comfort that matches the spiritual traveler's health and rest requirements.
                </Text>
              </View>

              {transportType === 'Train' ? (
                <>
                  <Text style={styles.groupLabel}>Sadhak coach options</Text>
                  <View style={styles.choiceList}>
                    {TRAIN_OPTIONS.map((option) => (
                      <ChoiceCard
                        key={option.value}
                        title={option.title}
                        description={option.description}
                        selected={busType === option.value}
                        onPress={() => updateField('busType', option.value)}
                      />
                    ))}
                  </View>
                </>
              ) : null}

              <Text style={styles.groupLabel}>Ashram stay options</Text>
              <View style={styles.choiceList}>
                {ROOM_OPTIONS.map((option) => (
                  <ChoiceCard
                    key={option.value}
                    title={option.title}
                    description={option.description}
                    selected={roomType === option.value}
                    onPress={() => updateField('roomType', option.value)}
                  />
                ))}
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setStepIndex(0)}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.primaryButton, (!roomType || (transportType === 'Train' && !busType)) && styles.primaryButtonDisabled]}
                  disabled={!roomType || (transportType === 'Train' && !busType)}
                  onPress={() => setStepIndex(2)}
                >
                  <LinearGradient
                    colors={['#E65C00', '#FF9933']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {step.key === 'traveler' ? (
            <View style={styles.sectionGap}>
              <View>
                <Text style={styles.sectionTitle}>Traveler information</Text>
                <Text style={styles.sectionSubtitle}>
                  Please fill in the sadhak's personal and communications details.
                </Text>
              </View>

              <Controller
                control={control}
                name="fullName"
                render={({ field: { value, onChange } }) => (
                  <InputField
                    label="Full Name"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Enter sadhak's complete legal name"
                    error={errors.fullName?.message}
                  />
                )}
              />

              <View style={styles.row}>
                <View style={styles.flexItem}>
                  <Controller
                    control={control}
                    name="phoneNumber"
                    render={({ field: { value, onChange } }) => (
                      <InputField
                        label="Phone Number"
                        value={value}
                        onChangeText={onChange}
                        placeholder="10-digit mobile number"
                        keyboardType="number-pad"
                        error={errors.phoneNumber?.message}
                      />
                    )}
                  />
                </View>
                <View style={styles.flexItem}>
                  <Controller
                    control={control}
                    name="whatsappNumber"
                    render={({ field: { value, onChange } }) => (
                      <InputField
                        label="WhatsApp Number"
                        value={value}
                        onChangeText={onChange}
                        placeholder="10-digit WhatsApp number"
                        keyboardType="number-pad"
                        error={errors.whatsappNumber?.message}
                      />
                    )}
                  />
                </View>
              </View>

              <Controller
                control={control}
                name="address"
                render={({ field: { value, onChange } }) => (
                  <InputField
                    label="Home Address"
                    value={value}
                    onChangeText={onChange}
                    placeholder="Provide detailed residential address"
                    multiline
                    error={errors.address?.message}
                  />
                )}
              />

              <View style={styles.row}>
                <View style={styles.flexItem}>
                  <Controller
                    control={control}
                    name="dob"
                    render={({ field: { value } }) => (
                      <Pressable onPress={() => setShowDatePicker(true)} style={styles.pickerField}>
                        <Text style={styles.fieldLabel}>Date of Birth</Text>
                        <View style={styles.pickerFieldRow}>
                          <Text style={[styles.pickerValue, !value && styles.pickerPlaceholder]}>
                            {value ? formatDate(new Date(value)) : 'Select date of birth'}
                          </Text>
                          <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                        </View>
                      </Pressable>
                    )}
                  />
                </View>
                <View style={styles.agePill}>
                  <Text style={styles.ageLabel}>Age</Text>
                  <Text style={styles.ageValue}>{ageValue || '—'}</Text>
                </View>
              </View>

              <Controller
                control={control}
                name="numberOfTravelers"
                render={({ field: { value, onChange } }) => (
                  <InputField
                    label="Number of Travelers"
                    value={value}
                    onChangeText={onChange}
                    keyboardType="number-pad"
                    placeholder="1"
                    error={errors.numberOfTravelers?.message}
                  />
                )}
              />

              <Controller
                control={control}
                name="specialNotes"
                render={({ field: { value, onChange } }) => (
                  <InputField
                    label="Ashram Seva and Special Requests (Optional)"
                    value={value ?? ''}
                    onChangeText={onChange}
                    multiline
                    placeholder="E.g., mobility assistance, food restrictions, prayer requests"
                  />
                )}
              />

              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.secondaryButton} onPress={() => setStepIndex(1)}>
                  <Text style={styles.secondaryButtonText}>Back</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.primaryButton} onPress={handleContinueFromTraveler}>
                  <LinearGradient
                    colors={['#E65C00', '#FF9933']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.buttonGradient}
                  >
                    <Text style={styles.primaryButtonText}>Save & Continue</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}


        </Animated.View>

        <View style={styles.footerCard}>
          <Text style={styles.footerLabel}>Spiritual Booking Code</Text>
          <Text style={styles.footerValue}>{draft.bookingReference || 'Will be generated dynamically'}</Text>
          <Text style={styles.footerText}>
            Ashram Yatra inclusions: {pricing.inclusions.join(' • ')}
          </Text>
        </View>
      </ScrollView>

      {showDatePicker ? (
        <Modal transparent animationType="fade" visible onRequestClose={() => setShowDatePicker(false)}>
          <Pressable style={styles.modalBackdrop} onPress={() => setShowDatePicker(false)}>
            <Pressable style={styles.modalCard} onPress={() => undefined}>
              <Text style={styles.modalTitle}>Select Date of Birth</Text>
              <DateTimePicker
                value={dobValue ? new Date(dobValue) : new Date(1995, 0, 1)}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                maximumDate={new Date()}
                minimumDate={minimumDate}
                onChange={(_, selectedDate) => {
                  if (!selectedDate) return
                  const isoDate = selectedDate.toISOString().split('T')[0]
                  setValue('dob', isoDate, { shouldValidate: true })
                  updateField('dob', isoDate)
                  updateField('age', calculateAge(isoDate))
                  if (Platform.OS !== 'ios') {
                    setShowDatePicker(false)
                  }
                }}
              />
              {Platform.OS === 'ios' ? (
                <TouchableOpacity style={styles.modalButton} onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.modalButtonText}>Done</Text>
                </TouchableOpacity>
              ) : null}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}


    </SafeAreaView>
  )
}

function InputField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
  error,
}: {
  label: string
  value: string
  onChangeText: (text: string) => void
  placeholder: string
  keyboardType?: 'default' | 'number-pad' | 'phone-pad'
  multiline?: boolean
  error?: string
}) {
  return (
    <View style={styles.inputBlock}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={COLORS.softText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea, error && styles.inputError]}
      />
      {error ? <Text style={styles.errorText}>{error}</Text> : null}
    </View>
  )
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryTile}>
      <Text style={styles.summaryTileLabel}>{label}</Text>
      <Text style={styles.summaryTileValue}>{value}</Text>
    </View>
  )
}

function LinearGradient({
  colors,
  style,
  children,
}: {
  colors: string[]
  start?: { x: number; y: number }
  end?: { x: number; y: number }
  style?: any
  children?: React.ReactNode
}) {
  // Simple shim wrapping view in case linear gradient wrapper isn't imported from correct native package
  const { LinearGradient: EXGradient } = require('expo-linear-gradient')
  return (
    <EXGradient colors={colors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={style}>
      {children}
    </EXGradient>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 18,
    paddingBottom: 40,
    gap: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 1,
  },
  headerCopy: {
    flex: 1,
  },
  headerEyebrow: {
    color: COLORS.primary,
    fontSize: 11,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    fontWeight: '800',
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    marginTop: 2,
  },
  headerBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.06,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 10 },
    elevation: 4,
  },
  heroTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  heroLabel: {
    color: COLORS.muted,
    fontSize: 11,
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  heroAmount: {
    color: COLORS.primaryDark,
    fontSize: 32,
    fontWeight: '900',
    marginTop: 4,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.chip,
  },
  heroPillText: {
    color: COLORS.primaryDark,
    fontWeight: '800',
    fontSize: 12,
  },
  heroConfigSummary: {
    marginTop: 10,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
  },
  heroConfigText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  boldText: {
    fontWeight: '800',
    color: COLORS.primaryDark,
  },
  inclusionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 12,
  },
  inclusionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  inclusionText: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '600',
  },
  stepperContainer: {
    marginVertical: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 2,
  },
  stepperProgressLine: {
    height: 4,
    backgroundColor: COLORS.line,
    borderRadius: 2,
    position: 'absolute',
    top: 34,
    left: 44,
    right: 44,
  },
  stepperProgressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  stepperNodesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  stepperNodeWrap: {
    alignItems: 'center',
    width: 60,
  },
  stepperNode: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.surface,
    borderWidth: 2,
    borderColor: COLORS.line,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  stepperNodeActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.surface,
    transform: [{ scale: 1.1 }],
  },
  stepperNodeCompleted: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primary,
  },
  stepperNodeText: {
    color: COLORS.softText,
    fontSize: 12,
    fontWeight: '800',
  },
  stepperNodeTextActive: {
    color: COLORS.primary,
  },
  stepperNodeLabel: {
    marginTop: 8,
    color: COLORS.softText,
    fontSize: 9,
    fontWeight: '800',
    textAlign: 'center',
    width: 72,
  },
  stepperNodeLabelActive: {
    color: COLORS.primaryDark,
    fontWeight: '900',
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 6,
  },
  sectionGap: {
    gap: 18,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginTop: 6,
  },
  choiceList: {
    gap: 12,
  },
  choiceCard: {
    borderRadius: 22,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.ivory,
    padding: 16,
  },
  choiceCardSelected: {
    borderColor: COLORS.primaryLight,
    backgroundColor: COLORS.warmSurface,
  },
  choiceCardPressed: {
    opacity: 0.94,
    transform: [{ scale: 0.995 }],
  },
  choiceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  choiceIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.chip,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceIconSelected: {
    backgroundColor: COLORS.primary,
  },
  choiceCopy: {
    flex: 1,
  },
  choiceTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  choiceTitleSelected: {
    color: COLORS.primaryDark,
  },
  choiceDescription: {
    marginTop: 4,
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: COLORS.primary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  primaryButton: {
    flex: 2,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  primaryButtonDisabled: {
    opacity: 0.55,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 16,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  secondaryButton: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: COLORS.ivory,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  secondaryButtonText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '800',
  },
  groupLabel: {
    color: COLORS.primaryDark,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginTop: 10,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  flexItem: {
    flex: 1,
  },
  inputBlock: {
    gap: 8,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.ivory,
    color: COLORS.text,
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
  },
  textArea: {
    minHeight: 96,
    textAlignVertical: 'top',
  },
  inputError: {
    borderColor: '#D32F2F',
  },
  errorText: {
    color: '#D32F2F',
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2,
  },
  pickerField: {
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.ivory,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 54,
    justifyContent: 'center',
  },
  pickerFieldRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  pickerValue: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '700',
  },
  pickerPlaceholder: {
    color: COLORS.softText,
    fontWeight: '600',
  },
  agePill: {
    width: 90,
    borderRadius: 18,
    backgroundColor: COLORS.warmSurface,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 2,
  },
  ageLabel: {
    color: COLORS.muted,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  ageValue: {
    color: COLORS.primary,
    fontSize: 26,
    fontWeight: '900',
    marginTop: 2,
  },
  documentCard: {
    borderRadius: 24,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.ivory,
    padding: 16,
    gap: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  documentHint: {
    color: COLORS.softText,
    fontSize: 12,
    marginTop: 4,
  },
  previewContainer: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    overflow: 'hidden',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
  },
  progressOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(43,35,27,0.72)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  progressText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 10,
  },
  progressBarTrack: {
    width: '80%',
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.24)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryLight,
  },
  documentPlaceholder: {
    width: '100%',
    height: 180,
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    gap: 8,
  },
  documentPlaceholderText: {
    color: COLORS.muted,
    fontSize: 13,
    fontWeight: '700',
  },
  documentFileName: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '700',
  },
  documentActions: {
    flexDirection: 'row',
    gap: 10,
  },
  documentAction: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: COLORS.chip,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  documentActionText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  modeRow: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  modeChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 999,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  modeChipSelected: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  modeChipText: {
    color: COLORS.muted,
    fontSize: 14,
    fontWeight: '800',
  },
  modeChipTextSelected: {
    color: '#ffffff',
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  summaryTile: {
    width: '48%',
    borderRadius: 18,
    padding: 14,
    backgroundColor: COLORS.ivory,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  summaryTileLabel: {
    color: COLORS.softText,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    fontWeight: '800',
  },
  summaryTileValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
    marginTop: 8,
  },
  priceCard: {
    borderRadius: 24,
    backgroundColor: COLORS.warmSurface,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.primaryLight,
    gap: 12,
  },
  priceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  priceCardLabel: {
    color: COLORS.muted,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  priceValue: {
    color: COLORS.primaryDark,
    fontSize: 30,
    fontWeight: '900',
    marginTop: 4,
  },
  priceTag: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  priceTagText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '800',
  },
  installmentNote: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  installmentContainer: {
    backgroundColor: COLORS.ivory,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    gap: 12,
  },
  timelineHeader: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  timeline: {
    gap: 12,
    paddingLeft: 12,
  },
  timelineVerticalLine: {
    position: 'absolute',
    left: 17,
    top: 10,
    bottom: 24,
    width: 2,
    backgroundColor: COLORS.line,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  timelineBulletWrap: {
    width: 12,
    alignItems: 'center',
    paddingTop: 4,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    zIndex: 10,
  },
  timelineDotActive: {
    backgroundColor: COLORS.primary,
    transform: [{ scale: 1.2 }],
  },
  timelineDotPending: {
    backgroundColor: COLORS.border,
  },
  timelineContent: {
    flex: 1,
  },
  timelineLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  timelineDate: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  timelineAmount: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '900',
    marginTop: 4,
  },
  footerCard: {
    borderRadius: 24,
    padding: 18,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    gap: 8,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  footerLabel: {
    color: COLORS.primary,
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    fontWeight: '800',
  },
  footerValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '800',
  },
  footerText: {
    color: COLORS.muted,
    fontSize: 13,
    lineHeight: 20,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(43,35,27,0.48)',
    padding: 20,
    justifyContent: 'center',
  },
  modalCard: {
    borderRadius: 26,
    backgroundColor: COLORS.surface,
    padding: 22,
    gap: 16,
    shadowColor: COLORS.shadow,
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
  },
  modalButton: {
    alignSelf: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 999,
    backgroundColor: COLORS.primary,
  },
  modalButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 6,
  },
  modalOption: {
    flex: 1,
    borderRadius: 18,
    backgroundColor: COLORS.ivory,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  modalOptionText: {
    color: COLORS.primaryDark,
    fontSize: 14,
    fontWeight: '800',
  },
})
