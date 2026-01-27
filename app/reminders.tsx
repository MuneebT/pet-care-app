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

interface Reminder {
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

const RemindersScreen: React.FC = () => {
  const { uid } = useLocalSearchParams<{ uid: string }>();
  const [reminders, setReminders] = useState<Reminder[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [filteredReminders, setFilteredReminders] = useState<Reminder[]>([]);
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
        await fetchReminders(user.uid);
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

  const fetchReminders = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Query appointments for the current user that are confirmed
      const appointmentsRef = collection(db, "appointments");
      const q = query(
        appointmentsRef, 
        where("userId", "==", userId),
        where("status", "==", "confirmed")
      );
      
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setReminders([]);
        setFilteredReminders([]);
        return;
      }

      const remindersData: Reminder[] = [];
      
      // Process each reminder
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data() as DocumentData;
        const reminderDate = data.date?.toDate() || new Date();
        
        const reminder: Reminder = {
          id: docSnapshot.id,
          userId: data.userId,
          petId: data.petId,
          vetId: data.vetId,
          petName: 'Loading...',
          vetName: 'Loading...',
          date: reminderDate,
          time: data.time || '12:00 PM',
          status: data.status || 'confirmed',
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
        };

        // Fetch pet details
        try {
          if (data.petId) {
            const petDoc = await getDoc(doc(db, "users", userId, "pets", data.petId));
            if (petDoc.exists()) {
              const petData = petDoc.data() as { name?: string };
              reminder.petName = petData.name || 'Unknown Pet';
            }
          }
        } catch (petError) {
          console.error('Error fetching pet:', petError);
          reminder.petName = 'Pet not found';
        }

        // Fetch vet details
        try {
          if (data.vetId) {
            const vetDoc = await getDoc(doc(db, "vets", data.vetId));
            if (vetDoc.exists()) {
              const vetData = vetDoc.data() as { name?: string };
              reminder.vetName = vetData.name || 'Unknown Vet';
            }
          }
        } catch (vetError) {
          console.error('Error fetching vet:', vetError);
          reminder.vetName = 'Vet not found';
        }

        remindersData.push(reminder);
      }

      // Sort by date (newest first)
      const sortedReminders = [...remindersData].sort(
        (a, b) => a.date.getTime() - b.date.getTime()
      );
      
      setReminders(sortedReminders);
      filterReminders(sortedReminders);
    } catch (error) {
      console.error('Error fetching reminders:', error);
      setError('Failed to load reminders. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter reminders based on selected filter
  const filterReminders = (remindersList = reminders) => {
    if (remindersList.length === 0) {
      setFilteredReminders([]);
      return;
    }
    
    const now = new Date();
    const filtered = remindersList.filter(reminder => {
      return filter === 'upcoming' 
        ? reminder.date >= now 
        : reminder.date < now;
    });
    
    setFilteredReminders(filtered);
  };

  useEffect(() => {
    filterReminders();
  }, [filter]);

  const renderItem: ListRenderItem<Reminder> = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.petName}>{item.petName}</Text>
          <View style={[styles.statusBadge, { backgroundColor: '#B2F0C0' }]}>
            <Text style={styles.statusText}>Reminder</Text>
          </View>
        </View>

        <Text style={styles.vetName}>Vet: {item.vetName}</Text>
        <Text style={styles.dateText}>
          {formatDate(item.date)} at {item.time}
        </Text>
      </View>
    );
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
          onPress={() => currentUser && fetchReminders(currentUser.uid)}
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
              <Text style={styles.title}>Reminders</Text>
            </View>

            <View style={styles.filterContainer}>
              <View style={styles.filterBackground}>
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
            </View>

            {filteredReminders.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  {filter === 'upcoming' 
                    ? 'No upcoming reminders' 
                    : 'No past reminders'}
                </Text>
              </View>
            ) : (
              <FlatList
                data={filteredReminders}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
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

export default RemindersScreen;

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
    color: '#5B4034',
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
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 20,
  },
  filterBackground: {
    flexDirection: 'row',
    backgroundColor: '#f0f0f0',
    borderRadius: 30,
    padding: 4,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 25,
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
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  petName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#5B4034",
  },
  statusBadge: {
    backgroundColor: "#B2F0C0",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusText: {
    fontWeight: "bold",
    color: "#333",
  },
  vetName: {
    fontSize: 16,
    color: "#6C4A3E",
    marginTop: 8,
  },
  dateText: {
    fontSize: 14,
    color: "#6C4A3E",
    marginTop: 5,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
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
});
