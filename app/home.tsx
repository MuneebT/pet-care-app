import { db } from "@/services/firebase";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from "expo-router";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    Image,
    Platform,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Avatar, useTheme } from "react-native-paper";
import { Colors, BorderRadius, Spacing, FontSize, Shadow, FontWeight, currentColors } from '@/constants/theme';
import { useAppTheme } from '@/context/ThemeContext';

const { width } = Dimensions.get('window');

const Home = () => {
  const params = useLocalSearchParams();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const { colors: appColors } = useAppTheme();

  const getUid = async () => {
    if (params?.uid && typeof params.uid === 'string') {
      return params.uid;
    }
    
    try {
      const storedUid = await AsyncStorage.getItem('userId');
      if (storedUid) return storedUid;
    } catch (error) {
      console.error('Error getting UID from storage:', error);
    }
    
    return null;
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userId = await getUid();
        if (!userId) {
          console.log("No UID found, redirecting to login");
          router.replace("/login");
          return;
        }

        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || "Pet Parent");
          
          try {
            const userPetsRef = collection(db, "users", userId, "pets");
            await getDocs(userPetsRef);
          } catch (petsError) {
            console.error("Error accessing pets collection:", petsError);
          }
        } else {
          console.log("No user document found");
          try {
            await setDoc(doc(db, "users", userId), {
              name: "Pet Parent",
              createdAt: new Date().toISOString()
            });
            setName("Pet Parent");
          } catch (createUserError) {
            console.error("Error creating user document:", createUserError);
            Alert.alert("Error", "Failed to set up your account. Please try again.");
            return;
          }
        }
      } catch (error) {
        console.error("Error in fetchUserData:", error);
        Alert.alert("Error", "Failed to load user data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [params]);

  type AppRoute = 
    | '/mypets' 
    | '/symptomchecker' 
    | '/appointments' 
    | '/reminders' 
    | '/healthrecords' 
    | '/imagechecker'
    | '/vets/myprofile';

  const navigateTo = async (screen: AppRoute, params: Record<string, any> = {}) => {
    try {
      const userId = await getUid();
      if (!userId) {
        router.replace("/login");
        return;
      }
      router.push({
        pathname: screen,
        params: { uid: userId, ...params }
      });
    } catch (error) {
      console.error('Navigation error:', error);
      Alert.alert("Error", "Failed to navigate. Please try again.");
    }
  }

  const menuItems = [
    {
      title: "My Pets",
      icon: <MaterialIcons name="pets" size={28} color={currentColors.primary} />,
      onPress: () => navigateTo('/mypets' as AppRoute),
      color: '#EEF2FF',
      iconBg: '#E0E7FF'
    },
    {
      title: "Symptom Checker",
      icon: <MaterialIcons name="medical-services" size={28} color={currentColors.secondary} />,
      onPress: () => navigateTo('/symptomchecker' as AppRoute),
      color: '#ECFDF5',
      iconBg: '#D1FAE5'
    },
    {
      title: "Appointments",
      icon: <MaterialCommunityIcons name="calendar-clock" size={28} color="#8B5CF6" />,
      onPress: () => navigateTo('/appointments' as AppRoute),
      color: '#F5F3FF',
      iconBg: '#EDE9FE'
    },
    {
      title: "Reminders",
      icon: <MaterialIcons name="notifications" size={28} color={currentColors.accent} />,
      onPress: () => navigateTo('/reminders' as AppRoute),
      color: '#FFFBEB',
      iconBg: '#FEF3C7'
    },
    {
      title: "Health Records",
      icon: <MaterialIcons name="folder" size={28} color={currentColors.info} />,
      onPress: () => navigateTo('/healthrecords' as AppRoute),
      color: '#EFF6FF',
      iconBg: '#DBEAFE'
    },
    {
      title: "Image Scanner",
      icon: <MaterialIcons name="camera-alt" size={28} color="#EC4899" />,
      onPress: () => navigateTo('/imagechecker' as AppRoute),
      color: '#FDF2F8',
      iconBg: '#FCE7F3'
    }
  ];


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentColors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor={currentColors.background} />
      
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Good Morning,</Text>
            <Text style={styles.userName}>{name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/settings')}>
            <View style={styles.avatarContainer}>
              <Avatar.Icon 
                size={50} 
                icon="account" 
                style={styles.avatar} 
                color={currentColors.primary}
              />
              <View style={styles.avatarBadge}>
                <MaterialIcons name="notifications" size={12} color={currentColors.white} />
              </View>
            </View>
          </TouchableOpacity>
        </View>

        <View style={styles.welcomeCard}>
          <View style={styles.welcomeContent}>
            <Text style={styles.welcomeTitle}>Welcome to PetCare</Text>
            <Text style={styles.welcomeText}>
              Keep your furry friends healthy and happy
            </Text>
            <TouchableOpacity style={styles.welcomeButton}>
              <Text style={styles.welcomeButtonText}>View Pets</Text>
              <MaterialIcons name="arrow-forward" size={18} color={currentColors.white} />
            </TouchableOpacity>
          </View>
          <View style={styles.welcomeImageContainer}>
            <Image 
              source={require('../assets/images/paw.jpg')} 
              style={styles.welcomeImage}
            />
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
                {item.icon}
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reminderCard}>
            <View style={styles.reminderIconContainer}>
              <MaterialCommunityIcons name="needle" size={24} color={currentColors.primary} />
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Vaccination Due</Text>
              <Text style={styles.reminderText}>Annual vaccination for Max</Text>
              <Text style={styles.reminderTime}>Today, 2:00 PM</Text>
            </View>
            <View style={styles.reminderStatus}>
              <View style={styles.statusDot} />
            </View>
          </View>

          <View style={styles.reminderCard}>
            <View style={[styles.reminderIconContainer, { backgroundColor: '#ECFDF5' }]}>
              <MaterialCommunityIcons name="tooth" size={24} color={currentColors.secondary} />
            </View>
            <View style={styles.reminderContent}>
              <Text style={styles.reminderTitle}>Dental Checkup</Text>
              <Text style={styles.reminderText}>Dental cleaning for Bella</Text>
              <Text style={styles.reminderTime}>Tomorrow, 10:00 AM</Text>
            </View>
            <View style={[styles.reminderStatus, { backgroundColor: '#ECFDF5' }]}>
              <View style={[styles.statusDot, { backgroundColor: currentColors.secondary }]} />
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <Text style={styles.tipsSectionTitle}>Pet Care Tips</Text>
          <View style={styles.tipCard}>
            <View style={styles.tipIconContainer}>
              <MaterialIcons name="lightbulb" size={24} color={currentColors.accent} />
            </View>
            <View style={styles.tipContent}>
              <Text style={styles.tipTitle}>Stay Hydrated</Text>
              <Text style={styles.tipText}>Make sure your pet has access to fresh water at all times</Text>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
    paddingHorizontal: Spacing.md,
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
    marginTop: Spacing.md,
    marginBottom: Spacing.lg,
  },
  greeting: {
    fontSize: FontSize.md,
    color: currentColors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  userName: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
    marginTop: 2,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: '#EEF2FF',
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: currentColors.primary,
    borderRadius: BorderRadius.full,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: currentColors.white,
  },
  welcomeCard: {
    backgroundColor: currentColors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.lg,
  },
  welcomeContent: {
    flex: 1,
  },
  welcomeTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
    color: currentColors.white,
    marginBottom: Spacing.xs,
  },
  welcomeText: {
    fontSize: FontSize.sm,
    color: 'rgba(255, 255, 255, 0.85)',
    marginBottom: Spacing.md,
    lineHeight: 20,
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  welcomeButtonText: {
    color: currentColors.white,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
    marginRight: Spacing.xs,
  },
  welcomeImageContainer: {
    marginLeft: Spacing.md,
  },
  welcomeImage: {
    width: 90,
    height: 90,
    borderRadius: BorderRadius.lg,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  seeAllText: {
    color: currentColors.primary,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  menuItem: {
    width: (width - Spacing.md * 3) / 2,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.sm,
  },
  menuIconContainer: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  menuItemText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
    textAlign: 'center',
  },
  section: {
    marginBottom: Spacing.lg,
  },
  reminderCard: {
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    ...Shadow.sm,
  },
  reminderIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  reminderContent: {
    flex: 1,
  },
  reminderTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
    marginBottom: 2,
  },
  reminderText: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    marginBottom: 2,
  },
  reminderTime: {
    fontSize: FontSize.xs,
    color: currentColors.textTertiary,
  },
  reminderStatus: {
    width: 12,
    height: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: currentColors.primary,
  },
  tipsSection: {
    marginBottom: Spacing.lg,
  },
  tipsSectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
    marginBottom: Spacing.md,
  },
  tipCard: {
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...Shadow.sm,
  },
  tipIconContainer: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFBEB',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md,
  },
  tipContent: {
    flex: 1,
  },
  tipTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
    marginBottom: 2,
  },
  tipText: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    lineHeight: 20,
  },
});

export default Home;
