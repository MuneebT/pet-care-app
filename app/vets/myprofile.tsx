import { auth, db } from '@/services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { uploadToCloudinary } from '@/services/cloudinary';
import { useRouter } from 'expo-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Button, TextInput, Switch } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Spacing, Shadow, FontSize, FontWeight, currentColors } from '@/constants/theme';
import Skeleton from '@/components/ui/skeleton';
import * as ImagePicker from 'expo-image-picker';

type DayOfWeek =
  | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

interface DaySchedule {
  enabled: boolean;
  start: string;
  end: string;
}

type WeeklySchedule = Record<DayOfWeek, DaySchedule>;

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const defaultSchedule = (): WeeklySchedule => {
  const s = {} as WeeklySchedule;
  for (const day of DAYS) {
    s[day] = { enabled: day !== 'Saturday' && day !== 'Sunday', start: '09:00', end: '17:00' };
  }
  return s;
};

const formatTime = (time: string) => {
  if (!time) return 'Set time';
  const [h, m] = time.split(':');
  const hour = parseInt(h);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
};

const MyProfile = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);

  const [name, setName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [experience, setExperience] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddr, setClinicAddr] = useState('');
  const [degree, setDegree] = useState('');
  const [licenseNo, setLicenseNo] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [certificate, setCertificate] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [schedule, setSchedule] = useState<WeeklySchedule>(defaultSchedule());
  const [status, setStatus] = useState('');
  const [accessDenied, setAccessDenied] = useState(false);

  const [showPicker, setShowPicker] = useState(false);
  const [pickerDay, setPickerDay] = useState<DayOfWeek | null>(null);
  const [pickerType, setPickerType] = useState<'start' | 'end' | null>(null);

  const currentUserUid = auth.currentUser?.uid;

  const getVetData = async () => {
    try {
      if (!currentUserUid) { setLoading(false); return; }
      const ref = doc(db, 'vets', currentUserUid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        if (data.userId !== currentUserUid) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        setName(data.name ?? '');
        setSpecialization(data.specialization ?? '');
        setExperience(data.experience?.toString() ?? '');
        setClinicName(data.clinicName ?? '');
        setClinicAddr(data.clinicAddress ?? '');
        setDegree(data.degree ?? '');
        setLicenseNo(data.licenseNo ?? '');
        setImage(data.image || data.imageUrl || data.imageUri || data.photoURL || null);
        setCertificate(data.certificateUri ? { uri: data.certificateUri, name: data.certificateName || 'Certificate', mimeType: data.certificateType || '' } : null);
        if (data.schedule) setSchedule(data.schedule as WeeklySchedule);
        setStatus(data.status ?? '');
      } else {
        setAccessDenied(true);
      }
    } catch (err) {
      console.error('Error fetching vet data:', err);
      setAccessDenied(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVetData();
  }, []);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (result.canceled || !result.assets?.[0]) return;
    setImageUploading(true);
    try {
      const url = await uploadToCloudinary(result.assets[0].uri);
      if (url) {
        setImage(url);
        if (currentUserUid) await updateDoc(doc(db, 'vets', currentUserUid), { image: url });
      }
    } catch {
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: '*/*', multiple: false });
    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setCertificate({ uri: file.uri, name: file.name ?? 'Certificate', mimeType: file.mimeType ?? '' });
    }
  };

  const openTimePicker = (day: DayOfWeek, type: 'start' | 'end') => {
    setPickerDay(day);
    setPickerType(type);
    setShowPicker(true);
  };

  const onTimeSelected = (_: any, selectedDate?: Date) => {
    if (!selectedDate || !pickerDay || !pickerType) { setShowPicker(false); return; }
    const formatted = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    setSchedule(prev => ({
      ...prev,
      [pickerDay]: { ...prev[pickerDay], [pickerType]: formatted },
    }));
    setShowPicker(false);
  };

  const getCurrentTime = (day: DayOfWeek, field: 'start' | 'end') => {
    const time = schedule[day]?.[field] || '09:00';
    const [h, m] = time.split(':');
    const d = new Date();
    d.setHours(parseInt(h), parseInt(m), 0, 0);
    return d;
  };

  const handleSave = async () => {
    if (!name.trim()) { Alert.alert('Error', 'Name is required'); return; }
    if (!currentUserUid) return;
    setSaving(true);
    try {
      const vetData: Record<string, any> = {
        name: name.trim(),
        specialization: specialization.trim(),
        experience: experience ? Number(experience) : null,
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddr.trim(),
        degree: degree.trim(),
        licenseNo: licenseNo.trim(),
        schedule,
      };
      if (certificate) {
        vetData.certificateUri = certificate.uri;
        vetData.certificateName = certificate.name;
        vetData.certificateType = certificate.mimeType;
      }
      await updateDoc(doc(db, 'vets', currentUserUid), vetData);
      Alert.alert('Success', 'Profile updated successfully');
    } catch {
      Alert.alert('Error', 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: currentColors.background }}>
        <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg }}>
            <Skeleton width={40} height={40} borderRadius={BorderRadius.md} style={{ marginRight: Spacing.sm }} />
            <Skeleton width={140} height={24} borderRadius={8} />
          </View>
          <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
            <Skeleton width={110} height={110} borderRadius={55} />
            <Skeleton width={160} height={20} borderRadius={8} style={{ marginTop: Spacing.sm }} />
          </View>
          {[1, 2, 3, 4, 5].map(i => (
            <View key={i} style={{ marginBottom: Spacing.md }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.sm }}>
                <Skeleton width={32} height={32} borderRadius={BorderRadius.sm} style={{ marginRight: Spacing.sm }} />
                <Skeleton width={140} height={18} borderRadius={6} />
              </View>
              <View style={{ backgroundColor: currentColors.surface, borderRadius: BorderRadius.lg, padding: Spacing.md }}>
                <Skeleton width={340} height={48} borderRadius={8} />
                <Skeleton width={340} height={48} borderRadius={8} style={{ marginTop: Spacing.sm }} />
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (accessDenied) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: Spacing.lg, backgroundColor: currentColors.background }}>
        <View style={{ backgroundColor: currentColors.surface, padding: Spacing.lg, borderRadius: BorderRadius.lg, width: '90%', alignItems: 'center', ...Shadow.md }}>
          <MaterialCommunityIcons name="alert-circle" size={50} color={currentColors.error} />
          <Text style={{ fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: currentColors.error, marginVertical: Spacing.sm }}>Access Denied</Text>
          <Text style={{ textAlign: 'center', color: currentColors.textSecondary, fontSize: FontSize.md }}>Your account does not have permission to view this profile.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: currentColors.background }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingBottom: Spacing.xxl }} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <MaterialCommunityIcons name="arrow-left" size={24} color={currentColors.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>My Profile</Text>
            {status === 'pending' && (
              <View style={styles.statusBadge}>
                <MaterialCommunityIcons name="clock-outline" size={14} color={currentColors.white} />
                <Text style={styles.statusText}>Pending</Text>
              </View>
            )}
          </View>

          {/* Profile Image */}
          <View style={styles.profileCard}>
            <TouchableOpacity onPress={pickImage} disabled={imageUploading} style={styles.avatarWrapper}>
              {imageUploading ? (
                <View style={[styles.avatar, { backgroundColor: currentColors.surfaceVariant }]}>
                  <ActivityIndicator size="large" color={currentColors.primary} />
                </View>
              ) : image ? (
                <Image source={{ uri: image }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { backgroundColor: currentColors.surfaceVariant }]}>
                  <MaterialCommunityIcons name="account" size={48} color={currentColors.textSecondary} />
                </View>
              )}
              <View style={styles.avatarBadge}>
                <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
              </View>
            </TouchableOpacity>
            <Text style={styles.profileName}>{name || 'Your Name'}</Text>
            {specialization && <Text style={styles.profileSpecialization}>{specialization}</Text>}
          </View>

          {/* Personal Information */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#EEF2FF' }]}>
                <MaterialCommunityIcons name="account" size={20} color="#6366F1" />
              </View>
              <Text style={styles.sectionTitle}>Personal Information</Text>
            </View>
            <View style={[styles.card, { backgroundColor: currentColors.surface }]}>
              <TextInput label="Full Name" value={name} onChangeText={setName} mode="outlined" outlineColor={currentColors.border} activeOutlineColor={currentColors.primary} style={styles.input} />
              <TextInput label="Specialization" value={specialization} onChangeText={setSpecialization} mode="outlined" outlineColor={currentColors.border} activeOutlineColor={currentColors.primary} style={styles.input} placeholder="e.g., Small Animal Medicine" />
              <TextInput label="Years of Experience" value={experience} onChangeText={setExperience} mode="outlined" outlineColor={currentColors.border} activeOutlineColor={currentColors.primary} keyboardType="numeric" style={styles.input} />
            </View>
          </View>

          {/* Clinic Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FEE2E2' }]}>
                <MaterialCommunityIcons name="hospital-building" size={20} color={currentColors.error} />
              </View>
              <Text style={styles.sectionTitle}>Clinic Details</Text>
            </View>
            <View style={[styles.card, { backgroundColor: currentColors.surface }]}>
              <TextInput label="Clinic Name" value={clinicName} onChangeText={setClinicName} mode="outlined" outlineColor={currentColors.border} activeOutlineColor={currentColors.primary} style={styles.input} />
              <TextInput label="Clinic Address" value={clinicAddr} onChangeText={setClinicAddr} mode="outlined" outlineColor={currentColors.border} activeOutlineColor={currentColors.primary} style={styles.input} multiline numberOfLines={2} />
            </View>
          </View>

          {/* Weekly Schedule */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FEF3C7' }]}>
                <MaterialCommunityIcons name="calendar-clock" size={20} color={currentColors.warning} />
              </View>
              <Text style={styles.sectionTitle}>Weekly Schedule</Text>
            </View>
            <View style={[styles.card, { backgroundColor: currentColors.surface }]}>
              {DAYS.map((day) => (
                <View key={day} style={styles.dayRow}>
                  <Switch
                    value={schedule[day]?.enabled ?? false}
                    onValueChange={(enabled) => setSchedule(prev => ({ ...prev, [day]: { ...prev[day], enabled } }))}
                    color={currentColors.primary}
                    style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
                  />
                  <Text style={styles.dayName}>{day.substring(0, 3)}</Text>
                  <View style={{ flex: 1 }} />
                  {schedule[day]?.enabled ? (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <TouchableOpacity style={styles.timeChip} onPress={() => openTimePicker(day, 'start')}>
                        <Text style={styles.timeChipText}>{formatTime(schedule[day]?.start || '09:00')}</Text>
                      </TouchableOpacity>
                      <Text style={{ color: currentColors.textTertiary, marginHorizontal: 4 }}>to</Text>
                      <TouchableOpacity style={styles.timeChip} onPress={() => openTimePicker(day, 'end')}>
                        <Text style={styles.timeChipText}>{formatTime(schedule[day]?.end || '17:00')}</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <Text style={{ color: currentColors.textTertiary, fontStyle: 'italic' }}>Off</Text>
                  )}
                </View>
              ))}
            </View>
          </View>

          {/* Professional Details */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#DCFCE7' }]}>
                <MaterialCommunityIcons name="certificate" size={20} color={currentColors.success} />
              </View>
              <Text style={styles.sectionTitle}>Professional Details</Text>
            </View>
            <View style={[styles.card, { backgroundColor: currentColors.surface }]}>
              <TextInput label="Degree" value={degree} onChangeText={setDegree} mode="outlined" outlineColor={currentColors.border} activeOutlineColor={currentColors.primary} style={styles.input} placeholder="e.g., DVM, VMD" />
              <TextInput label="License Number" value={licenseNo} onChangeText={setLicenseNo} mode="outlined" outlineColor={currentColors.border} activeOutlineColor={currentColors.primary} style={styles.input} />
            </View>
          </View>

          {/* Certificate Upload */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <View style={[styles.sectionIcon, { backgroundColor: '#FDF2F8' }]}>
                <MaterialCommunityIcons name="file-document" size={20} color="#EC4899" />
              </View>
              <Text style={styles.sectionTitle}>License Certificate</Text>
            </View>
            <TouchableOpacity onPress={pickDocument} activeOpacity={0.7}>
              <View style={[styles.card, { backgroundColor: currentColors.surface, padding: Spacing.lg }]}>
                {certificate ? (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={[styles.docIcon, { backgroundColor: currentColors.primary }]}>
                      <MaterialCommunityIcons name="file-pdf-box" size={24} color={currentColors.white} />
                    </View>
                    <View style={{ flex: 1, marginLeft: Spacing.sm }}>
                      <Text style={{ color: currentColors.text, fontWeight: FontWeight.medium }} numberOfLines={1}>{certificate.name}</Text>
                      <Text style={{ color: currentColors.textSecondary, fontSize: FontSize.xs }}>Tap to change file</Text>
                    </View>
                    <MaterialCommunityIcons name="check-circle" size={24} color={currentColors.success} />
                  </View>
                ) : (
                  <View style={{ alignItems: 'center', paddingVertical: Spacing.sm }}>
                    <MaterialCommunityIcons name="cloud-upload" size={40} color={currentColors.textTertiary} />
                    <Text style={{ color: currentColors.textSecondary, marginTop: Spacing.sm }}>Tap to upload your license document</Text>
                    <Text style={{ color: currentColors.textTertiary, fontSize: FontSize.xs, marginTop: 4 }}>PDF, JPG, PNG</Text>
                  </View>
                )}
              </View>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <Button
            mode="contained"
            onPress={handleSave}
            loading={saving}
            disabled={saving}
            style={styles.saveButton}
            labelStyle={styles.saveButtonLabel}
            contentStyle={{ paddingVertical: Spacing.sm }}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Time Pickers */}
      {showPicker && pickerDay && pickerType && (
        <DateTimePicker value={getCurrentTime(pickerDay, pickerType)} mode="time" onChange={onTimeSelected} />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    gap: Spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: currentColors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.sm,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
    flex: 1,
  },
  statusBadge: {
    backgroundColor: currentColors.warning,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    color: currentColors.white,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.xs,
    marginLeft: 4,
  },
  profileCard: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.sm,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: currentColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: currentColors.surface,
    ...Shadow.sm,
  },
  profileName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  profileSpecialization: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: Spacing.md,
    paddingHorizontal: Spacing.md,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    marginLeft: Spacing.xs,
  },
  sectionIcon: {
    width: 32,
    height: 32,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    ...Shadow.md,
  },
  input: {
    marginBottom: Spacing.sm,
    backgroundColor: 'transparent',
  },
  dayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: currentColors.border,
  },
  dayName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: currentColors.text,
    width: 36,
  },
  timeChip: {
    backgroundColor: currentColors.surfaceVariant,
    paddingVertical: 4,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  timeChipText: {
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
  },
  docIcon: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButton: {
    marginHorizontal: Spacing.md,
    marginTop: Spacing.sm,
    borderRadius: BorderRadius.xl,
    ...Shadow.md,
  },
  saveButtonLabel: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});

export default MyProfile;