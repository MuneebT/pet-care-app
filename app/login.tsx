import { auth } from '@/src/config/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import { signInWithEmailAndPassword } from 'firebase/auth';
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
  const [email, setemail] = useState("");
  const [password, setpassword] = useState("");
  const router = useRouter(); // ✅ FIXED: proper router hook

  const gotosignin = () => {
    router.push("/signup");
  };

  const checkemptyfields = () => {
    if (!email.trim() || !password.trim()) {
      alert("Don't leave empty fields");
      return false;
    }
    return true;
  };

  const verifyemailpassword = async () => {
    try {
      if (!checkemptyfields()) return;

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      alert("Login Successful");
      console.log("User logged in:", user.uid);

      await AsyncStorage.setItem("uid",user.uid);
      // ✅ Navigate to /home with UID param
      router.push({
        pathname: "/home",
        params: { uid: user.uid },
      });
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
            onChangeText={setemail}
          />
          <TextInput
            placeholder='Password'
            style={{
              height: 40, width: 270, fontWeight: 'bold', fontSize: 18, marginTop: 20,
              backgroundColor: "white", borderRadius: 7
            }}
            secureTextEntry
            onChangeText={setpassword}
          />
          <Button
            onPress={verifyemailpassword}
            style={{ height: 40, width: 270, backgroundColor: "white", borderRadius: 7, marginTop: 20 }}
            labelStyle={{ fontSize: 18, fontWeight: 'bold', color: "orange" }}
          >
            Login
          </Button>

          <Text style={{ color: "white", fontWeight: 'bold', fontSize: 18, marginTop: 20 }}>
            ------------------ or ---------------
          </Text>

          <Button
            onPress={gotosignin}
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
