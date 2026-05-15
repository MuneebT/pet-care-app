import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Switch,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { auth, db } from '@/services/firebase';
import { uploadToCloudinary } from '@/services/cloudinary';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Colors, Spacing, BorderRadius, FontSize, FontWeight, ThemeName, currentColors } from '@/constants/theme';
import { resetTipsShownForSession } from '@/components/DailyTipsDialog';
import * as ImagePicker from 'expo-image-picker';

const themeOptions: { name: ThemeName; color: string; label: string }[] = [
  { name: 'blue', color: '#3B82F6', label: 'Blue' },
  { name: 'green', color: '#10B981', label: 'Green' },
  { name: 'purple', color: '#8B5CF6', label: 'Purple' },
];

interface VetData {
  name: string;
  email: string;
  specialization: string;
  clinicName: string;
  clinicAddress: string;
}

export default function VetSettings() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [userData, setUserData] = useState<VetData | null>(null);
  const [notifications, setNotifications] = useState(true);
  
  const [name, setName] = useState('');
  const [profileImage, setProfileImage] = useState('');
  const [email, setEmail] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [clinicAddress, setClinicAddress] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [selectedTheme, setSelectedTheme] = useState<ThemeName>('blue');
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        router.replace('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userDataVal = userDoc.data() as VetData & { theme?: ThemeName; profileImage?: string };
        setUserData(userDataVal as VetData);
        setName(userDataVal.name || '');
        setEmail(userDataVal.email || '');
        if (userDataVal.profileImage) setProfileImage(userDataVal.profileImage);
        if (userDataVal.theme && ['blue', 'green', 'purple'].includes(userDataVal.theme)) {
          setSelectedTheme(userDataVal.theme);
        }
      }

      const vetDoc = await getDoc(doc(db, 'vets', user.uid));
      if (vetDoc.exists()) {
        const vetDataVal = vetDoc.data();
        setSpecialization(vetDataVal.specialization || '');
        setClinicName(vetDataVal.clinicName || '');
        setClinicAddress(vetDataVal.clinicAddress || '');
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChangeProfilePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setImageUploading(true);
    try {
      const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri);
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { profileImage: cloudinaryUrl });
        setProfileImage(cloudinaryUrl);
      }
      Alert.alert('Success', 'Profile photo updated');
    } catch (error) {
      console.error('Error uploading profile image:', error);
      Alert.alert('Error', 'Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!name.trim()) {
      Alert.alert('Error', 'Name cannot be empty');
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      await updateDoc(doc(db, 'users', user.uid), {
        name: name.trim(),
      });

      await updateDoc(doc(db, 'vets', user.uid), {
        name: name.trim(),
        specialization: specialization.trim(),
        clinicName: clinicName.trim(),
        clinicAddress: clinicAddress.trim(),
      });

      if (email !== userData?.email) {
        await updateEmail(user, email.trim());
        await updateDoc(doc(db, 'users', user.uid), {
          email: email.trim(),
        });
      }

      Alert.alert('Success', 'Profile updated successfully');
      setShowEditModal(false);
      loadUserData();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      if (error.code === 'auth/requires-recent-login') {
        Alert.alert('Error', 'Please log in again to update your email');
      } else {
        Alert.alert('Error', 'Failed to update profile');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (!currentPassword.trim()) {
      Alert.alert('Error', 'Please enter your current password');
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    setSaving(true);
    try {
      const user = auth.currentUser;
      if (!user || !user.email) {
        Alert.alert('Error', 'User not found');
        return;
      }

      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);

      Alert.alert('Success', 'Password changed successfully');
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error: any) {
      console.error('Error changing password:', error);
      if (error.code === 'auth/wrong-password') {
        Alert.alert('Error', 'Current password is incorrect');
      } else {
        Alert.alert('Error', 'Failed to change password');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleThemeChange = async (theme: ThemeName) => {
    setSelectedTheme(theme);
    try {
      const user = auth.currentUser;
      if (user) {
        await updateDoc(doc(db, 'users', user.uid), { theme });
      }
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('@app_theme', theme);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <MaterialCommunityIcons name="arrow-left" size={24} color={currentColors.text} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <View style={styles.avatarSection}>
          <TouchableOpacity onPress={handleChangeProfilePhoto} disabled={imageUploading} style={styles.avatarWrapper}>
            {imageUploading ? (
              <View style={[styles.avatar, { backgroundColor: currentColors.surfaceVariant }]}>
                <ActivityIndicator size="large" color={currentColors.primary} />
              </View>
            ) : profileImage ? (
              <Image source={{ uri: profileImage }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, { backgroundColor: currentColors.surfaceVariant }]}>
                <MaterialCommunityIcons name="account" size={48} color={currentColors.textSecondary} />
              </View>
            )}
            <View style={styles.avatarBadge}>
              <MaterialCommunityIcons name="camera" size={16} color="#FFF" />
            </View>
          </TouchableOpacity>
          <Text style={styles.avatarName}>{userData?.name}</Text>
          <Text style={styles.avatarEmail}>{userData?.email}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={[styles.card, { backgroundColor: currentColors.surface }]}>
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>Name</Text>
                <Text style={styles.value}>{userData?.name}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(true)}>
                <MaterialCommunityIcons name="pencil" size={20} color={currentColors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.value}>{userData?.email}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(true)}>
                <MaterialCommunityIcons name="pencil" size={20} color={currentColors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>Specialization</Text>
                <Text style={styles.value}>{specialization || 'Not set'}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(true)}>
                <MaterialCommunityIcons name="pencil" size={20} color={currentColors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>Clinic Name</Text>
                <Text style={styles.value}>{clinicName || 'Not set'}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(true)}>
                <MaterialCommunityIcons name="pencil" size={20} color={currentColors.primary} />
              </TouchableOpacity>
            </View>
            <View style={[styles.divider, { backgroundColor: currentColors.border }]} />
            <View style={styles.infoRow}>
              <View>
                <Text style={styles.label}>Clinic Address</Text>
                <Text style={styles.value}>{clinicAddress || 'Not set'}</Text>
              </View>
              <TouchableOpacity onPress={() => setShowEditModal(true)}>
                <MaterialCommunityIcons name="pencil" size={20} color={currentColors.primary} />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Security</Text>
          <TouchableOpacity
            style={[styles.card, { backgroundColor: currentColors.surface }]}
            onPress={() => setShowPasswordModal(true)}
          >
            <View style={styles.menuRow}>
              <MaterialCommunityIcons name="lock-outline" size={24} color={currentColors.text} />
              <Text style={styles.menuText}>Change Password</Text>
              <MaterialCommunityIcons name="chevron-right" size={24} color={currentColors.textTertiary} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <View style={[styles.card, { backgroundColor: currentColors.surface }]}>
            <Text style={styles.label}>Theme Color</Text>
            <View style={styles.themeOptions}>
              {themeOptions.map((theme) => (
                <TouchableOpacity
                  key={theme.name}
                  style={[
                    styles.themeOption,
                    { backgroundColor: theme.color },
                    selectedTheme === theme.name && styles.themeOptionSelected,
                  ]}
                  onPress={() => handleThemeChange(theme.name)}
                >
                  {selectedTheme === theme.name && (
                    <MaterialCommunityIcons name="check" size={20} color="#fff" />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={[styles.card, { backgroundColor: currentColors.surface }]}>
            <View style={styles.menuRow}>
              <MaterialCommunityIcons name="bell-outline" size={24} color={currentColors.text} />
              <Text style={styles.menuText}>Push Notifications</Text>
              <Switch
                value={notifications}
                onValueChange={setNotifications}
                trackColor={{ false: currentColors.border, true: currentColors.primaryLight }}
                thumbColor={notifications ? currentColors.primary : '#f4f3f4'}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.logoutButton, { backgroundColor: currentColors.error }]}
          onPress={() => {
            Alert.alert('Logout', 'Are you sure you want to logout?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                  await resetTipsShownForSession();
                  await auth.signOut();
                  router.replace('/login');
                },
              },
            ]);
          }}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#fff" />
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {showEditModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.surface }]}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentColors.surfaceVariant, color: currentColors.text, borderColor: currentColors.border }]}
              placeholder="Name"
              placeholderTextColor={currentColors.textTertiary}
              value={name}
              onChangeText={setName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: currentColors.surfaceVariant, color: currentColors.text, borderColor: currentColors.border }]}
              placeholder="Email"
              placeholderTextColor={currentColors.textTertiary}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <TextInput
              style={[styles.input, { backgroundColor: currentColors.surfaceVariant, color: currentColors.text, borderColor: currentColors.border }]}
              placeholder="Specialization"
              placeholderTextColor={currentColors.textTertiary}
              value={specialization}
              onChangeText={setSpecialization}
            />
            <TextInput
              style={[styles.input, { backgroundColor: currentColors.surfaceVariant, color: currentColors.text, borderColor: currentColors.border }]}
              placeholder="Clinic Name"
              placeholderTextColor={currentColors.textTertiary}
              value={clinicName}
              onChangeText={setClinicName}
            />
            <TextInput
              style={[styles.input, { backgroundColor: currentColors.surfaceVariant, color: currentColors.text, borderColor: currentColors.border }]}
              placeholder="Clinic Address"
              placeholderTextColor={currentColors.textTertiary}
              value={clinicAddress}
              onChangeText={setClinicAddress}
              multiline
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.surfaceVariant }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.primary }]}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text style={styles.modalButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}

      {showPasswordModal && (
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: currentColors.surface }]}>
            <Text style={styles.modalTitle}>Change Password</Text>
            <TextInput
              style={[styles.input, { backgroundColor: currentColors.surfaceVariant, color: currentColors.text, borderColor: currentColors.border }]}
              placeholder="Current Password"
              placeholderTextColor={currentColors.textTertiary}
              value={currentPassword}
              onChangeText={setCurrentPassword}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { backgroundColor: currentColors.surfaceVariant, color: currentColors.text, borderColor: currentColors.border }]}
              placeholder="New Password"
              placeholderTextColor={currentColors.textTertiary}
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry
            />
            <TextInput
              style={[styles.input, { backgroundColor: currentColors.surfaceVariant, color: currentColors.text, borderColor: currentColors.border }]}
              placeholder="Confirm New Password"
              placeholderTextColor={currentColors.textTertiary}
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.surfaceVariant }]}
                onPress={() => {
                  setShowPasswordModal(false);
                  setCurrentPassword('');
                  setNewPassword('');
                  setConfirmPassword('');
                }}
              >
                <Text style={[styles.modalButtonText, { color: currentColors.text }]}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: currentColors.primary }]}
                onPress={handleChangePassword}
                disabled={saving}
              >
                <Text style={styles.modalButtonText}>Change</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: FontSize.md,
    color: currentColors.textSecondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  backButton: {
    padding: Spacing.xs,
  },
  headerTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  placeholder: {
    width: 40,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: Spacing.lg,
  },
  avatarWrapper: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
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
    borderColor: currentColors.background,
  },
  avatarName: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  avatarEmail: {
    fontSize: FontSize.md,
    color: currentColors.textSecondary,
    marginTop: 2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: currentColors.textSecondary,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  card: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
  },
  label: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    marginBottom: 2,
  },
  value: {
    fontSize: FontSize.md,
    color: currentColors.text,
    fontWeight: FontWeight.medium,
  },
  divider: {
    height: 1,
    marginVertical: Spacing.sm,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuText: {
    flex: 1,
    fontSize: FontSize.md,
    color: currentColors.text,
    marginLeft: Spacing.md,
  },
  themeOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: Spacing.md,
  },
  themeOption: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
  },
  themeOptionSelected: {
    borderWidth: 3,
    borderColor: currentColors.text,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    gap: Spacing.sm,
  },
  logoutText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  bottomSpacing: {
    height: Spacing.xxl,
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
    maxHeight: '80%',
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    marginBottom: Spacing.md,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    gap: Spacing.md,
  },
  modalButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  modalButtonText: {
    color: '#fff',
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
});
