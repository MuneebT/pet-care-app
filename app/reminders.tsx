import { db } from "@/src/config/firebase";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  ListRenderItem,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import BottomNavigationBar from "./bottomnavigationbar";

interface Appointment {
  id: string;
  userId: string;
  petname: string;
  vetname: string;
  date: string; 
  time: string;
  stattus: boolean; // TRUE = confirmed
}

const RemindersScreen: React.FC = () => {
  const [reminders, setReminders] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [filteredReminders, setFilteredReminders] = useState<Appointment[]>([]);

  // Fetch only confirmed appointments
  const getConfirmedAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const dataList: Appointment[] = querySnapshot.docs
        .map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            userId: data.userId ?? "",
            petname: data.petname ?? "Unknown Pet",
            vetname: data.vetname ?? "Unknown Vet",
            date: data.date ?? "",
            time: data.time ?? "",
            stattus: data.stattus ?? false,
          };
        })
        .filter((item) => item.stattus === true); // 👈 Only confirmed appointments

      setReminders(dataList);
    } catch (error) {
      console.error("Error fetching reminders:", error);
    }
  };

  useEffect(() => {
    getConfirmedAppointments();
  }, []);

  useEffect(() => {
    filterReminders();
  }, [reminders, filter]);

  const filterReminders = () => {
    const today = new Date();
    const filtered = reminders.filter((item) => {
      const appointmentDate = new Date(item.date);
      return filter === "upcoming"
        ? appointmentDate >= today
        : appointmentDate < today;
    });
    setFilteredReminders(filtered);
  };

  const renderItem: ListRenderItem<Appointment> = ({ item }) => {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.petName}>{item.petname}</Text>
          <View style={[styles.statusBadge]}>
            <Text style={styles.statusText}>Reminder</Text>
          </View>
        </View>

        <Text style={styles.vetName}>Vet: {item.vetname}</Text>
        <Text style={styles.dateText}>
          {item.date} at {item.time}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "orange" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 10,
            paddingTop: 40,
            paddingBottom: 100,
          }}
        >
          <Text style={styles.title}>Reminders</Text>

          {/* Toggle */}
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
            <Text style={{ textAlign: "center", color: "#6C4A3E", marginTop: 20 }}>
              No reminders.
            </Text>
          ) : (
            <FlatList
              data={filteredReminders}
              renderItem={renderItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              contentContainerStyle={{ paddingHorizontal: 5 }}
            />
          )}
        </ScrollView>

        {/* Bottom Navigation */}
        <View style={styles.bottomNavContainer}>
          <BottomNavigationBar />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

export default RemindersScreen;

const styles = StyleSheet.create({
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5B4034",
    marginBottom: 20,
  },
  filterContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 20,
  },
  filterBackground: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 30,
    padding: 5,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  activeFilterButton: {
    backgroundColor: "#5B4034",
  },
  filterText: {
    fontWeight: "bold",
    color: "#5B4034",
  },
  activeFilterText: {
    color: "white",
  },
  card: {
    backgroundColor: "white",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
});
