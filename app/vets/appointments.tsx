import { auth, db } from "@/services/firebase";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where
} from "firebase/firestore";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextStyle,
  TouchableOpacity,
  View,
  ViewStyle
} from "react-native";
import { Button } from "react-native-paper";
import { BorderRadius, Spacing, Shadow, FontSize, FontWeight, currentColors } from '@/constants/theme';
import Skeleton from '@/components/ui/skeleton';

type AppointmentStatus = 'pending' | 'confirmed' | 'cancelled';

interface Appointment {
  id: string;
  userId: string;
  petId: string;
  vetId: string;
  petName: string;
  ownerName: string;
  date: Date;
  time: string;
  status: AppointmentStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface Styles {
  [key: string]: ViewStyle | TextStyle | any;
  container: ViewStyle;
  innerContainer: ViewStyle;
  scrollViewContent: ViewStyle;
  header: ViewStyle;
  title: TextStyle;
  loadingContainer: ViewStyle;
  errorContainer: ViewStyle;
  errorText: TextStyle;
  filterContainer: ViewStyle;
  filterButton: ViewStyle;
  activeFilterButton: ViewStyle;
  filterText: TextStyle;
  activeFilterText: TextStyle;
  card: ViewStyle;
  headerRow: ViewStyle;
  petName: TextStyle;
  statusBadge: (status: string) => ViewStyle;
  statusText: (status: string) => TextStyle;
  ownerName: TextStyle;
  dateTimeContainer: ViewStyle;
  dateTimeText: TextStyle;
  emptyState: ViewStyle;
  emptyStateText: TextStyle;
  actionButtons: ViewStyle;
  actionButton: ViewStyle;
  confirmButton: ViewStyle;
  cancelButton: ViewStyle;
  actionButtonText: TextStyle;
}

const styles = StyleSheet.create<Styles>({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  innerContainer: {
    flex: 1,
  },
  scrollViewContent: {
    padding: Spacing.md,
    paddingBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    color: currentColors.error,
    marginBottom: Spacing.lg,
    textAlign: 'center',
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    margin: Spacing.md,
    marginTop: 0,
    backgroundColor: currentColors.surfaceVariant,
    borderRadius: BorderRadius.sm,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: currentColors.surface,
    ...Shadow.sm,
  },
  filterText: {
    color: currentColors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  activeFilterText: {
    color: currentColors.primary,
    fontWeight: FontWeight.semibold,
  },
  card: {
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    ...Shadow.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  petName: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
  },
  statusBadge: (status: string) => ({
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: BorderRadius.md,
    backgroundColor: status === 'confirmed' ? '#d4edda' : 
                   status === 'pending' ? '#fff3cd' : '#f8d7da',
  } as ViewStyle),
  statusText: (status: string) => ({
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
    color: status === 'confirmed' ? '#155724' : 
           status === 'pending' ? '#856404' : '#721c24',
  } as TextStyle),
  ownerName: {
    color: currentColors.textSecondary,
    marginBottom: 4,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  dateTimeText: {
    color: currentColors.textSecondary,
    fontSize: FontSize.sm,
    marginLeft: 6,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: FontSize.md,
    color: currentColors.textTertiary,
    textAlign: 'center',
    marginTop: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: Spacing.sm,
  },
  actionButton: {
    marginLeft: Spacing.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.sm,
  },
  confirmButton: {
    backgroundColor: currentColors.success,
  },
  cancelButton: {
    backgroundColor: currentColors.error,
  },
  actionButtonText: {
    color: currentColors.white,
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
});

const VetAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<'all' | AppointmentStatus>('all');
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const lastFetchRef = useRef<number>(0);
  const cachedFilterRef = useRef<'all' | AppointmentStatus>('all');
  const CACHE_TTL = 60_000;
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  // Format date to readable string
  const formatDate = useCallback((date: Date | Timestamp) => {
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }, []);

  // Format time to readable string
  const formatTime = useCallback((date: Date | Timestamp) => {
    const dateObj = date instanceof Date ? date : date.toDate();
    return dateObj.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => unsubscribe();
  }, []);

  // Helper function to parse date from Firestore (handles both Timestamp and string formats)
  const parseFirestoreDate = (dateValue: any): Date => {
    try {
      if (!dateValue) return new Date();
      if (dateValue.toDate) return dateValue.toDate(); // Handle Firestore Timestamp
      if (typeof dateValue === 'string') return new Date(dateValue); // Handle ISO string
      if (dateValue.seconds) return new Date(dateValue.seconds * 1000); // Handle Timestamp object
      return new Date(); // Fallback to current date
    } catch (e) {
      console.error('Error parsing date:', dateValue, e);
      return new Date();
    }
  };

  // Helper function to fetch user and pet data
  const fetchUserAndPetData = async (userId: string, petId: string) => {
    try {
      // Fetch user data
      const userDoc = await getDoc(doc(db, 'users', userId));
      const userData = userDoc.data();
      
      // Fetch pet data
      const petDoc = await getDoc(doc(db, 'users', userId, 'pets', petId));
      const petData = petDoc.data();
      
      return {
        ownerName: userData?.name || 'Unknown Owner',
        petName: petData?.name || 'Unknown Pet',
      };
    } catch (error) {
      console.error('Error fetching user/pet data:', error);
      return {
        ownerName: 'Unknown Owner',
        petName: 'Unknown Pet',
      };
    }
  };

  const processSnapshot = useCallback(async (querySnapshot: any, isFirstSnapshot: boolean) => {
    const appointmentsData: Appointment[] = [];
    
    for (const doc of querySnapshot.docs) {
      try {
        const data = doc.data();
        const appointmentDate = parseFirestoreDate(data.date);
        const createdAt = parseFirestoreDate(data.createdAt);
        const updatedAt = parseFirestoreDate(data.updatedAt);
        
        const { ownerName, petName } = await fetchUserAndPetData(data.userId, data.petId);
        
        appointmentsData.push({
          id: doc.id,
          userId: data.userId || '',
          petId: data.petId || '',
          vetId: data.vetId || currentUser!.uid,
          petName: petName,
          ownerName: ownerName,
          date: appointmentDate,
          time: data.time || formatTime(appointmentDate),
          status: (data.status as AppointmentStatus) || 'pending',
          createdAt: createdAt,
          updatedAt: updatedAt,
        });
      } catch (err) {
        console.error('Error processing document:', doc.id, err);
      }
    }

    const filteredAppointments = filter === 'all' 
      ? appointmentsData 
      : appointmentsData.filter(appt => appt.status === filter);

    lastFetchRef.current = Date.now();
    cachedFilterRef.current = filter;
    setAppointments(filteredAppointments);
    setRefreshing(false);

    if (isFirstSnapshot) {
      setIsLoading(false);
    }
  }, [currentUser, filter]);

  const fetchAppointments = useCallback((force = false) => {
    if (!currentUser) {
      setIsLoading(false);
      return;
    }

    const now = Date.now();
    const cacheAge = now - lastFetchRef.current;
    const isCacheFresh = cacheAge < CACHE_TTL && cachedFilterRef.current === filter;

    if (isCacheFresh && !force) {
      setIsLoading(false);
      setRefreshing(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const q = query(
        collection(db, 'appointments'),
        where('vetId', '==', currentUser.uid),
        orderBy('date', 'desc')
      );

      let isFirstSnapshot = true;

      const unsubscribe = onSnapshot(q, async (querySnapshot) => {
        await processSnapshot(querySnapshot, isFirstSnapshot);
        isFirstSnapshot = false;
      });

      unsubscribeRef.current = unsubscribe;
    } catch (err) {
      console.error('Error fetching appointments:', err);
      setError('Failed to load appointments. Please try again.');
      setRefreshing(false);
      setIsLoading(false);
    }
  }, [currentUser, filter, processSnapshot]);

  // Handle refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAppointments(true);
  }, [fetchAppointments]);

  // Handle appointment status update
  const updateAppointmentStatus = useCallback(async (appointmentId: string, status: 'confirmed' | 'cancelled') => {
    try {
      const appointmentRef = doc(db, 'appointments', appointmentId);
      await updateDoc(appointmentRef, {
        status,
        updatedAt: Timestamp.now()
      });
      
      // Update local state
      setAppointments(prevAppointments =>
        prevAppointments.map(appt =>
          appt.id === appointmentId
            ? { ...appt, status, updatedAt: new Date() }
            : appt
        )
      );
      
      Alert.alert('Success', `Appointment has been ${status} successfully.`);
    } catch (error) {
      console.error('Error updating appointment status:', error);
      Alert.alert('Error', 'Failed to update appointment status. Please try again.');
    }
  }, []);

  // Fetch appointments when currentUser or filter changes
  useEffect(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    if (currentUser) {
      fetchAppointments();
    }
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [currentUser, filter, fetchAppointments]);

  // Render appointment item
  const renderAppointmentItem = useCallback(({ item }: { item: Appointment }) => (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.petName}>{item.petName}</Text>
        <View style={styles.statusBadge(item.status)}>
          <Text style={styles.statusText(item.status)}>
            {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
          </Text>
        </View>
      </View>
      
      <Text style={styles.ownerName}>
        Owner: {item.ownerName}
      </Text>
      
      <View style={styles.dateTimeContainer}>
        <MaterialCommunityIcons name="calendar" size={16} color="#666" />
        <Text style={styles.dateTimeText}>
          {formatDate(item.date)}
        </Text>
      </View>
      
      <View style={styles.dateTimeContainer}>
        <MaterialCommunityIcons name="clock" size={16} color="666" />
        <Text style={styles.dateTimeText}>
          {item.time}
        </Text>
      </View>
      
      {item.status === 'pending' && (
        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[styles.actionButton, styles.confirmButton]}
            onPress={() => updateAppointmentStatus(item.id, 'confirmed')}
          >
            <Text style={styles.actionButtonText}>Confirm</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.cancelButton]}
            onPress={() => updateAppointmentStatus(item.id, 'cancelled')}
          >
            <Text style={styles.actionButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  ), [formatDate, updateAppointmentStatus]);

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <Skeleton width={200} height={16} borderRadius={8} style={{ marginBottom: Spacing.lg }} />
          <View style={{ marginHorizontal: Spacing.md, marginBottom: Spacing.md }}>
            <View style={{ flexDirection: 'row', gap: Spacing.sm }}>
              {[1, 2, 3].map(i => <Skeleton key={i} width={100} height={36} borderRadius={BorderRadius.sm} />)}
            </View>
          </View>
          {[1, 2, 3].map(i => (
            <View key={i} style={{ backgroundColor: currentColors.surface, borderRadius: BorderRadius.md, padding: Spacing.md, marginHorizontal: Spacing.md, marginBottom: Spacing.sm }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.sm }}>
                <Skeleton width={140} height={18} borderRadius={6} />
                <Skeleton width={70} height={22} borderRadius={12} />
              </View>
              <Skeleton width={100} height={14} borderRadius={6} />
              <Skeleton width={180} height={14} borderRadius={6} style={{ marginTop: 4 }} />
            </View>
          ))}
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => fetchAppointments(true)} 
          style={{ marginTop: 10 }}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.innerContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>My Appointments</Text>
        </View>
        
        <View style={styles.filterContainer}>
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'all' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'all' && styles.activeFilterText,
              ]}
            >
              All
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'pending' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('pending')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'pending' && styles.activeFilterText,
              ]}
            >
              Pending
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.filterButton,
              filter === 'confirmed' && styles.activeFilterButton,
            ]}
            onPress={() => setFilter('confirmed')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.filterText,
                filter === 'confirmed' && styles.activeFilterText,
              ]}
            >
              Confirmed
            </Text>
          </TouchableOpacity>
        </View>
        
        {appointments.length === 0 ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="calendar-remove"
              size={48}
              color="#999"
            />
            <Text style={styles.emptyStateText}>
              {filter === 'all' 
                ? 'No appointments found' 
                : `No ${filter} appointments`}
            </Text>
          </View>
        ) : (
          <FlatList
            data={appointments}
            renderItem={renderAppointmentItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.scrollViewContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[currentColors.primary]}
                tintColor={currentColors.primary}
              />
            }
            ListFooterComponent={<View style={{ height: 20 }} />}
          />
        )}
      </View>
    </View>
  );
};

export default VetAppointments;
