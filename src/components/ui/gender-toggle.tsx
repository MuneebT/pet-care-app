import React from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BorderRadius, Spacing } from '@/constants/theme';

interface GenderToggleProps {
  value: string;
  onChange: (gender: string) => void;
}

export const GenderToggle: React.FC<GenderToggleProps> = ({
  value,
  onChange,
}) => {
  const options = [
    { label: 'Male', value: 'Male', icon: 'gender-male' },
    { label: 'Female', value: 'Female', icon: 'gender-female' },
  ];

  return (
    <View style={styles.container}>
      {options.map((option) => {
        const isSelected = value.toLowerCase() === option.value.toLowerCase();
        return (
          <TouchableOpacity
            key={option.value}
            style={[
              styles.option,
              isSelected && styles.optionSelected,
            ]}
            onPress={() => onChange(option.value)}
            activeOpacity={0.7}
          >
            <MaterialCommunityIcons
              name={option.icon as any}
              size={24}
              color={isSelected ? '#FFFFFF' : '#94A3B8'}
            />
            <Text
              style={[
                styles.optionText,
                isSelected && styles.optionTextSelected,
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: Spacing.md,
  },
  option: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: Spacing.sm,
  },
  optionSelected: {
    backgroundColor: '#6366F1',
    borderColor: '#6366F1',
  },
  optionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94A3B8',
  },
  optionTextSelected: {
    color: '#FFFFFF',
  },
});
