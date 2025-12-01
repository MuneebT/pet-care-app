import { auth, db } from '@/src/config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as DocumentPicker from 'expo-document-picker';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button, TextInput } from 'react-native-paper';
import { SafeAreaView } from 'react-native-safe-area-context';

type DayOfWeek =
  | 'Monday'
  | 'Tuesday'
  | 'Wednesday'
  | 'Thursday'
  | 'Friday'
  | 'Saturday'
  | 'Sunday';

interface DaySchedule {
  start: string;
  end: string;
}

type WeeklySchedule = Record<DayOfWeek, DaySchedule>;

const MyProfile = () => {
  const [certificate, setCertificate] = useState<{ uri: string; name: string; mimeType: string } | null>(null);
  const [clinicAddr, setClinicAddr] = useState('');
  const [clinicName, setClinicName] = useState('');
  const [degree, setDegree] = useState('');
  const [experience, setExperience] = useState<number | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [licenseNo, setLicenseNo] = useState('');
  const [name, setName] = useState('');
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    Monday: { start: '', end: '' },
    Tuesday: { start: '', end: '' },
    Wednesday: { start: '', end: '' },
    Thursday: { start: '', end: '' },
    Friday: { start: '', end: '' },
    Saturday: { start: '', end: '' },
    Sunday: { start: '', end: '' },
  });
  const [specialization, setSpecialization] = useState('');
  const [status, setStatus] = useState('');
  const [vetUserId, setVetUserId] = useState('');

  const [showPicker, setShowPicker] = useState(false);
  const [pickerDay, setPickerDay] = useState<DayOfWeek | null>(null);
  const [pickerType, setPickerType] = useState<'start' | 'end' | null>(null);
  const [accessDenied, setAccessDenied] = useState(false);

  const getVetData = async () => {
    try {
      const currentUserUid = auth.currentUser?.uid;
      console.log("Current user id",currentUserUid)
      if (!currentUserUid) {
        console.log("No authenticated user");
        return;
      }

      const ref = doc(db, "vets", currentUserUid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        const storedUserId = data.userId;
        setVetUserId(storedUserId);

        console.log("Vet ID",vetUserId)
        // Compare current user UID with stored userId
        if (storedUserId !== currentUserUid) {
          console.log("Access denied: UID mismatch");
          setAccessDenied(true);
          return;
        }

        // Populate state
        setCertificate(data.certificateUri ?? null);
        setClinicAddr(data.clinicAddress ?? '');
        setClinicName(data.clinicName ?? '');
        setDegree(data.degree ?? '');
        setExperience(data.experience ?? null);
        setImage(data.imageUri ?? null);
        setLicenseNo(data.licenseNo ?? '');
        setName(data.name ?? '');
        setSchedule(data.schedule as WeeklySchedule);
        setSpecialization(data.specialization ?? '');
        setStatus(data.status ?? '');
        console.log("Vet ID",vetUserId)
      } else {
        console.log("Vet ID",vetUserId)
        console.log("Vet document does not exist");
        setAccessDenied(true);
      }
    } catch (err) {
      console.log("Error fetching vet data:", err);
      setAccessDenied(true);
    }
  };

  useEffect(() => {
    getVetData();
  }, []);

  const openTimePicker = (day: DayOfWeek, type: 'start' | 'end') => {
    setPickerDay(day);
    setPickerType(type);
    setShowPicker(true);
  };

  const onTimeSelected = (_: any, selectedDate?: Date) => {
    if (!selectedDate || !pickerDay || !pickerType) {
      setShowPicker(false);
      return;
    }

    const formatted = selectedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setSchedule(prev => ({
      ...prev,
      [pickerDay]: {
        ...prev[pickerDay],
        [pickerType]: formatted,
      },
    }));

    setShowPicker(false);
  };

  const updateScheduleInFirestore = async () => {
    try {
      const currentUserUid = auth.currentUser?.uid;
      if (!currentUserUid || currentUserUid !== vetUserId) {
        alert("Access denied: Cannot update schedule");
        return;
      }

      const ref = doc(db, "vets", currentUserUid);
      await updateDoc(ref, { schedule });
      alert("Schedule updated successfully");
    } catch (err) {
      console.log("Error updating schedule:", err);
    }
  };

  const pickDocument = async () => {
    const result = await DocumentPicker.getDocumentAsync({ type: "*/*", multiple: false });
    if (!result.canceled && result.assets?.length > 0) {
      const file = result.assets[0];
      setCertificate({ uri: file.uri, name: file.name ?? "Unnamed", mimeType: file.mimeType ?? "" });
    }
  };

  if (accessDenied) {
    return (
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ fontSize: 20, fontWeight: 'bold', color: 'red' }}>
          Access Denied
        </Text>
        <Text>Your account does not have permission to view this profile.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'orange' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'android' ? 90 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView>
            <View style={{ alignItems: 'center', flexDirection: 'row' }}>
              <Text style={{ fontWeight: 'bold', fontSize: 25, color: 'black' }}>My Profile</Text>
              <Text>{status}</Text>
            </View>

            {/* Profile Section */}
            <View style={{ flexDirection: 'row', marginTop: 20, marginLeft: 10 }}>
              <TouchableOpacity>
                <View style={{
                  width: 100,
                  height: 100,
                  borderRadius: 70,
                  backgroundColor: 'white',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {image ? (
                    <Image source={{ uri: image }} style={{ width: '100%', height: '100%', borderRadius: 70 }} />
                  ) : (
                    <MaterialCommunityIcons name="camera" size={40} />
                  )}
                </View>
              </TouchableOpacity>

              <View style={{ width: 230, marginLeft: 10 }}>
                <TextInput label="Full Name" value={name} onChangeText={setName} style={{ backgroundColor: 'white' }} />
                <TextInput label="Specialization" value={specialization} onChangeText={setSpecialization} style={{ backgroundColor: 'white', marginTop: 10 }} />
                <TextInput
                  label="Experience (Years)"
                  value={experience ? experience.toString() : ''}
                  keyboardType="numeric"
                  onChangeText={(text) => setExperience(Number(text))}
                  style={{ backgroundColor: 'white', marginTop: 10 }}
                />
              </View>
            </View>

            {/* Clinic Details */}
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginLeft: 10, marginTop: 20 }}>Clinic Details</Text>
            <View style={{ width: 300, marginLeft: 25, marginTop: 15 }}>
              <TextInput label="Clinic Name" value={clinicName} onChangeText={setClinicName} style={{ backgroundColor: 'white', marginVertical: 5 }} />
              <TextInput label="Clinic Address" value={clinicAddr} onChangeText={setClinicAddr} style={{ backgroundColor: 'white', marginVertical: 5 }} />
            </View>

            {/* Schedule */}
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 20, marginLeft: 10 }}>Weekly Schedule</Text>
            <View style={{ marginTop: 10, paddingHorizontal: 20 }}>
              {(Object.keys(schedule) as DayOfWeek[]).map(day => (
                <View key={day} style={{ marginBottom: 15 }}>
                  <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{day}</Text>
                  <Text>Start: {schedule[day].start}</Text>
                  <Text>End: {schedule[day].end}</Text>

                  <View style={{ flexDirection: 'row', marginTop: 10 }}>
                    <TouchableOpacity onPress={() => openTimePicker(day, 'start')} style={{ backgroundColor: 'white', padding: 8, borderRadius: 6, marginRight: 10 }}>
                      <Text>Update Start</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => openTimePicker(day, 'end')} style={{ backgroundColor: 'white', padding: 8, borderRadius: 6 }}>
                      <Text>Update End</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {showPicker && <DateTimePicker value={new Date()} mode="time" onChange={onTimeSelected} />}

            {/* Professional Details */}
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 20, marginLeft: 20 }}>Professional Details</Text>
            <View style={{ width: 300, marginLeft: 25 }}>
              <TextInput label="Degree" value={degree} onChangeText={setDegree} style={{ backgroundColor: 'white', marginVertical: 5 }} />
              <TextInput label="License Number" value={licenseNo} onChangeText={setLicenseNo} style={{ backgroundColor: 'white', marginVertical: 5 }} />
            </View>

            {/* Upload Certificate */}
            <Text style={{ fontWeight: 'bold', fontSize: 18, marginTop: 20, marginLeft: 20 }}>Upload Certificate</Text>
            <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: 'white', padding: 10, borderRadius: 5 }}>
              <Text>{certificate ? certificate.name : 'Choose File'}</Text>
            </TouchableOpacity>

            {/* Save Schedule Button */}
            <Button mode="contained" onPress={updateScheduleInFirestore} style={{ margin: 20, padding: 10, borderRadius: 10 }}>
              Save Schedule
            </Button>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MyProfile;
