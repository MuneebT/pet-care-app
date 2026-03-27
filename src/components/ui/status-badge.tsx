import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BorderRadius, Spacing } from '@/constants/theme';

interface StatusBadgeProps {
  status: 'confirmed' | 'pending' | 'cancelled';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const config = {
    confirmed: {
      label: 'Confirmed',
      backgroundColor: '#DCFCE7',
      textColor: '#15803D',
      icon: 'check-circle',
    },
    pending: {
      label: 'Pending',
      backgroundColor: '#FEF3C7',
      textColor: '#B45309',
      icon: 'clock-outline',
    },
    cancelled: {
      label: 'Cancelled',
      backgroundColor: '#FEE2E2',
      textColor: '#B91C1C',
      icon: 'close-circle',
    },
  };

  const { label, backgroundColor, textColor, icon } = config[status] || config.pending;

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <MaterialCommunityIcons name={icon as any} size={14} color={textColor} />
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
  },
});
