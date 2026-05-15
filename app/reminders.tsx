import { auth, db } from "@/services/firebase";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
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
import { Colors, BorderRadius, Spacing, FontSize, Shadow, FontWeight } from '@/constants/theme';

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

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(date);
  };

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

  const safeToDate = (value: unknown): Date => {
    if (!value) return new Date();
    if (typeof value === 'object' && 'toDate' in (value as object)) {
      return (value as { toDate: () => Date }).toDate();
    }
    if (value instanceof Date) return value;
    if (typeof value === 'string' || typeof value === 'number') return new Date(value);
    return new Date();
  };

  const fetchReminders = async (userId: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
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
      
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data() as DocumentData;
        const reminder: Reminder = {
          id: docSnapshot.id,
          userId: data.userId,
          petId: data.petId,
          vetId: data.vetId,
          petName: 'Loading...',
          vetName: 'Loading...',
          date: safeToDate(data.date),
          time: data.time || '12:00 PM',
          status: data.status || 'confirmed',
          createdAt: safeToDate(data.createdAt),
          updatedAt: safeToDate(data.updatedAt),
        };

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
        <View style={styles.cardHeader}>
          <View style={styles.petInfoContainer}>
            <View style={styles.petAvatar}>
              <MaterialIcons name="pets" size={20} color={Colors.light.primary} />
            </View>
            <View>
              <Text style={styles.petName}>{item.petName}</Text>
              <Text style={styles.vetName}>Dr. {item.vetName}</Text>
            </View>
          </View>
          <View style={styles.statusBadge}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Confirmed</Text>
          </View>
        </View>
        
        <View style={styles.cardDivider} />
        
        <View style={styles.cardContent}>
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateContainer}>
              <MaterialCommunityIcons name="calendar" size={18} color={Colors.light.textSecondary} />
              <Text style={styles.dateText}>{formatDate(item.date)}</Text>
            </View>
            <View style={styles.timeContainer}>
              <MaterialCommunityIcons name="clock-outline" size={18} color={Colors.light.textSecondary} />
              <Text style={styles.timeText}>{item.time}</Text>
            </View>
          </View>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.light.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorIconContainer}>
          <MaterialIcons name="error-outline" size={48} color={Colors.light.error} />
        </View>
        <Text style={styles.errorText}>{error}</Text>
        <Button 
          mode="contained" 
          onPress={() => currentUser && fetchReminders(currentUser.uid)}
          style={styles.retryButton}
          labelStyle={styles.retryButtonLabel}
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
          <View style={styles.header}>
            <Text style={styles.title}>Reminders</Text>
            <Text style={styles.subtitle}>{filteredReminders.length} appointments</Text>
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

          <ScrollView contentContainerStyle={styles.scrollViewContent} showsVerticalScrollIndicator={false}>
            {filteredReminders.length === 0 ? (
              <View style={styles.emptyState}>
                <View style={styles.emptyIconContainer}>
                  <MaterialCommunityIcons name="calendar-blank" size={56} color={Colors.light.textTertiary} />
                </View>
                <Text style={styles.emptyStateText}>
                  {filter === 'upcoming' 
                    ? 'No upcoming appointments' 
                    : 'No past appointments'}
                </Text>
                <Text style={styles.emptyStateSubtext}>
                  {filter === 'upcoming' 
                    ? 'Book an appointment to see it here' 
                    : 'Your completed appointments will appear here'}
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
    backgroundColor: Colors.light.background,
  },
  innerContainer: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: Colors.light.white,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  subtitle: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginTop: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.light.background,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl,
    backgroundColor: Colors.light.background,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  errorText: {
    color: Colors.light.textSecondary,
    marginBottom: Spacing.lg,
    textAlign: 'center',
    fontSize: FontSize.md,
  },
  retryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.lg,
  },
  retryButtonLabel: {
    color: Colors.light.white,
    fontWeight: FontWeight.semibold,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    backgroundColor: Colors.light.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
  },
  filterButton: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    marginHorizontal: Spacing.xs,
  },
  activeFilterButton: {
    backgroundColor: Colors.light.primary,
  },
  filterText: {
    color: Colors.light.textSecondary,
    fontWeight: FontWeight.medium,
    fontSize: FontSize.sm,
  },
  activeFilterText: {
    color: Colors.light.white,
    fontWeight: FontWeight.semibold,
  },
  scrollViewContent: {
    padding: Spacing.md,
    paddingBottom: 100,
  },
  card: {
    backgroundColor: Colors.light.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadow.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
  },
  petInfoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  petAvatar: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm,
  },
  petName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: Colors.light.text,
  },
  vetName: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.light.secondary,
    marginRight: 4,
  },
  statusText: {
    fontSize: FontSize.xs,
    color: Colors.light.secondary,
    fontWeight: FontWeight.medium,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.light.border,
  },
  cardContent: {
    padding: Spacing.md,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: Spacing.lg,
  },
  dateText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: FontSize.sm,
    color: Colors.light.textSecondary,
    marginLeft: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  bottomNavContainer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    pointerEvents: 'box-none',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: Spacing.xxl,
  },
  emptyIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.surfaceVariant,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  emptyStateText: {
    fontSize: FontSize.lg,
    color: Colors.light.text,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  emptyStateSubtext: {
    fontSize: FontSize.sm,
    color: Colors.light.textTertiary,
    textAlign: 'center',
    maxWidth: '70%',
  },
});
