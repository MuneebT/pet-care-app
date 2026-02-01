import { auth, db } from "@/src/config/firebase";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { Picker } from "@react-native-picker/picker";
import { router } from "expo-router";
import { onAuthStateChanged, User } from "firebase/auth";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { Button, useTheme } from "react-native-paper";
import BottomNavigationBar from "./bottomnavigationbar";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string | number;
  gender: string;
  userId: string;
  createdAt?: any; // Timestamp or Date
  updatedAt?: any; // Timestamp or Date
};

type Vet = {
  id: string;
  name: string;
  specialization: string;
};

const BookAppointment = () => {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pets, setPets] = useState<Pet[]>([]);
  const [selectedPet, setSelectedPet] = useState("");
  const [vets, setVets] = useState<Vet[]>([]);
  const [selectedVet, setSelectedVet] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [date, setDate] = useState(new Date());
  const [mode, setMode] = useState<'date' | 'time'>('date');
  const [show, setShow] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        setCurrentUser(user);
        if (user) {
          await Promise.all([
            fetchPets(user.uid),
            fetchVets()
          ]);
        } else {
          router.replace('/login');
        }
      } catch (error: any) {
        console.error('Auth state change error:', error);
        const errorMessage = error?.message || "An error occurred while loading the app. Please try again.";
        Alert.alert("Error", errorMessage);
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      try {
        unsubscribe();
      } catch (error: any) {
        console.error('Error unsubscribing from auth:', error);
      }
    };
  }, []);

  const fetchPets = async (userId: string) => {
    try {
      if (!userId) {
        console.warn('No user ID provided to fetchPets');
        return;
      }
      
      console.log('Fetching pets for user:', userId);
      // Updated to query the pets subcollection under the user document
      const userPetsRef = collection(db, "users", userId, "pets");
      const snapshot = await getDocs(userPetsRef);
      
      console.log('Pets query result:', {
        size: snapshot.size,
        empty: snapshot.empty,
        docs: snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      });
      
      if (snapshot.empty) {
        console.log('No pets found for user:', userId);
        setPets([]);
        return;
      }
      
      const petsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing pet data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          name: data.name || 'Unnamed Pet',
          type: data.type || 'Pet',
          breed: data.breed || 'Unknown Breed',
          age: data.age || 'N/A',
          gender: data.gender || 'Unknown',
          ...data
        } as Pet;
      });
      
      console.log('Setting pets data:', petsData);
      setPets(petsData);
    } catch (error: any) {
      console.error("Error fetching pets:", error);
      const errorMessage = error?.code === 'permission-denied' 
        ? "You don't have permission to view pets. Please contact support."
        : "Failed to load pets. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const fetchVets = async () => {
    try {
      console.log('Starting to fetch vets...');
      const vetsRef = collection(db, "vets");
      console.log('Collection reference created');
      
      // First, try without any filters to see all vets
      const allVetsSnapshot = await getDocs(vetsRef);
      console.log('All vets in collection (unfiltered):', {
        size: allVetsSnapshot.size,
        docs: allVetsSnapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      });
      
      // Then try with the status filter
      const q = query(vetsRef, where("status", "==", "pending"));
      console.log('Query with pending status filter created');
      
      const snapshot = await getDocs(q);
      console.log('Filtered vets query result:', {
        size: snapshot.size,
        empty: snapshot.empty,
        docs: snapshot.docs.map(d => ({ id: d.id, ...d.data() }))
      });
      
      if (snapshot.empty) {
        console.log('No active veterinarians found. Showing all vets instead.');
        // If no active vets found, show all vets as a fallback
        const allVets = allVetsSnapshot.docs.map(doc => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || 'Veterinarian',
            specialization: data.specialization || 'General Practice',
            ...data
          } as Vet;
        });
        setVets(allVets);
        return;
      }
      
      const vetsData = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('Processing vet data:', { id: doc.id, ...data });
        return {
          id: doc.id,
          name: data.name || 'Veterinarian',
          specialization: data.specialization || 'General Practice',
          ...data
        } as Vet;
      });
      
      setVets(vetsData);
    } catch (error: any) {
      console.error("Error fetching vets:", error);
      const errorMessage = error?.code === 'permission-denied'
        ? "You don't have permission to view veterinarians."
        : "Failed to load veterinarians. Please try again.";
      Alert.alert("Error", errorMessage);
    }
  };

  const scheduleAppointment = async () => {
    if (!currentUser || !selectedPet || !selectedVet) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "appointments"), {
        userId: currentUser.uid,
        petId: selectedPet,
        vetId: selectedVet,
        date: date.toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      Alert.alert("Success", "Appointment booked successfully!");
      // Reset form
      setSelectedPet("");
      setSelectedVet("");
      setDate(new Date());
    } catch (err) {
      console.error("Error scheduling appointment:", err);
      Alert.alert("Error", "Failed to book appointment. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const onChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
    }

    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const showPicker = (type: 'date' | 'time') => {
    setMode(type);
    setShow(true);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.scrollViewContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.card}>
              <View style={styles.header}>
                <Text style={styles.title}>Book Appointment</Text>
                <MaterialCommunityIcons
                  name="calendar"
                  size={30}
                  color={theme.colors.primary}
                  style={styles.headerIcon}
                />
              </View>

              {/* Pet Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="paw"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Select Your Pet</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedPet}
                    onValueChange={setSelectedPet}
                    style={styles.picker}
                    dropdownIconColor={theme.colors.primary}
                  >
                    <Picker.Item 
                      label="Select Pet" 
                      value="" 
                      style={styles.pickerPlaceholder}
                    />
                    {pets.map((pet) => (
                      <Picker.Item 
                        key={pet.id} 
                        label={pet.name} 
                        value={pet.id} 
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Vet Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="stethoscope"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Select Veterinarian</Text>
                </View>
                <View style={styles.pickerContainer}>
                  <Picker
                    selectedValue={selectedVet}
                    onValueChange={setSelectedVet}
                    style={styles.picker}
                    dropdownIconColor={theme.colors.primary}
                  >
                    <Picker.Item 
                      label="Select Veterinarian" 
                      value="" 
                      style={styles.pickerPlaceholder}
                    />
                    {vets.map((vet) => (
                      <Picker.Item 
                        key={vet.id} 
                        label={`${vet.name} (${vet.specialization})`} 
                        value={vet.id}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Date Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="calendar"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Appointment Date</Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => showPicker('date')}
                  style={[styles.button, styles.dateTimeButton]}
                  labelStyle={styles.buttonLabel}
                  icon="calendar"
                >
                  {formatDate(date)}
                </Button>
              </View>

              {/* Time Selection */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons
                    name="clock"
                    size={20}
                    color={theme.colors.primary}
                  />
                  <Text style={styles.sectionTitle}>Appointment Time</Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => showPicker('time')}
                  style={[styles.button, styles.dateTimeButton]}
                  labelStyle={styles.buttonLabel}
                  icon="clock"
                >
                  {formatTime(date)}
                </Button>
              </View>

              {/* Date/Time Picker */}
              {show && (
                <DateTimePicker
                  value={date}
                  mode={mode}
                  is24Hour={true}
                  display="default"
                  onChange={onChange}
                  minimumDate={new Date()}
                />
              )}

              {/* Submit Button */}
              <Button
                mode="contained"
                onPress={scheduleAppointment}
                style={[styles.button, styles.submitButton]}
                labelStyle={styles.submitButtonLabel}
                loading={isSubmitting}
                disabled={isSubmitting || !selectedPet || !selectedVet}
                icon="calendar-check"
              >
                {isSubmitting ? 'Booking...' : 'Book Appointment'}
              </Button>
            </View>
          </ScrollView>
          <BottomNavigationBar />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  innerContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    padding: 16,
    paddingBottom: 80,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  headerIcon: {
    marginLeft: 10,
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#444',
    marginLeft: 8,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 8,
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#333',
  },
  pickerItem: {
    fontSize: 16,
  },
  pickerPlaceholder: {
    color: '#999',
  },
  button: {
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
  dateTimeButton: {
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    justifyContent: 'flex-start',
    paddingLeft: 12,
  },
  submitButton: {
    marginTop: 24,
    backgroundColor: '#4CAF50',
    paddingVertical: 10,
  },
  submitButtonLabel: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default BookAppointment;
