import { auth, db } from '@/src/config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
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
    useColorScheme
} from 'react-native';
import { Card, useTheme } from 'react-native-paper';

const { width } = Dimensions.get('window');
const CARD_SIZE = width * 0.4;

const Home = () => {
  const router = useRouter();
  const theme = useTheme();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const colorScheme = useColorScheme();
  
  // Menu items for the grid
  // Menu items for the grid
  const menuItems = [
    {
      id: 'profile',
      title: 'My Profile',
      icon: 'account' as const,
      color: '#4CAF50',
      onPress: () => {
        const currentUserUid = auth.currentUser?.uid;
        if (currentUserUid) {
          router.push({
            pathname: "/vets/myprofile",
            params: { uid: currentUserUid },
          });
        }
      }
    },
    {
      id: 'detector',
      title: 'Image Detector',
      icon: 'camera' as const,
      color: '#2196F3',
      onPress: () => console.log('Image Detector pressed')
    },
    {
      id: 'symptom',
      title: 'Symptom Checker',
      icon: 'stethoscope' as const,
      color: '#FF9800',
      onPress: () => console.log('Symptom Checker pressed')
    },
    {
      id: 'health',
      title: 'Health Records',
      icon: 'file-document' as const,
      color: '#9C27B0',
      onPress: () => {
        // Navigate to My Patients first to select a pet
        router.push('/vets/mypatients');
      }
    },
    {
      id: 'appointments',
      title: 'Appointments',
      icon: 'calendar' as const,
      color: '#3F51B5',
      onPress: () => router.push('/vets/appointments')
    },
    {
      id: 'patients',
      title: 'My Patients',
      icon: 'paw' as const,
      color: '#E91E63',
      onPress: () => router.push('/vets/mypatients')
    },
  ];

  useEffect(() => {
    const checkCredentials = async () => {
      const currentUserUid = auth.currentUser?.uid;
      if (!currentUserUid) {
        router.replace('/login');
        return;
      }
      
      try {
        const vetDoc = await getDoc(doc(db, 'vets', currentUserUid));
        if (!vetDoc.exists()) {
          Alert.alert('Credentials Required', 'Please complete your vet credentials first');
          router.replace('/vets/credentials');
          return;
        }
        
        // Set profile data if available
        const vetData = vetDoc.data();
        if (vetData) {
          setName(vetData.name || '');
          if (vetData.image) {
            setProfileImage(vetData.image);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking vet credentials:', error);
        Alert.alert('Error', 'Failed to load your profile');
        router.replace('/login');
      } finally {
        setLoading(false);
      }
    };
    
    checkCredentials();
  }, []);

  const readVetName = async () => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
      console.log("No authenticated user");
      return;
    }

    try {
      const ref = doc(db, "users", currentUserUid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name || "Veterinarian");
      } else {
        console.log("Vet document does not exist");
      }
    } catch (err) {
      console.log("Error fetching vet name:", err);
    }
  };

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <Text>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'} />
      <ScrollView contentContainerStyle={styles.scrollView}>
        {/* Header with greeting and notification bell */}
        <View style={styles.header}>
          <View style={styles.profileContainer}>
            <View style={styles.avatar}>
              {profileImage ? (
                <Image 
                  source={{ uri: profileImage }} 
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <MaterialCommunityIcons name="account" size={40} color="#fff" />
              )}
            </View>
            <View style={styles.greetingContainer}>
              <Text style={[styles.greeting, { color: theme.colors.onSurface }]}>Welcome back,</Text>
              <Text style={[styles.name, { color: theme.colors.onSurface }]}>{name || 'Veterinarian'}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.notificationIcon} onPress={() => console.log('Notifications pressed')}>
            <MaterialCommunityIcons 
              name="bell-outline" 
              size={28} 
              color={theme.colors.onSurface} 
            />
            <View style={styles.notificationBadge} />
          </TouchableOpacity>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]} >
            <Card.Content style={styles.statCardContent}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>12</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]} >
                Today's Appointments
              </Text>
            </Card.Content>
          </Card>
          <Card style={[styles.statCard, { backgroundColor: theme.colors.surface }]} >
            <Card.Content style={styles.statCardContent}>
              <Text style={[styles.statNumber, { color: theme.colors.primary }]}>5</Text>
              <Text style={[styles.statLabel, { color: theme.colors.onSurfaceVariant }]} >
                Pending Requests
              </Text>
            </Card.Content>
          </Card>
        </View>

        {/* Menu Grid */}
        <View style={styles.menuGrid}>
          {menuItems.map((item) => (
            <TouchableOpacity 
              key={item.id} 
              style={styles.menuItem} 
              onPress={item.onPress}
              activeOpacity={0.8}
            >
              <Card style={[styles.menuCard, { backgroundColor: item.color }]} >
                <Card.Content style={styles.menuCardContent}>
                  <View style={[styles.iconContainer, { backgroundColor: `${item.color}33` }]} >
                    <MaterialCommunityIcons 
                      name={item.icon} 
                      size={28} 
                      color="#fff" 
                    />
                  </View>
                  <Text style={styles.menuItemTitle}>{item.title}</Text>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Developer Section */}
        <View style={[styles.developerSection, { backgroundColor: theme.colors.surfaceVariant }]} >
          <Text style={[styles.developerTitle, { color: theme.colors.onSurfaceVariant }]} >
            Developed By
          </Text>
          <Text style={[styles.developerName, { color: theme.colors.onSurfaceVariant }]} >
            Muneeb Tariq
          </Text>
          <Text style={[styles.developerName, { color: theme.colors.onSurfaceVariant }]} >
            Muhammad Islam
          </Text>
          <Text style={[styles.developerName, { color: theme.colors.onSurfaceVariant }]} >
            Hammad-ul-Hassan
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flexGrow: 1,
    padding: 16,
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    marginTop: 8,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  greetingContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  greeting: {
    fontSize: 14,
    marginBottom: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  notificationIcon: {
    padding: 8,
    position: 'relative',
    marginLeft: 8,
  },
  notificationBadge: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#FF3B30',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    width: '48%',
    borderRadius: 12,
    elevation: 2,
  },
  statCardContent: {
    padding: 16,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: 'center',
  },
  menuGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginHorizontal: -4,
  },
  menuItem: {
    width: '48%',
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  menuCard: {
    borderRadius: 12,
    elevation: 2,
    overflow: 'hidden',
  },
  menuCardContent: {
    padding: 12,
    alignItems: 'center',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  menuItemTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
    marginTop: 4,
  },
  developerSection: {
    marginTop: 24,
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginHorizontal: 0,
    width: '100%',
  },
  developerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  developerName: {
    marginTop: 4,
    fontWeight: '500',
  },
});

export default Home;
