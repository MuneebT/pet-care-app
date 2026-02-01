import { auth } from '@/src/config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from 'expo-router';
import { doc, getFirestore, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e3f2fd',
  },
  gradientBackground: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: 16,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 10,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#5c6bc0',
    elevation: 5,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: '#283593',
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#1a237e',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  scheduleDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  timeText: {
    marginHorizontal: 8,
    color: '#666',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    marginBottom: 16,
  },
  uploadButtonText: {
    marginLeft: 8,
    color: '#333',
  },
  documentPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  documentIcon: {
    marginRight: 8,
  },
  documentName: {
    flex: 1,
    color: '#333',
  },
  submitButton: {
    marginTop: 20,
    borderRadius: 25,
    backgroundColor: '#3949ab',
    margin: 20,
    padding: 12,
    elevation: 3,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
    color: '#333',
  },
  timeButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    marginHorizontal: 4,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Credentials = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { uid } = useLocalSearchParams();
  const [name, setName] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [experience, setExperience] = useState<number | null>(null);
  const [clinicName, setClinicName] = useState("");
  const [clinicAddress, setClinicAddress] = useState("");
  const [degree, setDegree] = useState("");
  const [licenseNo, setLicenseNo] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [document, setDocument] = useState<{ uri: string; name: string; mimeType: string } | null>(null);

  const [schedule, setSchedule] = useState<Record<string, { start: string; end: string }>>(
    daysOfWeek.reduce((acc, day) => ({ ...acc, [day]: { start: "", end: "" } }), {})
  );

  const [showStartPicker, setShowStartPicker] = useState<string | null>(null);
  const [showEndPicker, setShowEndPicker] = useState<string | null>(null);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 1,
    });
    if (!result.canceled) setImage(result.assets[0].uri);
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: false });
    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setDocument({ uri: file.uri, name: file.name ?? "Unnamed", mimeType: file.mimeType ?? "" });
    }
  };

  const updateTime = (day: string, field: "start" | "end", value: Date) => {
    const time = value.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    setSchedule(prev => ({ ...prev, [day]: { ...prev[day], [field]: time } }));
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      const currentUserUid = auth.currentUser?.uid;
      if (!currentUserUid) {
        Alert.alert("Error", "No authenticated user.");
        return;
      }

      // Validate required fields
      const requiredFields = [
        { field: name, name: 'Full Name' },
        { field: specialization, name: 'Specialization' },
        { field: experience, name: 'Experience' },
        { field: clinicName, name: 'Clinic Name' },
        { field: clinicAddress, name: 'Clinic Address' },
        { field: degree, name: 'Degree' },
        { field: licenseNo, name: 'License Number' },
      ];

      const missingField = requiredFields.find(field => !field.field);
      if (missingField) {
        Alert.alert("Error", `Please fill in the ${missingField.name} field.`);
        return;
      }

      if (!document) {
        Alert.alert("Error", "Please upload your license document.");
        return;
      }
      
      // Prepare vet data
      const vetData = {
        name,
        specialization,
        experience: Number(experience),
        clinicName,
        clinicAddress,
        degree,
        licenseNo,
        schedule,
        documentUrl: document.uri,
        documentName: document.name,
        documentType: document.mimeType,
        imageUrl: image || null,
        userId: currentUserUid,
        status: 'pending', // You can use this for admin approval
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Get a reference to Firestore
      const db = getFirestore();
      
      // Save to Firestore
      await setDoc(doc(db, 'vets', currentUserUid), vetData, { merge: true });
      
      // Set the credentials filled flag
      await AsyncStorage.setItem('@vet_credentials_filled', 'true');
      
      // Show success message
      Alert.alert(
        "Success", 
        "Your credentials have been submitted successfully!\n\nYour profile is under review. You'll be notified once approved.",
        [
          {
            text: "OK",
            onPress: () => {
              // Navigate to home screen after successful submission
              router.replace('/vets/home');
            }
          }
        ]
      );
      
    } catch (error: any) {
      console.error("Error saving vet credentials:", error);
      let errorMessage = "Failed to save credentials. Please try again.";
      
      if (error?.code === 'permission-denied') {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error?.code === 'unavailable') {
        errorMessage = "Network error. Please check your internet connection and try again.";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "android" ? 90 : 0}
      >

        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView
            style={{ flex: 1 }}
            contentContainerStyle={{ padding: 20, paddingBottom: 150 }} // keeps submit button above android nav
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.title}>Veterinarian Credentials</Text>

            {/* Photo */}
            <View style={{ flexDirection: "row", marginBottom: 20 }}>
              <TouchableOpacity onPress={pickImage}>
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 70,
                  backgroundColor: "white",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 20
                }}>
                  {image ?
                    <Image source={{ uri: image }} style={{ width: "100%", height: "100%", borderRadius: 70 }} /> :
                    <MaterialCommunityIcons name="camera" size={40} />}
                </View>
              </TouchableOpacity>

              <View style={{ flex: 1 }}>
                <TextInput label="Full Name" value={name} onChangeText={setName} style={{ backgroundColor: "white" }} />
                <TextInput label="Specialization" value={specialization} onChangeText={setSpecialization} style={{ backgroundColor: "white", marginTop: 10 }} />
                <TextInput
                  label="Experience (years)"
                  value={experience ? experience.toString() : ""}
                  keyboardType="numeric"
                  onChangeText={(t) => setExperience(Number(t))}
                  style={{ backgroundColor: "white", marginTop: 10 }}
                />
              </View>
            </View>

            {/* Clinic */}
            <Text style={styles.sectionTitle}>Clinic Details</Text>
            <TextInput label="Clinic Name" value={clinicName} onChangeText={setClinicName} style={{ backgroundColor: "white", marginVertical: 5 }} />
            <TextInput label="Clinic Address" value={clinicAddress} onChangeText={setClinicAddress} style={{ backgroundColor: "white", marginVertical: 5 }} />

            {/* Schedule */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Weekly Schedule</Text>

            {daysOfWeek.map(day => (
              <View key={day} style={{ marginBottom: 10 }}>
                <Text style={{ fontWeight: "bold" }}>{day}</Text>
                <View style={{ flexDirection: "row", marginTop: 5 }}>
                  <Button onPress={() => setShowStartPicker(day)}>{schedule[day].start || "Start"}</Button>
                  <View style={{ width: 10 }} />
                  <Button onPress={() => setShowEndPicker(day)}>{schedule[day].end || "End"}</Button>
                </View>

                {showStartPicker === day && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    onChange={(e, d) => {
                      setShowStartPicker(null);
                      if (d) updateTime(day, "start", d);
                    }}
                  />
                )}

                {showEndPicker === day && (
                  <DateTimePicker
                    value={new Date()}
                    mode="time"
                    onChange={(e, d) => {
                      setShowEndPicker(null);
                      if (d) updateTime(day, "end", d);
                    }}
                  />
                )}
              </View>
            ))}

            {/* Degree */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Professional Details</Text>
            <TextInput label="Degree" value={degree} onChangeText={setDegree} style={{ backgroundColor: "white", marginVertical: 5 }} />
            <TextInput label="License Number" value={licenseNo} onChangeText={setLicenseNo} style={{ backgroundColor: "white", marginVertical: 5 }} />

            {/* Document */}
            <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Upload Certificate</Text>
            <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: "white", padding: 10, borderRadius: 5 }}>
              <Text>{document ? document.name : "Choose File"}</Text>
            </TouchableOpacity>

            {/* --- Extra bottom spacing so Android nav doesn't hide the button --- */}
            <View style={{ height: 40 }} />

            <Button 
              mode="contained" 
              onPress={handleSubmit} 
              style={styles.submitButton}
              labelStyle={{ fontSize: 16, fontWeight: '600' }}
            >
              Submit
            </Button>

            <View style={{ height: 80 }} /> 
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default Credentials;
