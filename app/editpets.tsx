import { db } from '@/src/config/firebase';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, updateDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import { Alert, ScrollView, Text, TextInput } from 'react-native';
import { Button } from 'react-native-paper';

const EditPet = () => {
  // ✅ Extract params and safely typecast them as strings
  const params = useLocalSearchParams();

  const uid = Array.isArray(params.uid) ? params.uid[0] : params.uid || '';
  const petId = Array.isArray(params.petId) ? params.petId[0] : params.petId || '';
  const name = Array.isArray(params.name) ? params.name[0] : params.name || '';
  const type = Array.isArray(params.type) ? params.type[0] : params.type || '';
  const breed = Array.isArray(params.breed) ? params.breed[0] : params.breed || '';
  const gender = Array.isArray(params.gender) ? params.gender[0] : params.gender || '';
  const age = Array.isArray(params.age) ? params.age[0] : params.age || '';

  // ✅ Initialize state with clean string values
  const [petName, setPetName] = useState(name);
  const [petType, setPetType] = useState(type);
  const [petBreed, setPetBreed] = useState(breed);
  const [petGender, setPetGender] = useState(gender);
  const [petAge, setPetAge] = useState(age);

  const handleUpdate = async () => {
    if (!petId) {
      Alert.alert('Error', 'Pet ID is missing.');
      return;
    }

    try {
      const petRef = doc(db, 'pets', petId);
      await updateDoc(petRef, {
        name: petName,
        type: petType,
        breed: petBreed,
        gender: petGender,
        age: petAge,
      });

      Alert.alert('Success', 'Pet updated successfully!');
      router.back();
    } catch (error) {
      console.error('Error updating pet:', error);
      Alert.alert('Error', 'Failed to update pet.');
    }
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: 'orange', padding: 20 }}
      contentContainerStyle={{ alignItems: 'center' }}
    >
      <Text style={{ fontSize: 26, fontWeight: 'bold', color: 'white', marginBottom: 20 }}>
        Edit Pet
      </Text>

      <TextInput
        placeholder="Pet Name"
        value={petName}
        onChangeText={setPetName}
        style={{
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 10,
          width: '90%',
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Type"
        value={petType}
        onChangeText={setPetType}
        style={{
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 10,
          width: '90%',
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Breed"
        value={petBreed}
        onChangeText={setPetBreed}
        style={{
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 10,
          width: '90%',
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Gender"
        value={petGender}
        onChangeText={setPetGender}
        style={{
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 10,
          width: '90%',
          marginBottom: 10,
        }}
      />
      <TextInput
        placeholder="Age"
        value={petAge}
        onChangeText={setPetAge}
        keyboardType="numeric"
        style={{
          backgroundColor: 'white',
          padding: 10,
          borderRadius: 10,
          width: '90%',
          marginBottom: 10,
        }}
      />

      <Button
        mode="contained"
        onPress={handleUpdate}
        style={{ backgroundColor: 'lightblue', width: 200, marginTop: 20 }}
        labelStyle={{ color: 'black', fontWeight: 'bold' }}
      >
        Save Changes
      </Button>
    </ScrollView>
  );
};

export default EditPet;
