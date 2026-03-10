import { auth, db } from '@/services/firebase';
import { router } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { ActivityIndicator, Button, TextInput as PaperInput, Text as PaperText, useTheme } from 'react-native-paper';
import BottomNavigationBar from './bottomnavigationbar';

interface PetData {
  userId: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  createdAt: any;
  updatedAt?: any;
}
const MyPetRecords = () => {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const savePet = useCallback(async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please sign in to add a pet');
      return;
    }

    // Form validation
    if (!name.trim() || !type.trim() || !breed.trim() || !gender.trim() || !age.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const petData: Omit<PetData, 'id'> = {
        userId: currentUser.uid,
        name: name.trim(),
        type: type.trim(),
        breed: breed.trim(),
        gender: gender.trim(),
        age: age.trim(),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'users', currentUser.uid, 'pets'), petData);
      Alert.alert('Success', 'Pet added successfully!');
      router.back();
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, name, type, breed, gender, age]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <ActivityIndicator size="large" color={theme.colors.onPrimary} />
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <PaperText style={styles.errorText}>
          Please sign in to add a pet
        </PaperText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={styles.innerContainer}>
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <PaperText style={styles.title}>
              Add New Pet
            </PaperText>

            <PaperInput
              label="Pet Name"
              value={name}
              onChangeText={setName}
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.onPrimary,
                  background: theme.colors.surface,
                },
              }}
            />

            <PaperInput
              label="Breed"
              value={breed}
              onChangeText={setBreed}
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.onPrimary,
                  background: theme.colors.surface,
                },
              }}
            />

            <PaperInput
              label="Age"
              value={age}
              onChangeText={setAge}
              keyboardType="numeric"
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.onPrimary,
                  background: theme.colors.surface,
                },
              }}
            />

            <PaperInput
              label="Type (e.g., Dog, Cat)"
              value={type}
              onChangeText={setType}
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.onPrimary,
                  background: theme.colors.surface,
                },
              }}
            />

            <PaperInput
              label="Gender"
              value={gender}
              onChangeText={setGender}
              mode="outlined"
              style={styles.input}
              theme={{
                colors: {
                  primary: theme.colors.onPrimary,
                  background: theme.colors.surface,
                },
              }}
            />

            <Button
              mode="contained"
              onPress={savePet}
              style={[styles.button, { backgroundColor: theme.colors.secondary }]}
              labelStyle={styles.buttonLabel}
              loading={isSubmitting}
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Pet'}
            </Button>
          </ScrollView>
          
          <View style={styles.bottomNav}>
            <BottomNavigationBar />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFA500',
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100, // Extra space for bottom navigation
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 30,
    textAlign: 'center',
    marginTop: 20,
  },
  input: {
    marginBottom: 16,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 24,
    paddingVertical: 8,
    borderRadius: 8,
    elevation: 2,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
});

export default MyPetRecords;
