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
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { auth, db } from '../src/services/firebase';
import { Colors, BorderRadius, Spacing, FontSize, Shadow, FontWeight } from '@/constants/theme';

const Signup = () => {
  const [checked, setChecked] = useState('');
  const [name, setname] = useState('');
  const [email, setemail] = useState('');
  const [password, setpassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
      alert('Dont leave empty fields');
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
      console.log("Attempting signup for:", email);

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
          <View style={styles.headerSection}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Image
                  source={require('../assets/images/paw.jpg')}
                  style={styles.logo}
                  resizeMode="cover"
                />
              </View>
              <Text style={styles.title}>PetCare</Text>
              <Text style={styles.subtitle}>Create your account to get started</Text>
            </View>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="account-outline" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="John Doe"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={name}
                  onChangeText={setname}
                  autoCapitalize="words"
                  textContentType="name"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="email-outline" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="example@email.com"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={email}
                  onChangeText={setemail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                  autoCorrect={false}
                  textContentType="emailAddress"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>I am a</Text>
              <View style={styles.roleContainer}>
                <TouchableOpacity 
                  style={[
                    styles.roleCard,
                    checked === 'first' && styles.roleCardActive
                  ]}
                  onPress={() => setChecked('first')}
                >
                  <MaterialCommunityIcons 
                    name="doctor" 
                    size={24} 
                    color={checked === 'first' ? Colors.light.white : Colors.light.primary} 
                  />
                  <Text style={[
                    styles.roleText,
                    checked === 'first' && styles.roleTextActive
                  ]}>Veterinarian</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[
                    styles.roleCard,
                    checked === 'second' && styles.roleCardActive
                  ]}
                  onPress={() => setChecked('second')}
                >
                  <MaterialCommunityIcons 
                    name="paw" 
                    size={24} 
                    color={checked === 'second' ? Colors.light.white : '#8B5CF6'} 
                  />
                  <Text style={[
                    styles.roleText,
                    checked === 'second' && styles.roleTextActive
                  ]}>Pet Owner</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputContainer}>
                <MaterialCommunityIcons name="lock-outline" size={20} color={Colors.light.textSecondary} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Create a password"
                  placeholderTextColor={Colors.light.textTertiary}
                  value={password}
                  onChangeText={setpassword}
                  secureTextEntry={!showPassword}
                  textContentType="newPassword"
                />
                <TouchableOpacity 
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <MaterialCommunityIcons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={20} 
                    color={Colors.light.textSecondary} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity 
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={signupUser}
              disabled={isLoading}
              activeOpacity={0.8}
            >
              {isLoading ? (
                <ActivityIndicator color={Colors.light.white} />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

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
    backgroundColor: Colors.light.background,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  headerSection: {
    paddingTop: Spacing.xxl,
    paddingBottom: Spacing.md,
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.light.white,
    padding: 4,
    marginBottom: Spacing.md,
    ...Shadow.lg,
  },
  logo: {
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  title: {
    fontSize: FontSize.xxxl,
    fontWeight: FontWeight.bold,
    color: Colors.light.primary,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: FontSize.md,
    color: Colors.light.textSecondary,
    textAlign: 'center',
  },
  formContainer: {
    backgroundColor: Colors.light.white,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    padding: Spacing.lg,
    paddingTop: Spacing.xl,
    flex: 1,
    ...Shadow.xl,
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: Colors.light.text,
    marginBottom: Spacing.xs,
    marginLeft: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.border,
  },
  inputIcon: {
    marginLeft: Spacing.md,
  },
  input: {
    flex: 1,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 14,
    fontSize: FontSize.md,
    color: Colors.light.text,
  },
  eyeIcon: {
    padding: Spacing.md,
  },
  roleContainer: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  roleCard: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.surfaceVariant,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    borderWidth: 2,
    borderColor: Colors.light.border,
    gap: Spacing.sm,
  },
  roleCardActive: {
    backgroundColor: Colors.light.primary,
    borderColor: Colors.light.primary,
  },
  roleText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: Colors.light.text,
  },
  roleTextActive: {
    color: Colors.light.white,
  },
  button: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    ...Shadow.md,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: Colors.light.white,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.lg,
  },
  loginText: {
    color: Colors.light.textSecondary,
    fontSize: FontSize.md,
  },
  loginLink: {
    color: Colors.light.primary,
    fontWeight: FontWeight.bold,
    fontSize: FontSize.md,
  },
});

export default Signup;
