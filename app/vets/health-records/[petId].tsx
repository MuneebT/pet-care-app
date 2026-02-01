import HealthRecordForm from '@/src/components/health/HealthRecordForm';
import { db } from '@/src/config/firebase';
import { HealthRecord, HealthRecordFormData, RecordType } from '@/src/types/healthRecord';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { format } from 'date-fns';
import * as FileSystem from 'expo-file-system';
import { Paths } from 'expo-file-system';
import { useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { addDoc, collection, deleteDoc, doc, getDocs, orderBy, query, serverTimestamp, Timestamp, updateDoc, where, writeBatch } from 'firebase/firestore';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, Divider, FAB, Menu, Modal, Portal, Snackbar, Text, useTheme } from 'react-native-paper';
// Use cache directory for temporary files like CSV exports
const cacheDir = Paths.cache.uri;
// TODO: Uncomment and implement useAuth hook
// import { useAuth } from '@/src/hooks/useAuth';

// Mock user object for now
const useAuth = () => ({
  user: { 
    uid: 'current-user-id',
    displayName: 'Veterinarian Name' // Added displayName to match the expected type
  }
});

const HealthRecordsScreen = () => {
  const params = useLocalSearchParams<{ petId: string }>();
  const { petId } = params;
  const { user } = useAuth();
  const theme = useTheme();
  
  // Debug: Log the received parameters
  console.log('HealthRecordsScreen - Received params:', params);
  console.log('petId:', petId);
  const [snackbarVisible, setSnackbarVisible] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HealthRecord | null>(null);
  const [menuVisible, setMenuVisible] = useState<{visible: boolean, recordId: string | null}>({ visible: false, recordId: null });

  const initialFormData: HealthRecordFormData = {
    recordType: 'treatment',
    name: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    medicine: '',
    dosage: '',
    notes: ''
  };
  
  const [formData, setFormData] = useState<HealthRecordFormData>(initialFormData);
  const [exportMenuVisible, setExportMenuVisible] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  const addTestHealthRecords = async () => {
    if (!petId) return;

    const testRecords = [
      {
        petId,
        recordType: 'vaccination' as const,
        name: 'Rabies Vaccine',
        description: 'Annual rabies vaccination',
        date: new Date(),
        nextVaccinationDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
        vetName: 'Dr. Smith',
        notes: 'Pet handled the vaccination well, no adverse reactions.'
      },
      {
        petId,
        recordType: 'treatment' as const,
        name: 'Flea Treatment',
        description: 'Monthly flea prevention',
        date: new Date(),
        medicine: 'Frontline Plus',
        dosage: '1 application',
        notes: 'Applied between shoulder blades'
      },
      {
        petId,
        recordType: 'checkup' as const,
        name: 'Annual Checkup',
        description: 'Routine health checkup',
        date: new Date(),
        weight: '4.5 kg',
        temperature: '38.5°C',
        notes: 'Overall good health, recommended dental cleaning next visit'
      }
    ];

    try {
      const batch = writeBatch(db);
      const recordsRef = collection(db, 'healthRecords');
      
      testRecords.forEach(record => {
        const docRef = doc(recordsRef);
        batch.set(docRef, {
          ...record,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      });

      await batch.commit();
      Alert.alert('Success', 'Test health records added successfully');
      fetchRecords(); // Refresh the list
    } catch (error) {
      console.error('Error adding test records:', error);
      Alert.alert('Error', 'Failed to add test records');
    }
  };

  const fetchRecords = async () => {
    if (!petId) return;
    
    setLoading(true);
    try {
      const q = query(
        collection(db, 'healthRecords'),
        where('petId', '==', petId),
        orderBy('date', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const recordsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate()
      })) as HealthRecord[];
      
      setRecords(recordsData);
    } catch (error) {
      console.error('Error fetching records:', error);
      Alert.alert('Error', 'Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecords();
  }, [petId]);

  const handleInputChange = (field: keyof HealthRecordFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.description) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    try {
      const recordData = {
        ...formData,
        petId,
        vetId: user?.uid || '',
        vetName: user?.displayName || 'Veterinarian',
        date: Timestamp.fromDate(new Date(formData.date)),
        updatedAt: Timestamp.now(),
        ...(selectedRecord ? {} : { createdAt: Timestamp.now() })
      };

      if (selectedRecord?.id) {
        await updateDoc(doc(db, 'healthRecords', selectedRecord.id), recordData);
      } else {
        await addDoc(collection(db, 'healthRecords'), recordData);
      }

      setModalVisible(false);
      setSelectedRecord(null);
      setFormData(initialFormData);
      fetchRecords();
    } catch (error) {
      console.error('Error saving record:', error);
      Alert.alert('Error', 'Failed to save health record');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'healthRecords', id));
      fetchRecords();
      setMenuVisible({ visible: false, recordId: null });
    } catch (error) {
      console.error('Error deleting record:', error);
      Alert.alert('Error', 'Failed to delete health record');
    }
  };

  const openEditModal = (record: HealthRecord) => {
    setSelectedRecord(record);
    setFormData({
      recordType: record.recordType,
      name: record.name,
      description: record.description,
      date: format(record.date as Date, 'yyyy-MM-dd'),
      medicine: record.medicine || '',
      dosage: record.dosage || '',
      notes: record.notes || ''
    });
    setModalVisible(true);
  };

  const openMenu = (recordId: string) => setMenuVisible({ visible: true, recordId });
  const closeMenu = () => setMenuVisible({ visible: false, recordId: null });

  const getRecordIcon = (type: RecordType): keyof typeof MaterialCommunityIcons.glyphMap => {
    const icons = {
      'vaccination': 'needle',
      'surgery': 'scalpel',
      'checkup': 'stethoscope',
      'treatment': 'medical-bag',
      'other': 'medical-bag'
    } as const;
    
    const icon = icons[type] || 'medical-bag';
    return icon as keyof typeof MaterialCommunityIcons.glyphMap;
  };

  const exportToCSV = async () => {
    if (!records.length) {
      setSnackbarMessage('No records to export');
      setSnackbarVisible(true);
      return;
    }

    setIsExporting(true);
    try {
      const headers = 'Date,Type,Name,Description,Medicine,Dosage,Notes\n';
      const csvRows = records.map(record => {
        const date = record.date instanceof Date ? record.date : record.date.toDate();
        return [
          `"${format(date, 'yyyy-MM-dd')}"`,
          `"${record.recordType}"`,
          `"${record.name}"`,
          `"${record.description}"`,
          `"${record.medicine || ''}"`,
          `"${record.dosage || ''}"`,
          `"${(record.notes || '').replace(/"/g, '\\"')}"`
        ].join(',');
      });

      const csvContent = headers + csvRows.join('\n');
      
      if (Platform.OS === 'web') {
        // For web, create a download link
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `health-records-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        // For mobile, use expo-file-system and sharing
        const fileName = `health-records-${Date.now()}.csv`;
        const fileUri = `${cacheDir}${fileName}`;
        
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: 'utf8'
        });

        await Sharing.shareAsync(fileUri, {
          mimeType: 'text/csv',
          dialogTitle: 'Export Health Records',
          UTI: 'public.comma-separated-values-text'
        });
      }
      
      setSnackbarMessage('Records exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      setSnackbarMessage('Failed to export records');
    } finally {
      setIsExporting(false);
      setExportMenuVisible(false);
      setSnackbarVisible(true);
    }
  };

  const renderExportMenu = () => (
    <Portal>
      <Menu
        visible={exportMenuVisible}
        onDismiss={() => setExportMenuVisible(false)}
        anchor={
          <View style={{ position: 'absolute', right: -1000 }} />
        }
        contentStyle={{ marginTop: 40 }}
      >
        <Menu.Item
          leadingIcon="file-document-outline"
          onPress={exportToCSV}
          title="Export as CSV"
          disabled={isExporting || records.length === 0}
        />
      </Menu>
    </Portal>
  );

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {renderExportMenu()}
      <Snackbar
        visible={snackbarVisible}
        onDismiss={() => setSnackbarVisible(false)}
        duration={3000}
        action={{
          label: 'OK',
          onPress: () => setSnackbarVisible(false),
        }}
      >
        {snackbarMessage}
      </Snackbar>
      {records.length === 0 ? (
        <View style={styles.emptyContainer}>
          <MaterialCommunityIcons name="clipboard-text-outline" size={64} color={theme.colors.primary} />
          <Text style={[styles.emptyText, { color: theme.colors.onSurfaceVariant }]}>
            No health records found
          </Text>
          <Button 
            mode="contained" 
            onPress={() => setModalVisible(true)}
            style={styles.addButton}
          >
            Add First Record
          </Button>
        </View>
      ) : (
        <ScrollView style={styles.scrollView}>
          {records.map(record => (
            <Card key={record.id} style={[styles.card, { backgroundColor: theme.colors.surface }]}>
              <Card.Title
                title={record.name}
                titleStyle={{ color: theme.colors.onSurface }}
                subtitle={`${record.recordType.charAt(0).toUpperCase() + record.recordType.slice(1)} • ${format(record.date as Date, 'MMM d, yyyy')}`}
                subtitleStyle={{ color: theme.colors.onSurfaceVariant }}
                left={props => (
                  <MaterialCommunityIcons 
                    {...props} 
                    name={getRecordIcon(record.recordType)} 
                    size={24} 
                    color={theme.colors.primary} 
                  />
                )}
                right={props => (
                  <Menu
                    visible={menuVisible.visible && menuVisible.recordId === record.id}
                    onDismiss={closeMenu}
                    anchor={
                      <MaterialCommunityIcons
                        {...props}
                        name="dots-vertical"
                        size={24}
                        color={theme.colors.onSurfaceVariant}
                        onPress={() => openMenu(record.id!)}
                      />
                    }
                  >
                    <Menu.Item 
                      onPress={() => {
                        closeMenu();
                        openEditModal(record);
                      }} 
                      title="Edit" 
                    />
                    <Divider />
                    <Menu.Item 
                      onPress={() => {
                        closeMenu();
                        Alert.alert(
                          'Delete Record',
                          'Are you sure you want to delete this record?',
                          [
                            { text: 'Cancel', style: 'cancel' },
                            { text: 'Delete', style: 'destructive', onPress: () => handleDelete(record.id!) }
                          ]
                        );
                      }} 
                      title="Delete"
                      titleStyle={{ color: theme.colors.error }}
                    />
                  </Menu>
                )}
              />
              <Card.Content>
                <Text style={{ color: theme.colors.onSurface }}>{record.description}</Text>
                {(record.medicine || record.dosage) && (
                  <View style={styles.medicineContainer}>
                    {record.medicine && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="pill" size={16} color={theme.colors.primary} />
                        <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>{record.medicine}</Text>
                      </View>
                    )}
                    {record.dosage && (
                      <View style={styles.detailRow}>
                        <MaterialCommunityIcons name="scale" size={16} color={theme.colors.primary} />
                        <Text style={[styles.detailText, { color: theme.colors.onSurface }]}>{record.dosage}</Text>
                      </View>
                    )}
                  </View>
                )}
                {record.notes && (
                  <View style={styles.notesContainer}>
                    <Text style={[styles.notesLabel, { color: theme.colors.primary }]}>Notes:</Text>
                    <Text style={{ color: theme.colors.onSurface }}>{record.notes}</Text>
                  </View>
                )}
              </Card.Content>
              <Card.Actions>
                <Text style={[styles.vetText, { color: theme.colors.onSurfaceVariant }]}>
                  Added by {record.vetName || 'Veterinarian'}
                </Text>
              </Card.Actions>
            </Card>
          ))}
        </ScrollView>
      )}

      <Portal>
        <View style={styles.fabContainer}>
          <FAB.Group
            open={fabOpen}
            visible={!loading}
            icon={fabOpen ? 'close' : 'plus'}
            fabStyle={styles.fabGroup}
            actions={[
              {
                icon: 'file-document-edit',
                label: 'Add Record',
                onPress: () => setModalVisible(true),
                style: styles.actionButton,
              },
              {
                icon: 'file-export',
                label: 'Export Records',
                onPress: () => setExportMenuVisible(true),
                style: styles.actionButton,
              },
              {
                icon: 'test-tube',
                label: 'Add Test Data',
                onPress: addTestHealthRecords,
                color: theme.colors.primary,
                style: [styles.actionButton, { backgroundColor: theme.colors.surface }],
              },
            ]}
            onStateChange={({ open }) => setFabOpen(open)}
          />
        </View>
      </Portal>

      <Portal>
        <Modal
          visible={modalVisible}
          onDismiss={() => {
            setModalVisible(false);
            setSelectedRecord(null);
            setFormData(initialFormData);
          }}
          contentContainerStyle={[styles.modal, { backgroundColor: theme.colors.surface }]}
        >
          <HealthRecordForm
            formData={formData}
            onInputChange={handleInputChange}
            onSubmit={handleSubmit}
            onCancel={() => {
              setModalVisible(false);
              setSelectedRecord(null);
              setFormData(initialFormData);
            }}
            isEditing={!!selectedRecord}
          />
        </Modal>
      </Portal>

      {records.length > 0 && (
        <FAB
          style={[styles.fab, { backgroundColor: theme.colors.primary }]}
          icon="plus"
          color={theme.colors.onPrimary}
          onPress={() => {
            setFormData(initialFormData);
            setSelectedRecord(null);
            setModalVisible(true);
          }}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  exportButton: {
    margin: 8,
  },
  exportMenu: {
    marginTop: 50,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 16,
    marginBottom: 24,
    fontSize: 16,
    textAlign: 'center',
  },
  addButton: {
    marginTop: 20,
  },
  scrollView: {
    flex: 1,
    padding: 16,
    paddingBottom: 100, // Add more padding at the bottom
  },
  card: {
    margin: 8,
    marginBottom: 16,
    borderRadius: 8,
    elevation: 2,
  },
  medicineContainer: {
    marginTop: 12,
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f5f5f5',
    borderRadius: 4,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    marginLeft: 8,
  },
  notesContainer: {
    marginTop: 12,
    padding: 8,
    paddingTop: 8,
    backgroundColor: '#f0f7ff',
    borderRadius: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  notesLabel: {
    fontWeight: '600',
    marginBottom: 4,
  },
  vetText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    textAlign: 'right',
    fontStyle: 'italic',
    flex: 1,
  },
  modal: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 8,
  },
  fabContainer: {
    position: 'absolute',
    right: 0,
    bottom: 70, // Position above bottom navigation
    zIndex: 1,
  },
  fabGroup: {
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 8,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 70, // Position above bottom navigation
    zIndex: 1,
  },
});

export default HealthRecordsScreen;
