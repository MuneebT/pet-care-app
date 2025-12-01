import { auth, db } from '@/src/config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams } from 'expo-router';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';

import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const Credentials = () => {
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
  const currentUserUid = auth.currentUser?.uid;
  if (!currentUserUid) return Alert.alert("Error", "No authenticated user.");

  if (!document) {
    return Alert.alert("Error", "Please upload your certificate document.");
  }

  await setDoc(doc(db, "vets", currentUserUid), { // UID as document ID
    userId: currentUserUid,
    name,
    specialization,
    experience,
    clinicName,
    clinicAddress,
    degree,
    licenseNo,
    imageUri: image,
    certificateUri: document.uri, // safe now
    schedule,
    status: "pending",
  });

  Alert.alert("Success", "Credentials submitted!");
};


  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "orange" }}>

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
            <Text style={{ fontWeight: "bold", fontSize: 25, textAlign: "center", marginBottom: 20 }}>
              Credentials Form
            </Text>

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
            <Text style={{ fontWeight: "bold", fontSize: 18 }}>Clinic Details</Text>
            <TextInput label="Clinic Name" value={clinicName} onChangeText={setClinicName} style={{ backgroundColor: "white", marginVertical: 5 }} />
            <TextInput label="Clinic Address" value={clinicAddress} onChangeText={setClinicAddress} style={{ backgroundColor: "white", marginVertical: 5 }} />

            {/* Schedule */}
            <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 20 }}>Weekly Schedule</Text>

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
            <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 20 }}>Professional Details</Text>
            <TextInput label="Degree" value={degree} onChangeText={setDegree} style={{ backgroundColor: "white", marginVertical: 5 }} />
            <TextInput label="License Number" value={licenseNo} onChangeText={setLicenseNo} style={{ backgroundColor: "white", marginVertical: 5 }} />

            {/* Document */}
            <Text style={{ fontWeight: "bold", fontSize: 18, marginTop: 20 }}>Upload Certificate</Text>
            <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: "white", padding: 10, borderRadius: 5 }}>
              <Text>{document ? document.name : "Choose File"}</Text>
            </TouchableOpacity>

            {/* --- Extra bottom spacing so Android nav doesn't hide the button --- */}
            <View style={{ height: 40 }} />

            <Button mode="contained" onPress={handleSubmit} style={{ marginTop: 20, padding: 10 }}>
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
