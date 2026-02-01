import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, TextInput, Button, useTheme, HelperText } from 'react-native-paper';
import { HealthRecordFormData, RecordType } from '@/src/types/healthRecord';

interface HealthRecordFormProps {
  formData: HealthRecordFormData;
  onInputChange: (field: keyof HealthRecordFormData, value: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing?: boolean;
}

const recordTypes: { value: RecordType; label: string }[] = [
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'treatment', label: 'Treatment' },
  { value: 'checkup', label: 'Check-up' },
  { value: 'surgery', label: 'Surgery' },
  { value: 'other', label: 'Other' },
];

const HealthRecordForm: React.FC<HealthRecordFormProps> = ({
  formData,
  onInputChange,
  onSubmit,
  onCancel,
  isEditing = false,
}) => {
  const theme = useTheme();
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Record name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else if (new Date(formData.date) > new Date()) {
      newErrors.date = 'Date cannot be in the future';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit();
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={[styles.title, { color: theme.colors.primary }]}>
        {isEditing ? 'Edit Health Record' : 'Add New Health Record'}
      </Text>

      <View style={styles.inputGroup}>
        <Text style={[styles.label, { color: theme.colors.onSurface }]}>
          Record Type *
        </Text>
        <View style={styles.recordTypeContainer}>
          {recordTypes.map((type) => (
            <Button
              key={type.value}
              mode={formData.recordType === type.value ? 'contained' : 'outlined'}
              onPress={() => onInputChange('recordType', type.value)}
              style={styles.recordTypeButton}
              contentStyle={styles.recordTypeButtonContent}
              labelStyle={{
                color: formData.recordType === type.value 
                  ? theme.colors.onPrimary 
                  : theme.colors.primary,
              }}
            >
              {type.label}
            </Button>
          ))}
        </View>
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          label="Record Name *"
          value={formData.name}
          onChangeText={(text) => onInputChange('name', text)}
          style={styles.input}
          mode="outlined"
          error={!!errors.name}
        />
        {errors.name && (
          <HelperText type="error" visible={!!errors.name}>
            {errors.name}
          </HelperText>
        )}
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          label="Description *"
          value={formData.description}
          onChangeText={(text) => onInputChange('description', text)}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
          mode="outlined"
          error={!!errors.description}
        />
        {errors.description && (
          <HelperText type="error" visible={!!errors.description}>
            {errors.description}
          </HelperText>
        )}
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          label="Date *"
          value={formData.date}
          onChangeText={(text) => onInputChange('date', text)}
          style={styles.input}
          mode="outlined"
          placeholder="YYYY-MM-DD"
          keyboardType="numbers-and-punctuation"
          error={!!errors.date}
        />
        {errors.date && (
          <HelperText type="error" visible={!!errors.date}>
            {errors.date}
          </HelperText>
        )}
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          label="Medicine (optional)"
          value={formData.medicine}
          onChangeText={(text) => onInputChange('medicine', text)}
          style={styles.input}
          mode="outlined"
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          label="Dosage (optional)"
          value={formData.dosage}
          onChangeText={(text) => onInputChange('dosage', text)}
          style={styles.input}
          mode="outlined"
        />
      </View>

      <View style={styles.inputGroup}>
        <TextInput
          label="Additional Notes (optional)"
          value={formData.notes}
          onChangeText={(text) => onInputChange('notes', text)}
          multiline
          numberOfLines={3}
          style={[styles.input, styles.textArea]}
          mode="outlined"
        />
      </View>

      <View style={styles.buttonContainer}>
        <Button
          mode="outlined"
          onPress={onCancel}
          style={[styles.button, { borderColor: theme.colors.outline }]}
        >
          Cancel
        </Button>
        <Button
          mode="contained"
          onPress={handleSubmit}
          style={[styles.button, { marginLeft: 12 }]}
        >
          {isEditing ? 'Update Record' : 'Add Record'}
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    marginBottom: 8,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    backgroundColor: 'transparent',
  },
  textArea: {
    minHeight: 80,
  },
  recordTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
    marginBottom: 8,
  },
  recordTypeButton: {
    margin: 4,
    borderRadius: 20,
  },
  recordTypeButtonContent: {
    height: 36,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 24,
    marginBottom: 8,
  },
  button: {
    minWidth: 120,
  },
});

export default HealthRecordForm;
