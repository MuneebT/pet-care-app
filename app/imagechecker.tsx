import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
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
  const [rejected, setRejected] = useState<string | null>(null);
  const [showTreatment, setShowTreatment] = useState(false);
  const [animalChoice, setAnimalChoice] = useState<"cat" | "dog">("cat");
  const [catTop2, setCatTop2] = useState<PredictionResult | null>(null);
  const [dogTop2, setDogTop2] = useState<PredictionResult | null>(null);
  const [animalScores, setAnimalScores] = useState<{
    cat: number;
    dog: number;
    predicted: "cat" | "dog";
  } | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const [shouldScrollToResults, setShouldScrollToResults] = useState(false);

  const API_URL = "http://192.168.0.105:5000/predict";

  useEffect(() => {
    if (!result && !rejected) return;
    setShouldScrollToResults(true);
  }, [result, rejected]);

  const mapImageDiseaseToTreatmentKey = (disease: string): string | null => {
    if (disease.toLowerCase().includes("healthy")) return null;
    return disease;
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
      setRejected(null);
      setShowTreatment(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
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
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.95,
    });
    if (!res.canceled) {
      setImage(res.assets[0].uri);
      setResult(null);
      setRejected(null);
      setShowTreatment(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  const analyzeImage = async () => {
    if (!image || loading) return;
    setLoading(true);
    setResult(null);
    setRejected(null);

    try {
      const formData = new FormData();
      formData.append("image", {
        uri: image,
        name: "pet-image.jpg",
        type: "image/jpeg",
      } as any);
      formData.append("animal_type", animalChoice);

      const response = await fetch(API_URL, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const text = await response.text().catch(() => "");
        throw new Error(`API error: ${response.status}. ${text}`);
      }

      const data = await response.json();

      // ── NOT_A_PET REJECTION ────────────────────────────────────────
      if (data?.rejected === true) {
        setRejected(data.reason ?? "This image was not recognized as a pet skin photo.");
        return;
      }
      // ──────────────────────────────────────────────────────────────

      const overallResult: PredictionResult = {
        top1: {
          disease:    String(data?.top1?.disease ?? ""),
          confidence: Number(data?.top1?.confidence ?? 0),
        },
        top2: {
          disease:    String(data?.top2?.disease ?? ""),
          confidence: Number(data?.top2?.confidence ?? 0),
        },
      };

      const predictedAnimal: "cat" | "dog" =
        data?.animal?.predicted === "dog" ? "dog" : "cat";
      setAnimalChoice(predictedAnimal);

      if (data?.animal?.cat != null && data?.animal?.dog != null) {
        setAnimalScores({
          cat:       Number(data.animal.cat ?? 0),
          dog:       Number(data.animal.dog ?? 0),
          predicted: predictedAnimal,
        });
      }

      if (data?.catTop2) setCatTop2({ top1: data.catTop2.top1, top2: data.catTop2.top2 });
      if (data?.dogTop2) setDogTop2({ top1: data.dogTop2.top1, top2: data.dogTop2.top2 });

      setResult(overallResult);
    } catch (err: any) {
      Alert.alert("Analyze failed", err?.message ? String(err.message) : "Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isHealthy     = result?.top1.disease.toLowerCase().includes("healthy");
  const isEyeOrDental = result?.top1.disease.toLowerCase().includes("eye") ||
                        result?.top1.disease.toLowerCase().includes("dental");

  return (
    <ScrollView
      ref={scrollRef}
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.bgCircle1} pointerEvents="none" />
      <View style={styles.bgCircle2} pointerEvents="none" />

      {/* Hero */}
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

      {/* Image section */}
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
              <MaterialCommunityIcons name="image-album" size={22} color={currentColors.primary} />
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
            <Text style={styles.actionSubtitle}>Use your phone camera</Text>
          </TouchableOpacity>
        </View>

        {/* Preview */}
        <View style={styles.previewFrame}>
          {image ? (
            <Image source={{ uri: image }} style={styles.previewImage} />
          ) : (
            <View style={styles.previewEmpty}>
              <MaterialCommunityIcons name="image-search" size={32} color={currentColors.textSecondary} />
              <Text style={styles.previewEmptyTitle}>No photo yet</Text>
              <Text style={styles.previewEmptySubtitle}>Choose Gallery or Take Picture above</Text>
            </View>
          )}
        </View>

        {/* Animal selector */}
        <View style={{ marginBottom: Spacing.md }}>
          <Text style={[styles.sectionTitle, { fontSize: FontSize.md, marginBottom: Spacing.sm }]}>
            Predict disease for:
          </Text>
          <View style={styles.animalChoiceRow}>
            <TouchableOpacity
              style={[
                styles.animalChoiceButton,
                animalChoice === "cat"
                  ? { borderColor: currentColors.primary, backgroundColor: `${currentColors.primary}12` }
                  : { borderColor: currentColors.border },
              ]}
              onPress={() => setAnimalChoice("cat")}
            >
              <MaterialCommunityIcons
                name="cat-hair" size={24}
                color={animalChoice === "cat" ? currentColors.primary : currentColors.textSecondary}
                style={{ marginRight: Spacing.sm }}
              />
              <Text style={[styles.animalChoiceText,
                animalChoice === "cat"
                  ? { color: currentColors.primary, fontWeight: "bold" }
                  : { color: currentColors.textSecondary }
              ]}>Cat</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.animalChoiceButton,
                animalChoice === "dog"
                  ? { borderColor: currentColors.secondary, backgroundColor: `${currentColors.secondary}12` }
                  : { borderColor: currentColors.border },
              ]}
              onPress={() => setAnimalChoice("dog")}
            >
              <MaterialCommunityIcons
                name="dog" size={24}
                color={animalChoice === "dog" ? currentColors.secondary : currentColors.textSecondary}
                style={{ marginRight: Spacing.sm }}
              />
              <Text style={[styles.animalChoiceText,
                animalChoice === "dog"
                  ? { color: currentColors.secondary, fontWeight: "bold" }
                  : { color: currentColors.textSecondary }
              ]}>Dog</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Analyze button */}
        <TouchableOpacity
          style={[styles.analyzeButton, (!image || loading) ? { opacity: 0.6 } : null]}
          onPress={analyzeImage}
          activeOpacity={0.9}
          disabled={!image || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={currentColors.white} />
          ) : (
            <MaterialCommunityIcons name="robot" size={18} color={currentColors.white} style={{ marginRight: Spacing.sm }} />
          )}
          <Text style={styles.analyzeButtonText}>{loading ? "Analyzing..." : "Analyze Image"}</Text>
        </TouchableOpacity>
      </View>

      {/* ── REJECTION CARD (random image detected) ── */}
      {rejected && (
        <View
          style={styles.rejectionCard}
          onLayout={(e) => {
            if (!shouldScrollToResults) return;
            scrollRef.current?.scrollTo({ y: e.nativeEvent.layout.y - Spacing.md, animated: true });
            setShouldScrollToResults(false);
          }}
        >
          <View style={styles.rejectionIconRow}>
            <MaterialCommunityIcons name="alert-circle" size={32} color="#E53E3E" />
            <Text style={styles.rejectionTitle}>Image Not Recognized</Text>
          </View>
          <Text style={styles.rejectionReason}>{rejected}</Text>
          <Text style={styles.rejectionTips}>Tips for a better photo:</Text>
          {[
            "Make sure the affected skin area fills most of the frame",
            "Use good lighting — natural light works best",
            "Hold the camera steady and close to the skin",
            "Do not upload random objects, rooms, or unrelated images",
          ].map((tip, i) => (
            <Text key={i} style={styles.rejectionTip}>• {tip}</Text>
          ))}
        </View>
      )}

      {/* ── RESULT CARD ── */}
      {result && (
        <>
          <View
            style={styles.resultCard}
            onLayout={(e) => {
              if (!shouldScrollToResults) return;
              scrollRef.current?.scrollTo({ y: Math.max(0, e.nativeEvent.layout.y - Spacing.md), animated: true });
              setShouldScrollToResults(false);
            }}
          >
            <Text style={styles.resultTitle}>Most possible disease</Text>

            {isHealthy ? (
              <View style={{ backgroundColor: `${currentColors.primary}20`, padding: Spacing.md, borderRadius: BorderRadius.md, alignItems: "center", marginVertical: Spacing.md }}>
                <MaterialCommunityIcons name="check-decagram" size={64} color={currentColors.primary} />
                <Text style={{ fontSize: FontSize.lg, fontWeight: "bold", color: currentColors.primary, marginTop: Spacing.sm }}>Great News!</Text>
                <Text style={{ color: currentColors.text, textAlign: "center", marginTop: Spacing.xs, fontSize: FontSize.md }}>
                  Your pet appears to be Healthy (Confidence: {result.top1.confidence.toFixed(2)}%)
                </Text>
              </View>
            ) : (
              <View style={{ width: "100%" }}>
                {/* Top 1 */}
                <View style={styles.predictionBlock}>
                  <View style={styles.predictionRankRow}>
                    <View style={[styles.rankBadge, { backgroundColor: `${currentColors.primary}15` }]}>
                      <Text style={[styles.rankBadgeText, { color: currentColors.primary }]}>🥇</Text>
                    </View>
                    <View style={styles.predictionBody}>
                      <Text style={styles.diseaseText}>{result.top1.disease}</Text>
                      <Text style={styles.confidenceText}>{result.top1.confidence.toFixed(2)}%</Text>
                    </View>
                  </View>
                  <View style={styles.confidenceTrack}>
                    <View style={[styles.confidenceFill, { width: `${Math.max(0, Math.min(100, result.top1.confidence))}%`, backgroundColor: currentColors.primary }]} />
                  </View>
                </View>

                {/* Top 2 */}
                {result.top2.disease !== "Uncertain" && !isEyeOrDental && (
                  <View style={styles.predictionBlock}>
                    <Text style={styles.secondLabel}>Also have signs of</Text>
                    <View style={styles.predictionRankRow}>
                      <View style={[styles.rankBadge, { backgroundColor: `${currentColors.secondary}15` }]}>
                        <Text style={[styles.rankBadgeText, { color: currentColors.secondary }]}>🥈</Text>
                      </View>
                      <View style={styles.predictionBody}>
                        <Text style={styles.diseaseText}>{result.top2.disease}</Text>
                        <Text style={styles.confidenceText}>{result.top2.confidence.toFixed(2)}%</Text>
                      </View>
                    </View>
                    <View style={styles.confidenceTrack}>
                      <View style={[styles.confidenceFill, { width: `${Math.max(0, Math.min(100, result.top2.confidence))}%`, backgroundColor: currentColors.secondary }]} />
                    </View>
                  </View>
                )}
              </View>
            )}
          </View>

          {/* Treatment toggle */}
          {!isHealthy && (
            <TouchableOpacity
              style={[styles.analyzeButton, { backgroundColor: currentColors.secondary, marginTop: Spacing.sm, marginBottom: Spacing.md }]}
              onPress={() => setShowTreatment(!showTreatment)}
              activeOpacity={0.9}
            >
              <MaterialCommunityIcons
                name={showTreatment ? "chevron-up" : "medical-bag"}
                size={18} color={currentColors.white}
                style={{ marginRight: Spacing.sm }}
              />
              <Text style={styles.analyzeButtonText}>
                {showTreatment ? "Hide Treatment Recommendations" : "Show Treatment Recommendations"}
              </Text>
            </TouchableOpacity>
          )}

          {/* Treatment card */}
          {!isHealthy && showTreatment && (
            <View style={styles.treatmentCard}>
              <Text style={styles.treatmentTitle}>Treatment</Text>

              {top1TreatmentKey ? (
                <View style={styles.treatmentGroup}>
                  <Text style={styles.treatmentSubtitle}>For: {result.top1.disease}</Text>
                  {top1Medicines.length ? (
                    top1Medicines.slice(0, 3).map((m, i) => (
                      <View key={i} style={styles.medicineRow}>
                        <Text style={styles.medicineName}>
                          • Give {m.medicine}{" "}
                          {m.attributes?.Route_of_Administration ? `via ${m.attributes.Route_of_Administration.toLowerCase()}` : ""}{" "}
                          {m.attributes?.Dosage_Frequency ? m.attributes.Dosage_Frequency.toLowerCase() : ""}{" "}
                          {m.attributes?.Treatment_Duration_Days ? `for ${m.attributes.Treatment_Duration_Days.toLowerCase()}` : ""}.
                        </Text>
                        {m.attributes?.Side_Effects ? (
                          <Text style={[styles.medicineMeta, { color: currentColors.secondary, fontStyle: "italic", marginTop: 4 }]}>
                            ⚠️ Watch for: {m.attributes.Side_Effects}
                          </Text>
                        ) : null}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.fallbackText}>No specific treatment data found. Please consult a veterinarian.</Text>
                  )}
                </View>
              ) : null}

              {top2TreatmentKey && result?.top2.disease !== result?.top1.disease ? (
                <View style={styles.treatmentGroup}>
                  <Text style={styles.treatmentSubtitle}>Also consider for: {result.top2.disease}</Text>
                  {top2Medicines.length ? (
                    top2Medicines.slice(0, 3).map((m, i) => (
                      <View key={i} style={styles.medicineRow}>
                        <Text style={styles.medicineName}>
                          • Give {m.medicine}{" "}
                          {m.attributes?.Route_of_Administration ? `via ${m.attributes.Route_of_Administration.toLowerCase()}` : ""}{" "}
                          {m.attributes?.Dosage_Frequency ? m.attributes.Dosage_Frequency.toLowerCase() : ""}{" "}
                          {m.attributes?.Treatment_Duration_Days ? `for ${m.attributes.Treatment_Duration_Days.toLowerCase()}` : ""}.
                        </Text>
                        {m.attributes?.Side_Effects ? (
                          <Text style={[styles.medicineMeta, { color: currentColors.secondary, fontStyle: "italic", marginTop: 4 }]}>
                            ⚠️ Watch for: {m.attributes.Side_Effects}
                          </Text>
                        ) : null}
                      </View>
                    ))
                  ) : (
                    <Text style={styles.fallbackText}>No specific treatment data found. Please consult a veterinarian.</Text>
                  )}
                </View>
              ) : null}
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default Imagechecker;

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: currentColors.background },
  contentContainer: { padding: Spacing.lg, paddingBottom: Spacing.xxl, position: "relative" },
  bgCircle1: { position: "absolute", top: -120, left: -60,  width: 240, height: 240, borderRadius: 9999, backgroundColor: `${currentColors.primary}20` },
  bgCircle2: { position: "absolute", top: 40,  right: -80, width: 280, height: 280, borderRadius: 9999, backgroundColor: `${currentColors.secondary}18` },
  hero:           { backgroundColor: currentColors.primary, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadow.lg },
  heroRow:        { flexDirection: "row", alignItems: "center" },
  heroTitle:      { marginLeft: Spacing.sm, fontSize: FontSize.xxl, fontWeight: FontWeight.bold, color: currentColors.white },
  heroSubtitle:   { marginTop: Spacing.sm, fontSize: FontSize.md, color: "rgba(255,255,255,0.92)", lineHeight: 22 },
  heroDisclaimer: { marginTop: Spacing.xs, fontSize: FontSize.xs, color: "rgba(255,255,255,0.85)", lineHeight: 18 },
  section:       { marginTop: Spacing.lg },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: Spacing.sm },
  sectionTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.semibold, color: currentColors.text },
  statusPill:     { paddingHorizontal: Spacing.sm, paddingVertical: 6, borderRadius: BorderRadius.full },
  statusPillText: { fontSize: FontSize.xs, fontWeight: FontWeight.semibold },
  actionGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: Spacing.md },
  actionCard: { flex: 1, backgroundColor: currentColors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderColor: currentColors.border, ...Shadow.sm, alignItems: "center", marginHorizontal: 4 },
  iconBubble: { width: 46, height: 46, borderRadius: BorderRadius.full, alignItems: "center", justifyContent: "center", marginBottom: Spacing.sm },
  galleryCard:    { backgroundColor: `${currentColors.primary}08` },
  cameraCard:     { backgroundColor: currentColors.surface, elevation: 0, shadowOpacity: 0 },
  actionTitle:    { marginTop: Spacing.sm, fontSize: FontSize.md, fontWeight: FontWeight.bold, color: currentColors.text, textAlign: "center" },
  actionSubtitle: { marginTop: 2, fontSize: FontSize.xs, color: currentColors.textSecondary, textAlign: "center" },
  previewFrame:         { backgroundColor: currentColors.surface, borderRadius: BorderRadius.xl, padding: Spacing.md, borderWidth: 1, borderStyle: "dashed", borderColor: currentColors.border, ...Shadow.sm, marginBottom: Spacing.lg, overflow: "hidden" },
  previewImage:         { width: "100%", aspectRatio: 1, borderRadius: BorderRadius.lg },
  previewEmpty:         { flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: Spacing.lg },
  previewEmptyTitle:    { marginTop: Spacing.sm, fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: currentColors.text },
  previewEmptySubtitle: { marginTop: 4, fontSize: FontSize.sm, color: currentColors.textSecondary, textAlign: "center", lineHeight: 20 },
  analyzeButton:     { flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: currentColors.primary, borderRadius: BorderRadius.full, paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, ...Shadow.md },
  analyzeButtonText: { color: currentColors.white, fontSize: FontSize.lg, fontWeight: FontWeight.bold },
  animalChoiceRow:    { flexDirection: "row", marginBottom: Spacing.md },
  animalChoiceButton: { flex: 1, marginHorizontal: 4, borderRadius: BorderRadius.lg, borderWidth: 1, paddingVertical: Spacing.sm, flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: currentColors.surfaceVariant },
  animalChoiceText:   { fontSize: FontSize.md, fontWeight: FontWeight.semibold },
  rejectionCard:    { marginTop: Spacing.lg, backgroundColor: currentColors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadow.lg, borderLeftWidth: 4, borderLeftColor: "#E53E3E" },
  rejectionIconRow: { flexDirection: "row", alignItems: "center", marginBottom: Spacing.sm },
  rejectionTitle:   { marginLeft: Spacing.sm, fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: "#E53E3E" },
  rejectionReason:  { fontSize: FontSize.md, color: currentColors.text, lineHeight: 22, marginBottom: Spacing.md },
  rejectionTips:    { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: currentColors.textSecondary, marginBottom: Spacing.xs },
  rejectionTip:     { fontSize: FontSize.sm, color: currentColors.textSecondary, lineHeight: 22, marginLeft: Spacing.sm },
  resultCard:   { marginTop: Spacing.lg, backgroundColor: currentColors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadow.lg, borderLeftWidth: 4, borderLeftColor: currentColors.primary },
  resultTitle:  { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: currentColors.text, marginBottom: Spacing.md },
  secondLabel:  { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: currentColors.textSecondary, marginBottom: Spacing.sm },
  predictionBlock:   { backgroundColor: currentColors.surfaceVariant, borderRadius: BorderRadius.lg, padding: Spacing.md, marginBottom: Spacing.sm },
  predictionRankRow: { flexDirection: "row", alignItems: "center" },
  predictionBody:    { flex: 1, marginLeft: Spacing.md },
  rankBadge:         { width: 44, height: 44, borderRadius: BorderRadius.full, alignItems: "center", justifyContent: "center" },
  rankBadgeText:     { fontSize: 18, fontWeight: FontWeight.bold },
  diseaseText:       { fontSize: FontSize.md, fontWeight: FontWeight.semibold, color: currentColors.text },
  confidenceText:    { marginTop: 4, fontSize: FontSize.sm, color: currentColors.textSecondary },
  confidenceTrack:   { marginTop: Spacing.sm, height: 10, backgroundColor: currentColors.background, borderRadius: 9999, overflow: "hidden" },
  confidenceFill:    { height: 10, borderRadius: 9999 },
  treatmentCard:     { marginTop: Spacing.md, backgroundColor: currentColors.surface, borderRadius: BorderRadius.xl, padding: Spacing.lg, ...Shadow.lg, borderLeftWidth: 4, borderLeftColor: currentColors.secondary },
  treatmentTitle:    { fontSize: FontSize.lg, fontWeight: FontWeight.bold, color: currentColors.text, marginBottom: Spacing.sm },
  treatmentGroup:    { marginTop: Spacing.md, backgroundColor: currentColors.surfaceVariant, borderRadius: BorderRadius.lg, padding: Spacing.md, borderWidth: 1, borderColor: currentColors.border },
  treatmentSubtitle: { fontSize: FontSize.sm, fontWeight: FontWeight.semibold, color: currentColors.textSecondary, marginBottom: Spacing.xs },
  medicineRow:       { marginTop: Spacing.sm, marginBottom: Spacing.sm },
  medicineName:      { fontSize: FontSize.sm, fontWeight: FontWeight.medium, color: currentColors.text },
  medicineMeta:      { marginTop: 4, fontSize: FontSize.xs, color: currentColors.textSecondary, lineHeight: 18 },
  fallbackText:      { fontSize: FontSize.sm, color: currentColors.textSecondary, marginTop: Spacing.sm, lineHeight: 20 },
});