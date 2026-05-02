import { db } from "@/services/firebase";
import { getMedicinesForDisease, MedicineInfo } from "@/data/medications";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useLocalSearchParams } from "expo-router";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
} from "firebase/firestore";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
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
});

const Healthrecords = () => {
  const params = useLocalSearchParams<{ userId?: string; uid?: string }>();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [medicationVisible, setMedicationVisible] = useState(false);
  const [selectedDisease, setSelectedDisease] = useState<string | null>(null);
  const [selectedMeds, setSelectedMeds] = useState<MedicineInfo[]>([]);

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
    } catch (error) {
      console.error("Error loading health records:", error);
    } finally {
      setLoading(false);
    }
  }, [getUserId]);

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

    const handleShowMedication = () => {
      const meds = getMedicinesForDisease(item.prediction);
      setSelectedDisease(item.prediction);
      setSelectedMeds(meds);
      setMedicationVisible(true);
    };

    return (
      <View style={[styles.card, { borderLeftColor: severityColor }]}>
        <View style={styles.cardHeaderRow}>
          <Text style={styles.predictionText}>{item.prediction}</Text>
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
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.5)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              maxHeight: "70%",
              backgroundColor: currentColors.surface,
              borderTopLeftRadius: BorderRadius.xl,
              borderTopRightRadius: BorderRadius.xl,
              padding: Spacing.lg,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: Spacing.md,
              }}
            >
              <Text
                style={{
                  fontSize: FontSize.lg,
                  fontWeight: FontWeight.bold,
                  color: currentColors.text,
                }}
              >
                Medications for{" "}
                {selectedDisease || "Selected Disease"}
              </Text>
              <TouchableOpacity
                onPress={() => setMedicationVisible(false)}
              >
                <Text
                  style={{
                    fontSize: FontSize.lg,
                    color: currentColors.primary,
                    fontWeight: FontWeight.semibold,
                  }}
                >
                  Close
                </Text>
              </TouchableOpacity>
            </View>

            {selectedMeds.length === 0 ? (
              <Text
                style={{
                  fontSize: FontSize.sm,
                  color: currentColors.textSecondary,
                }}
              >
                No medication data available for this disease
                yet.
              </Text>
            ) : (
              <FlatList
                data={selectedMeds}
                keyExtractor={(item, index) =>
                  `${item.medicine}-${index}`
                }
                showsVerticalScrollIndicator={false}
                renderItem={({ item }) => (
                  <View
                    style={{
                      marginBottom: Spacing.md,
                      padding: Spacing.md,
                      borderRadius: BorderRadius.lg,
                      backgroundColor: "#F8FAFC",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: FontSize.md,
                        fontWeight: FontWeight.semibold,
                        color: currentColors.text,
                        marginBottom: 4,
                      }}
                    >
                      {item.medicine}
                    </Text>
                    {item.medicineClass && (
                      <Text
                        style={{
                          fontSize: FontSize.xs,
                          color: currentColors.textSecondary,
                          marginBottom: Spacing.xs,
                        }}
                      >
                        {item.medicineClass}
                      </Text>
                    )}
                    {item.attributes && (
                      <View>
                        <Text style={styles.label}>
                          Vet Visit Required
                        </Text>
                        <Text style={styles.value}>
                          {item.attributes.Vet_Visit_Required}
                        </Text>

                        <Text style={styles.label}>
                          Treatment Duration
                        </Text>
                        <Text style={styles.value}>
                          {
                            item.attributes
                              .Treatment_Duration_Days
                          }
                        </Text>

                        <Text style={styles.label}>
                          Dosage Frequency
                        </Text>
                        <Text style={styles.value}>
                          {item.attributes.Dosage_Frequency}
                        </Text>

                        <Text style={styles.label}>
                          Route of Administration
                        </Text>
                        <Text style={styles.value}>
                          {
                            item.attributes
                              .Route_of_Administration
                          }
                        </Text>

                        <Text style={styles.label}>
                          Possible Side Effects
                        </Text>
                        <Text style={styles.value}>
                          {item.attributes.Side_Effects}
                        </Text>
                      </View>
                    )}
                  </View>
                )}
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default Healthrecords;