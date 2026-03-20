import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import {
  BorderRadius,
  currentColors,
  FontSize,
  FontWeight,
  Shadow,
  Spacing,
} from "@/constants/theme";
import {
  getMedicinesForDisease,
  MedicineInfo,
} from "@/data/medications";

type PredictionTop = {
  disease: string;
  confidence: number;
};

type PredictionResult = {
  top1: PredictionTop;
  top2: PredictionTop;
};

const Imagechecker = () => {
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);

  useEffect(() => {
    // When analysis result appears, scroll to the TOP of the prediction card
    // (so the user sees predictions first).
    if (!result) return;
    setShouldScrollToResults(true);
  }, [result]);

  const mapImageDiseaseToTreatmentKey = (disease: string): string | null => {
    const d = disease.toLowerCase();

    // Image model classes follow patterns like: "Dog-Fungal Infection", "Cat-Ringworm", etc.
    if (d.includes("healthy")) return null;
    if (d.includes("fungal")) return "Fungal Infection";
    if (d.includes("ringworm")) return "Ringworm";

    // Eye infections use the same medicine mapping as conjunctivitis.
    if (d.includes("eye")) return "Conjunctivitis";

    // Most skin/parasite-related image classes are covered by the broad "Skin Condition" bucket.
    if (
      d.includes("skin") ||
      d.includes("alopecia") ||
      d.includes("dermatitis") ||
      d.includes("scabies") ||
      d.includes("mites") ||
      d.includes("mange") ||
      d.includes("flea") ||
      d.includes("miliary") ||
      d.includes("hypersensitivity")
    ) {
      return "Skin Condition";
    }

    // Fallback to skin bucket so the UI always shows something useful.
    return "Skin Condition";
  };

  const top1TreatmentKey = useMemo(() => {
    if (!result) return null;
    return mapImageDiseaseToTreatmentKey(result.top1.disease);
  }, [result]);

  const top2TreatmentKey = useMemo(() => {
    if (!result) return null;
    return mapImageDiseaseToTreatmentKey(result.top2.disease);
  }, [result]);

  const top1Medicines: MedicineInfo[] = useMemo(() => {
    if (!result || !top1TreatmentKey) return [];
    return getMedicinesForDisease(top1TreatmentKey);
  }, [result, top1TreatmentKey]);

  const top2Medicines: MedicineInfo[] = useMemo(() => {
    if (!result || !top2TreatmentKey) return [];
    return getMedicinesForDisease(top2TreatmentKey);
  }, [result, top2TreatmentKey]);

  const pickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
      // Scroll so the Analyze button (below preview) becomes visible.
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  };

  const takePicture = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Camera permission required", "Please allow camera access to take a photo.");
      return;
    }

    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      // Bring back in-camera edit/crop UI, but keep aspect not-too-square
      // so the native controls tend to be more readable.
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.95,
    });

    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
      // Scroll so the Analyze button (below preview) becomes visible.
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 50);
    }
  };

  const analyzeImage = async () => {
    if (!image || loading) return;
    setLoading(true);

    // Temporary fake response (replace with API later)
    setTimeout(() => {
      setResult({
        top1: { disease: "Dog-Fungal Infection", confidence: 85 },
        top2: { disease: "Dog-Ringworm", confidence: 72 },
      });
      setLoading(false);
    }, 2000);
  };

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bgCircle1} pointerEvents="none" />
      <View style={styles.bgCircle2} pointerEvents="none" />

      <View style={styles.hero}>
        <View style={styles.heroRow}>
          <MaterialCommunityIcons name="paw" size={28} color={currentColors.white} />
          <Text style={styles.heroTitle}>PetScan AI</Text>
        </View>
        <Text style={styles.heroSubtitle}>
          Upload or take a photo to detect possible pet diseases.
        </Text>
        <Text style={styles.heroDisclaimer}>
          Educational use only. For serious symptoms, please contact a veterinarian.
        </Text>
      </View>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Get an image</Text>
          <View
            style={[
              styles.statusPill,
              { backgroundColor: image ? `${currentColors.secondary}15` : `${currentColors.textTertiary}20` },
            ]}
          >
            <Text
              style={[
                styles.statusPillText,
                { color: image ? currentColors.secondary : currentColors.textTertiary },
              ]}
            >
              {image ? "Photo ready" : "No photo yet"}
            </Text>
          </View>
        </View>

        <View style={styles.actionGrid}>
          <TouchableOpacity
            style={[styles.actionCard, styles.galleryCard]}
            onPress={pickImage}
            activeOpacity={0.85}
            disabled={loading}
          >
            <View style={[styles.iconBubble, { backgroundColor: `${currentColors.primary}14` }]}>
              <MaterialCommunityIcons
                name="image-album"
                size={22}
                color={currentColors.primary}
              />
            </View>
            <Text style={styles.actionTitle}>Gallery</Text>
            <Text style={styles.actionSubtitle}>Pick a clear photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionCard, styles.cameraCard]}
            onPress={takePicture}
            activeOpacity={0.85}
            disabled={loading}
          >
            <View style={[styles.iconBubble, { backgroundColor: `${currentColors.secondary}14` }]}>
              <MaterialCommunityIcons name="camera" size={22} color={currentColors.secondary} />
            </View>
            <Text style={styles.actionTitle}>Take Picture</Text>
            <Text style={[styles.actionSubtitle, { color: currentColors.textSecondary }]}>
              Use your phone camera
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.previewFrame}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewEmpty}>
              <MaterialCommunityIcons
                name="image-search"
                size={32}
                color={currentColors.textSecondary}
              />
              <Text style={styles.previewEmptyTitle}>No photo yet</Text>
              <Text style={styles.previewEmptySubtitle}>
                Choose Gallery or Take Picture above
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.analyzeButton,
            (!image || loading) ? { opacity: 0.6 } : null,
          ]}
          onPress={analyzeImage}
          activeOpacity={0.9}
          disabled={!image || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={currentColors.white} />
          ) : (
            <MaterialCommunityIcons
              name="robot"
              size={18}
              color={currentColors.white}
              style={{ marginRight: Spacing.sm }}
            />
          )}
          <Text style={styles.analyzeButtonText}>{loading ? "Analyzing..." : "Analyze Image"}</Text>
        </TouchableOpacity>
      </View>

      {result && (
        <>
          <View
            style={styles.resultCard}
            onLayout={(e) => {
              if (!shouldScrollToResults) return;
              const y = e.nativeEvent.layout.y;
              scrollRef.current?.scrollTo({
                y: Math.max(0, y - Spacing.md),
                animated: true,
              });
              setShouldScrollToResults(false);
            }}
          >
            <Text style={styles.resultTitle}>Most possible disease</Text>

            <View style={styles.predictionBlock}>
              <View style={styles.predictionRankRow}>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: `${currentColors.primary}15` },
                  ]}
                >
                  <Text style={[styles.rankBadgeText, { color: currentColors.primary }]}>🥇</Text>
                </View>
                <View style={styles.predictionBody}>
                  <Text style={styles.diseaseText}>{result.top1.disease}</Text>
                  <Text style={styles.confidenceText}>{result.top1.confidence.toFixed(2)}%</Text>
                </View>
              </View>

              <View style={styles.confidenceTrack}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${Math.max(0, Math.min(100, result.top1.confidence))}%`,
                      backgroundColor: currentColors.primary,
                    },
                  ]}
                />
              </View>
            </View>

            <View style={styles.predictionBlock}>
              <Text style={styles.secondLabel}>Also have signs of</Text>
              <View style={styles.predictionRankRow}>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: `${currentColors.secondary}15` },
                  ]}
                >
                  <Text style={[styles.rankBadgeText, { color: currentColors.secondary }]}>🥈</Text>
                </View>
                <View style={styles.predictionBody}>
                  <Text style={styles.diseaseText}>{result.top2.disease}</Text>
                  <Text style={styles.confidenceText}>{result.top2.confidence.toFixed(2)}%</Text>
                </View>
              </View>

              <View style={styles.confidenceTrack}>
                <View
                  style={[
                    styles.confidenceFill,
                    {
                      width: `${Math.max(0, Math.min(100, result.top2.confidence))}%`,
                      backgroundColor: currentColors.secondary,
                    },
                  ]}
                />
              </View>
            </View>
          </View>

          {/* Treatment section */}
          <View style={styles.treatmentCard}>
            <Text style={styles.treatmentTitle}>Treatment</Text>

            {top1TreatmentKey ? (
              <View style={styles.treatmentGroup}>
                <Text style={styles.treatmentSubtitle}>
                  For: {result.top1.disease}
                </Text>
                {top1Medicines.length ? (
                  top1Medicines.slice(0, 3).map((m) => (
                    <View key={`${m.disease}-${m.medicine}`} style={styles.medicineRow}>
                      <Text style={styles.medicineName}>• {m.medicine}</Text>
                      {m.attributes ? (
                        <Text style={styles.medicineMeta}>
                          Duration: {m.attributes.Treatment_Duration_Days} • Route:{" "}
                          {m.attributes.Route_of_Administration}
                        </Text>
                      ) : null}
                      {m.attributes?.Side_Effects ? (
                        <Text style={styles.medicineMeta2}>
                          Side effects: {m.attributes.Side_Effects}
                        </Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.fallbackText}>
                    No specific treatment data found for this disease. Please consult a veterinarian.
                  </Text>
                )}
              </View>
            ) : (
              <Text style={styles.fallbackText}>
                This prediction looks healthy, so no treatment recommendations are shown.
              </Text>
            )}

            {top2TreatmentKey && top2TreatmentKey !== top1TreatmentKey ? (
              <View style={styles.treatmentGroup}>
                <Text style={styles.treatmentSubtitle}>
                  Also consider for: {result.top2.disease}
                </Text>
                {top2Medicines.length ? (
                  top2Medicines.slice(0, 3).map((m) => (
                    <View key={`${m.disease}-${m.medicine}`} style={styles.medicineRow}>
                      <Text style={styles.medicineName}>• {m.medicine}</Text>
                      {m.attributes ? (
                        <Text style={styles.medicineMeta}>
                          Duration: {m.attributes.Treatment_Duration_Days} • Route:{" "}
                          {m.attributes.Route_of_Administration}
                        </Text>
                      ) : null}
                    </View>
                  ))
                ) : (
                  <Text style={styles.fallbackText}>
                    No specific treatment data found for the 2nd prediction. Please consult a veterinarian.
                  </Text>
                )}
              </View>
            ) : null}
          </View>
        </>
      )}
    </ScrollView>
  );
};

export default Imagechecker;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: currentColors.background,
  },
  contentContainer: {
    padding: Spacing.lg,
    paddingBottom: Spacing.xxl,
    position: "relative",
  },

  bgCircle1: {
    position: "absolute",
    top: -120,
    left: -60,
    width: 240,
    height: 240,
    borderRadius: 9999,
    backgroundColor: `${currentColors.primary}20`,
  },
  bgCircle2: {
    position: "absolute",
    top: 40,
    right: -80,
    width: 280,
    height: 280,
    borderRadius: 9999,
    backgroundColor: `${currentColors.secondary}18`,
  },

  hero: {
    backgroundColor: currentColors.primary,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
  },
  heroRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  heroTitle: {
    marginLeft: Spacing.sm,
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    color: currentColors.white,
  },
  heroSubtitle: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    color: "rgba(255,255,255,0.92)",
    lineHeight: 22,
  },
  heroDisclaimer: {
    marginTop: Spacing.xs,
    fontSize: FontSize.xs,
    color: "rgba(255,255,255,0.85)",
    lineHeight: 18,
  },

  section: {
    marginTop: Spacing.lg,
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
  },

  statusPill: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  statusPillText: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.semibold,
  },

  actionGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: Spacing.md,
  },
  actionCard: {
    flex: 1,
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: currentColors.border,
    ...Shadow.sm,
    alignItems: "center",
    marginHorizontal: 4,
  },
  iconBubble: {
    width: 46,
    height: 46,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  galleryCard: {
    backgroundColor: `${currentColors.primary}08`,
  },
  cameraCard: {
    // Avoid the “colored outer glow” look by using a solid background and
    // disabling shadow/elevation on this specific card.
    backgroundColor: currentColors.surface,
    elevation: 0,
    shadowOpacity: 0,
    shadowRadius: 0,
  },
  actionTitle: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
    textAlign: "center",
  },
  actionSubtitle: {
    marginTop: 2,
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
    textAlign: "center",
  },

  previewFrame: {
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: currentColors.border,
    ...Shadow.sm,
    marginBottom: Spacing.lg,
    overflow: "hidden",
  },
  previewImage: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: BorderRadius.lg,
  },
  previewEmpty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.lg,
  },
  previewEmptyTitle: {
    marginTop: Spacing.sm,
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
  },
  previewEmptySubtitle: {
    marginTop: 4,
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },

  analyzeButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: currentColors.primary,
    borderRadius: BorderRadius.full,
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    ...Shadow.md,
  },
  analyzeButtonText: {
    color: currentColors.white,
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },

  resultCard: {
    marginTop: Spacing.lg,
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
    borderLeftWidth: 4,
    borderLeftColor: currentColors.primary,
  },
  resultTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
    marginBottom: Spacing.md,
  },
  secondLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: currentColors.textSecondary,
    marginBottom: Spacing.sm,
  },

  predictionBlock: {
    backgroundColor: currentColors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
  },
  predictionRankRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  predictionBody: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  rankBadge: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
  rankText: {
    fontSize: 18,
    fontWeight: FontWeight.bold,
  },
  diseaseText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.semibold,
    color: currentColors.text,
  },
  confidenceText: {
    marginTop: 4,
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
  },
  confidenceTrack: {
    marginTop: Spacing.sm,
    height: 10,
    backgroundColor: currentColors.background,
    borderRadius: 9999,
    overflow: "hidden",
  },
  confidenceFill: {
    height: 10,
    borderRadius: 9999,
  },

  treatmentCard: {
    marginTop: Spacing.md,
    backgroundColor: currentColors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    ...Shadow.lg,
    borderLeftWidth: 4,
    borderLeftColor: currentColors.secondary,
  },
  treatmentTitle: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
    color: currentColors.text,
    marginBottom: Spacing.sm,
  },
  treatmentGroup: {
    marginTop: Spacing.md,
    backgroundColor: currentColors.surfaceVariant,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: currentColors.border,
  },
  treatmentSubtitle: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
    color: currentColors.textSecondary,
    marginBottom: Spacing.xs,
  },
  medicineRow: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.sm,
  },
  medicineName: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    color: currentColors.text,
  },
  medicineMeta: {
    marginTop: 4,
    fontSize: FontSize.xs,
    color: currentColors.textSecondary,
    lineHeight: 18,
  },
  medicineMeta2: {
    marginTop: 2,
    fontSize: FontSize.xs,
    color: currentColors.textTertiary,
    lineHeight: 18,
  },
  fallbackText: {
    fontSize: FontSize.sm,
    color: currentColors.textSecondary,
    marginTop: Spacing.sm,
    lineHeight: 20,
  },
});