import { auth } from '@/services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from "expo-image-picker";
import { useRouter } from 'expo-router';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { ActivityIndicator, Switch, TextInput } from 'react-native-paper';
import { BorderRadius, Spacing, Shadow, FontSize, FontWeight, currentColors } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  headerTitle: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: currentColors.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    marginTop: 2,
  },
  progressCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '600',
    color: currentColors.text,
  },
  progressPercent: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.bold,
    color: currentColors.primary,
  },
  progressBar: {
    height: 8,
    backgroundColor: currentColors.border,
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: currentColors.primary,
    borderRadius: BorderRadius.full,
  },
  profileCard: {
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    alignItems: 'center',
    ...Shadow.md,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: currentColors.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: currentColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  profileHint: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
    overflow: 'hidden',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: currentColors.surfaceVariant,
    borderBottomWidth: 1,
    borderBottomColor: currentColors.border,
  },
  cardIconContainer: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: '#DCFCE7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  cardTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
  },
  cardContent: {
    padding: Spacing.md,
  },
  inputRow: {
    marginBottom: Spacing.md,
  },
  scheduleCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
    overflow: 'hidden',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: currentColors.border,
  },
  dayRowLast: {
    borderBottomWidth: 0,
  },
  dayInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dayName: {
    fontSize: 15,
    fontWeight: '500',
    color: currentColors.text,
    marginLeft: Spacing.sm,
  },
  dayTime: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm,
  },
  dayUnavailable: {
    fontSize: 13,
    color: currentColors.textTertiary,
    marginLeft: Spacing.sm,
    fontStyle: 'italic',
  },
  timeButton: {
    backgroundColor: currentColors.surfaceVariant,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    marginHorizontal: 2,
  },
  timeButtonText: {
    fontSize: 13,
    color: '#64748B',
  },
  uploadCard: {
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    ...Shadow.md,
    overflow: 'hidden',
  },
  uploadArea: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#E2E8F0',
    borderRadius: BorderRadius.md,
    padding: Spacing.xl,
    alignItems: 'center',
    margin: Spacing.md,
  },
  uploadIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  uploadText: {
    fontSize: 15,
    color: currentColors.textSecondary,
    textAlign: 'center',
    marginBottom: 4,
  },
  uploadHint: {
    fontSize: 13,
    color: currentColors.textTertiary,
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  documentIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.sm,
    backgroundColor: currentColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  documentInfo: {
    flex: 1,
  },
  documentName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: currentColors.text,
  },
  documentSize: {
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
  },
  submitButton: {
    marginTop: Spacing.md,
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.lg,
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    backgroundColor: currentColors.primary,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: currentColors.white,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Credentials = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState("");
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [degree, setDegree] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [document, setDocument] = useState<{ uri: string; name: string; mimeType: string; size?: number } | null>(null);

  const [schedule, setSchedule] = useState<Record<string, { enabled: boolean; start: string; end: string }>>(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { enabled: false, start: "09:00", end: "17:00" } }), {})
  );

  const [showStartPicker, setShowStartPicker] = useState<string | null>(null);
  const [showEndPicker, setShowEndPicker] = useState<string | null>(null);

  const calculateProgress = () => {
    const fields = [name, specialization, experience, clinicName, clinicAddress, degree, licenseNo, document];
    const filledFields = fields.filter(f => f && (typeof f === 'string' ? f.trim() !== '' : true));
    return Math.round((filledFields.length / fields.length) * 100);
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: false });
    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setDocument({ uri: file.uri, name: file.name ?? "Document", mimeType: file.mimeType ?? "", size: file.size });
    }
  };

  const formatTime = (time: string) => {
    if (!time) return "Set time";
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  const handleTimeChange = (day: string, field: 'start' | 'end', event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowStartPicker(null);
      setShowEndPicker(null);
    }
    if (date) {
      const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
      setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: time } }));
    }
  };

  const getCurrentTime = (day: string, field: 'start' | 'end') => {
    const time = schedule[day][field];
    const [hours, minutes] = time.split(':');
    const d = new Date();
    d.setHours(parseInt(hours), parseInt(minutes), 0, 0);
    return d;
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const currentUserUid = auth.currentUser?.uid;
      if (!currentUserUid) {
        Alert.alert("Error", "No authenticated user.");
        return;
      }

      const requiredFields = [
        { field: name, name: 'Full Name' },
        { field: specialization, name: 'Specialization' },
        { field: experience, name: 'Experience' },
        { field: clinicName, name: 'Clinic Name' },
        { field: clinicAddress, name: 'Clinic Address' },
        { field: degree, name: 'Degree' },
        { field: licenseNo, name: 'License Number' },
      ];

      const missingField = requiredFields.find(field => !field.field.toString().trim());
      if (missingField) {
        Alert.alert("Error", `Please fill in the ${missingField.name} field.`);
        return;
      }

      if (!document) {
        Alert.alert("Error", "Please upload your license document.");
        return;
      }

      const vetData = {
        name,
        specialization,
        experience: Number(experience),
        clinicName,
        clinicAddress,
        degree,
        licenseNo,
        schedule,
        documentUrl: document.uri,
        documentName: document.name,
        documentType: document.mimeType,
        imageUrl: image || null,
        userId: currentUserUid,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const db = getFirestore();
      await setDoc(doc(db, 'vets', currentUserUid), vetData, { merge: true });
      await AsyncStorage.setItem('@vet_credentials_filled', 'true');

      Alert.alert(
        "Success",
        "Your credentials have been submitted successfully!\n\nYour profile is under review. You'll be notified once approved.",
        [{ text: "OK", onPress: () => router.replace('/vets/home') }]
      );
    } catch (error: any) {
      console.error("Error saving vet credentials:", error);
      Alert.alert("Error", "Failed to save credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const progress = calculateProgress();

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === 'android' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.header}>
              <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
                <MaterialCommunityIcons name="arrow-left" size={24} color={currentColors.text} />
              </TouchableOpacity>
              <View style={styles.headerTitle}>
                <Text style={styles.title}>Complete Your Profile</Text>
                <Text style={styles.subtitle}>Help pet owners find you</Text>
              </View>
            </View>

            <View style={styles.progressCard}>
              <View style={styles.progressHeader}>
                <Text style={styles.progressText}>Profile Completion</Text>
                <Text style={styles.progressPercent}>{progress}%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progress}%` }]} />
              </View>
            </View>

            <View style={styles.profileCard}>
              <TouchableOpacity style={styles.profileImageContainer} onPress={pickImage}>
                <View style={styles.profileImage}>
                  {image ? (
                    <Image source={{ uri: image }} style={{ width: 120, height: 120, borderRadius: 60 }} />
                  ) : (
                    <MaterialCommunityIcons name="account" size={60} color={currentColors.textTertiary} />
                  )}
                </View>
                <View style={styles.cameraButton}>
                  <MaterialCommunityIcons name="camera" size={20} color={currentColors.white} />
                </View>
              </TouchableOpacity>
              <Text style={styles.profileHint}>Tap to add photo</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconContainer, { backgroundColor: '#DCFCE7' }]}>
                  <MaterialCommunityIcons name="account" size={20} color={currentColors.primary} />
                </View>
                <Text style={styles.cardTitle}>Personal Information</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.inputRow}>
                  <TextInput
                    label="Full Name"
                    value={name}
                    onChangeText={setName}
                    mode="outlined"
                    outlineColor={currentColors.border}
                    activeOutlineColor={currentColors.primary}
                    style={{ backgroundColor: currentColors.surface }}
                  />
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    label="Specialization"
                    value={specialization}
                    onChangeText={setSpecialization}
                    mode="outlined"
                    outlineColor={currentColors.border}
                    activeOutlineColor={currentColors.primary}
                    style={{ backgroundColor: currentColors.surface }}
                    placeholder="e.g., Small Animal Medicine"
                  />
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    label="Years of Experience"
                    value={experience}
                    onChangeText={setExperience}
                    mode="outlined"
                    outlineColor={currentColors.border}
                    activeOutlineColor={currentColors.primary}
                    keyboardType="numeric"
                    style={{ backgroundColor: currentColors.surface }}
                  />
                </View>
              </View>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconContainer, { backgroundColor: '#FEE2E2' }]}>
                  <MaterialCommunityIcons name="hospital-building" size={20} color={currentColors.error} />
                </View>
                <Text style={styles.cardTitle}>Clinic Details</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.inputRow}>
                  <TextInput
                    label="Clinic Name"
                    value={clinicName}
                    onChangeText={setClinicName}
                    mode="outlined"
                    outlineColor={currentColors.border}
                    activeOutlineColor={currentColors.primary}
                    style={{ backgroundColor: currentColors.surface }}
                  />
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    label="Clinic Address"
                    value={clinicAddress}
                    onChangeText={setClinicAddress}
                    mode="outlined"
                    outlineColor={currentColors.border}
                    activeOutlineColor={currentColors.primary}
                    style={{ backgroundColor: currentColors.surface }}
                    multiline
                    numberOfLines={2}
                  />
                </View>
              </View>
            </View>

            <View style={styles.scheduleCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconContainer, { backgroundColor: '#FEF3C7' }]}>
                  <MaterialCommunityIcons name="calendar-clock" size={20} color={currentColors.warning} />
                </View>
                <Text style={styles.cardTitle}>Weekly Schedule</Text>
              </View>
              {daysOfWeek.map((day, index) => (
                <View
                  key={day}
                  style={[
                    styles.dayRow,
                    index === daysOfWeek.length - 1 && styles.dayRowLast
                  ]}
                >
                  <Switch
                    value={schedule[day].enabled}
                    onValueChange={(enabled) => setSchedule(prev => ({
                      ...prev,
                      [day]: { ...prev[day], enabled }
                    }))}
                    color={currentColors.primary}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                  <View style={styles.dayInfo}>
                    <Text style={styles.dayName}>{day}</Text>
                    {schedule[day].enabled ? (
                      <View style={styles.dayTime}>
                        <TouchableOpacity
                          style={styles.timeButton}
                          onPress={() => setShowStartPicker(day)}
                        >
                          <Text style={styles.timeButtonText}>{formatTime(schedule[day].start)}</Text>
                        </TouchableOpacity>
                        <Text style={{ color: '#64748B', marginHorizontal: 4 }}>to</Text>
                        <TouchableOpacity
                          style={styles.timeButton}
                          onPress={() => setShowEndPicker(day)}
                        >
                          <Text style={styles.timeButtonText}>{formatTime(schedule[day].end)}</Text>
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <Text style={styles.dayUnavailable}>Unavailable</Text>
                    )}
                  </View>
                </View>
              ))}
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconContainer, { backgroundColor: '#EEF2FF' }]}>
                  <MaterialCommunityIcons name="certificate" size={20} color="#6366F1" />
                </View>
                <Text style={styles.cardTitle}>Professional Details</Text>
              </View>
              <View style={styles.cardContent}>
                <View style={styles.inputRow}>
                  <TextInput
                    label="Degree"
                    value={degree}
                    onChangeText={setDegree}
                    mode="outlined"
                    outlineColor={currentColors.border}
                    activeOutlineColor={currentColors.primary}
                    style={{ backgroundColor: currentColors.surface }}
                    placeholder="e.g., DVM, VMD"
                  />
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    label="License Number"
                    value={licenseNo}
                    onChangeText={setLicenseNo}
                    mode="outlined"
                    outlineColor={currentColors.border}
                    activeOutlineColor={currentColors.primary}
                    style={{ backgroundColor: currentColors.surface }}
                  />
                </View>
              </View>
            </View>

            <View style={styles.uploadCard}>
              <View style={styles.cardHeader}>
                <View style={[styles.cardIconContainer, { backgroundColor: '#FDF2F8' }]}>
                  <MaterialCommunityIcons name="file-document" size={20} color="#EC4899" />
                </View>
                <Text style={styles.cardTitle}>Upload License Certificate</Text>
              </View>
              <TouchableOpacity onPress={pickDocument} activeOpacity={0.7}>
                <View style={styles.uploadArea}>
                  <View style={styles.uploadIcon}>
                    <MaterialCommunityIcons name="cloud-upload" size={32} color={currentColors.textSecondary} />
                  </View>
                  <Text style={styles.uploadText}>Tap to upload your license document</Text>
                  <Text style={styles.uploadHint}>PDF, JPG, PNG up to 10MB</Text>
                </View>
              </TouchableOpacity>
              {document && (
                <View style={styles.documentPreview}>
                  <View style={styles.documentIcon}>
                    <MaterialCommunityIcons name="file-pdf-box" size={24} color={currentColors.white} />
                  </View>
                  <View style={styles.documentInfo}>
                    <Text style={styles.documentName} numberOfLines={1}>{document.name}</Text>
                    {document.size && (
                      <Text style={styles.documentSize}>
                        {(document.size / 1024 / 1024).toFixed(2)} MB
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => setDocument(null)}>
                    <MaterialCommunityIcons name="close-circle" size={24} color={currentColors.textTertiary} />
                  </TouchableOpacity>
                </View>
              )}
            </View>

            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
              disabled={isLoading}
            >
              <View style={styles.submitButtonContent}>
                {isLoading ? (
                  <ActivityIndicator color={currentColors.white} size="small" />
                ) : (
                  <>
                    <MaterialCommunityIcons name="check-circle" size={22} color={currentColors.white} />
                    <Text style={styles.submitButtonText}>Submit for Review</Text>
                  </>
                )}
              </View>
            </TouchableOpacity>

            <View style={styles.bottomSpacer} />
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      {showStartPicker && (
        <DateTimePicker
          value={getCurrentTime(showStartPicker, 'start')}
          mode="time"
          onChange={(e, d) => {
            setShowStartPicker(null);
            if (d) handleTimeChange(showStartPicker, 'start', e, d);
          }}
        />
      )}

      {showEndPicker && (
        <DateTimePicker
          value={getCurrentTime(showEndPicker, 'end')}
          mode="time"
          onChange={(e, d) => {
            setShowEndPicker(null);
            if (d) handleTimeChange(showEndPicker, 'end', e, d);
          }}
        />
      )}
    </View>
  );
};

export default Credentials;
