import { auth, db } from "@/services/firebase";
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
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from "react-native";
import { BorderRadius, Spacing, Shadow } from "@/constants/theme";
import BottomNavigationBar from "./bottomnavigationbar";
import { FormFieldCard } from "@/components/ui/form-field-card";

type Pet = {
  id: string;
  name: string;
  type: string;
  breed: string;
  age: string | number;
  gender: string;
  userId: string;
  createdAt?: any;
  updatedAt?: any;
};

type Vet = {
  id: string;
  name: string;
  specialization: string;
};

const BookAppointment = () => {
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
        Alert.alert("Error", error?.message || "An error occurred while loading the app.");
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
      if (!userId) return;
      
      const userPetsRef = collection(db, "users", userId, "pets");
      const snapshot = await getDocs(userPetsRef);
      
      if (snapshot.empty) {
        setPets([]);
        return;
      }
      
      const petsData = snapshot.docs.map(doc => {
        const data = doc.data();
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
      
      setPets(petsData);
    } catch (error: any) {
      console.error("Error fetching pets:", error);
      Alert.alert("Error", "Failed to load pets. Please try again.");
    }
  };

  const fetchVets = async () => {
    try {
      const vetsRef = collection(db, "vets");
      const allVetsSnapshot = await getDocs(vetsRef);
      
      const q = query(vetsRef, where("status", "==", "pending"));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
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
      Alert.alert("Error", "Failed to load veterinarians. Please try again.");
    }
  };

  const scheduleAppointment = async () => {
    if (!currentUser || !selectedPet || !selectedVet) {
      Alert.alert("Oops!", "Please fill in all the fields to continue");
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
      
      Alert.alert("Hooray!", "Your appointment has been booked successfully!");
      setSelectedPet("");
      setSelectedVet("");
      setDate(new Date());
      router.back();
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

  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (d: Date) => {
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const getSelectedPetName = () => {
    const pet = pets.find(p => p.id === selectedPet);
    return pet?.name || '';
  };

  const getSelectedVetName = () => {
    const vet = vets.find(v => v.id === selectedVet);
    return vet ? `${vet.name} (${vet.specialization})` : '';
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.gradientBackground} />
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons name="calendar-sync" size={64} color="#6366F1" />
          <Text style={styles.loadingText}>Loading...</Text>
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
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
                </TouchableOpacity>
                <View style={styles.titleRow}>
                  <MaterialCommunityIcons name="calendar-plus" size={28} color="#6366F1" />
                  <Text style={styles.title}>Book Appointment</Text>
                </View>
                <View style={styles.placeholder} />
              </View>

              <View style={styles.formContainer}>
                <FormFieldCard icon="paw" label="Select Your Pet">
                  {pets.length > 0 ? (
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={selectedPet}
                        onValueChange={setSelectedPet}
                        style={styles.picker}
                        dropdownIconColor="#6366F1"
                      >
                        <Picker.Item 
                          label="Choose a pet..." 
                          value="" 
                          style={styles.pickerPlaceholder}
                        />
                        {pets.map((pet) => (
                          <Picker.Item 
                            key={pet.id} 
                            label={`${pet.name} (${pet.type})`} 
                            value={pet.id} 
                          />
                        ))}
                      </Picker>
                    </View>
                  ) : (
                    <View style={styles.emptyField}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#94A3B8" />
                      <Text style={styles.emptyFieldText}>No pets found. Add a pet first!</Text>
                    </View>
                  )}
                </FormFieldCard>

                <FormFieldCard icon="doctor" label="Select Veterinarian">
                  {vets.length > 0 ? (
                    <View style={styles.pickerWrapper}>
                      <Picker
                        selectedValue={selectedVet}
                        onValueChange={setSelectedVet}
                        style={styles.picker}
                        dropdownIconColor="#6366F1"
                      >
                        <Picker.Item 
                          label="Choose a vet..." 
                          value="" 
                          style={styles.pickerPlaceholder}
                        />
                        {vets.map((vet) => (
                          <Picker.Item 
                            key={vet.id} 
                            label={`${vet.name} - ${vet.specialization}`} 
                            value={vet.id}
                          />
                        ))}
                      </Picker>
                    </View>
                  ) : (
                    <View style={styles.emptyField}>
                      <MaterialCommunityIcons name="alert-circle-outline" size={20} color="#94A3B8" />
                      <Text style={styles.emptyFieldText}>No veterinarians available</Text>
                    </View>
                  )}
                </FormFieldCard>

                <FormFieldCard icon="calendar-month" label="Appointment Date">
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => showPicker('date')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateTimeContent}>
                      <MaterialCommunityIcons name="calendar" size={20} color="#6366F1" />
                      <Text style={styles.dateTimeText}>{formatDate(date)}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </FormFieldCard>

                <FormFieldCard icon="clock-outline" label="Appointment Time">
                  <TouchableOpacity
                    style={styles.dateTimeButton}
                    onPress={() => showPicker('time')}
                    activeOpacity={0.7}
                  >
                    <View style={styles.dateTimeContent}>
                      <MaterialCommunityIcons name="clock" size={20} color="#6366F1" />
                      <Text style={styles.dateTimeText}>{formatTime(date)}</Text>
                    </View>
                    <MaterialCommunityIcons name="chevron-right" size={20} color="#94A3B8" />
                  </TouchableOpacity>
                </FormFieldCard>

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

                <View style={styles.summaryCard}>
                  <View style={styles.summaryHeader}>
                    <MaterialCommunityIcons name="clipboard-text-outline" size={20} color="#6366F1" />
                    <Text style={styles.summaryTitle}>Appointment Summary</Text>
                  </View>
                  <View style={styles.summaryContent}>
                    <View style={styles.summaryRow}>
                      <MaterialCommunityIcons name="paw" size={16} color="#64748B" />
                      <Text style={styles.summaryLabel}>Pet:</Text>
                      <Text style={styles.summaryValue}>{getSelectedPetName() || 'Not selected'}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <MaterialCommunityIcons name="doctor" size={16} color="#64748B" />
                      <Text style={styles.summaryLabel}>Vet:</Text>
                      <Text style={styles.summaryValue}>{getSelectedVetName() || 'Not selected'}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <MaterialCommunityIcons name="calendar" size={16} color="#64748B" />
                      <Text style={styles.summaryLabel}>Date:</Text>
                      <Text style={styles.summaryValue}>{formatDate(date)}</Text>
                    </View>
                    <View style={styles.summaryRow}>
                      <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
                      <Text style={styles.summaryLabel}>Time:</Text>
                      <Text style={styles.summaryValue}>{formatTime(date)}</Text>
                    </View>
                  </View>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.submitButton,
                  (!selectedPet || !selectedVet) && styles.submitButtonDisabled,
                ]}
                onPress={scheduleAppointment}
                activeOpacity={0.8}
                disabled={isSubmitting || !selectedPet || !selectedVet}
              >
                <View style={styles.submitButtonContent}>
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="check-circle" size={22} color="#FFFFFF" />
                      <Text style={styles.submitButtonText}>Confirm Booking</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.spacer} />
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
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
  placeholder: {
    width: 44,
  },
  formContainer: {
    marginTop: Spacing.sm,
  },
  pickerWrapper: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  picker: {
    width: '100%',
    color: '#1E293B',
  },
  pickerPlaceholder: {
    color: '#94A3B8',
  },
  emptyField: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.sm,
    backgroundColor: '#FEF3C7',
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
  },
  emptyFieldText: {
    fontSize: 14,
    color: '#B45309',
  },
  dateTimeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dateTimeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  dateTimeText: {
    fontSize: 15,
    color: '#1E293B',
    fontWeight: '500',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
    ...Shadow.md,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  summaryContent: {
    gap: Spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#64748B',
    minWidth: 50,
  },
  summaryValue: {
    fontSize: 14,
    color: '#1E293B',
    fontWeight: '500',
    flex: 1,
  },
  submitButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#10B981',
    ...Shadow.lg,
  },
  submitButtonDisabled: {
    backgroundColor: '#CBD5E1',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
  },
  submitButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  spacer: {
    height: Spacing.xxl,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default BookAppointment;
