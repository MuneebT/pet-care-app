import { db } from '@/services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BorderRadius, Spacing, Shadow, FontSize, FontWeight, currentColors } from '@/constants/theme';
import Skeleton from '@/components/ui/skeleton';

const safeToDate = (val: any): Date | null => {
  if (!val) return null;
  if (typeof val.toDate === 'function') return val.toDate();
  if (val instanceof Date) return val;
  if (typeof val === 'string' || typeof val === 'number') return new Date(val);
  if (val.seconds) return new Date(val.seconds * 1000);
  return null;
};

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
  image?: string;
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
  
  const fmtDate = (date: Date | null | undefined): string => {
    if (!date) return 'N/A';
    return formatDate(date);
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
        
        const lastVisit = safeToDate(firstAppointment.date);
        
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
              image: petData?.image,
              lastVisit: lastVisit ? formatDate(lastVisit) : 'No visits yet',
              medicalHistory: petData?.medicalHistory || 'No medical history available',
              createdAt: safeToDate(petData?.createdAt) ? formatDate(safeToDate(petData.createdAt)!) : 'Unknown',
              updatedAt: safeToDate(petData?.updatedAt) ? formatDate(safeToDate(petData.updatedAt)!) : 'Unknown'
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
      <View style={[styles.container, { padding: Spacing.lg }]}>
        <View style={{ alignItems: 'center', marginBottom: Spacing.lg }}>
          <Skeleton width={120} height={120} borderRadius={60} />
          <Skeleton width={180} height={22} borderRadius={8} style={{ marginTop: Spacing.md }} />
          <Skeleton width={140} height={16} borderRadius={8} style={{ marginTop: 6 }} />
        </View>
        {[1, 2, 3].map(i => (
          <View key={i} style={{ borderWidth: 1, borderColor: currentColors.border, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.md }}>
            <Skeleton width={120} height={18} borderRadius={6} style={{ marginBottom: Spacing.sm }} />
            {[1, 2, 3].map(j => (
              <Skeleton key={j} width={j === 2 ? 160 : 220} height={14} borderRadius={6} style={{ marginTop: 6 }} />
            ))}
          </View>
        ))}
        <View style={{ flexDirection: 'row', gap: Spacing.md }}>
          <Skeleton width={(Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2} height={48} borderRadius={BorderRadius.md} />
          <Skeleton width={(Dimensions.get('window').width - Spacing.lg * 2 - Spacing.md) / 2} height={48} borderRadius={BorderRadius.md} />
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.container, styles.center]}>
        <Text style={{ color: '#EF4444' }}>{error}</Text>
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
    image,
    createdAt = 'Unknown',
    updatedAt = 'Unknown'
  } = pet;

  return (
    <ScrollView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={styles.header}>
        {image ? (
          <Image source={{ uri: image }} style={styles.petImage} />
        ) : (
          <View style={[styles.petImage, { backgroundColor: currentColors.surfaceVariant }]}>
            <MaterialCommunityIcons 
              name={type.toLowerCase() === 'dog' ? 'dog' : 'cat'} 
              size={60} 
              color={currentColors.primary} 
            />
          </View>
        )}
        <Text style={[styles.petName, { color: currentColors.text }]}>
          {name}
        </Text>
        <Text style={{ color: currentColors.textSecondary }}>
          {type} • {breed}
        </Text>
      </View>

      <View style={[styles.section, { borderColor: currentColors.border }]}>
        <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>Pet Details</Text>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Name:</Text>
          <Text style={{ color: currentColors.text }}>{name}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Type:</Text>
          <Text style={{ color: currentColors.text }}>{type}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Breed:</Text>
          <Text style={{ color: currentColors.text }}>{breed}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Age:</Text>
          <Text style={{ color: currentColors.text }}>{age} {age ? 'years' : ''}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Gender:</Text>
          <Text style={{ color: currentColors.text }}>{gender}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Owner:</Text>
          <Text style={{ color: currentColors.text }}>{ownerName}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Last Visit:</Text>
          <Text style={{ color: currentColors.text }}>{lastVisit}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Added on:</Text>
          <Text style={{ color: currentColors.text }}>{createdAt}</Text>
        </View>
        
        <View style={styles.detailRow}>
          <Text style={[styles.detailLabel, { color: currentColors.textSecondary }]}>Last Updated:</Text>
          <Text style={{ color: currentColors.text }}>{updatedAt}</Text>
        </View>
      </View>

      <View style={[styles.section, { borderColor: currentColors.border, flexDirection: 'row', justifyContent: 'space-between' }]}>
        <TouchableOpacity 
          style={[styles.actionButton, { backgroundColor: currentColors.primary }]}
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
        <View style={[styles.section, { borderColor: currentColors.border }]}>
          <Text style={[styles.sectionTitle, { color: currentColors.primary }]}>Medical History</Text>
          <Text style={{ color: currentColors.text }}>{medicalHistory}</Text>
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
