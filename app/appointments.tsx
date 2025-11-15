import { db } from "@/src/config/firebase";
import { router, useLocalSearchParams } from "expo-router";
import { collection, DocumentData, getDocs } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
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
  stattus: boolean;
}

const MyAppointments: React.FC = () => {
  const{uid}=useLocalSearchParams()
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [filter, setFilter] = useState<"upcoming" | "past">("upcoming");
  const [filteredAppointments, setFilteredAppointments] = useState<
    Appointment[]
  >([]);

  const gotobookAppointments=()=>{
    router.push({
      pathname:"/bookapointment",
      params:{uid:uid}
    })
  }
  const getAppointments = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "appointments"));
      const dataList: Appointment[] = querySnapshot.docs.map((doc) => {
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
      });
      setAppointments(dataList);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  useEffect(() => {
    getAppointments();
  }, []);

  useEffect(() => {
    filterAppointments();
  }, [appointments, filter]);

  const filterAppointments = () => {
    const today = new Date();
    const filtered = appointments.filter((item) => {
      const appointmentDate = new Date(item.date);
      return filter === "upcoming"
        ? appointmentDate >= today
        : appointmentDate < today;
    });
    setFilteredAppointments(filtered);
  };

  const renderItem: ListRenderItem<Appointment> = ({ item }) => {
    const status = item.stattus ? "Confirmed" : "Pending";

    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <Text style={styles.petName}>{item.petname}</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: item.stattus ? "#B2F0C0" : "#FCE59C" },
            ]}
          >
            <Text style={styles.statusText}>{status}</Text>
          </View>
        </View>

        <Text style={styles.vetName}>Vet: {item.vetname}</Text>
        <Text style={styles.dateText}>
          Date & Time: {item.date}, {item.time}
        </Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "orange" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={{
              paddingHorizontal: 10,
              paddingTop: 40,
              paddingBottom: 140,
            }}
          >
            <Text style={styles.title}>My Appointments</Text>

            {/* Filter Buttons */}
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

            {filteredAppointments.length === 0 ? (
              <Text
                style={{
                  textAlign: "center",
                  color: "#6C4A3E",
                  marginTop: 20,
                }}
              >
                No appointments found.
              </Text>
            ) : (
              <FlatList
                data={filteredAppointments}
                renderItem={renderItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                contentContainerStyle={{ paddingHorizontal: 5 }}
              />
            )}

            {/* BOOK APPOINTMENT BUTTON */}
            <TouchableOpacity
              style={styles.bookButton}
              onPress={gotobookAppointments}
            >
              <Text style={styles.bookButtonText}>Book Appointment</Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Bottom Navigation Bar */}
          <View style={styles.bottomNavContainer}>
            <BottomNavigationBar />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default MyAppointments;

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
    alignItems: "center",
    justifyContent: "center",
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

  /** BOOK BUTTON */
  bookButton: {
    marginTop: 25,
    backgroundColor: "#5B4034",
    paddingVertical: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  bookButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});
