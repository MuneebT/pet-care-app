import { auth, db } from '@/services/firebase';
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
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
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
    position: 'relative',
  },
  statusBadge: {
    position: 'absolute',
    top: 0,
    right: 16,
    backgroundColor: '#FFA500',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
    marginLeft: 4,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e0e0e0',
  },
  editIcon: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 8,
    elevation: 3,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#333',
  },
  card: {
    marginBottom: 16,
    borderRadius: 12,
    elevation: 2,
  },
  input: {
    marginBottom: 12,
    backgroundColor: '#fff',
  },
  scheduleDay: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    padding: 12,
    backgroundColor: '#fff',
    borderRadius: 8,
    elevation: 1,
  },
  timeInput: {
    flex: 1,
    marginHorizontal: 8,
  },
  saveButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
  actionButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 8,
  },
});

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
        // Check multiple possible field names for the image URL
        setImage(data.image || data.imageUrl || data.imageUri || data.photoURL || null);
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
      <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#e3f2fd' }}>
        <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 15, width: '90%', alignItems: 'center', elevation: 5 }}>
          <MaterialCommunityIcons name="alert-circle" size={50} color="#ff5252" />
          <Text style={{ fontSize: 22, fontWeight: 'bold', color: '#d32f2f', marginVertical: 10 }}>
            Access Denied
          </Text>
          <Text style={{ textAlign: 'center', color: '#555', fontSize: 16 }}>
            Your account does not have permission to view this profile.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.gradientBackground} />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={{ alignItems: 'center', flexDirection: 'row', marginBottom: 15 }}>
              <Text style={{ fontWeight: 'bold', fontSize: 28, color: '#1a237e', marginRight: 10 }}>My Profile</Text>
              {status === 'pending' && (
                <View style={styles.statusBadge}>
                  <MaterialCommunityIcons name="clock-outline" size={14} color="#fff" />
                  <Text style={styles.statusText}>Pending Approval</Text>
                </View>
              )}
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
                  borderWidth: 3,
                  borderColor: '#5c6bc0',
                  elevation: 5,
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
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginLeft: 10, marginTop: 20, color: '#283593' }}>Clinic Details</Text>
            <View style={{ width: 300, marginLeft: 25, marginTop: 15 }}>
              <TextInput label="Clinic Name" value={clinicName} onChangeText={setClinicName} style={{ backgroundColor: 'white', marginVertical: 5 }} />
              <TextInput label="Clinic Address" value={clinicAddr} onChangeText={setClinicAddr} style={{ backgroundColor: 'white', marginVertical: 5 }} />
            </View>

            {/* Schedule */}
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginTop: 20, marginLeft: 10, color: '#283593' }}>Weekly Schedule</Text>
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
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginTop: 20, marginLeft: 20, color: '#283593' }}>Professional Details</Text>
            <View style={{ width: 300, marginLeft: 25 }}>
              <TextInput label="Degree" value={degree} onChangeText={setDegree} style={{ backgroundColor: 'white', marginVertical: 5 }} />
              <TextInput label="License Number" value={licenseNo} onChangeText={setLicenseNo} style={{ backgroundColor: 'white', marginVertical: 5 }} />
            </View>

            {/* Upload Certificate */}
            <Text style={{ fontWeight: 'bold', fontSize: 20, marginTop: 20, marginLeft: 20, color: '#283593' }}>Upload Certificate</Text>
            <TouchableOpacity onPress={pickDocument} style={{ backgroundColor: 'white', padding: 10, borderRadius: 5 }}>
              <Text>{certificate ? certificate.name : 'Choose File'}</Text>
            </TouchableOpacity>

            {/* Save Schedule Button */}
            <Button 
              mode="contained" 
              onPress={updateScheduleInFirestore} 
              style={{ 
                margin: 20, 
                padding: 8, 
                borderRadius: 25, 
                backgroundColor: '#3949ab',
                elevation: 3
              }}
              labelStyle={{ fontSize: 16, fontWeight: '600' }}
            >
              Save Schedule
            </Button>
          </ScrollView>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default MyProfile;
