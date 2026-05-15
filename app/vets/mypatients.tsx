import { auth, db } from '@/services/firebase';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { collection, doc, getDoc, getDocs, query, where } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  
    FlatList,
    Image,
    SafeAreaView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { BorderRadius, Spacing, Shadow, FontSize, FontWeight, currentColors } from '@/constants/theme';
import Skeleton from '@/components/ui/skeleton';
import VetBottomNavigationBar from './bootomna';

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
  image?: string;
  [key: string]: any; // For any other fields
};

const MyPatients = () => {
  const router = useRouter();
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
        image: data?.image,
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
          router.push('/login');
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
        
        const toDate = (val: any): Date | null => {
          if (!val) return null;
          if (typeof val.toDate === 'function') return val.toDate();
          if (val instanceof Date) return val;
          if (typeof val === 'string' || typeof val === 'number') return new Date(val);
          if (val.seconds) return new Date(val.seconds * 1000);
          return null;
        };

        const petAppointments = new Map();
        querySnapshot.forEach(doc => {
          const data = doc.data();
          const petId = data.petId;
          if (petId) {
            petAppointments.set(petId, {
              ...data,
              appointmentId: doc.id,
              date: toDate(data.date),
              ownerId: data.userId
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
                lastVisit: appointment?.date
                  ? appointment.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'N/A',
                nextAppointment: appointment?.date
                  ? appointment.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                  : 'N/A',
                image: petData.image || null
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
  }, [currentUser]);

  const renderPatientItem = ({ item }: { item: Patient }) => (
    <Link
      href={{
        pathname: '/vets/[id]',
        params: { id: item.id }
      }}
      asChild
    >
      <TouchableOpacity style={styles.card} accessibilityLabel={`View ${item.petName}'s profile`}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles.petImage} />
        ) : (
          <View style={[styles.petImage, { backgroundColor: '#F1F5F9' }]}>
            <MaterialCommunityIcons
              name={item.petType.toLowerCase() === 'dog' ? 'dog' : 'cat'}
              size={40}
              color={currentColors.textTertiary}
            />
          </View>
        )}
        <View style={styles.patientInfo}>
          <Text style={[styles.petName, { color: currentColors.text }]}>{item.petName}</Text>
          <Text style={[styles.ownerName, { color: currentColors.textSecondary }]}>{item.name}</Text>
          <View style={styles.detailsRow}>
            <Text style={[styles.detailText, { color: currentColors.textSecondary }]}>
              {item.petType} • Last visit: {item.lastVisit}
            </Text>
          </View>
        </View>
        <MaterialCommunityIcons
          name="chevron-right"
          size={24}
          color={currentColors.textTertiary}
        />
      </TouchableOpacity>
    </Link>
  );

  if (loading) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: currentColors.background }}>
        <View style={{ padding: Spacing.lg, paddingBottom: Spacing.sm }}>
          <Skeleton width={180} height={26} borderRadius={8} />
        </View>
        <View style={{ paddingHorizontal: Spacing.lg }}>
          {[1, 2, 3].map(i => (
            <View key={i} style={[styles.card, { marginBottom: Spacing.md }]}>
              <Skeleton width={60} height={60} borderRadius={30} />
              <View style={{ flex: 1, marginLeft: Spacing.md }}>
                <Skeleton width={140} height={18} borderRadius={6} />
                <Skeleton width={100} height={14} borderRadius={6} style={{ marginTop: 6 }} />
                <Skeleton width={180} height={12} borderRadius={6} style={{ marginTop: 6 }} />
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentColors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: currentColors.text }]}>
          My Patients
        </Text>
      </View>

      {patients.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons
            name="account-group"
            size={64}
            color={currentColors.textTertiary}
          />
          <Text style={[styles.emptyText, { color: currentColors.textSecondary, marginBottom: 16 }]}>
            {invalidPetIds.size > 0
              ? 'Some appointments reference missing pet data'
              : 'No patients found'}
          </Text>
          {invalidPetIds.size > 0 && (
            <View style={styles.warningBox}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={24}
                color="#EF4444"
                style={styles.warningIcon}
              />
              <Text style={[styles.warningText, { color: '#EF4444' }]}>
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
    backgroundColor: currentColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: currentColors.background,
  },
  header: {
    padding: Spacing.lg,
    paddingBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  listContent: {
    padding: Spacing.lg,
    paddingTop: Spacing.sm,
    paddingBottom: 100,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    ...Shadow.md,
  },
  petImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  petName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    marginBottom: 2,
    color: currentColors.text,
  },
  ownerName: {
    fontSize: FontSize.sm,
    marginBottom: 2,
    color: currentColors.textSecondary,
  },
  detailsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
  },
  emptyText: {
    marginTop: Spacing.md,
    fontSize: FontSize.md,
    textAlign: 'center',
    color: currentColors.textSecondary,
  },
  warningBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
  },
  warningIcon: {
    marginRight: Spacing.sm,
  },
  warningText: {
    fontSize: FontSize.sm,
    flex: 1,
  },
});

export default MyPatients;
