import { router } from 'expo-router';
import { FirebaseError } from 'firebase/app';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import React, { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import { Button as PaperButton, RadioButton } from 'react-native-paper';
import { auth, db } from '../src/config/firebase';

const Signup = () => {
  const [checked, setChecked] = useState('');
  const [name, setname] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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

      setIsLoading(true);
      console.log("🟡 Attempting signup for:", email);

      const userCredential = await createUserWithEmailAndPassword(auth, email.trim(), password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        name: name.trim(),
        role: checked === "first" ? "veterinarian" : "petowner",
        email: email.trim(),
        createdAt: new Date().toISOString()
      });

      console.log("Signup successful:", user.email);
      Alert.alert("Success", "Account created successfully!");
      router.push("/login");

    } catch (err) {
      setIsLoading(false);
      const error = err instanceof FirebaseError ? err : (err as any);
      console.log("Firebase error:", error);

      if (error.code) {
        switch (error.code) {
          case "auth/email-already-in-use":
            Alert.alert("Error", "An account with this email already exists.");
            break;
          case "auth/invalid-email":
            Alert.alert("Invalid Email", "Please enter a valid email address.");
            break;
          case "auth/weak-password":
            Alert.alert("Weak Password", "Please use at least 6 characters.");
            break;
          case "auth/network-request-failed":
            Alert.alert("Network Error", "Please check your internet connection and try again.");
            break;
          default:
            Alert.alert("Error", "An error occurred. Please try again later.");
        }
      } else {
        Alert.alert("Error", error.message || "An unexpected error occurred.");
      }
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/images/paw.jpg')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.title}>PET CARE</Text>
            <Text style={styles.subtitle}>Create your account</Text>
          </View>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="John Doe"
              placeholderTextColor="#999"
              value={name}
              onChangeText={setname}
              autoCapitalize="words"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              placeholderTextColor="#999"
              value={email}
              onChangeText={setemail}
              autoCapitalize="none"
              keyboardType="email-address"
            />

            <Text style={styles.label}>I am a</Text>
            <View style={styles.radioContainer}>
              <View style={styles.radioButton}>
                <RadioButton
                  value="first"
                  status={checked === 'first' ? 'checked' : 'unchecked'}
                  onPress={() => setChecked('first')}
                  color="#FF6B35"
                />
                <Text style={styles.radioLabel}>Veterinarian</Text>
              </View>
              <View style={styles.radioButton}>
                <RadioButton
                  value="second"
                  status={checked === 'second' ? 'checked' : 'unchecked'}
                  onPress={() => setChecked('second')}
                  color="#FF6B35"
                />
                <Text style={styles.radioLabel}>Pet Owner</Text>
              </View>
            </View>

            <Text style={styles.label}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setpassword}
              secureTextEntry
            />

            <PaperButton
              mode="contained"
              onPress={signupUser}
              style={styles.button}
              labelStyle={styles.buttonLabel}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                'Create Account'
              )}
            </PaperButton>

            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={gotologin} disabled={isLoading}>
                <Text style={styles.loginLink}>Sign In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 15,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: '800',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 10,
  },
  formContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  radioContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 10,
  },
  radioButton: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  radioLabel: {
    fontSize: 16,
    color: '#333',
    marginLeft: 8,
  },
  button: {
    marginTop: 25,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FF6B35',
    elevation: 2,
  },
  buttonLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: 'white',
    paddingVertical: 4,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  loginText: {
    color: '#666',
    fontSize: 15,
  },
  loginLink: {
    color: '#FF6B35',
    fontWeight: '600',
    fontSize: 15,
  },
});

export default Signup;
