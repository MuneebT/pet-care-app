import { db } from "@/src/config/firebase";
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

const { width } = Dimensions.get('window');

const Home = () => {
  const params = useLocalSearchParams();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const theme = useTheme();

  // Get UID from params or fallback to AsyncStorage
  const getUid = async () => {
    // First try to get from params
    if (params?.uid && typeof params.uid === 'string') {
      return params.uid;
    }
    
    // If not in params, try AsyncStorage
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

        // Get user data
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setName(userData.name || "Pet Parent");
          
          // Check if user has any pets (no automatic creation)
          try {
            const userPetsRef = collection(db, "users", userId, "pets");
            await getDocs(userPetsRef); // Just verify we can access the collection
          } catch (petsError) {
            console.error("Error accessing pets collection:", petsError);
            // Don't block the UI for this error
          }
        } else {
          console.log("No user document found");
          // Optionally create user document if it doesn't exist
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
      // For mobile, use the screen name directly without leading slash
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
      icon: <MaterialIcons name="pets" size={28} color="#4A6FA5" />,
      onPress: () => navigateTo('/mypets' as AppRoute),
      color: "#E3F2FD"
    },
    {
      title: "Symptom Checker",
      icon: <MaterialIcons name="medical-services" size={28} color="#388E3C" />,
      onPress: () => navigateTo('/symptomchecker' as AppRoute),
      color: "#E8F5E9"
    },
    {
      title: "Appointments",
      icon: <MaterialCommunityIcons name="calendar-clock" size={28} color="#7B1FA2" />,
      onPress: () => navigateTo('/appointments' as AppRoute),
      color: "#F3E5F5"
    },
    {
      title: "Reminders",
      icon: <MaterialIcons name="notifications" size={28} color="#F57C00" />,
      onPress: () => navigateTo('/reminders' as AppRoute),
      color: "#FFF3E0"
    },
    {
      title: "Health Records",
      icon: <MaterialIcons name="folder" size={28} color="#0288D1" />,
      onPress: () => navigateTo('/healthrecords' as AppRoute),
      color: "#E3F2FD"
    },
    {
      title: "Image Scanner",
      icon: <MaterialIcons name="camera-alt" size={28} color="#5D4037" />,
      onPress: () => navigateTo('/imagechecker' as AppRoute),
      color: "#EFEBE9"
    }
  ];


  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      
      <ScrollView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.userName}>{name}</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/vets/myprofile')}>
            <Avatar.Icon 
              size={50} 
              icon="account" 
              style={styles.avatar} 
              color="#FF6B35"
            />
          </TouchableOpacity>
        </View>

        {/* Welcome Card */}
        <View style={styles.welcomeCard}>
          <View>
            <Text style={styles.welcomeTitle}>Welcome to PetCare</Text>
            <Text style={styles.welcomeText}>
              Track your pet's health and wellness in one place
            </Text>
          </View>
          <Image 
            source={require('../assets/images/paw.jpg')} 
            style={styles.welcomeImage}
          />
        </View>

        {/* Quick Actions Grid */}
        <View style={styles.gridContainer}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.menuItem, { backgroundColor: item.color }]}
              onPress={item.onPress}
            >
              <View style={styles.menuIconContainer}>
                {item.icon}
              </View>
              <Text style={styles.menuItemText}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Activity Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Activity</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.activityCard}>
            <View style={styles.activityIcon}>
              <MaterialIcons name="pets" size={24} color="#4CAF50" />
            </View>
            <View style={styles.activityContent}>
              <Text style={styles.activityTitle}>Vaccination Due</Text>
              <Text style={styles.activityText}>Your pet's annual vaccination is due soon</Text>
              <Text style={styles.activityTime}>Today</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: '#666',
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 4,
  },
  avatar: {
    backgroundColor: '#FFECB3',
  },
  welcomeCard: {
    backgroundColor: '#FF6B35',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  welcomeTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  welcomeText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    maxWidth: '70%',
  },
  welcomeImage: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  menuItem: {
    width: (width - 48) / 2,
    height: 120,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  menuIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  seeAllText: {
    color: '#FF6B35',
    fontWeight: '500',
  },
  activityCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  activityIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  activityContent: {
    flex: 1,
  },
  activityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  activityText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  activityTime: {
    fontSize: 12,
    color: '#999',
  },
});

export default Home;
