import { db } from '@/src/config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from 'react-native-paper';

// Utility function to format dates
const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

type Appointment = {
  id: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  date: Date;
  [key: string]: any; // For other properties that might exist
};

interface PetDetails {
  id: string;
  name?: string;
  type?: string;
  breed?: string;
  age?: string;
  gender?: string;
  weight?: string;
  ownerName?: string;
  ownerId?: string;
  photoURL?: string;
  lastVisit?: string;
  medicalHistory?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function PatientDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pet, setPet] = useState<PetDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();
  
  // Format date utility function
  const formatDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  useEffect(() => {
    let isMounted = true;
    
    const fetchPetDetails = async () => {
      try {
        if (!id) return;
        
        if (isMounted) {
          setLoading(true);
          setError(null);
        }
        
        // First, find which user owns this pet by checking the appointments
        const appointmentsRef = collection(db, 'appointments');
        const q = query(
          appointmentsRef,
          where('petId', '==', id)
        );
        
        const querySnapshot = await getDocs(q);
        
        if (!isMounted) return;
        
        if (querySnapshot.empty) {
          setError('No appointments found for this pet');
          setLoading(false);
          return;
        }
        
        // Get the first appointment to find the owner
        const firstAppointment = querySnapshot.docs[0].data();
        const ownerId = firstAppointment.userId; // This is the pet owner's ID
        
        if (!ownerId) {
          setError('Could not find pet owner');
          setLoading(false);
          return;
        }
        
        // First, fetch the owner's name from the users collection
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
        
        // Process the appointment date from the first appointment
        let lastVisit: Date | null = null;
        const appointmentDate = firstAppointment.date;
        if (appointmentDate) {
          try {
            // Check if it's a Firestore Timestamp
            if (typeof appointmentDate.toDate === 'function') {
              lastVisit = appointmentDate.toDate();
            }
            // Handle string or number timestamps
            else if (typeof appointmentDate === 'string' || typeof appointmentDate === 'number') {
              lastVisit = new Date(appointmentDate);
            }
            // Handle if it's already a Date object
            else if (appointmentDate instanceof Date) {
              lastVisit = appointmentDate;
            }
            
            if (lastVisit) {
              console.log('Appointment date:', lastVisit);
              console.log('Formatted appointment date:', formatDate(lastVisit));
            }
          } catch (e) {
            console.warn('Error processing appointment date:', e);
          }
        }
        
        try {
          // Now fetch the pet details from the user's pets subcollection
          const petDoc = await getDoc(doc(db, 'users', ownerId, 'pets', id as string));
          
          if (petDoc.exists()) {
            const petData = petDoc.data();
            
            setPet({ 
              id: petDoc.id, 
              name: petData?.name || 'Unnamed Pet',
              type: petData?.type || 'Unknown',
              breed: petData?.breed || 'Unknown',
              age: petData?.age,
              gender: petData?.gender,
              weight: petData?.weight,
              ownerName: ownerName,
              ownerId: ownerId,
              photoURL: petData?.photoURL,
              lastVisit: lastVisit ? formatDate(lastVisit) : 'No visits yet',
              medicalHistory: petData?.medicalHistory || 'No medical history available',
              createdAt: petData?.createdAt ? formatDate(petData.createdAt.toDate()) : 'Unknown',
              updatedAt: petData?.updatedAt ? formatDate(petData.updatedAt.toDate()) : 'Unknown'
            } as PetDetails);
          } else {
            console.error('Pet document not found at path:', `users/${ownerId}/pets/${id}`);
            setError('Pet not found in the database');
          }
        } catch (error) {
          console.error('Error fetching pet details:', error);
          setError('Failed to load pet details');
        }
      } catch (err) {
        console.error('Error fetching pet details:', err);
        if (isMounted) {
          setError('Failed to load pet details');
          setLoading(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPetDetails();

    // Cleanup function
    return () => {
      isMounted = false;
    };
  }, [id, pet?.id]); // Add pet.id to dependency array to track changes

  if (loading) {
    return (
      <View style={[styles.container, styles.center]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: theme.colors.error }}>{error}</Text>
      </View>
    );
  }

  if (!pet) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text>No pet data available</Text>
      </View>
    );
  }

  // Safely access pet properties with fallbacks
  const {
    name = 'Unnamed Pet',
    type = 'Unknown',
    breed = 'Unknown',
    age = '',
    gender = 'Not specified',
    ownerName = 'Unknown',
    lastVisit = 'No visits yet',
    medicalHistory,
    photoURL,
    createdAt = 'Unknown',
    updatedAt = 'Unknown'
  } = pet;

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <View style={styles.header}>
        {photoURL ? (
          <Image source={{ uri: photoURL }} style={styles.petImage} />
        ) : (
          <View style={[styles.petImage, { backgroundColor: theme.colors.primaryContainer }]}>
            <MaterialCommunityIcons 
              name={type.toLowerCase() === 'dog' ? 'dog' : 'cat'} 
              size={60} 
              color={theme.colors.onPrimaryContainer} 
            />
          </View>
        )}
        <Text style={[styles.petName, { color: theme.colors.onBackground }]}>
          {name}
        </Text>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          {type} • {breed}
        </Text>
      </View>

      <View style={[styles.section, { borderColor: theme.colors.outline }]}>
        <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Pet Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Name:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Type:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{type}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Breed:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{breed}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Age:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{age} {age ? 'years' : ''}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Gender:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{gender}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Owner:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{ownerName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Last Visit:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{lastVisit}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Added on:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{createdAt}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: theme.colors.onSurfaceVariant }]}>Last Updated:</Text>
          <Text style={{ color: theme.colors.onBackground }}>{updatedAt}</Text>
        </View>
      </View>

      <View style={[styles.section, { borderColor: theme.colors.outline, flexDirection: 'row', justifyContent: 'space-between' }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: theme.colors.primary }]}
          onPress={() => {
            // Using the correct path format with object syntax
            router.push({
              pathname: '/vets/health-records/[petId]',
              params: { petId: id }
            });
            console.log('Navigating to health records with petId:', id);
          }}
        >
          <MaterialCommunityIcons name="clipboard-pulse" size={20} color="white" />
          <Text style={styles.actionButtonText}>View Health Records</Text>
        </TouchableOpacity>
      </View>

      {medicalHistory && (
        <View style={[styles.section, { borderColor: theme.colors.outline }]}>
          <Text style={[styles.sectionTitle, { color: theme.colors.primary }]}>Medical History</Text>
          <Text style={{ color: theme.colors.onBackground }}>{medicalHistory}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'transparent',
  },
  petImage: {
    width: 150,
    height: 150,
    borderRadius: 75,
    marginBottom: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
    backgroundColor: 'transparent',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailLabel: {
    fontWeight: '500',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 8,
    marginHorizontal: 4,
  },
  actionButtonText: {
    color: 'white',
    marginLeft: 8,
    fontWeight: '500',
  },
});
