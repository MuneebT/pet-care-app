import { auth, db } from '@/src/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback
} from 'react-native';
import { Button } from 'react-native-paper';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const gotoSignup = () => {
    router.push("/signup");
  };

  // Fetch role directly and return it
  const getRole = async (uid: string): Promise<string | null> => {
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);

      if (snap.exists()) {
        return snap.data().role as string;
      } else {
        console.log("No such user document exists");
        return null;
      }
    } catch (err) {
      console.log("Error fetching role:", err);
      return null;
    }
  };

  const checkEmptyFields = () => {
    if (!email.trim() || !password.trim()) {
      alert("Don't leave empty fields");
      return false;
    }
    return true;
  };

  const verifyEmailPassword = async () => {
    try {
      if (!checkEmptyFields()) return;

      // Sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      alert("Login Successful");
      console.log("User logged in:", user.uid);

      await AsyncStorage.setItem("uid", user.uid);

      // Fetch role immediately
      const userRole = await getRole(user.uid);

      if (!userRole) {
        alert("Unable to fetch user role");
        return;
      }

      // Redirect based on role
      if (userRole === "petowner") {
        router.push({ pathname: "/home", params: { uid: user.uid } });
      } else {
        router.push({ pathname: "/vets/home", params: { uid: user.uid } });// for testing purpose added hme we will add a credentials screen here
      }

    } catch (err) {
      console.log("Login Error:", err);
      const error = err instanceof FirebaseError ? err : (err as any);

      if (error.code === "auth/user-not-found") {
        alert("No user found with this email.");
      } else if (error.code === "auth/wrong-password") {
        alert("Incorrect password.");
      } else if (error.code === "auth/invalid-email") {
        alert("Invalid email address.");
      } else if (error.code === "auth/network-request-failed") {
        alert("Network error. Check your connection.");
      } else {
        alert("Unknown error: " + error.message);
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: 'orange' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={{ flex: 1, backgroundColor: "orange", marginTop: 100 }}
          contentContainerStyle={{ alignItems: 'center' }}
        >
          <Image
            source={require("../assets/images/paw.jpg")}
            style={{ width: 120, height: 120, marginTop: 20, borderRadius: 7 }}
          />
          <Text style={{ marginTop: 20, fontWeight: 'bold', color: 'white', fontSize: 30 }}>
            PET CARE
          </Text>

          <TextInput
            placeholder='Email'
            style={{
              height: 40, width: 270, fontWeight: 'bold', fontSize: 18, marginTop: 20,
              backgroundColor: "white", borderRadius: 7
            }}
            onChangeText={setEmail}
          />
          <TextInput
            placeholder='Password'
            style={{
              height: 40, width: 270, fontWeight: 'bold', fontSize: 18, marginTop: 20,
              backgroundColor: "white", borderRadius: 7
            }}
            secureTextEntry
            onChangeText={setPassword}
          />
          <Button
            onPress={verifyEmailPassword}
            style={{ height: 40, width: 270, backgroundColor: "white", borderRadius: 7, marginTop: 20 }}
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: "orange" }}
          >
            Login
          </Button>

          <Text style={{ color: "white", fontWeight: 'bold', fontSize: 18, marginTop: 20 }}>
            ------------------ or ---------------
          </Text>

          <Button
            onPress={gotoSignup}
            style={{ height: 40, width: 270, backgroundColor: "white", borderRadius: 7, marginTop: 20 }}
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: "orange" }}
          >
            Signup
          </Button>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Login;
