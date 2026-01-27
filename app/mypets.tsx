import { db } from '@/src/config/firebase';
import { MaterialIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { collection, deleteDoc, doc, getDocs } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { Button, Card, FAB, useTheme } from 'react-native-paper';
import BottomNavigationBar from './bottomnavigationbar';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  header: {
    height: 60,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e6ed',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  listContainer: {
    padding: 16,
  },
  petCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  petCardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 16,
    backgroundColor: '#e0e0e0',
  },
  petImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  petDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 8,
  },
  petDetail: {
    fontSize: 14,
    color: '#7f8c8d',
    marginRight: 12,
    marginBottom: 4,
  },
  petActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  actionButton: {
    padding: 6,
    marginRight: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    elevation: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 60,
  },
  emptyText: {
    fontSize: 18,
    color: '#95a5a6',
    marginVertical: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  addButton: {
    marginTop: 16,
    borderRadius: 10,
    backgroundColor: '#FF6B35',
    paddingHorizontal: 24,
    elevation: 2,
  },
  addButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: 80,
    backgroundColor: '#FF6B35',
    borderRadius: 28,
    elevation: 4,
  },
  navButton: {
    alignItems: 'center',
    padding: 8,
  },
  navButtonText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
});

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: number;
  image?: string;
  gender?: string;
};

type AppRoute = 
  | 'mypets' 
  | 'symptomchecker' 
  | 'appointments' 
  | 'reminders' 
  | 'healthrecords' 
  | 'imagechecker'
  | 'profile'
  | 'add-pet'
  | 'pet-details'
  | 'edit-pet';

const MyPets = () => {
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const theme = useTheme();
  const params = useLocalSearchParams<{ uid?: string }>();

  const getUserId = useCallback(async (): Promise<string | null> => {
    if (params?.uid) {
      return params.uid;
    }
    try {
      const storedUid = await AsyncStorage.getItem('userId');
      return storedUid;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  }, [params?.uid]);

  const fetchPets = useCallback(async () => {
    try {
      const uid = await getUserId();
      if (!uid) {
        router.replace('/login');
        return;
      }

      setUserId(uid);
      
      // Updated to use the nested collection path: users/{userId}/pets
      const userPetsRef = collection(db, 'users', uid, 'pets');
      const querySnapshot = await getDocs(userPetsRef);

      const petsData = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || 'Unnamed Pet',
          type: data.type || '',
          breed: data.breed || '',
          age: data.age || 0,
          gender: data.gender || 'Unknown',
          image: data.image
        } as Pet;
      });

      setPets(petsData);
    } catch (error) {
      console.error('Error fetching pets:', error);
      Alert.alert('Error', 'Failed to load pets. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getUserId]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchPets();
  }, [fetchPets]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [fetchPets])
  );

  const handleDeletePet = async (petId: string) => {
    try {
      const uid = await getUserId();
      if (!uid) {
        Alert.alert('Error', 'User not authenticated');
        return;
      }

      Alert.alert(
        'Delete Pet',
        'Are you sure you want to delete this pet?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
              // Updated to use the nested collection path
              await deleteDoc(doc(db, 'users', uid, 'pets', petId));
              setPets(prev => prev.filter(pet => pet.id !== petId));
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error deleting pet:', error);
      Alert.alert('Error', 'Failed to delete pet. Please try again.');
    }
  };

  const goToEditPet = (pet: Pet) => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    router.push({
      pathname: '/editpets',
      params: { 
        userId,
        petId: pet.id,
        ...pet
      }
    } as any);
  };

  const gotoReminders = () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    router.push({ pathname: '/reminders', params: { userId } });
  };

  const gotoMyPetRecords = () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    router.push({ pathname: '/healthrecords', params: { userId } });
  };

  const navigateToAddPet = () => {
    if (!userId) {
      Alert.alert('Error', 'User not authenticated');
      return;
    }
    router.push({ pathname: "/mypetrecords", params: { userId } } as any);
  };

    const renderPetItem = ({ item }: { item: Pet }) => (
    <Card 
      style={styles.petCard} 
      onPress={() => router.push({ 
        pathname: '/editpets', 
        params: { 
          petId: item.id,
          userId,
          ...item
        } as any 
      })}
    >
      <View style={styles.petCardContent}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.petImage} />
        ) : (
          <View style={[styles.petImage, styles.petImagePlaceholder]}>
            <MaterialIcons name="pets" size={40} color="#666" />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <View style={styles.petDetails}>
            <Text style={styles.petDetail}>{item.type}</Text>
            <Text style={styles.petDetail}>• {item.breed}</Text>
            <Text style={styles.petDetail}>• {item.age} {item.age === 1 ? 'year' : 'years'} old</Text>
          </View>
          <View style={styles.petActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                goToEditPet(item);
              }}
            >
              <MaterialIcons name="edit" size={20} color="#4A90E2" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePet(item.id);
              }}
            >
              <MaterialIcons name="delete" size={20} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Pets</Text>
      </View>
      <FlatList
        data={pets}
        renderItem={renderPetItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh} 
            colors={['#FF6B35']}
            tintColor="#FF6B35"
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialIcons name="pets" size={80} color="#e0e0e0" />
            <Text style={styles.emptyText}>No pets added yet</Text>
            <Button
              mode="contained"
              onPress={navigateToAddPet}
              style={styles.addButton}
              labelStyle={styles.addButtonLabel}
            >
              Add Your First Pet
            </Button>
          </View>
        }
      />

      {pets.length > 0 && (
        <FAB
          style={styles.fab}
          icon="plus"
          color="white"
          onPress={navigateToAddPet}
        />
      )}
      
      <BottomNavigationBar />
    </View>
  );
};

export default MyPets;
