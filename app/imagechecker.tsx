import React, { useState, useEffect } from 'react';
import {
  Alert,
  Dimensions,
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from 'react-native-paper';
import {
  BorderRadius,
  Spacing,
  FontSize,
  FontWeight,
  Shadow,
  currentColors,
} from '@/constants/theme';
import { db } from '@/services/firebase';
import { collection, addDoc, serverTimestamp, query, getDocs, orderBy } from 'firebase/firestore';

const { width } = Dimensions.get('window');

interface Pet {
  id: string;
  name: string;
  species?: string;
}

interface ScanRecord {
  id: string;
  imageUri: string;
  petId?: string;
  petName?: string;
  scannedAt: any;
  status: string;
}

const ImageChecker = () => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedPet, setSelectedPet] = useState<Pet | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [scanHistory, setScanHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const theme = useTheme();

  const getUserId = async (): Promise<string | null> => {
    try {
      const storedUid = await AsyncStorage.getItem('userId');
      return storedUid;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  };

  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to scan pet images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs storage access to select images.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
      } catch (err) {
        console.warn(err);
      }
    }

    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'Please grant camera and photo library permissions to use the image scanner.'
      );
    }
  };

  const fetchPets = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const petsRef = collection(db, 'users', userId, 'pets');
      const snapshot = await getDocs(petsRef);
      const petsList: Pet[] = [];
      snapshot.forEach((doc) => {
        petsList.push({ id: doc.id, ...doc.data() } as Pet);
      });
      setPets(petsList);
    } catch (error) {
      console.error('Error fetching pets:', error);
    }
  };

  const fetchScanHistory = async () => {
    try {
      const userId = await getUserId();
      if (!userId) return;

      const scansRef = collection(db, 'users', userId, 'imageScans');
      const q = query(scansRef, orderBy('scannedAt', 'desc'));
      const snapshot = await getDocs(q);
      const scans: ScanRecord[] = [];
      
      snapshot.forEach((doc) => {
        scans.push({ id: doc.id, ...doc.data() } as ScanRecord);
      });
      setScanHistory(scans.slice(0, 10));
    } catch (error) {
      console.error('Error fetching scan history:', error);
    }
  };

  useEffect(() => {
    requestPermissions();
    fetchPets();
    fetchScanHistory();
  }, []);

  const pickImageFromCamera = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from camera:', error);
      Alert.alert('Error', 'Failed to take photo. Please try again.');
    }
  };

  const pickImageFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setSelectedImage(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error picking image from gallery:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleScan = async () => {
    if (!selectedImage) {
      Alert.alert('No Image', 'Please select an image first.');
      return;
    }

    setLoading(true);
    try {
      const userId = await getUserId();
      if (!userId) {
        Alert.alert('Error', 'User not authenticated.');
        return;
      }

      const scansRef = collection(db, 'users', userId, 'imageScans');
      await addDoc(scansRef, {
        imageUri: selectedImage,
        petId: selectedPet?.id || null,
        petName: selectedPet?.name || null,
        scannedAt: serverTimestamp(),
        status: 'pending',
      });

      Alert.alert(
        'Image Saved',
        'Your image has been saved for analysis. Results will be available soon.',
        [
          { text: 'OK', onPress: () => {
            setSelectedImage(null);
            setSelectedPet(null);
            fetchScanHistory();
          }}
        ]
      );
    } catch (error) {
      console.error('Error saving scan:', error);
      Alert.alert('Error', 'Failed to save scan. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setSelectedPet(null);
  };

  const handleSelectPet = (pet: Pet | null) => {
    setSelectedPet(pet);
    setShowPetSelector(false);
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return 'Just now';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={currentColors.background}
      />
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: currentColors.text }]}>
            Image Scanner
          </Text>
          <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>
            Upload a photo of your pet for health analysis
          </Text>
        </View>

        {!selectedImage ? (
          <View style={styles.uploadSection}>
            <TouchableOpacity
              style={[styles.uploadArea, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}
              onPress={pickImageFromCamera}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${currentColors.primary}15` }]}>
                <MaterialCommunityIcons
                  name="camera"
                  size={48}
                  color={currentColors.primary}
                />
              </View>
              <Text style={[styles.uploadTitle, { color: currentColors.text }]}>
                Take Photo
              </Text>
              <Text style={[styles.uploadDesc, { color: currentColors.textSecondary }]}>
                Use your camera to capture a photo
              </Text>
            </TouchableOpacity>

            <View style={styles.orContainer}>
              <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
              <Text style={[styles.orText, { color: currentColors.textTertiary }]}>OR</Text>
              <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
            </View>

            <TouchableOpacity
              style={[styles.uploadArea, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}
              onPress={pickImageFromGallery}
              activeOpacity={0.7}
            >
              <View style={[styles.iconCircle, { backgroundColor: `${currentColors.secondary}15` }]}>
                <MaterialCommunityIcons
                  name="image"
                  size={48}
                  color={currentColors.secondary}
                />
              </View>
              <Text style={[styles.uploadTitle, { color: currentColors.text }]}>
                Choose from Gallery
              </Text>
              <Text style={[styles.uploadDesc, { color: currentColors.textSecondary }]}>
                Select an existing photo
              </Text>
            </TouchableOpacity>

            <View style={styles.tipsContainer}>
              <MaterialCommunityIcons
                name="lightbulb-outline"
                size={20}
                color={currentColors.accent}
              />
              <Text style={[styles.tipsText, { color: currentColors.textSecondary }]}>
                For best results, use good lighting and capture a clear image of your pet&apos;s affected area
              </Text>
            </View>
          </View>
        ) : (
          <View style={styles.previewSection}>
            <View style={[styles.imageContainer, { backgroundColor: currentColors.surface }]}>
              <Image
                source={{ uri: selectedImage }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: currentColors.surface }]}
                onPress={clearImage}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="close-circle"
                  size={32}
                  color={currentColors.error}
                />
              </TouchableOpacity>
            </View>

            <View style={styles.controlsSection}>
              <TouchableOpacity
                style={[styles.petSelector, { backgroundColor: currentColors.surface, borderColor: currentColors.border }]}
                onPress={() => setShowPetSelector(true)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="paw"
                  size={24}
                  color={currentColors.primary}
                />
                <Text style={[styles.petSelectorText, { color: currentColors.text }]}>
                  {selectedPet ? selectedPet.name : 'Select Pet (Optional)'}
                </Text>
                <MaterialCommunityIcons
                  name="chevron-down"
                  size={24}
                  color={currentColors.textTertiary}
                />
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.scanButton,
                  { backgroundColor: loading ? currentColors.textTertiary : currentColors.primary },
                ]}
                onPress={handleScan}
                disabled={loading}
                activeOpacity={0.8}
              >
                {loading ? (
                  <Text style={styles.scanButtonText}>Saving...</Text>
                ) : (
                  <>
                    <MaterialCommunityIcons
                      name="magnify"
                      size={24}
                      color={currentColors.white}
                    />
                    <Text style={styles.scanButtonText}>Save Image</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {scanHistory.length > 0 && (
          <View style={styles.historySection}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Recent Scans
            </Text>
            {scanHistory.map((scan) => (
              <TouchableOpacity
                key={scan.id}
                style={[styles.historyCard, { backgroundColor: currentColors.surface }]}
                activeOpacity={0.7}
              >
                <Image
                  source={{ uri: scan.imageUri }}
                  style={styles.historyImage}
                  resizeMode="cover"
                />
                <View style={styles.historyInfo}>
                  <Text style={[styles.historyPetName, { color: currentColors.text }]}>
                    {scan.petName || 'Unknown Pet'}
                  </Text>
                  <Text style={[styles.historyDate, { color: currentColors.textSecondary }]}>
                    {formatDate(scan.scannedAt)}
                  </Text>
                  <View style={[styles.statusBadge, {
                    backgroundColor: scan.status === 'completed' 
                      ? `${currentColors.success}20` 
                      : `${currentColors.warning}20`
                  }]}>
                    <Text style={[styles.statusText, {
                      color: scan.status === 'completed' 
                        ? currentColors.success 
                        : currentColors.warning
                    }]}>
                      {scan.status === 'completed' ? 'Analyzed' : 'Pending'}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>

      {showPetSelector && (
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowPetSelector(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: currentColors.surface }]}>
            <Text style={[styles.modalTitle, { color: currentColors.text }]}>
              Select Pet
            </Text>
            <TouchableOpacity
              style={[styles.petOption, { borderColor: currentColors.border }]}
              onPress={() => handleSelectPet(null)}
              activeOpacity={0.7}
            >
              <MaterialCommunityIcons
                name="paw-off"
                size={24}
                color={currentColors.textTertiary}
              />
              <Text style={[styles.petOptionText, { color: currentColors.text }]}>
                No specific pet
              </Text>
            </TouchableOpacity>
            {pets.map((pet) => (
              <TouchableOpacity
                key={pet.id}
                style={[styles.petOption, { borderColor: currentColors.border }]}
                onPress={() => handleSelectPet(pet)}
                activeOpacity={0.7}
              >
                <MaterialCommunityIcons
                  name="paw"
                  size={24}
                  color={currentColors.primary}
                />
                <Text style={[styles.petOptionText, { color: currentColors.text }]}>
                  {pet.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: currentColors.border }]}
              onPress={() => setShowPetSelector(false)}
              activeOpacity={0.7}
            >
              <Text style={[styles.cancelButtonText, { color: currentColors.error }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.lg,
    paddingBottom: 120,
  },
  header: {
    marginBottom: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
  },
  uploadSection: {
    gap: Spacing.md,
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xl,
    alignItems: 'center',
    ...Shadow.sm,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  uploadTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  uploadDesc: {
    fontSize: FontSize.sm,
    textAlign: 'center',
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.sm,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  orText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  tipsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  tipsText: {
    flex: 1,
    fontSize: FontSize.sm,
    lineHeight: 20,
  },
  previewSection: {
    gap: Spacing.md,
  },
  imageContainer: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    ...Shadow.md,
  },
  previewImage: {
    width: '100%',
    height: width - Spacing.md * 4,
    borderRadius: BorderRadius.lg,
  },
  clearButton: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    borderRadius: BorderRadius.full,
    ...Shadow.sm,
  },
  controlsSection: {
    gap: Spacing.md,
  },
  petSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    gap: Spacing.sm,
    ...Shadow.sm,
  },
  petSelectorText: {
    flex: 1,
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  scanButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.sm,
    ...Shadow.md,
  },
  scanButtonText: {
    color: currentColors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  historySection: {
    marginTop: Spacing.xl,
    gap: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.xs,
  },
  historyCard: {
    flexDirection: 'row',
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  historyImage: {
    width: 80,
    height: 80,
  },
  historyInfo: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'center',
    gap: Spacing.xs,
  },
  historyPetName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  historyDate: {
    fontSize: FontSize.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  statusText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: currentColors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    ...Shadow.xl,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
    gap: Spacing.md,
  },
  petOptionText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  cancelButton: {
    marginTop: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});

export default ImageChecker;
