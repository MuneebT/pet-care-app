import { db } from "@/src/config/firebase";
import { Picker } from "@react-native-picker/picker";
import { router, useLocalSearchParams } from "expo-router";
import { addDoc, collection } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";
import { Button } from "react-native-paper";
import BottomNavigationBar from "./bottomnavigationbar";
const MyPetRecords = () => {
  const { uid } = useLocalSearchParams(); // ✅ get uid from navigation params
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [breed, setBreed] = useState("");
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");

  useEffect(() => {
    if (!uid) {
      console.warn("⚠️ No UID found in route params!");
    }
  }, [uid]);

  const savePet = async () => {
    if (!uid) {
      Alert.alert("Error", "No UID found. Please go back and log in again.");
      return;
    }

    if (!name || !type || !breed || !gender || !age) {
      Alert.alert("Error", "Please fill in all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "pets"), {
        userId: uid,
        name,
        type,
        breed,
        gender,
        age,
        createdAt: new Date(),
      });
      Alert.alert("Success", "Pet added successfully!");
      router.back(); // ✅ return to previous page (mypets)
    } catch (error) {
      console.error("Error saving pet:", error);
      Alert.alert("Error", "Failed to save pet record.");
    }
  };

  return (
    <KeyboardAvoidingView 
          style={{ flex: 1, backgroundColor: "orange" }}
          behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>

      <View style={{flex:1}}>
    <ScrollView style={{ flex: 1, backgroundColor: "orange", padding: 20 }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "white", marginVertical: 20 }}>
        Add Pet Record
      </Text>

      {!uid ? (
        <Text style={{ color: "red", fontWeight: "bold" }}>
          ⚠️ No UID found in route params!
        </Text>
      ) : null}

      <TextInput
        placeholder="Pet Name"
        value={name}
        onChangeText={setName}
        style={{ backgroundColor: "white", borderRadius: 8, padding: 12, marginBottom: 15 }}
      />

      <TextInput
        placeholder="Breed"
        value={breed}
        onChangeText={setBreed}
        style={{ backgroundColor: "white", borderRadius: 8, padding: 12, marginBottom: 15 }}
      />

      <TextInput
        placeholder="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={{ backgroundColor: "white", borderRadius: 8, padding: 12, marginBottom: 15 }}
      />

      <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Select Type</Text>
      <Picker selectedValue={type} onValueChange={setType} style={{ backgroundColor: "white", marginBottom: 15 }}>
        <Picker.Item label="Select Type" value="" />
        <Picker.Item label="Dog" value="Dog" />
        <Picker.Item label="Cat" value="Cat" />
      </Picker>

      <Text style={{ fontWeight: "bold", marginBottom: 5 }}>Select Gender</Text>
      <Picker selectedValue={gender} onValueChange={setGender} style={{ backgroundColor: "white", marginBottom: 20 }}>
        <Picker.Item label="Select Gender" value="" />
        <Picker.Item label="Male" value="Male" />
        <Picker.Item label="Female" value="Female" />
      </Picker>

      <Button
        mode="contained"
        onPress={savePet}
        style={{ backgroundColor: "blue", padding: 8, borderRadius: 8 }}
      >
        Save Pet
      </Button>
    </ScrollView>
    <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <BottomNavigationBar />
          </View>
    </View>
    </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default MyPetRecords;
