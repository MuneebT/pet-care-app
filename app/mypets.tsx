import { db } from '@/src/config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { collection, deleteDoc, doc, getDocs, query, where } from 'firebase/firestore';
import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableWithoutFeedback,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';
import BottomNavigationBar from './bottomnavigationbar';

const Mypets = () => {
  const { uid } = useLocalSearchParams();
  const [pets, setPets] = useState<
    { id: string; name: string; type: string; breed: string; gender: string; age: string }[]
  >([]);
  const [loading, setLoading] = useState(true);

  const gotoMyPetRecords = () => {
    router.push({
      pathname: "/mypetrecords",
      params: { uid },
    });
  };

  const gotoReminders=()=>{
    router.push("/reminders")
  }
  const fetchPets = async () => {
    if (!uid) {
      console.warn("⚠️ No UID found in route params!");
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const petsRef = collection(db, 'pets');
      const q = query(petsRef, where('userId', '==', uid));
      const querySnapshot = await getDocs(q);

      const petsData = querySnapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as {
          name: string;
          type: string;
          breed: string;
          gender: string;
          age: string;
        }),
      }));

      setPets(petsData);
    } catch (error) {
      console.error("🔥 Error fetching pets:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [uid])
  );

  const deletePet = async (petId: string) => {
    try {
      Alert.alert(
        "Delete Pet",
        "Are you sure you want to delete this pet?",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: async () => {
              await deleteDoc(doc(db, "pets", petId));
              setPets((prev) => prev.filter((p) => p.id !== petId));
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error("Error deleting pet:", error);
    }
  };

  const goToEditPet = (pet: any) => {
    router.push({
      pathname: "/editpets",
      params: {
        uid,
        petId: pet.id,
        name: pet.name,
        type: pet.type,
        breed: pet.breed,
        gender: pet.gender,
        age: pet.age,
      },
    });
  };

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "orange" }}>
        <ActivityIndicator size="large" color="white" />
        <Text style={{ color: "white", fontSize: 18, marginTop: 10 }}>Loading pets...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "orange" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          <ScrollView style={{ flex: 1, backgroundColor: "orange" }} contentContainerStyle={{ paddingBottom: 100 }}>
            {/* Header */}
            <View style={{ flexDirection: "row", alignItems: "center", marginTop: 50, paddingLeft: 20 }}>
              <MaterialCommunityIcons name="paw" size={40} color="blue" />
              <Text style={{ fontSize: 26, fontWeight: "bold", paddingLeft: 10 }}>My Pets</Text>
            </View>

            {/* Empty State */}
            {pets.length === 0 ? (
              <View style={{ alignItems: "center", marginTop: 150 }}>
                <MaterialCommunityIcons
                  name="plus-circle-outline"
                  size={70}
                  color="blue"
                  onPress={gotoMyPetRecords}
                />
                <Text style={{ color: "white", marginTop: 10, fontSize: 18, fontWeight: "bold" }}>
                  Add Pet
                </Text>
              </View>
            ) : (
              <FlatList
                data={pets}
                keyExtractor={(item) => item.id}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => (
                  <View
                    style={{
                      backgroundColor: "white",
                      borderRadius: 15,
                      marginHorizontal: 20,
                      marginTop: 30,
                      paddingVertical: 20,
                      paddingHorizontal: 15,
                      alignItems: "center",
                      elevation: 4,
                    }}
                  >
                    <Text style={{ fontSize: 22, fontWeight: "bold", color: "black", marginBottom: 10 }}>
                      {item.name || "Unnamed Pet"}
                    </Text>

                    <View style={{ flexDirection: "row", alignItems: "center", marginTop: 5 }}>
                      <MaterialCommunityIcons name="paw" size={35} color="blue" />
                      <Text style={{ fontSize: 18, fontWeight: "bold", paddingLeft: 10, color: "#333" }}>
                        {item.type || "Type"}, {item.breed || "Breed"}
                      </Text>

                      <MaterialCommunityIcons
                        name="pencil"
                        size={30}
                        color="blue"
                        style={{ marginLeft: 20 }}
                        onPress={() => goToEditPet(item)}
                      />

                      <MaterialCommunityIcons
                        name="delete"
                        size={30}
                        color="red"
                        style={{ marginLeft: 10 }}
                        onPress={() => deletePet(item.id)}
                      />
                    </View>

                    <Text style={{ fontSize: 18, marginTop: 8, color: "#555" }}>
                      {item.gender || "Gender"}, {item.age || "Age"}
                    </Text>

                    <Button
                      icon="file-document"
                      mode="contained"
                      style={{ marginTop: 20, backgroundColor: "lightblue", width: 200 }}
                      labelStyle={{ color: "black", fontWeight: "bold" }}
                    >
                      Health Records
                    </Button>

                    <Button
                      icon="clock-outline"
                      mode="contained"
                      style={{ marginTop: 10, backgroundColor: "#b3e5fc", width: 200 }}
                      labelStyle={{ color: "black", fontWeight: "bold" }}
                      onPress={gotoReminders}
                    >
                      Reminders
                    </Button>
                  </View>
                )}
              />
            )}

            {/* Add Pet Button */}
            {pets.length > 0 && (
              <View
                style={{
                  alignItems: "center",
                  backgroundColor: "white",
                  marginHorizontal: 20,
                  borderRadius: 10,
                  marginBottom: 30,
                  paddingVertical: 10,
                }}
              >
                <MaterialCommunityIcons
                  name="plus"
                  size={35}
                  color="black"
                  onPress={gotoMyPetRecords}
                />
              </View>
            )}
          </ScrollView>

          
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0 }}>
            <BottomNavigationBar />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Mypets;
