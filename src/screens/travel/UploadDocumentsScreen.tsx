import React, { useState } from 'react'
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
import * as ImagePicker from 'expo-image-picker'
import { Image } from 'expo-image'
import { Ionicons, MaterialIcons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { TravelStackParamList } from '../../navigators/TravelStackNavigator'
import { useBookingDraftStore } from '../../store/useBookingDraftStore'
import { getYatraPrice } from '../../utils/yatraPricing'

type UploadDocumentsRoute = RouteProp<TravelStackParamList, 'UploadDocuments'>
type UploadDocumentsNav = NativeStackNavigationProp<TravelStackParamList, 'UploadDocuments'>

type ImageTarget = 'aadhaar' | 'selfie'

const COLORS = {
  background: '#FAF6F0',
  ivory: '#FCFAF6',
  surface: '#ffffff',
  primary: '#E65C00',
  primaryDark: '#993D00',
  primaryLight: '#FF9933',
  text: '#2B231B',
  muted: '#7E7162',
  softText: '#9E9080',
  border: '#F0E7DD',
  line: '#F5EDE4',
  chip: '#FFF0D9',
  shadow: '#5B4636',
}

export default function UploadDocumentsScreen() {
  const route = useRoute<UploadDocumentsRoute>()
  const navigation = useNavigation<UploadDocumentsNav>()
  const draft = useBookingDraftStore()

  const [showAadhaarModal, setShowAadhaarModal] = useState(false)
  const [showSelfieModal, setShowSelfieModal] = useState(false)
  const [aadhaarProgress, setAadhaarProgress] = useState(0)
  const [selfieProgress, setSelfieProgress] = useState(0)

  const handlePickImage = async (target: ImageTarget, source: 'camera' | 'gallery') => {
    const permissions =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync()

    if (!permissions.granted) {
      Alert.alert('Permission needed', 'Please allow access so the document can be attached.')
      return
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.8 })
        : await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            quality: 0.8,
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
          })

    if (result.canceled || !result.assets[0]) return

    const asset = result.assets[0]
    const label = asset.fileName ?? `${source === 'camera' ? 'Camera' : 'Gallery'} capture`

    if (target === 'aadhaar') {
      draft.updateField('aadhaarPhotoLabel', label)
      draft.updateField('aadhaarPhotoUri', asset.uri)
      setShowAadhaarModal(false)

      setAadhaarProgress(0)
      let prog = 0
      const timer = setInterval(() => {
        prog += 10
        setAadhaarProgress(prog)
        if (prog >= 100) clearInterval(timer)
      }, 70)
    } else {
      draft.updateField('selfiePhotoLabel', label)
      draft.updateField('selfiePhotoUri', asset.uri)
      setShowSelfieModal(false)

      setSelfieProgress(0)
      let prog = 0
      const timer = setInterval(() => {
        prog += 10
        setSelfieProgress(prog)
        if (prog >= 100) clearInterval(timer)
      }, 70)
    }
  }

  const handleContinue = () => {
    if (!draft.aadhaarNumber || draft.aadhaarNumber.length !== 12) {
      Alert.alert('Invalid Input', 'Please enter a valid 12-digit Aadhaar number.')
      return
    }

    if (!draft.aadhaarPhotoUri || !draft.selfiePhotoUri) {
      Alert.alert('Upload required', 'Please upload both Aadhaar and Selfie images before continuing.')
      return
    }

    const pricing = getYatraPrice(
      draft.transportType || 'Flight',
      draft.roomType || 'AC Room',
      draft.busType || 'AC Train'
    )

    navigation.navigate('Payment', {
      packageName: draft.selectedPackage?.title ?? 'Sacred Yatra',
      totalAmount: `₹${pricing.amount.toLocaleString('en-IN')}`,
    })
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="chevron-back" size={20} color={COLORS.primaryDark} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.headerEyebrow}>Verification</Text>
          <Text style={styles.headerTitle}>Upload Documents</Text>
        </View>
        <View style={styles.headerBadge}>
          <MaterialIcons name="verified-user" size={14} color={COLORS.primaryDark} />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        <Text style={styles.sectionTitle}>Verification Requirements</Text>
        <Text style={styles.sectionSubtitle}>
          Ashram security requires a valid Aadhaar number and front photo, plus a verification selfie.
        </Text>

        <View style={styles.inputBlock}>
          <Text style={styles.fieldLabel}>Aadhaar Card Number</Text>
          <TextInput
            value={draft.aadhaarNumber}
            onChangeText={(text) => draft.updateField('aadhaarNumber', text)}
            placeholder="12-digit Aadhaar number"
            placeholderTextColor={COLORS.softText}
            keyboardType="number-pad"
            maxLength={12}
            style={styles.input}
          />
        </View>

        {/* Aadhaar Upload Card */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View>
              <Text style={styles.groupLabel}>Aadhaar Card Photo</Text>
              <Text style={styles.documentHint}>Provide front photo or capture from camera.</Text>
            </View>
            <Ionicons name="card-outline" size={20} color={COLORS.primary} />
          </View>

          {draft.aadhaarPhotoUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: draft.aadhaarPhotoUri }} style={styles.documentPreview} contentFit="cover" />
              {aadhaarProgress < 100 && (
                <View style={styles.progressOverlay}>
                  <Text style={styles.progressText}>Uploading {aadhaarProgress}%</Text>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${aadhaarProgress}%` }]} />
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Pressable style={styles.documentPlaceholder} onPress={() => setShowAadhaarModal(true)}>
              <Ionicons name="cloud-upload-outline" size={28} color={COLORS.softText} />
              <Text style={styles.documentPlaceholderText}>Tap to add Aadhaar image</Text>
            </Pressable>
          )}

          <Text style={styles.documentFileName}>{draft.aadhaarPhotoLabel || 'No file selected'}</Text>
          <View style={styles.documentActions}>
            <TouchableOpacity style={styles.documentAction} onPress={() => setShowAadhaarModal(true)}>
              <Text style={styles.documentActionText}>
                {draft.aadhaarPhotoUri ? 'Change Photo' : 'Upload Photo'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Selfie Upload Card */}
        <View style={styles.documentCard}>
          <View style={styles.documentHeader}>
            <View>
              <Text style={styles.groupLabel}>Traveler Verification Selfie</Text>
              <Text style={styles.documentHint}>A clear, well-lit face portrait.</Text>
            </View>
            <Ionicons name="camera-outline" size={20} color={COLORS.primary} />
          </View>

          {draft.selfiePhotoUri ? (
            <View style={styles.previewContainer}>
              <Image source={{ uri: draft.selfiePhotoUri }} style={styles.documentPreview} contentFit="cover" />
              {selfieProgress < 100 && (
                <View style={styles.progressOverlay}>
                  <Text style={styles.progressText}>Uploading {selfieProgress}%</Text>
                  <View style={styles.progressBarTrack}>
                    <View style={[styles.progressBarFill, { width: `${selfieProgress}%` }]} />
                  </View>
                </View>
              )}
            </View>
          ) : (
            <Pressable style={styles.documentPlaceholder} onPress={() => setShowSelfieModal(true)}>
              <Ionicons name="cloud-upload-outline" size={28} color={COLORS.softText} />
              <Text style={styles.documentPlaceholderText}>Tap to capture/upload selfie</Text>
            </Pressable>
          )}

          <Text style={styles.documentFileName}>{draft.selfiePhotoLabel || 'No file selected'}</Text>
          <View style={styles.documentActions}>
            <TouchableOpacity style={styles.documentAction} onPress={() => setShowSelfieModal(true)}>
              <Text style={styles.documentActionText}>
                {draft.selfiePhotoUri ? 'Retake Selfie' : 'Capture Selfie'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={styles.primaryButton} onPress={handleContinue}>
          <View style={styles.buttonGradient}>
            <Text style={styles.primaryButtonText}>Continue to Payment</Text>
            <Ionicons name="arrow-forward" size={16} color="#fff" />
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* Modals */}
      <Modal transparent animationType="fade" visible={showAadhaarModal} onRequestClose={() => setShowAadhaarModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowAadhaarModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Add Aadhaar Photo</Text>
            <Text style={styles.modalText}>Capture with device camera or choose from library.</Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalOption} onPress={() => handlePickImage('aadhaar', 'camera')}>
                <Text style={styles.modalOptionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => handlePickImage('aadhaar', 'gallery')}>
                <Text style={styles.modalOptionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent animationType="fade" visible={showSelfieModal} onRequestClose={() => setShowSelfieModal(false)}>
        <Pressable style={styles.modalBackdrop} onPress={() => setShowSelfieModal(false)}>
          <Pressable style={styles.modalCard} onPress={() => undefined}>
            <Text style={styles.modalTitle}>Take Selfie for Ashram Verification</Text>
            <Text style={styles.modalText}>Capture fresh portrait or select gallery image.</Text>
            <View style={styles.modalActionRow}>
              <TouchableOpacity style={styles.modalOption} onPress={() => handlePickImage('selfie', 'camera')}>
                <Text style={styles.modalOptionText}>Camera</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalOption} onPress={() => handlePickImage('selfie', 'gallery')}>
                <Text style={styles.modalOptionText}>Gallery</Text>
              </TouchableOpacity>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.line,
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
  content: {
    padding: 18,
    paddingBottom: 40,
    gap: 16,
  },
  sectionTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '900',
  },
  sectionSubtitle: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 4,
  },
  inputBlock: {
    gap: 8,
    marginBottom: 12,
  },
  fieldLabel: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: '800',
  },
  input: {
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: COLORS.text,
  },
  documentCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
    gap: 12,
  },
  documentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  groupLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '800',
  },
  documentHint: {
    color: COLORS.muted,
    fontSize: 12,
    marginTop: 2,
  },
  documentPlaceholder: {
    height: 120,
    backgroundColor: COLORS.ivory,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  documentPlaceholderText: {
    color: COLORS.softText,
    fontSize: 13,
    fontWeight: '700',
  },
  previewContainer: {
    height: 140,
    borderRadius: 14,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  documentPreview: {
    width: '100%',
    height: '100%',
    opacity: 0.8,
  },
  progressOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    gap: 10,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  progressBarTrack: {
    height: 6,
    width: '100%',
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: COLORS.primaryLight,
  },
  documentFileName: {
    color: COLORS.text,
    fontSize: 12,
    fontWeight: '600',
  },
  documentActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  documentAction: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: COLORS.chip,
  },
  documentActionText: {
    color: COLORS.primaryDark,
    fontSize: 13,
    fontWeight: '800',
  },
  primaryButton: {
    marginTop: 10,
    borderRadius: 999,
    overflow: 'hidden',
    shadowColor: COLORS.primary,
    shadowOpacity: 0.28,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  buttonGradient: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 18,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '900',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(27,28,25,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalText: {
    color: COLORS.muted,
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 20,
  },
  modalActionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  modalOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: COLORS.chip,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modalOptionText: {
    color: COLORS.primaryDark,
    fontSize: 15,
    fontWeight: '700',
  },
})
