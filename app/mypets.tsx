import { db } from '@/services/firebase';
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
import { Button, FAB, useTheme } from 'react-native-paper';
import BottomNavigationBar from './bottomnavigationbar';
import { Colors, BorderRadius, Spacing, FontSize, Shadow, FontWeight } from '@/constants/theme';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.white,
  },
  headerTitle: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  headerSubtitle: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  listContent: {
    padding: Spacing.md,
    paddingBottom: 120,
  },
  listContainer: {
    padding: Spacing.md,
  },
  petCard: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.md,
  },
  petCardContent: {
    flexDirection: 'row',
    padding: Spacing.md,
    alignItems: 'center',
  },
  petImage: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    backgroundColor: Colors.light.surfaceVariant,
  },
  petImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.lg,
    marginRight: Spacing.md,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petInfo: {
    flex: 1,
  },
  petName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
    marginBottom: 4,
  },
  petDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  petDetail: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginRight: Spacing.sm,
  },
  petDetailDot: {
    fontSize: FontSize.sm,
    color: Colors.light.textTertiary,
    marginRight: Spacing.sm,
  },
  petActions: {
    flexDirection: 'row',
    marginTop: Spacing.xs,
  },
  actionButton: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.light.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyText: {
    fontSize: FontSize.lg,
    color: Colors.light.textSecondary,
    marginBottom: Spacing.xs,
    fontWeight: FontWeight.semibold,
  },
  emptySubtext: {
    fontSize: FontSize.sm,
    color: Colors.light.textTertiary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  addButton: {
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primary,
    paddingHorizontal: Spacing.lg,
    ...Shadow.md,
  },
  addButtonLabel: {
    color: Colors.light.white,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
  },
  fab: {
    position: 'absolute',
    right: Spacing.lg,
    bottom: 100,
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.lg,
    ...Shadow.lg,
  },
  navButton: {
    alignItems: 'center',
    padding: Spacing.sm,
  },
  navButtonText: {
    fontSize: FontSize.xs,
    color: Colors.light.textSecondary,
    marginTop: 2,
  },
  petTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petTypeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.sm,
  },
  petTypeText: {
    fontSize: FontSize.xs,
    color: Colors.light.primary,
    fontWeight: FontWeight.medium,
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
        'Are you sure you want to delete this pet? This action cannot be undone.',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: async () => {
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
    <View style={styles.petCard}>
      <TouchableOpacity 
        style={styles.petCardContent}
        onPress={() => router.push({ 
          pathname: '/editpets', 
          params: { 
            petId: item.id,
            userId,
            ...item
          } as any 
        })}
        activeOpacity={0.7}
      >
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.petImage} />
        ) : (
          <View style={styles.petImagePlaceholder}>
            <MaterialIcons name="pets" size={36} color={Colors.light.primary} />
          </View>
        )}
        <View style={styles.petInfo}>
          <Text style={styles.petName}>{item.name}</Text>
          <View style={styles.petDetails}>
            <Text style={styles.petDetail}>{item.type}</Text>
            <Text style={styles.petDetailDot}>•</Text>
            <Text style={styles.petDetail}>{item.breed}</Text>
          </View>
          <View style={styles.petTypeContainer}>
            <View style={styles.petTypeBadge}>
              <Text style={styles.petTypeText}>{item.age} {item.age === 1 ? 'year' : 'years'} old</Text>
            </View>
          </View>
          <View style={styles.petActions}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                goToEditPet(item);
              }}
            >
              <MaterialIcons name="edit" size={18} color={Colors.light.primary} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={(e) => {
                e.stopPropagation();
                handleDeletePet(item.id);
              }}
            >
              <MaterialIcons name="delete" size={18} color={Colors.light.error} />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Pets</Text>
        <Text style={styles.headerSubtitle}>{pets.length} {pets.length === 1 ? 'pet' : 'pets'} registered</Text>
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
            colors={[Colors.light.primary]}
            tintColor={Colors.light.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconContainer}>
              <MaterialIcons name="pets" size={56} color={Colors.light.primary} />
            </View>
            <Text style={styles.emptyText}>No pets added yet</Text>
            <Text style={styles.emptySubtext}>Add your first furry friend to get started</Text>
            <Button
              mode="contained"
              onPress={navigateToAddPet}
              style={styles.addButton}
              labelStyle={styles.addButtonLabel}
              icon="plus"
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
          color={Colors.light.white}
          onPress={navigateToAddPet}
        />
      )}
      
      <BottomNavigationBar />
    </View>
  );
};

export default MyPets;
