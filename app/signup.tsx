import { router } from 'expo-router';
import React, { useState } from 'react';
import { auth ,db} from '../src/config/firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { FirebaseError } from 'firebase/app';
import { doc,setDoc } from 'firebase/firestore';
import {
  ScrollView,
  Image,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { RadioButton, Button } from 'react-native-paper';

const Signup = () => {
  const [checked, setChecked] = useState('');
  const [name, setname] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');

  const commonEmailDomains = [
    '@gmail.com',
    '@yahoo.com',
    '@outlook.com',
    '@hotmail.com',
    '@icloud.com',
    '@protonmail.com',
    '@aol.com',
    '@mail.com',
    '@gmx.com',
    '@yandex.com',
  ];

  const gotologin = () => {
    router.push('/login');
  };

  const checkEmptyFields = () => {
    if (!name.trim() || !email.trim() || !password.trim() || !checked.trim()) {
      alert('Don’t leave empty fields');
      return false;
    }
    return true;
  };

  const checkEmailPattern = () => {
    const found = commonEmailDomains.some((domain) => email.includes(domain));
    if (!found) {
      alert('Email seems incorrect');
      return false;
    }
    return true;
  };

  const signupUser = async () => {
  try {
    if (!checkEmptyFields() || !checkEmailPattern()) {
      return;
    }

    console.log("🟡 Attempting signup for:", email);

    const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
    const user = userCredential.user;

    await setDoc(doc(db,"users",user.uid),{
      name:name.trim(),
      role:checked==="first"?"veterinarian":"petowner",
      email:email.trim(),
      createdAt:new Date().toISOString()
    })

    console.log(" Signup successful:", user.email);
    alert("Signup successful!");
    router.push("/login");

  } catch (err) {
    const error = err instanceof FirebaseError ? err : (err as any);

    console.log(" Firebase error:", error);

    if (error.code) {
      switch (error.code) {
        case "auth/email-already-in-use":
          alert("User already exists with this email");
          break;
        case "auth/invalid-email":
          alert("Invalid email address");
          break;
        case "auth/weak-password":
          alert("Weak password (use at least 6 characters)");
          break;
        case "auth/network-request-failed":
          alert("Network error — please check your connection");
          break;
        default:
          alert(`Firebase error: ${error.code}`);
      }
    } else {
      alert(`Unexpected error: ${error.message || "Unknown error"}`);
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
          contentContainerStyle={{
            flexGrow: 1,
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 50,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../assets/images/paw.jpg')}
            style={{ width: 120, height: 120, marginTop: 20, borderRadius: 7 }}
          />
          <Text
            style={{
              marginTop: 20,
              fontWeight: 'bold',
              color: 'white',
              fontSize: 30,
            }}
          >
            PET CARE
          </Text>

          <TextInput
            placeholder="Full Name"
            style={{
              height: 40,
              width: 270,
              borderRadius: 7,
              marginTop: 20,
              backgroundColor: 'white',
              fontSize: 18,
              fontWeight: 'bold',
            }}
            onChangeText={(text) => setname(text)}
          />

          <TextInput
            placeholder="Email"
            style={{
              height: 40,
              width: 270,
              borderRadius: 7,
              backgroundColor: 'white',
              marginTop: 20,
              fontSize: 18,
              fontWeight: 'bold',
            }}
            onChangeText={(text) => setemail(text)}
          />

          <View
            style={{
              marginTop: 10,
              marginRight: 140,
              flexDirection: 'row',
              paddingLeft: 110,
            }}
          >
            <RadioButton
              value="first"
              status={checked === 'first' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('first')}
            />
            <Text style={{ marginTop: 7, fontWeight: 'bold', fontSize: 18 }}>
              Veterinarian
            </Text>
            <RadioButton
              value="second"
              status={checked === 'second' ? 'checked' : 'unchecked'}
              onPress={() => setChecked('second')}
            />
            <Text style={{ marginTop: 7, fontWeight: 'bold', fontSize: 18 }}>
              Pet owner
            </Text>
          </View>

          <TextInput
            placeholder="Password"
            style={{
              height: 40,
              width: 270,
              borderRadius: 7,
              backgroundColor: 'white',
              marginTop: 20,
              fontSize: 18,
              fontWeight: 'bold',
            }}
            secureTextEntry
            onChangeText={(text) => setpassword(text)}
          />

          <View>
            <Button
              buttonColor="white"
              textColor="orange"
              mode="contained"
              style={{
                height: 40,
                width: 270,
                borderRadius: 7,
                backgroundColor: 'white',
                marginTop: 20,
              }}
              labelStyle={{ fontSize: 18, fontWeight: 'bold' }}
              onPress={signupUser} 
            >
              Signup
            </Button>
          </View>

          <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 40 }}>
            <Text style={{ fontSize: 15 }}>Already Have an account? </Text>
            <TouchableOpacity onPress={gotologin}>
              <Text style={{ fontWeight: 'bold', color: 'blue', fontSize: 15 }}>
                LogIn
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default Signup;
