import { auth, db } from '@/src/config/firebase';
import { useAppNavigation } from '@/src/navigation/useAppNavigation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { Card, useTheme } from 'react-native-paper';

type Patient = {
  id: string;
  name: string;
  petName: string;
  petType: string;
  lastVisit: string;
  nextAppointment?: string;
  image?: string;
};

type PetDocumentData = {
  id: string;
  name?: string;
  type?: string;
  userId?: string;
  lastVisit?: string;
  photoURL?: string;
  [key: string]: any; // For any other fields
};

const MyPatients = () => {
  const theme = useTheme();
  const { navigate } = useAppNavigation();
  const [loading, setLoading] = useState(true);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [invalidPetIds, setInvalidPetIds] = useState<Set<string>>(new Set());
  const currentUser = auth.currentUser;

  // Helper function to fetch pet data with proper typing
  const fetchPetData = async (petId: string, ownerId: string): Promise<PetDocumentData | null> => {
    try {
      console.log(`Fetching pet ${petId} for owner ${ownerId}`);
      const petDoc = await getDoc(doc(db, 'users', ownerId, 'pets', petId));
      
      if (!petDoc.exists()) {
        console.warn(`⚠️ Pet document with ID ${petId} not found for owner ${ownerId}`);
        return null;
      }
      
      const data = petDoc.data();
      return {
        id: petDoc.id,
        name: data?.name,
        type: data?.type,
        userId: data?.userId,
        lastVisit: data?.lastVisit,
        photoURL: data?.photoURL,
        ...data
      };
    } catch (error) {
      console.error(`Error fetching pet ${petId}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        console.log('Starting to fetch patients...');
        if (!currentUser) {
          console.log('No current user, redirecting to login');
          navigate('/login');
          return;
        }

        console.log('Current user ID:', currentUser.uid);
        const appointmentsRef = collection(db, 'appointments');
        console.log('Querying appointments for vet:', currentUser.uid);
        
        const q = query(
          appointmentsRef,
          where('vetId', '==', currentUser.uid)
        );

        console.log('Fetching appointments...');
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.size} appointments`);
        
        // Process each appointment to get unique pet IDs with owner info
        const petAppointments = new Map();
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const petId = data.petId;
          if (petId) {
            petAppointments.set(petId, {
              ...data,
              appointmentId: doc.id,
              date: data.date?.toDate?.() || data.date,
              // Assuming the appointment has the owner's ID
              ownerId: data.userId
            });
            
            console.log(`Appointment ${doc.id}:`, {
              petId: petId,
              ownerId: data.userId,
              vetId: data.vetId,
              status: data.status,
              date: data.date?.toDate?.() || data.date
            });
          }
        });

        const petIds = Array.from(petAppointments.keys());
        console.log('Unique pet IDs in appointments:', petIds);

        if (petIds.length === 0) {
          console.log('No valid pet IDs found in appointments');
          setPatients([]);
          return;
        }

        // Fetch pet details for each unique pet
        console.log('Fetching pet details...');
        const patientsData = await Promise.all(
          petIds.map(async (petId) => {
            try {
              console.log(`Processing pet ID: ${petId}`);
              const appointment = petAppointments.get(petId);
              const ownerId = appointment?.ownerId;
              
              if (!ownerId) {
                console.warn(`No owner ID found for pet ${petId}`);
                return null;
              }

              // Fetch the pet data using the owner's ID
              const petData = await fetchPetData(petId, ownerId);
              if (!petData) {
                setInvalidPetIds(prev => new Set([...prev, petId]));
                return null;
              }

              // Get owner details
              let ownerName = 'Unknown Owner';
              try {
                const ownerDoc = await getDoc(doc(db, 'users', ownerId));
                if (ownerDoc.exists()) {
                  const ownerData = ownerDoc.data();
                  ownerName = ownerData?.name || ownerName;
                  console.log(`Found owner: ${ownerName}`);
                }
              } catch (error) {
                console.error(`Error fetching owner ${ownerId}:`, error);
              }

              return {
                id: petId,
                name: ownerName,
                petName: petData.name || 'Unnamed Pet',
                petType: petData.type || 'Pet',
                lastVisit: petData.lastVisit || 'N/A',
                nextAppointment: appointment?.date 
                  ? new Date(appointment.date.seconds * 1000).toLocaleDateString() 
                  : 'No upcoming',
                image: petData.photoURL || null
              };
            } catch (error) {
              console.error(`Error processing pet ${petId}:`, error);
              return null;
            }
          })
        );

        const validPatients = patientsData.filter(Boolean) as Patient[];
        console.log(`Found ${validPatients.length} valid patients`);
        setPatients(validPatients);
      } catch (error) {
        console.error('Error in fetchPatients:', error);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      fetchPatients();
    }
  }, [currentUser, navigate]);

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <Card style={[styles.card, { backgroundColor: theme.colors.surface }]}>
      <Link 
        href={{
          pathname: '/vets/[id]',
          params: { id: item.id }
        }}
        asChild
      >
        <TouchableOpacity style={styles.patientItem} accessibilityLabel={`View ${item.petName}'s profile`}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.petImage} />
        ) : (
          <View style={[styles.petImage, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons 
              name={item.petType.toLowerCase() === 'dog' ? 'dog' : 'cat'}
              size={40} 
              color={theme.colors.onPrimaryContainer} 
            />
          </View>
        )}
        <View style={styles.patientInfo}>
          <Text style={[styles.petName, { color: theme.colors.onSurface }]}>{item.petName}</Text>
          <Text style={[styles.ownerName, { color: theme.colors.onSurfaceVariant }]}>{item.name}</Text>
          <View style={styles.detailsRow}>
            <Text style={[styles.detailText, { color: theme.colors.onSurfaceVariant }]}>
              {item.petType} • Last visit: {item.lastVisit}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons 
          name="chevron-right" 
          size={24} 
          color={theme.colors.onSurfaceVariant} 
        />
        </TouchableOpacity>
      </Link>
    </Card>
  );

  if (loading) {
    return (
      <View style={[styles.loadingContainer, { backgroundColor: theme.colors.background }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.colors.onBackground }]}>
          My Patients
        </Text>
      </View>

      {patients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons 
            name="account-group" 
            size={64} 
            color={theme.colors.onSurfaceVariant} 
          />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant, marginBottom: 16 }]}>
            {invalidPetIds.size > 0 
              ? 'Some appointments reference missing pet data'
              : 'No patients found'}
          </Text>
          {invalidPetIds.size > 0 && (
            <View style={styles.warningBox}>
              <MaterialCommunityIcons 
                name="alert-circle" 
                size={24} 
                color={theme.colors.error} 
                style={styles.warningIcon}
              />
              <Text style={[styles.warningText, { color: theme.colors.error }]}>
                Found {invalidPetIds.size} appointment{invalidPetIds.size > 1 ? 's' : ''} with missing pet data.
              </Text>
            </View>
          )}
        </View>
      ) : (
        <FlatList
          data={patients}
          renderItem={renderPatientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
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
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
  },
  patientItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  ownerName: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  warningIcon: {
    marginRight: 8,
  },
  warningText: {
    fontSize: 14,
    flex: 1,
  },
});

export default MyPatients;
