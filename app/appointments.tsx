import { auth, db } from "@/src/config/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import {
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  query,
  where
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import BottomNavigationBar from "./bottomnavigationbar";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 100,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
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
    padding: 20,
  },
  errorText: {
    color: 'red',
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 10,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    padding: 4,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  activeFilterButton: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  filterText: {
    color: '#666',
    fontWeight: '500',
  },
  activeFilterText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  bookButton: {
    backgroundColor: '#5B4034',
    marginTop: 25,
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 20,
  },
  bookButtonLabel: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  petName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  vetName: {
    color: '#666',
    marginBottom: 4,
  },
  dateText: {
    color: '#666',
    fontSize: 14,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

interface Appointment {
  id: string;
  userId: string;
  petId: string;
  vetId: string;
  petName: string;
  vetName: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const MyAppointments: React.FC = () => {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const theme = useTheme();

  // Format date to readable string
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  // Get current user on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchAppointments(user.uid);
      } else {
        router.replace('/login');
      }
      setIsLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const handleBookAppointment = () => {
    if (!currentUser) {
      Alert.alert("Authentication Required", "Please sign in to book an appointment.");
      router.replace('/login');
      return;
    }
    router.push("/bookapointment");
  };

  const fetchAppointments = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Query appointments for the current user
      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setAppointments([]);
        setFilteredAppointments([]);
        return;
      }

      const appointmentsData: Appointment[] = [];
      
      // Process each appointment
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data() as DocumentData;
        const appointmentDate = data.date?.toDate() || new Date();
        
        const appointment: Appointment = {
          id: docSnapshot.id,
          userId: data.userId,
          petId: data.petId,
          vetId: data.vetId,
          petName: 'Loading...',
          vetName: 'Loading...',
          date: appointmentDate,
          time: data.time || '12:00 PM',
          status: data.status || 'pending',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        // Fetch pet details
        try {
          if (data.petId) {
            const petDoc = await getDoc(doc(db, "users", userId, "pets", data.petId));
            if (petDoc.exists()) {
              const petData = petDoc.data() as { name?: string };
              appointment.petName = petData.name || 'Unknown Pet';
            }
          }
        } catch (petError) {
          console.error('Error fetching pet:', petError);
          appointment.petName = 'Pet not found';
        }

        // Fetch vet details
        try {
          if (data.vetId) {
            const vetDoc = await getDoc(doc(db, "vets", data.vetId));
            if (vetDoc.exists()) {
              const vetData = vetDoc.data() as { name?: string };
              appointment.vetName = vetData.name || 'Unknown Vet';
            }
          }
        } catch (vetError) {
          console.error('Error fetching vet:', vetError);
          appointment.vetName = 'Vet not found';
        }

        appointmentsData.push(appointment);
      }

      // Sort by date (newest first)
      const sortedAppointments = [...appointmentsData].sort(
        (a, b) => b.date.getTime() - a.date.getTime()
      );
      
      setAppointments(appointmentsData);
      setFilteredAppointments(sortedAppointments);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter appointments based on selected filter
  useEffect(() => {
    if (appointments.length === 0) return;
    
    const now = new Date();
    const filtered = appointments.filter(appointment => {
      return filter === 'upcoming' 
        ? appointment.date >= now 
        : appointment.date < now;
    });
    
    setFilteredAppointments(filtered);
  }, [filter, appointments]);


  const renderItem: ListRenderItem<Appointment> = ({ item }) => {
    const status = item.status === 'confirmed' ? "Confirmed" : "Pending";
    const statusColor = item.status === 'confirmed' ? "#B2F0C0" : "#FCE59C";

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.petName}>{item.petName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.vetName}>Vet: {item.vetName}</Text>
        <Text style={styles.dateText}>
          {formatDate(item.date)} at {item.time}
        </Text>
      </View>
    );
  };

  const handleBookAppointmentPress = () => {
    if (!currentUser) {
      Alert.alert("Authentication Required", "Please sign in to book an appointment.");
      router.replace('/login');
      return;
    }
    router.push("/bookapointment");
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => currentUser && fetchAppointments(currentUser.uid)}
          style={styles.retryButton}
        >
          Retry
        </Button>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.header}>
              <Text style={styles.title}>My Appointments</Text>
              <TouchableOpacity
                style={styles.bookButton}
                onPress={handleBookAppointmentPress}
              >
                <Text style={styles.bookButtonLabel}>Book New</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.filterContainer}>
              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "upcoming" && styles.activeFilterButton,
                ]}
                onPress={() => setFilter("upcoming")}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === "upcoming" && styles.activeFilterText,
                  ]}
                >
                  Upcoming
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.filterButton,
                  filter === "past" && styles.activeFilterButton,
                ]}
                onPress={() => setFilter("past")}
              >
                <Text
                  style={[
                    styles.filterText,
                    filter === "past" && styles.activeFilterText,
                  ]}
                >
                  Past
                </Text>
              </TouchableOpacity>
            </View>

            {filteredAppointments.length > 0 ? (
              <FlatList
                data={filteredAppointments}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {filter === 'upcoming' 
                    ? 'No upcoming appointments' 
                    : 'No past appointments'}
                </Text>
              </View>
            )}
          </ScrollView>
          
          <View style={styles.bottomNavContainer}>
            <BottomNavigationBar />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default MyAppointments;
