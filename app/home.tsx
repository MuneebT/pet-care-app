import { db } from "@/services/firebase";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams, useFocusEffect } from "expo-router";
import { collection, doc, getDoc, getDocs, setDoc } from "firebase/firestore";
import React, { useEffect, useState, useCallback } from "react";
import DailyTipsDialog, { checkAndShowTips, resetTipsForTesting } from "@/components/DailyTipsDialog";
import {
    ActivityIndicator,
    Alert,
    Dimensions,
    FlatList,
    Image,
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { Avatar } from "react-native-paper";
import { BorderRadius, Spacing, FontSize, Shadow, FontWeight, currentColors } from '@/constants/theme';
import BottomNavigationBar from './bottomnavigationbar';

const { width } = Dimensions.get('window');

const getGreeting = () => {
  const hour = new Date().getHours();
  
  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
};

const Home = () => {
  const params = useLocalSearchParams();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showTips, setShowTips] = useState(false);
  const [tipsReady, setTipsReady] = useState(false);
  const [greeting, setGreeting] = useState(getGreeting());
  const [pets, setPets] = useState<{ id: string; name: string; image?: string }[]>([]);

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
            const petsSnapshot = await getDocs(userPetsRef);
            const petsData = petsSnapshot.docs.map(doc => ({
              id: doc.id,
              name: doc.data().name || 'Unnamed Pet',
              image: doc.data().image || undefined,
            }));
            setPets(petsData);
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
        const shouldShowTips = await checkAndShowTips();
        setTipsReady(true);
        setShowTips(shouldShowTips);
      }
    };

    fetchUserData();
  }, [params]);

  useFocusEffect(
    useCallback(() => {
      return () => {
      };
    }, [])
  );

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
      subtitle: "Profiles and care details",
      icon: <MaterialIcons name="pets" size={28} color={currentColors.primary} />,
      onPress: () => navigateTo('/mypets' as AppRoute),
      color: '#EEF2FF',
      iconBg: '#E0E7FF',
      accent: currentColors.primary
    },
    {
      title: "Symptom Checker",
      subtitle: "AI-powered health insights",
      icon: <MaterialIcons name="medical-services" size={28} color={currentColors.secondary} />,
      onPress: () => navigateTo('/symptomchecker' as AppRoute),
      color: '#ECFDF5',
      iconBg: '#D1FAE5',
      accent: currentColors.secondary
    },
    {
      title: "Appointments",
      subtitle: "Book and track visits",
      icon: <MaterialCommunityIcons name="calendar-clock" size={28} color="#8B5CF6" />,
      onPress: () => navigateTo('/appointments' as AppRoute),
      color: '#F5F3FF',
      iconBg: '#EDE9FE',
      accent: '#8B5CF6'
    },
    {
      title: "Reminders",
      subtitle: "Medication and routines",
      icon: <MaterialIcons name="notifications" size={28} color={currentColors.accent} />,
      onPress: () => navigateTo('/reminders' as AppRoute),
      color: '#FFFBEB',
      iconBg: '#FEF3C7',
      accent: currentColors.accent
    },
    {
      title: "Health Records",
      subtitle: "Saved prediction history",
      icon: <MaterialIcons name="folder" size={28} color={currentColors.info} />,
      onPress: () => navigateTo('/healthrecords' as AppRoute),
      color: '#EFF6FF',
      iconBg: '#DBEAFE',
      accent: currentColors.info
    },
    {
      title: "Image Scanner",
      subtitle: "Upload for visual checks",
      icon: <MaterialIcons name="camera-alt" size={28} color="#EC4899" />,
      onPress: () => navigateTo('/imagechecker' as AppRoute),
      color: '#FDF2F8',
      iconBg: '#FCE7F3',
      accent: '#EC4899'
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
      
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        <View style={styles.heroCard}>
          <View style={styles.heroGlowPrimary} />
          <View style={styles.heroGlowSecondary} />

          <View style={styles.header}>
            <View style={styles.headerTextWrap}>
              <Text style={styles.eyebrow}>Pet wellness dashboard</Text>
              <Text style={styles.greeting}>{greeting},</Text>
              <Text style={styles.userName}>{name}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/settings')} onLongPress={async () => {
              await resetTipsForTesting();
              setShowTips(true);
              Alert.alert('Tips Reset', 'Tips dialog will appear');
            }}>
              <View style={styles.avatarContainer}>
                <Avatar.Icon 
                  size={54} 
                  icon="account" 
                  style={styles.avatar} 
                  color={currentColors.white}
                />
                <View style={styles.avatarBadge}>
                  <MaterialIcons name="notifications" size={12} color={currentColors.white} />
                </View>
              </View>
            </TouchableOpacity>
          </View>

          <View style={styles.heroContentRow}>
            <View style={styles.welcomeContent}>
              <View style={styles.heroPill}>
                <MaterialCommunityIcons name="heart-pulse" size={16} color={currentColors.white} />
                <Text style={styles.heroPillText}>Care smarter every day</Text>
              </View>
              <Text style={styles.welcomeTitle}>Everything your pet needs, in one calm place.</Text>
              <Text style={styles.welcomeText}>
                Track routines, catch warning signs early, and keep every visit, reminder, and record close at hand.
              </Text>
              <TouchableOpacity
                style={styles.welcomeButton}
                onPress={() => navigateTo('/mypets' as AppRoute)}
                activeOpacity={0.8}
              >
                <Text style={styles.welcomeButtonText}>View Pets</Text>
                <MaterialIcons name="arrow-forward" size={18} color={currentColors.primaryDark} />
              </TouchableOpacity>
            </View>

            <View style={styles.welcomeImageShell}>
              <View style={styles.welcomeImageAccent} />
              {pets[0]?.image ? (
                <Image 
                  source={{ uri: pets[0].image }} 
                  style={styles.welcomeImage}
                />
              ) : (
                <Image 
                  source={require('../assets/images/paw.jpg')} 
                  style={styles.welcomeImage}
                />
              )}
            </View>
          </View>

          <View style={styles.statsRow}>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>6</Text>
              <Text style={styles.statLabel}>care tools</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>24/7</Text>
              <Text style={styles.statLabel}>AI guidance</Text>
            </View>
            <View style={styles.statChip}>
              <Text style={styles.statValue}>1</Text>
              <Text style={styles.statLabel}>pet hub</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <Text style={styles.sectionSubtitle}>Jump into the tools you use most.</Text>
          </View>
        </View>

        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: currentColors.surface }]}
              onPress={item.onPress}
              activeOpacity={0.82}
            >
              <View style={[styles.menuAccentBar, { backgroundColor: item.accent }]} />
              <View style={styles.menuHeaderRow}>
                <View style={[styles.menuIconContainer, { backgroundColor: item.iconBg }]}>
                  {item.icon}
                </View>
                <MaterialIcons name="arrow-outward" size={18} color={item.accent} />
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
              <Text style={styles.menuItemSubtext}>{item.subtitle}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {pets.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionTitle}>Your Pets</Text>
                <Text style={styles.sectionSubtitle}>Quick access to your furry friends.</Text>
              </View>
              <TouchableOpacity onPress={() => navigateTo('/mypets' as AppRoute)}>
                <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.petScroll}>
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={styles.petCardSmall}
                  onPress={() => navigateTo('/mypets' as AppRoute)}
                  activeOpacity={0.7}
                >
                  <View style={styles.petCardSmallImageContainer}>
                    {pet.image ? (
                      <Image source={{ uri: pet.image }} style={styles.petCardSmallImage} />
                    ) : (
                      <View style={styles.petCardSmallPlaceholder}>
                        <MaterialIcons name="pets" size={28} color={currentColors.primary} />
                      </View>
                    )}
                  </View>
                  <Text style={styles.petCardSmallName} numberOfLines={1}>{pet.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Upcoming Reminders</Text>
              <Text style={styles.sectionSubtitle}>What needs attention next.</Text>
            </View>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.reminderCard}>
            <View style={styles.reminderLeading}>
              <View style={styles.reminderIconContainer}>
                <MaterialCommunityIcons name="needle" size={24} color={currentColors.primary} />
              </View>
              <View style={styles.reminderContent}>
                <View style={styles.reminderTitleRow}>
                  <Text style={styles.reminderTitle}>Vaccination Due</Text>
                  <View style={styles.priorityPill}>
                    <Text style={styles.priorityPillText}>Today</Text>
                  </View>
                </View>
                <Text style={styles.reminderText}>Annual vaccination for Max</Text>
                <Text style={styles.reminderTime}>2:00 PM appointment window</Text>
              </View>
            </View>
            <View style={styles.reminderStatus}>
              <View style={styles.statusDot} />
            </View>
          </View>

          <View style={styles.reminderCard}>
            <View style={styles.reminderLeading}>
              <View style={[styles.reminderIconContainer, { backgroundColor: '#ECFDF5' }]}>
                <MaterialCommunityIcons name="tooth" size={24} color={currentColors.secondary} />
              </View>
              <View style={styles.reminderContent}>
                <View style={styles.reminderTitleRow}>
                  <Text style={styles.reminderTitle}>Dental Checkup</Text>
                  <View style={[styles.priorityPill, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.priorityPillText, { color: currentColors.secondary }]}>Tomorrow</Text>
                  </View>
                </View>
                <Text style={styles.reminderText}>Dental cleaning for Bella</Text>
                <Text style={styles.reminderTime}>10:00 AM clinic visit</Text>
              </View>
            </View>
            <View style={[styles.reminderStatus, { backgroundColor: '#ECFDF5' }]}>
              <View style={[styles.statusDot, { backgroundColor: currentColors.secondary }]} />
            </View>
          </View>
        </View>

        <View style={styles.tipsSection}>
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionTitle}>Pet Care Tips</Text>
              <Text style={styles.sectionSubtitle}>Small habits that make a big difference.</Text>
            </View>
          </View>

          <View style={styles.tipCard}>
            <View style={styles.tipBadgeRow}>
              <View style={styles.tipBadge}>
                <MaterialIcons name="lightbulb" size={14} color={currentColors.accent} />
                <Text style={styles.tipBadgeText}>Daily tip</Text>
              </View>
            </View>
            <View style={styles.tipMainRow}>
              <View style={styles.tipIconContainer}>
                <MaterialIcons name="water-drop" size={24} color={currentColors.accent} />
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipTitle}>Stay Hydrated</Text>
                <Text style={styles.tipText}>Make sure your pet has access to fresh water at all times.</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>

      <DailyTipsDialog
        visible={tipsReady && showTips && !loading}
        onClose={() => setShowTips(false)}
      />

      <View style={styles.bottomNavContainer}>
        <BottomNavigationBar />
      </View>
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
  },
  contentContainer: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
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
    alignItems: 'flex-start',
    marginBottom: Spacing.lg,
    zIndex: 2,
  },
  headerTextWrap: {
    flex: 1,
    paddingRight: Spacing.md,
  },
  eyebrow: {
    fontSize: FontSize.xs,
    color: 'rgba(255, 255, 255, 0.72)',
    fontWeight: FontWeight.semibold,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  greeting: {
    fontSize: FontSize.md,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: FontWeight.medium,
    marginTop: Spacing.xs,
  },
  userName: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: currentColors.white,
    marginTop: 4,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
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
    borderColor: currentColors.primaryDark,
  },
  heroCard: {
    backgroundColor: currentColors.primaryDark,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
    overflow: 'hidden',
    ...Shadow.xl,
  },
  heroGlowPrimary: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: BorderRadius.full,
    top: -120,
    right: -40,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroGlowSecondary: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: BorderRadius.full,
    bottom: -70,
    left: -40,
    backgroundColor: 'rgba(16, 185, 129, 0.18)',
  },
  heroContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 2,
  },
  welcomeContent: {
    flex: 1,
  },
  heroPill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  heroPillText: {
    marginLeft: 6,
    color: currentColors.white,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: FontWeight.bold,
    color: currentColors.white,
    marginBottom: Spacing.sm,
    lineHeight: 34,
  },
  welcomeText: {
    fontSize: FontSize.md,
    color: 'rgba(255, 255, 255, 0.82)',
    marginBottom: Spacing.lg,
    lineHeight: 23,
  },
  welcomeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: currentColors.white,
    paddingVertical: 12,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  welcomeButtonText: {
    color: currentColors.primaryDark,
    fontWeight: FontWeight.semibold,
    fontSize: FontSize.sm,
    marginRight: Spacing.xs,
  },
  welcomeImageShell: {
    marginLeft: Spacing.md,
    width: width * 0.26,
    height: width * 0.26,
    minWidth: 96,
    minHeight: 96,
    maxWidth: 124,
    maxHeight: 124,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeImageAccent: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    transform: [{ rotate: '-9deg' }],
  },
  welcomeImage: {
    width: '92%',
    height: '92%',
    borderRadius: BorderRadius.lg,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.45)',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.lg,
    gap: Spacing.sm,
    zIndex: 2,
  },
  statChip: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: BorderRadius.lg,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.sm,
  },
  statValue: {
    color: currentColors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    marginBottom: 2,
  },
  statLabel: {
    color: 'rgba(255, 255, 255, 0.78)',
    fontSize: FontSize.xs,
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
  sectionSubtitle: {
    marginTop: 4,
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
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
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: currentColors.border,
    ...Shadow.md,
  },
  menuAccentBar: {
    width: 44,
    height: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.md,
  },
  menuHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  menuIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuItemText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
    marginBottom: 4,
  },
  menuItemSubtext: {
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
    lineHeight: 18,
  },
  section: {
    marginBottom: Spacing.lg,
  },
  petScroll: {
    marginTop: Spacing.sm,
  },
  petCardSmall: {
    alignItems: 'center',
    marginRight: Spacing.md,
    width: 80,
  },
  petCardSmallImageContainer: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    ...Shadow.md,
  },
  petCardSmallImage: {
    width: 72,
    height: 72,
    borderRadius: 36,
    resizeMode: 'cover',
  },
  petCardSmallPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petCardSmallName: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: currentColors.text,
    fontWeight: FontWeight.medium,
    textAlign: 'center',
    maxWidth: 80,
  },
  reminderCard: {
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: currentColors.border,
    ...Shadow.md,
  },
  reminderLeading: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
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
  reminderTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
    gap: Spacing.sm,
  },
  reminderTitle: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
  },
  reminderText: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    marginBottom: 4,
  },
  reminderTime: {
    fontSize: FontSize.xs,
    color: currentColors.textTertiary,
  },
  priorityPill: {
    backgroundColor: '#EEF2FF',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  priorityPillText: {
    color: currentColors.primary,
    fontSize: 11,
    fontWeight: FontWeight.semibold,
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
  tipCard: {
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: currentColors.border,
    ...Shadow.md,
  },
  tipBadgeRow: {
    marginBottom: Spacing.md,
  },
  tipBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderRadius: BorderRadius.full,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  tipBadgeText: {
    marginLeft: 6,
    color: currentColors.accent,
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },
  tipMainRow: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginBottom: 4,
  },
  tipText: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    lineHeight: 20,
  },
  bottomNavContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none',
  },
});

export default Home;
