import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BorderRadius, Spacing, Shadow } from '@/constants/theme';
import { StatusBadge } from './status-badge';

interface AppointmentCardProps {
  petName: string;
  vetName: string;
  date: Date;
  time: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  petType?: string;
  onPress?: () => void;
}

export const AppointmentCard: React.FC<AppointmentCardProps> = ({
  petName,
  vetName,
  date,
  time,
  status,
  petType = 'paw',
  onPress,
}) => {
  const formatDate = (d: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    }).format(d);
  };

  const formatTime = (t: string) => {
    if (t) return t;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  };

  const borderColor =
    status === 'confirmed'
      ? '#10B981'
      : status === 'cancelled'
      ? '#EF4444'
      : '#F59E0B';

  return (
    <TouchableOpacity
      style={[styles.container, { borderLeftColor: borderColor }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.petInfo}>
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name={petType === 'Cat' ? 'cat' : petType === 'Bird' ? 'bird' : 'paw'}
              size={20}
              color="#6366F1"
            />
          </View>
          <View>
            <Text style={styles.petName}>{petName}</Text>
            <Text style={styles.petType}>{petType}</Text>
          </View>
        </View>
        <StatusBadge status={status} />
      </View>

      <View style={styles.divider} />

      <View style={styles.details}>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="doctor" size={16} color="#64748B" />
          <Text style={styles.detailText}>{vetName}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="calendar" size={16} color="#64748B" />
          <Text style={styles.detailText}>{formatDate(date)}</Text>
        </View>
        <View style={styles.detailRow}>
          <MaterialCommunityIcons name="clock-outline" size={16} color="#64748B" />
          <Text style={styles.detailText}>{formatTime(time)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderLeftWidth: 4,
    ...Shadow.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  petInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
  },
  petName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
  },
  petType: {
    fontSize: 12,
    color: '#64748B',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: Spacing.sm,
  },
  details: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  detailText: {
    fontSize: 14,
    color: '#64748B',
  },
});
