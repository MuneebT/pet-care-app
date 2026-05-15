import { auth, db } from "@/services/firebase";
import { router } from "expo-router";
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
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BorderRadius, Spacing, Shadow } from "@/constants/theme";
import BottomNavigationBar from "./bottomnavigationbar";
import { AppointmentCard } from "@/components/ui/appointment-card";

interface Appointment {
  id: string;
  userId: string;
  petId: string;
  vetId: string;
  petName: string;
  petType?: string;
  vetName: string;
  date: Date;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

const parseDate = (dateValue: any): Date => {
  if (!dateValue) return new Date();
  
  if (typeof dateValue.toDate === 'function') {
    return dateValue.toDate();
  }
  
  if (typeof dateValue === 'string') {
    const parsed = new Date(dateValue);
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  }
  
  if (typeof dateValue === 'number') {
    return new Date(dateValue);
  }
  
  return new Date();
};

const MyAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const fetchAppointments = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const appointmentsRef = collection(db, "appointments");
      const q = query(appointmentsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setAppointments([]);
        setFilteredAppointments([]);
        return;
      }

      const appointmentsData: Appointment[] = [];
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data() as DocumentData;
        const appointmentDate = parseDate(data.date);
        
        const appointment: Appointment = {
          id: docSnapshot.id,
          userId: data.userId,
          petId: data.petId,
          vetId: data.vetId,
          petName: 'Loading...',
          petType: 'paw',
          vetName: 'Loading...',
          date: appointmentDate,
          time: data.time || '12:00 PM',
          status: data.status || 'pending',
          createdAt: parseDate(data.createdAt),
          updatedAt: parseDate(data.updatedAt),
        };

        try {
          if (data.petId) {
            const petDoc = await getDoc(doc(db, "users", userId, "pets", data.petId));
            if (petDoc.exists()) {
              const petData = petDoc.data() as { name?: string; type?: string };
              appointment.petName = petData.name || 'Unknown Pet';
              appointment.petType = petData.type || 'paw';
            }
          }
        } catch (petError) {
          appointment.petName = 'Pet not found';
        }

        try {
          if (data.vetId) {
            const vetDoc = await getDoc(doc(db, "vets", data.vetId));
            if (vetDoc.exists()) {
              const vetData = vetDoc.data() as { name?: string };
              appointment.vetName = vetData.name || 'Unknown Vet';
            }
          }
        } catch (vetError) {
          appointment.vetName = 'Vet not found';
        }

        appointmentsData.push(appointment);
      }

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

  const handleBookAppointmentPress = () => {
    if (!currentUser) {
      Alert.alert("Authentication Required", "Please sign in to book an appointment.");
      router.replace('/login');
      return;
    }
    router.push("/bookapointment");
  };

  const renderItem: ListRenderItem<Appointment> = ({ item }) => (
    <AppointmentCard
      petName={item.petName}
      petType={item.petType}
      vetName={item.vetName}
      date={item.date}
      time={item.time}
      status={item.status}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.gradientBackground} />
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons name="calendar-clock" size={64} color="#6366F1" />
          <Text style={styles.loadingText}>Loading your appointments...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.gradientBackground} />
        <View style={styles.errorContent}>
          <MaterialCommunityIcons name="alert-circle-outline" size={64} color="#EF4444" />
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={() => currentUser && fetchAppointments(currentUser.uid)}
          >
            <Text style={styles.retryButtonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground} />
      
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <ScrollView 
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <View style={styles.titleRow}>
                  <MaterialCommunityIcons name="calendar-check" size={32} color="#6366F1" />
                  <Text style={styles.title}>My Appointments</Text>
                </View>
                <TouchableOpacity
                  style={styles.bookButton}
                  onPress={handleBookAppointmentPress}
                  activeOpacity={0.8}
                >
                  <MaterialCommunityIcons name="plus" size={20} color="#FFFFFF" />
                  <Text style={styles.bookButtonText}>Book New</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.filterContainer}>
                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filter === "upcoming" && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter("upcoming")}
                >
                  <MaterialCommunityIcons 
                    name="calendar-clock" 
                    size={18} 
                    color={filter === "upcoming" ? "#FFFFFF" : "#64748B"} 
                  />
                  <Text
                    style={[
                      styles.filterText,
                      filter === "upcoming" && styles.filterTextActive,
                    ]}
                  >
                    Upcoming
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.filterButton,
                    filter === "past" && styles.filterButtonActive,
                  ]}
                  onPress={() => setFilter("past")}
                >
                  <MaterialCommunityIcons 
                    name="history" 
                    size={18} 
                    color={filter === "past" ? "#FFFFFF" : "#64748B"} 
                  />
                  <Text
                    style={[
                      styles.filterText,
                      filter === "past" && styles.filterTextActive,
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
                  <View style={styles.emptyIconContainer}>
                    <MaterialCommunityIcons 
                      name={filter === 'upcoming' ? "calendar-blank" : "calendar-remove"} 
                      size={64} 
                      color="#CBD5E1" 
                    />
                  </View>
                  <Text style={styles.emptyTitle}>
                    {filter === 'upcoming' 
                      ? 'No Upcoming Appointments' 
                      : 'No Past Appointments'}
                  </Text>
                  <Text style={styles.emptySubtitle}>
                    {filter === 'upcoming' 
                      ? 'Book an appointment to keep your pets healthy!' 
                      : 'Your completed appointments will appear here.'}
                  </Text>
                  {filter === 'upcoming' && (
                    <TouchableOpacity
                      style={styles.emptyButton}
                      onPress={handleBookAppointmentPress}
                      activeOpacity={0.8}
                    >
                      <MaterialCommunityIcons name="plus" size={18} color="#FFFFFF" />
                      <Text style={styles.emptyButtonText}>Book Now</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </ScrollView>
            
            <View style={styles.bottomNavContainer}>
              <BottomNavigationBar />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#F8FAFC',
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  errorContent: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: Spacing.lg,
    backgroundColor: '#EF4444',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  bookButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
    ...Shadow.md,
  },
  bookButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  filterContainer: {
    flexDirection: "row",
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.xs,
    marginBottom: Spacing.lg,
    ...Shadow.sm,
  },
  filterButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    gap: Spacing.xs,
  },
  filterButtonActive: {
    backgroundColor: '#6366F1',
  },
  filterText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: Spacing.xxl,
    paddingHorizontal: Spacing.lg,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6366F1',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginTop: Spacing.lg,
    gap: Spacing.xs,
    ...Shadow.md,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomNavContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none',
  },
});

export default MyAppointments;
