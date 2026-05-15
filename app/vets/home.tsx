import { auth, db } from '@/services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter, useFocusEffect } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Spacing, Shadow, FontSize, FontWeight, currentColors } from '@/constants/theme';
import Skeleton from '@/components/ui/skeleton';
import VetBottomNavigationBar from './bootomna';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good Morning';
  if (hour >= 12 && hour < 17) return 'Good Afternoon';
  if (hour >= 17 && hour < 21) return 'Good Evening';
  return 'Good Night';
};

const Home = () => {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [greeting] = useState(getGreeting());
  const [todayAppointments, setTodayAppointments] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);

  const menuItems = [
    {
      id: 'patients',
      title: 'My Patients',
      subtitle: 'View and manage patients',
      icon: 'account-group' as const,
      color: '#EEF2FF',
      iconBg: '#E0E7FF',
      accent: '#6366F1',
      onPress: () => router.push('/vets/mypatients'),
    },
    {
      id: 'appointments',
      title: 'Appointments',
      subtitle: 'Schedule and track visits',
      icon: 'calendar-clock' as const,
      color: '#F5F3FF',
      iconBg: '#EDE9FE',
      accent: '#8B5CF6',
      onPress: () => router.push('/vets/appointments'),
    },
    {
      id: 'health',
      title: 'Health Records',
      subtitle: 'Pet medical history',
      icon: 'file-document' as const,
      color: '#ECFDF5',
      iconBg: '#D1FAE5',
      accent: '#10B981',
      onPress: () => router.push('/vets/mypatients'),
    },
    {
      id: 'profile',
      title: 'My Profile',
      subtitle: 'Update your details',
      icon: 'account' as const,
      color: '#FFFBEB',
      iconBg: '#FEF3C7',
      accent: '#F59E0B',
      onPress: () => {
        const currentUserUid = auth.currentUser?.uid;
        if (currentUserUid) {
          router.push({ pathname: '/vets/myprofile', params: { uid: currentUserUid } });
        }
      },
    },
  ];

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    try {
      setLoading(true);
      const currentUserUid = auth.currentUser?.uid;
      if (!currentUserUid) {
        router.replace('/login');
        return;
      }

      const userDoc = await getDoc(doc(db, 'users', currentUserUid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setName(data.name || 'Veterinarian');
        if (data.profileImage) setProfileImage(data.profileImage);
      }

      const vetDoc = await getDoc(doc(db, 'vets', currentUserUid));
      if (!vetDoc.exists()) {
        router.replace('/vets/credentials');
        return;
      }

      if (vetDoc.exists()) {
        const vetData = vetDoc.data();
        if (vetData.image && !profileImage) setProfileImage(vetData.image);
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const appointmentsRef = collection(db, 'appointments');
      const appointmentsQuery = query(
        appointmentsRef,
        where('vetId', '==', currentUserUid),
        where('status', '==', 'confirmed')
      );
      const appointmentsSnap = await getDocs(appointmentsQuery);
      setTodayAppointments(appointmentsSnap.size);

      const patientsSet = new Set<string>();
      appointmentsSnap.forEach(doc => {
        const d = doc.data();
        if (d.petId) patientsSet.add(d.petId);
      });
      setTotalPatients(patientsSet.size);

    } catch (error) {
      console.error('Error loading vet data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { padding: Spacing.lg }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: Spacing.lg, paddingTop: Spacing.md }}>
          <Skeleton width={52} height={52} borderRadius={26} />
          <View style={{ marginLeft: Spacing.md, flex: 1 }}>
            <Skeleton width={80} height={12} borderRadius={6} />
            <Skeleton width={160} height={16} borderRadius={6} style={{ marginTop: 6 }} />
          </View>
        </View>
        <Skeleton width={width - Spacing.lg * 2} height={120} borderRadius={BorderRadius.xl} style={{ marginBottom: Spacing.lg }} />
        <View style={{ flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg }}>
          <Skeleton width={(Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2} height={100} borderRadius={BorderRadius.lg} />
          <Skeleton width={(Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2} height={100} borderRadius={BorderRadius.lg} />
        </View>
        <Skeleton width={120} height={18} borderRadius={6} style={{ marginBottom: Spacing.md }} />
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.md }}>
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} width={(Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2} height={140} borderRadius={BorderRadius.lg} />
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <View style={styles.profileSection}>
              <View style={styles.avatar}>
                {profileImage ? (
                  <Image source={{ uri: profileImage }} style={styles.avatarImage} resizeMode="cover" />
                ) : (
                  <MaterialCommunityIcons name="account" size={32} color="#94A3B8" />
                )}
              </View>
              <View>
                <Text style={styles.greeting}>{greeting},</Text>
                <Text style={styles.name}>{name || 'Veterinarian'}</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings/vet')}>
              <MaterialCommunityIcons name="cog-outline" size={26} color={currentColors.text} />
            </TouchableOpacity>
          </View>

          <View style={styles.heroCard}>
            <View style={styles.heroContent}>
              <Text style={styles.heroTitle}>Veterinarian Dashboard</Text>
              <Text style={styles.heroSubtitle}>Manage your patients, appointments, and health records all in one place.</Text>
            </View>
            <View style={styles.heroIconContainer}>
              <MaterialCommunityIcons name="stethoscope" size={48} color={currentColors.primary} />
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={[styles.statCard, { backgroundColor: '#EEF2FF' }]}>
              <MaterialCommunityIcons name="calendar-check" size={24} color="#6366F1" />
              <Text style={[styles.statNumber, { color: '#6366F1' }]}>{todayAppointments}</Text>
              <Text style={styles.statLabel}>Appointments</Text>
            </View>
            <View style={[styles.statCard, { backgroundColor: '#F5F3FF' }]}>
              <MaterialCommunityIcons name="account-group" size={24} color="#8B5CF6" />
              <Text style={[styles.statNumber, { color: '#8B5CF6' }]}>{totalPatients}</Text>
              <Text style={styles.statLabel}>Active Patients</Text>
            </View>
          </View>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <View style={styles.menuGrid}>
            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.menuItem}
                onPress={item.onPress}
                activeOpacity={0.7}
              >
                <View style={[styles.menuCard, { backgroundColor: item.color }]}>
                  <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
                    <MaterialCommunityIcons name={item.icon} size={26} color={item.accent} />
                  </View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                  <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </SafeAreaView>
      <VetBottomNavigationBar show={true} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  safeArea: {
    flex: 1,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: currentColors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    ...Shadow.md,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  greeting: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
  },
  name: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  heroCard: {
    flexDirection: 'row',
    backgroundColor: currentColors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  heroContent: {
    flex: 1,
    marginRight: Spacing.md,
  },
  heroTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: '#FFFFFF',
    marginBottom: Spacing.xs,
  },
  heroSubtitle: {
    fontSize: FontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: 20,
  },
  heroIconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.5,
  },
  statsRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
  },
  statCard: {
    flex: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    ...Shadow.md,
  },
  statNumber: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    marginTop: Spacing.xs,
  },
  statLabel: {
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
    marginTop: 2,
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.md,
  },
  menuItem: {
    width: (width - Spacing.lg * 2 - Spacing.md) / 2,
  },
  menuCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    minHeight: 140,
    ...Shadow.md,
  },
  menuIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  menuItemTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
  },
});

export default Home;
