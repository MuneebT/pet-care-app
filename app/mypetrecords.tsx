import { auth, db } from '@/services/firebase';
import { router } from 'expo-router';
import { onAuthStateChanged, User } from 'firebase/auth';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, Text } from 'react-native';
import { ActivityIndicator, TextInput } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Shadow } from '@/constants/theme';
import BottomNavigationBar from './bottomnavigationbar';
import { PetImagePicker } from '@/components/ui/pet-image-picker';
import { FormFieldCard } from '@/components/ui/form-field-card';
import { GenderToggle } from '@/components/ui/gender-toggle';

interface PetData {
  userId: string;
  name: string;
  type: string;
  breed: string;
  gender: string;
  age: string;
  image?: string;
  createdAt: any;
  updatedAt?: any;
}

const PET_TYPES = ['Dog', 'Cat'];

const CAT_BREEDS = [
  'Himalayan', 'Turkish Angora', 'Siamese', 'Russian Blue', 'Domestic Shorthair',
  'Oriental Shorthair', 'Persian', 'Domestic Longhair', 'Sphynx', 'Bengal',
  'Tonkinese', 'Manx', 'British Shorthair', 'Abyssinian', 'Scottish Fold',
  'Birman', 'Maine Coon', 'Cornish Rex', 'Devon Rex', 'Norwegian Forest Cat',
  'Exotic Shorthair', 'Ragdoll', 'Burmese', 'American Shorthair', 'Chartreux'
];

const DOG_BREEDS = [
  'Beagle', 'Australian Shepherd', 'Poodle', 'Pomeranian', 'Bulldog',
  'German Shepherd', 'Doberman', 'Boston Terrier', 'Miniature Schnauzer', 'Border Collie',
  'Boxer', 'Cavalier King Charles Spaniel', 'Dachshund', 'Chihuahua', 'Cocker Spaniel',
  'Yorkshire Terrier', 'Shih Tzu', 'Great Dane', 'Siberian Husky', 'Maltese',
  'Shetland Sheepdog', 'Golden Retriever', 'Pembroke Welsh Corgi', 'Rottweiler', 'Labrador Retriever'
];

const getBreedsByType = (type: string): string[] => {
  return type.toLowerCase() === 'cat' ? CAT_BREEDS : DOG_BREEDS;
};

const MyPetRecords = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [breed, setBreed] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [image, setImage] = useState('');
  const [showTypeDropdown, setShowTypeDropdown] = useState<boolean>(false);
  const [showBreedDropdown, setShowBreedDropdown] = useState<boolean>(false);

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

    if (!name.trim() || !type.trim() || !breed.trim() || !gender.trim() || !age.trim()) {
      Alert.alert('Oops!', 'Please fill in all the fields to continue');
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
        image: image || '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'users', currentUser.uid, 'pets'), petData);
      Alert.alert('Hooray!', `${name} has been added to your family!`);
      router.back();
    } catch (error) {
      console.error('Error saving pet:', error);
      Alert.alert('Error', 'Failed to save pet. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }, [currentUser, name, type, breed, gender, age, image]);

  const handleImagePick = () => {
    Alert.alert(
      'Add Pet Photo',
      'Choose how you want to add a photo',
      [
        { text: 'Camera', onPress: () => console.log('Camera pressed') },
        { text: 'Photo Library', onPress: () => console.log('Gallery pressed') },
        { text: 'Cancel', style: 'cancel' },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.gradientBackground} />
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons name="paw" size={64} color="#F59E0B" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.gradientBackground} />
        <View style={styles.loadingContent}>
          <MaterialCommunityIcons name="account-circle" size={64} color="#94A3B8" />
          <Text style={styles.errorText}>Please sign in to add a pet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.gradientBackground} />
      
      <KeyboardAvoidingView 
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.innerContainer}>
            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.header}>
                <TouchableOpacity 
                  style={styles.backButton}
                  onPress={() => router.back()}
                >
                  <MaterialCommunityIcons name="arrow-left" size={24} color="#1E293B" />
                </TouchableOpacity>
                <View style={styles.titleContainer}>
                  <MaterialCommunityIcons name="paw" size={28} color="#F59E0B" />
                  <Text style={styles.title}>Add New Pet</Text>
                </View>
                <View style={styles.placeholder} />
              </View>

              <PetImagePicker
                imageUri={image}
                onImageSelected={handleImagePick}
              />

              <View style={styles.formContainer}>
                <FormFieldCard icon="paw" label="Pet Name">
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="What's your pet's name?"
                    placeholderTextColor="#94A3B8"
                    style={styles.input}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                  />
                </FormFieldCard>

                <FormFieldCard icon="tag-outline" label="Pet Type">
                  <TouchableOpacity
                    style={styles.dropdownButton}
                    onPress={() => setShowTypeDropdown(!showTypeDropdown)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.dropdownText, !type && styles.placeholderText]}>
                      {type || 'Select pet type'}
                    </Text>
                    <MaterialCommunityIcons 
                      name={showTypeDropdown ? 'chevron-up' : 'chevron-down'} 
                      size={20} 
                      color="#64748B" 
                    />
                  </TouchableOpacity>
                  {showTypeDropdown && (
                    <View style={styles.dropdown}>
                      {PET_TYPES.map((petType) => (
                        <TouchableOpacity
                          key={petType}
                          style={[styles.dropdownItem, type === petType && styles.dropdownItemSelected]}
                          onPress={() => {
                            setType(petType);
                            setShowTypeDropdown(false);
                          }}
                        >
                          <MaterialCommunityIcons 
                            name="circle-small" 
                            size={20} 
                            color={type === petType ? '#6366F1' : '#CBD5E1'} 
                          />
                          <Text style={[styles.dropdownItemText, type === petType && styles.dropdownItemTextSelected]}>
                            {petType}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )}
                </FormFieldCard>

                <FormFieldCard icon="certificate-outline" label="Breed">
                  {!type ? (
                    <Text style={styles.placeholderText}>Select pet type first</Text>
                  ) : (
                    <TouchableOpacity
                      style={styles.dropdownButton}
                      onPress={() => setShowBreedDropdown(!showBreedDropdown)}
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.dropdownText, !breed && styles.placeholderText]}>
                        {breed || 'Select breed'}
                      </Text>
                      <MaterialCommunityIcons 
                        name={showBreedDropdown ? 'chevron-up' : 'chevron-down'} 
                        size={20} 
                        color="#64748B" 
                      />
                    </TouchableOpacity>
                  )}
                  {showBreedDropdown && type && (
                    <ScrollView style={styles.breedDropdown} nestedScrollEnabled>
                      {getBreedsByType(type).map((b) => (
                        <TouchableOpacity
                          key={b}
                          style={[styles.breedOption, breed === b && styles.breedOptionSelected]}
                          onPress={() => {
                            setBreed(b);
                            setShowBreedDropdown(false);
                          }}
                        >
                          <Text style={[styles.breedOptionText, breed === b && styles.breedOptionTextSelected]}>
                            {b}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  )}
                </FormFieldCard>

                <FormFieldCard icon="heart-outline" label="Gender">
                  <GenderToggle
                    value={gender}
                    onChange={setGender}
                  />
                </FormFieldCard>

                <FormFieldCard icon="calendar-month-outline" label="Age">
                  <TextInput
                    value={age}
                    onChangeText={setAge}
                    placeholder="How old is your pet?"
                    placeholderTextColor="#94A3B8"
                    keyboardType="numeric"
                    style={styles.input}
                    underlineColor="transparent"
                    activeUnderlineColor="transparent"
                  />
                </FormFieldCard>
              </View>

              <TouchableOpacity
                style={styles.submitButton}
                onPress={savePet}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <View style={styles.submitGradient}>
                  {isSubmitting ? (
                    <ActivityIndicator color="#FFFFFF" size="small" />
                  ) : (
                    <>
                      <MaterialCommunityIcons name="plus" size={22} color="#FFFFFF" />
                      <Text style={styles.submitText}>Add Pet</Text>
                    </>
                  )}
                </View>
              </TouchableOpacity>

              <View style={styles.spacer} />
            </ScrollView>
            
            <View style={styles.bottomNav}>
              <BottomNavigationBar />
            </View>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FEF3E2',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '100%',
    backgroundColor: '#FEF3E2',
  },
  keyboardView: {
    flex: 1,
  },
  innerContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: 16,
    fontWeight: '600',
    color: '#64748B',
  },
  errorText: {
    marginTop: Spacing.md,
    fontSize: 16,
    color: '#64748B',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
    paddingTop: Spacing.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1E293B',
  },
  placeholder: {
    width: 44,
  },
  formContainer: {
    marginTop: Spacing.sm,
  },
  input: {
    backgroundColor: 'transparent',
    fontSize: 16,
    color: '#1E293B',
    paddingVertical: 0,
    marginTop: -4,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: Spacing.xs,
  },
  dropdownText: {
    fontSize: 16,
    color: '#1E293B',
  },
  placeholderText: {
    color: '#94A3B8',
  },
  dropdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  dropdownItemSelected: {
    backgroundColor: '#EEF2FF',
  },
  dropdownItemText: {
    fontSize: 15,
    color: '#64748B',
  },
  dropdownItemTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  submitButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.xl,
    ...Shadow.lg,
  },
  submitGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderRadius: BorderRadius.xl,
    backgroundColor: '#F59E0B',
  },
  submitText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  breedDropdown: {
    backgroundColor: '#F8FAFC',
    borderRadius: BorderRadius.md,
    marginTop: Spacing.sm,
    maxHeight: 200,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  breedOption: {
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  breedOptionSelected: {
    backgroundColor: '#EEF2FF',
  },
  breedOptionText: {
    fontSize: 15,
    color: '#64748B',
  },
  breedOptionTextSelected: {
    color: '#6366F1',
    fontWeight: '600',
  },
  spacer: {
    height: Spacing.xxl,
  },
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default MyPetRecords;
