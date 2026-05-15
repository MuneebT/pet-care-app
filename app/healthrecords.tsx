import { db } from "@/services/firebase";
import { uploadToCloudinary } from "@/services/cloudinary";
import { getMedicinesForDisease, MedicineInfo } from "@/data/medications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  collection,
  doc,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
} from "firebase/firestore";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  BorderRadius,
  currentColors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import * as ImagePicker from 'expo-image-picker';

type HealthRecord = {
  id: string;
  animalType: string;
  sex: string;
  breed: string;
  age: number;
  weight: number;
  bodyTemperature?: number;
  selectedSymptoms: string[];
  flags: {
    appetiteLoss: boolean;
    vomiting: boolean;
    diarrhea: boolean;
    coughing: boolean;
    laboredBreathing: boolean;
  };
  prediction: string;
  primaryPrediction?: string;
  savedDiseases: string[];
  confidence: number;
  severity: string;
  recommendations: string[];
  createdAt?: Timestamp | null;
  source?: string;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.md,
    backgroundColor: currentColors.primary,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadow.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: currentColors.white,
  },
  subtitle: {
    marginTop: 4,
    fontSize: FontSize.sm,
    color: "rgba(255,255,255,0.85)",
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  card: {
    backgroundColor: currentColors.white,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    borderLeftWidth: 4,
    borderLeftColor: currentColors.primary,
    ...Shadow.lg,
  },
  cardHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  predictionText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  dateText: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    textAlign: "left",
  },
  metaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.sm,
  },
  metaItem: {
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
    marginRight: Spacing.sm,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
    marginBottom: 2,
  },
  value: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  badgeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: Spacing.xs,
  },
  badge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.xs,
    marginBottom: Spacing.xs,
    backgroundColor: "#EEF2FF",
  },
  badgeText: {
    fontSize: FontSize.xs,
    color: currentColors.primary,
  },
  severityBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.xl,
  },
  emptyTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: currentColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  emptySubtitle: {
    fontSize: FontSize.sm,
    textAlign: "center",
    color: currentColors.textTertiary,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: currentColors.background,
  },
  petInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.sm,
    marginBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  petThumbContainer: {
    position: 'relative',
    marginRight: Spacing.md,
  },
  petThumb: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  petThumbPlaceholder: {
    backgroundColor: '#EEF2FF',
  },
  petThumbBadge: {
    position: 'absolute',
    bottom: -2,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: currentColors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: currentColors.white,
  },
  petInfoText: {
    flex: 1,
  },
  petInfoName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
  },
  petInfoAction: {
    fontSize: FontSize.xs,
    color: currentColors.primary,
    marginTop: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    maxHeight: "80%",
    backgroundColor: currentColors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    paddingTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xxl,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  modalTitleSection: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  modalTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: currentColors.surfaceVariant || '#F1F5F9',
    justifyContent: "center",
    alignItems: "center",
  },
  modalDiseaseBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    backgroundColor: "#EEF2FF",
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.lg,
    gap: 4,
  },
  modalDiseaseBadgeText: {
    fontSize: FontSize.xs,
    color: currentColors.primary,
    fontWeight: FontWeight.medium,
  },
  modalEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.xxl * 2,
  },
  modalEmptyText: {
    marginTop: Spacing.md,
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    textAlign: "center",
  },
  medListContent: {
    paddingBottom: Spacing.lg,
  },
  medCard: {
    backgroundColor: currentColors.white,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    overflow: 'hidden',
    ...Shadow.md,
  },
  medCardHeader: {
    padding: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  medNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  medName: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
    flexShrink: 1,
  },
  medClassBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  medClassText: {
    fontSize: FontSize.xs,
    color: '#059669',
    fontWeight: FontWeight.medium,
  },
  medAttrs: {
    padding: Spacing.md,
    paddingTop: Spacing.sm,
  },
  medAttrRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  medAttrIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    justifyContent: "center",
    alignItems: "center",
    marginRight: Spacing.sm,
    marginTop: 1,
  },
  medAttrContent: {
    flex: 1,
  },
  medAttrLabel: {
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
    marginBottom: 1,
  },
  medAttrValue: {
    fontSize: FontSize.sm,
    color: currentColors.text,
    fontWeight: FontWeight.medium,
  },
  medAttrDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginBottom: Spacing.sm,
    marginLeft: 36,
  },
});

const Healthrecords = () => {
  const params = useLocalSearchParams<{ userId?: string; uid?: string }>();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicationVisible, setMedicationVisible] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [selectedMeds, setSelectedMeds] = useState<MedicineInfo[]>([]);
  const [pets, setPets] = useState<{ id: string; name: string; type: string; image?: string }[]>([]);
  const [uploadingPetId, setUploadingPetId] = useState<string | null>(null);

  const formatDateTime = (date: Date | null): string => {
    if (!date) return "Unknown date";

    const day = date.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });

    const time = date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${day} • ${time}`;
  };

  const getUserId = useCallback(async (): Promise<string | null> => {
    if (params?.userId) return String(params.userId);
    if (params?.uid) return String(params.uid);
    try {
      const storedUid = await AsyncStorage.getItem("userId");
      return storedUid;
    } catch (error) {
      console.error("Error getting user ID in healthrecords:", error);
      return null;
    }
  }, [params?.userId, params?.uid]);

  const loadRecords = useCallback(async () => {
    try {
      setLoading(true);
      const uid = await getUserId();
      if (!uid) {
        setRecords([]);
        return;
      }

      const ref = collection(db, "users", uid, "healthRecords");
      const q = query(ref, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);

      const data: HealthRecord[] = snap.docs.map((docSnap) => {
        const d = docSnap.data() as any;
        return {
          id: docSnap.id,
          animalType: d.animalType || "Unknown",
          sex: d.sex || "Unknown",
          breed: d.breed || "",
          age: d.age ?? 0,
          weight: d.weight ?? 0,
          bodyTemperature: d.bodyTemperature,
          selectedSymptoms: Array.isArray(d.selectedSymptoms)
            ? d.selectedSymptoms
            : [],
          flags: {
            appetiteLoss: !!d.flags?.appetiteLoss,
            vomiting: !!d.flags?.vomiting,
            diarrhea: !!d.flags?.diarrhea,
            coughing: !!d.flags?.coughing,
            laboredBreathing: !!d.flags?.laboredBreathing,
          },
          prediction: d.prediction || "Unknown",
          primaryPrediction: d.primaryPrediction || d.prediction || "Unknown",
          savedDiseases: Array.isArray(d.savedDiseases)
            ? d.savedDiseases
            : d.prediction
              ? String(d.prediction)
                  .split(" / ")
                  .map((disease: string) => disease.trim())
                  .filter(Boolean)
              : [],
          confidence: d.confidence ?? 0,
          severity: d.severity || "Unknown",
          recommendations: Array.isArray(d.recommendations)
            ? d.recommendations
            : [],
          createdAt: d.createdAt ?? null,
          source: d.source,
        };
      });

      setRecords(data);

      const petsRef = collection(db, "users", uid, "pets");
      const petsSnap = await getDocs(petsRef);
      const petsData = petsSnap.docs.map(doc => ({
        id: doc.id,
        name: doc.data().name || 'Unnamed Pet',
        type: doc.data().type || '',
        image: doc.data().image || undefined,
      }));
      setPets(petsData);
    } catch (error) {
      console.error("Error loading health records:", error);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

  const getPetForRecord = (record: HealthRecord): { id: string; name: string; image?: string } | null => {
    const matchingPets = pets.filter(p => p.type.toLowerCase() === record.animalType.toLowerCase());
    if (matchingPets.length === 1) return matchingPets[0];
    if (matchingPets.length > 1) {
      const breedMatch = matchingPets.filter(p =>
        p.name.toLowerCase().includes(record.breed.toLowerCase()) ||
        record.breed.toLowerCase().includes(p.name.toLowerCase())
      );
      return breedMatch.length > 0 ? breedMatch[0] : matchingPets[0];
    }
    return null;
  };

  const handleChangePetImage = async (petId: string) => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Gallery permission is required');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (result.canceled || !result.assets[0]) return;

    setUploadingPetId(petId);
    try {
      const uid = await getUserId();
      if (!uid) return;
      const cloudinaryUrl = await uploadToCloudinary(result.assets[0].uri);
      const petRef = doc(db, 'users', uid, 'pets', petId);
      await updateDoc(petRef, { image: cloudinaryUrl });
      setPets(prev => prev.map(p => p.id === petId ? { ...p, image: cloudinaryUrl } : p));
      Alert.alert('Success', 'Pet photo updated');
    } catch (error) {
      console.error('Error updating pet image:', error);
      Alert.alert('Error', 'Failed to update pet photo');
    } finally {
      setUploadingPetId(null);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadRecords();
    }, [loadRecords]),
  );

  const renderRecord = ({ item }: { item: HealthRecord }) => {
    const createdDate =
      item.createdAt && item.createdAt.toDate
        ? item.createdAt.toDate()
        : null;
    const dateLabel = formatDateTime(createdDate);

    let severityBg = "#E0F2FE";
    let severityColor = "#0284C7";
    if (item.severity === "High") {
      severityBg = "#FEE2E2";
      severityColor = "#DC2626";
    } else if (item.severity === "Medium") {
      severityBg = "#FEF3C7";
      severityColor = "#D97706";
    } else if (item.severity === "Low") {
      severityBg = "#DCFCE7";
      severityColor = "#059669";
    }

    const activeFlags = Object.entries(item.flags)
      .filter(([, v]) => v)
      .map(([k]) => k.replace(/([A-Z])/g, " $1").trim());
    const displayedPrediction =
      item.savedDiseases.length > 0
        ? item.savedDiseases.join(" / ")
        : item.prediction;
    const primaryDisease =
      item.primaryPrediction ||
      item.savedDiseases[0] ||
      item.prediction;

    const handleShowMedication = () => {
      const meds = getMedicinesForDisease(primaryDisease);
      setSelectedDisease(primaryDisease);
      setSelectedMeds(meds);
      setMedicationVisible(true);
    };

    const matchedPet = getPetForRecord(item);

    return (
      <View style={[styles.card, { borderLeftColor: severityColor }]}>
        {matchedPet && (
          <TouchableOpacity
            style={styles.petInfoRow}
            onPress={() => handleChangePetImage(matchedPet.id)}
            disabled={uploadingPetId === matchedPet.id}
            activeOpacity={0.7}
          >
            <View style={styles.petThumbContainer}>
              {uploadingPetId === matchedPet.id ? (
                <View style={styles.petThumb}>
                  <ActivityIndicator size="small" color={currentColors.primary} />
                </View>
              ) : matchedPet.image ? (
                <Image source={{ uri: matchedPet.image }} style={styles.petThumb} />
              ) : (
                <View style={[styles.petThumb, styles.petThumbPlaceholder]}>
                  <MaterialCommunityIcons
                    name={item.animalType.toLowerCase() === 'dog' ? 'dog' : 'cat'}
                    size={22}
                    color={currentColors.primary}
                  />
                </View>
              )}
              <View style={styles.petThumbBadge}>
                <MaterialCommunityIcons name="camera" size={10} color="#FFF" />
              </View>
            </View>
            <View style={styles.petInfoText}>
              <Text style={styles.petInfoName}>{matchedPet.name}</Text>
              <Text style={styles.petInfoAction}>Tap to change photo</Text>
            </View>
          </TouchableOpacity>
        )}

        <View style={styles.cardHeaderRow}>
          <Text style={styles.predictionText}>{displayedPrediction}</Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={[styles.dateText, { fontWeight: FontWeight.semibold }]}>
            Checked on {dateLabel}
          </Text>
        </View>

        <View style={styles.metaRow}>
          <Text style={styles.metaItem}>{item.animalType}</Text>
          {item.breed ? (
            <Text style={styles.metaItem}>{item.breed}</Text>
          ) : null}
          <Text style={styles.metaItem}>
            Age: {item.age || "N/A"} yrs
          </Text>
          <Text style={styles.metaItem}>
            Weight: {item.weight || "N/A"} kg
          </Text>
          {item.bodyTemperature ? (
            <Text style={styles.metaItem}>
              Temp: {item.bodyTemperature.toFixed(1)}°C
            </Text>
          ) : null}
        </View>

        {item.selectedSymptoms.length > 0 && (
          <>
            <Text style={styles.label}>Symptoms</Text>
            <View style={styles.badgeRow}>
              {item.selectedSymptoms.map((s) => (
                <View key={s} style={styles.badge}>
                  <Text style={styles.badgeText}>{s}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {activeFlags.length > 0 && (
          <>
            <Text style={[styles.label, { marginTop: Spacing.sm }]}>
              Additional Signs
            </Text>
            <View style={styles.badgeRow}>
              {activeFlags.map((flag) => (
                <View key={flag} style={styles.badge}>
                  <Text style={styles.badgeText}>{flag}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        <View style={{ marginTop: Spacing.sm }}>
          <Text style={styles.label}>Severity</Text>
          <View style={[styles.severityBadge, { backgroundColor: severityBg }]}>
            <Text
              style={{
                fontSize: FontSize.xs,
                fontWeight: FontWeight.semibold,
                color: severityColor,
              }}
            >
              {item.severity}
            </Text>
          </View>
        </View>

        <View style={{ marginTop: Spacing.sm }}>
          <Text style={styles.label}>Confidence</Text>
          <View style={{ marginTop: 4 }}>
            <View
              style={{
                height: 8,
                borderRadius: BorderRadius.full,
                backgroundColor: "#E5E7EB",
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${Math.min(Math.max(item.confidence, 0), 100)}%`,
                  backgroundColor: severityColor,
                }}
              />
            </View>
            <Text style={[styles.value, { marginTop: 4 }]}>
              {item.confidence.toFixed(1)}%
            </Text>
          </View>
        </View>

        {item.recommendations.length > 0 && (
          <View style={{ marginTop: Spacing.sm }}>
            <Text style={styles.label}>Recommendations</Text>
            {item.recommendations.slice(0, 3).map((rec, idx) => (
              <Text key={idx} style={styles.value}>
                • {rec}
              </Text>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={{
            marginTop: Spacing.md,
            paddingVertical: Spacing.sm,
            borderRadius: BorderRadius.full,
            backgroundColor: currentColors.primary,
            alignItems: "center",
          }}
          activeOpacity={0.8}
          onPress={handleShowMedication}
        >
          <Text
            style={{
              color: "#FFFFFF",
              fontSize: FontSize.sm,
              fontWeight: FontWeight.semibold,
            }}
          >
            Get Medication
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={currentColors.primary} />
      </View>
    );
  }

  if (!records.length) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Health Records</Text>
          <Text style={styles.subtitle}>
            Your pet&apos;s AI disease predictions will appear here.
          </Text>
        </View>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No records yet</Text>
          <Text style={styles.emptySubtitle}>
            Use the Disease Prediction tool to generate insights. Each
            prediction will be saved here automatically.
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Health Records</Text>
        <Text style={styles.subtitle}>
          View a history of your pet&apos;s disease predictions.
        </Text>
      </View>

      <FlatList
        data={records}
        keyExtractor={(item) => item.id}
        renderItem={renderRecord}
        contentContainerStyle={styles.listContent}
      />

      <Modal
        visible={medicationVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setMedicationVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleSection}>
                <MaterialCommunityIcons name="pill" size={22} color={currentColors.primary} />
                <Text style={styles.modalTitle}>Medications</Text>
              </View>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setMedicationVisible(false)}
              >
                <MaterialCommunityIcons name="close" size={20} color={currentColors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalDiseaseBadge}>
              <MaterialCommunityIcons name="tag-outline" size={12} color={currentColors.primary} />
              <Text style={styles.modalDiseaseBadgeText}>{selectedDisease || "Selected Disease"}</Text>
            </View>

            {selectedMeds.length === 0 ? (
              <View style={styles.modalEmpty}>
                <MaterialCommunityIcons name="pill" size={48} color="#CBD5E1" />
                <Text style={styles.modalEmptyText}>
                  No medication data available for this disease yet.
                </Text>
              </View>
            ) : (
              <FlatList
                data={selectedMeds}
                keyExtractor={(item, index) =>
                  `${item.medicine}-${index}`
                }
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.medListContent}
                renderItem={({ item, index }) => {
                  const cardColors = ['#F0FDF4', '#EFF6FF', '#FDF2F8', '#FFF7ED', '#F5F3FF', '#ECFEFF', '#FFF1F2'];
                  const headerColors = ['#DCFCE7', '#DBEAFE', '#FCE7F3', '#FFEDD5', '#EDE9FE', '#CFFAFE', '#FFE4E6'];
                  const iconColors = ['#16A34A', '#2563EB', '#DB2777', '#EA580C', '#7C3AED', '#0891B2', '#E11D48'];
                  const ci = index % cardColors.length;
                  return (
                    <View style={[styles.medCard, { backgroundColor: cardColors[ci] }]}>
                      <View style={[styles.medCardHeader, { borderBottomColor: headerColors[ci] }]}>
                        <View style={styles.medNameRow}>
                          <MaterialCommunityIcons name="needle" size={18} color={iconColors[ci]} />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.medName, { color: iconColors[ci] }]}>{item.medicine}</Text>
                          </View>
                        </View>
                        {item.medicineClass && (
                          <View style={[styles.medClassBadge, { backgroundColor: headerColors[ci], marginTop: Spacing.xs }]}>
                            <Text style={[styles.medClassText, { color: iconColors[ci] }]}>{item.medicineClass}</Text>
                          </View>
                        )}
                      </View>

                    {item.attributes && (
                      <View style={styles.medAttrs}>
                        <View style={styles.medAttrRow}>
                          <View style={styles.medAttrIcon}>
                            <MaterialCommunityIcons name="hospital-box" size={15} color="#6366F1" />
                          </View>
                          <View style={styles.medAttrContent}>
                            <Text style={styles.medAttrLabel}>Vet Visit Required</Text>
                            <Text style={styles.medAttrValue}>{item.attributes.Vet_Visit_Required}</Text>
                          </View>
                        </View>

                        <View style={styles.medAttrDivider} />

                        <View style={styles.medAttrRow}>
                          <View style={styles.medAttrIcon}>
                            <MaterialCommunityIcons name="calendar-clock" size={15} color="#F59E0B" />
                          </View>
                          <View style={styles.medAttrContent}>
                            <Text style={styles.medAttrLabel}>Treatment Duration</Text>
                            <Text style={styles.medAttrValue}>{item.attributes.Treatment_Duration_Days}</Text>
                          </View>
                        </View>

                        <View style={styles.medAttrDivider} />

                        <View style={styles.medAttrRow}>
                          <View style={styles.medAttrIcon}>
                            <MaterialCommunityIcons name="clock-outline" size={15} color="#10B981" />
                          </View>
                          <View style={styles.medAttrContent}>
                            <Text style={styles.medAttrLabel}>Dosage Frequency</Text>
                            <Text style={styles.medAttrValue}>{item.attributes.Dosage_Frequency}</Text>
                          </View>
                        </View>

                        <View style={styles.medAttrDivider} />

                        <View style={styles.medAttrRow}>
                          <View style={styles.medAttrIcon}>
                            <MaterialCommunityIcons name="medical-bag" size={15} color="#8B5CF6" />
                          </View>
                          <View style={styles.medAttrContent}>
                            <Text style={styles.medAttrLabel}>Route of Administration</Text>
                            <Text style={styles.medAttrValue}>{item.attributes.Route_of_Administration}</Text>
                          </View>
                        </View>

                        <View style={styles.medAttrDivider} />

                        <View style={[styles.medAttrRow, { marginBottom: 0 }]}>
                          <View style={styles.medAttrIcon}>
                            <MaterialCommunityIcons name="alert-circle-outline" size={15} color="#EF4444" />
                          </View>
                          <View style={styles.medAttrContent}>
                            <Text style={styles.medAttrLabel}>Possible Side Effects</Text>
                            <Text style={styles.medAttrValue}>{item.attributes.Side_Effects}</Text>
                          </View>
                        </View>
                      </View>
                    )}
                  </View>
                  );
                }}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Healthrecords;
