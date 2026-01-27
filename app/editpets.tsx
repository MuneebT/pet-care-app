import { auth, db } from '@/src/config/firebase';
import { router, useLocalSearchParams } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { addDoc, collection, CollectionReference, doc, DocumentReference, updateDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableWithoutFeedback, View } from 'react-native';
import { Button, TextInput as PaperInput, Text as PaperText, useTheme } from 'react-native-paper';
import BottomNavigationBar from './bottomnavigationbar';

interface PetData {
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  createdAt?: string;
  updatedAt?: string;
}

const EditPet = () => {
  const theme = useTheme();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user: User | null) => {
      setCurrentUser(user);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Extract params and safely typecast them as strings
  const params = useLocalSearchParams();
  const petId = Array.isArray(params.petId) ? params.petId[0] : params.petId || '';
  const name = Array.isArray(params.name) ? params.name[0] : params.name || '';
  const type = Array.isArray(params.type) ? params.type[0] : params.type || '';
  const breed = Array.isArray(params.breed) ? params.breed[0] : params.breed || '';
  const gender = Array.isArray(params.gender) ? params.gender[0] : params.gender || '';
  const age = Array.isArray(params.age) ? params.age[0] : params.age || '';

  // Initialize state with clean string values
  const [petName, setPetName] = useState<string>(name);
  const [petType, setPetType] = useState<string>(type);
  const [petBreed, setPetBreed] = useState<string>(breed);
  const [petGender, setPetGender] = useState<string>(gender);
  const [petAge, setPetAge] = useState<string>(age);

  const handleUpdate = useCallback(async () => {
    if (!currentUser) {
      Alert.alert('Error', 'Please sign in to update pet information');
      return;
    }

    // Basic validation
    if (!petName.trim() || !petType.trim() || !petBreed.trim() || !petGender.trim() || !petAge.trim()) {
      Alert.alert('Validation Error', 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);

    try {
      const userPetsRef = collection(db, 'users', currentUser.uid, 'pets') as CollectionReference<PetData>;
      const petData: Omit<PetData, 'id'> = {
        name: petName.trim(),
        type: petType.trim(),
        breed: petBreed.trim(),
        gender: petGender.trim(),
        age: petAge.trim(),
        updatedAt: new Date().toISOString(),
      };

      if (petId) {
        // Update existing pet
        const petRef = doc(userPetsRef, petId) as DocumentReference<PetData>;
        await updateDoc(petRef, petData);
        Alert.alert('Success', 'Pet updated successfully!');
      } else {
        // Create new pet
        await addDoc(userPetsRef, {
          ...petData,
          createdAt: new Date().toISOString(),
        });
        Alert.alert('Success', 'Pet added successfully!');
      }
      
      router.back();
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, petName, petType, petBreed, petGender, petAge, petId]);

  if (isLoading || isSubmitting) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <PaperText style={styles.loadingText}>Loading...</PaperText>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
        <PaperText style={styles.errorText}>Please sign in to edit pets</PaperText>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
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
              {petId ? 'Edit Pet' : 'Add New Pet'}
            </PaperText>

            <PaperInput
              label="Pet Name"
              value={petName}
              onChangeText={setPetName}
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
              value={petType}
              onChangeText={setPetType}
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
              value={petBreed}
              onChangeText={setPetBreed}
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
              value={petGender}
              onChangeText={setPetGender}
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
              value={petAge}
              onChangeText={setPetAge}
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

            <Button
              mode="contained"
              onPress={handleUpdate}
              style={[styles.button, { backgroundColor: theme.colors.secondary }]}
              labelStyle={styles.buttonLabel}
              loading={isSubmitting}
              disabled={isSubmitting || isLoading}
            >
              {petId ? 'Save Changes' : 'Add Pet'}
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
    backgroundColor: '#FFA500', // Orange background
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#FFA500',
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
    borderRadius: 8,
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
  loadingText: {
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    fontSize: 16,
    color: '#ffebee',
  },
});

export default EditPet;
