import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Shadow } from '@/constants/theme';
import * as ImagePicker from 'expo-image-picker';

interface PetImagePickerProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  size?: number;
  uploading?: boolean;
}

export const PetImagePicker: React.FC<PetImagePickerProps> = ({
  imageUri,
  onImageSelected,
  size = 140,
  uploading = false,
}) => {
  const requestPermission = async (type: 'camera' | 'gallery') => {
    if (type === 'camera') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Camera permission is required to take a photo');
        return false;
      }
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission needed', 'Gallery permission is required to pick a photo');
        return false;
      }
    }
    return true;
  };

  const pickFromCamera = async () => {
    const hasPermission = await requestPermission('camera');
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const pickFromGallery = async () => {
    const hasPermission = await requestPermission('gallery');
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled && result.assets[0]) {
      onImageSelected(result.assets[0].uri);
    }
  };

  const handlePress = () => {
    Alert.alert('Add Pet Photo', 'Choose how you want to add a photo', [
      { text: 'Camera', onPress: pickFromCamera },
      { text: 'Photo Library', onPress: pickFromGallery },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.imageContainer,
          { width: size, height: size, borderRadius: size / 2 },
        ]}
        onPress={handlePress}
        activeOpacity={0.8}
        disabled={uploading}
      >
        {uploading ? (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          >
            <ActivityIndicator size="large" color="#6366F1" />
          </View>
        ) : imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={[
              styles.image,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          />
        ) : (
          <View
            style={[
              styles.placeholder,
              { width: size, height: size, borderRadius: size / 2 },
            ]}
          >
            <MaterialCommunityIcons name="paw" size={size * 0.4} color="#94A3B8" />
          </View>
        )}
        <View
          style={[
            styles.cameraButton,
            { width: size * 0.35, height: size * 0.35, borderRadius: size * 0.175 },
          ]}
        >
          <MaterialCommunityIcons
            name="camera"
            size={size * 0.18}
            color="#FFFFFF"
          />
        </View>
      </TouchableOpacity>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7} disabled={uploading}>
        <View style={styles.button}>
          <MaterialCommunityIcons name="image-plus" size={18} color="#6366F1" />
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  imageContainer: {
    ...Shadow.lg,
    overflow: 'hidden',
  },
  image: {
    resizeMode: 'cover',
  },
  placeholder: {
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: '#6366F1',
    justifyContent: 'center',
    alignItems: 'center',
    ...Shadow.md,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.md,
  },
});
