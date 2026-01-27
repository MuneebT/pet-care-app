import { auth, db } from '@/src/config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { doc, getDoc } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from 'react-native';

const Home = () => {
  const [name, setName] = useState("");

  const readVetName = async () => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) {
      console.log("No authenticated user");
      return;
    }

    try {
      const ref = doc(db, "users", currentUserUid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        const data = snap.data();
        setName(data.name ?? "");
      } else {
        console.log("Vet document does not exist");
      }
    } catch (err) {
      console.log("Error fetching vet name:", err);
    }
  };

  useEffect(() => {
    readVetName();
  }, []);

  const gotoMyProfile = () => {
    const currentUserUid = auth.currentUser?.uid;
    if (!currentUserUid) return;

    router.push({
      pathname: "/vets/myprofile",
      params: { uid: currentUserUid },
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "orange" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={() => {}}>
        <ScrollView>
          <View>
            <View style={{ flexDirection: "row", margin: 30 }}>
              <MaterialCommunityIcons name="hand-clap" size={40} />
              <Text style={{ fontWeight: "bold", fontSize: 25, marginLeft: 10 }}>
                Hi, {name}
              </Text>
            </View>

            {/* Row 1 */}
            <View style={{ flexDirection: "row" }}>
              <TouchableOpacity onPress={gotoMyProfile}>
                <View
                  style={{
                    backgroundColor: "lightgreen",
                    width: 120,
                    height: 120,
                    margin: 20,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ marginLeft: 30, marginTop: 10 }}>
                    <MaterialCommunityIcons name="account" size={50} />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "black",
                      marginTop: 10,
                      marginLeft: 15,
                    }}
                  >
                    My Profile
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: "skyblue",
                    width: 120,
                    height: 120,
                    margin: 20,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ marginLeft: 30, marginTop: 10 }}>
                    <MaterialCommunityIcons name="camera" size={50} />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "black",
                      marginTop: 5,
                      marginLeft: 15,
                    }}
                  >
                    Image Detector
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Row 2 */}
            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: "cyan",
                    width: 120,
                    height: 120,
                    margin: 20,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ marginLeft: 30, marginTop: 10 }}>
                    <MaterialCommunityIcons name="calendar" size={50} />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "black",
                      marginTop: 10,
                    }}
                  >
                    Appointment
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: "lightyellow",
                    width: 120,
                    height: 120,
                    margin: 20,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ marginLeft: 30, marginTop: 10 }}>
                    <MaterialCommunityIcons name="bell" size={50} />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "black",
                      marginTop: 5,
                      marginLeft: 15,
                    }}
                  >
                    Reminders
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Row 3 */}
            <View style={{ flexDirection: "row", marginTop: 15 }}>
              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: "#FF6347",
                    width: 120,
                    height: 120,
                    margin: 20,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ marginLeft: 30, marginTop: 10 }}>
                    <MaterialCommunityIcons name="account-heart" size={50} />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "black",
                      marginLeft: 18,
                    }}
                  >
                    Health Records
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity>
                <View
                  style={{
                    backgroundColor: "lightyellow",
                    width: 120,
                    height: 120,
                    margin: 20,
                    borderRadius: 10,
                  }}
                >
                  <View style={{ marginLeft: 30, marginTop: 10 }}>
                    <MaterialCommunityIcons name="brain" size={50} />
                  </View>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: "bold",
                      color: "black",
                      marginTop: 5,
                      marginLeft: 15,
                    }}
                  >
                    Symptom Checker
                  </Text>
                </View>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: "center" }}>
              <Text style={{ marginTop: 20, fontSize: 20, fontWeight: "bold" }}>
                Developed By
              </Text>
              <Text style={{ marginTop: 5, fontWeight: "bold" }}>Muneeb Tariq</Text>
              <Text style={{ marginTop: 5, fontWeight: "bold" }}>Muhammad Islam</Text>
              <Text style={{ marginTop: 5, fontWeight: "bold" }}>Hammad-ul-Hassan</Text>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Home;
