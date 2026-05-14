import React from 'react';
import { View, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Shadow } from '@/constants/theme';

interface PetImagePickerProps {
  imageUri?: string;
  onImageSelected: (uri: string) => void;
  size?: number;
}

export const PetImagePicker: React.FC<PetImagePickerProps> = ({
  imageUri,
  onImageSelected,
  size = 140,
}) => {
  const handlePress = () => {
    onImageSelected('placeholder');
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
      >
        {imageUri ? (
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
      <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
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
