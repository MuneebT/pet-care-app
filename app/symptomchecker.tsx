import {
  BorderRadius,
  FontSize,
  FontWeight,
  Spacing,
  currentColors,
} from "@/constants/theme";
import { db } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import axios from "axios";
import { useLocalSearchParams } from "expo-router";
import React, { useCallback, useState } from "react";
import BottomNavigationBar from './bottomnavigationbar';
import {
  Alert,
  Dimensions,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { Button, Chip, Searchbar, Switch, useTheme } from "react-native-paper";

const { width } = Dimensions.get("window");

interface SymptomData {
  name: string;
  category: string;
}

const SYMPTOMS: SymptomData[] = [
  { name: "Fever", category: "General" },
  { name: "Lethargy", category: "General" },
  { name: "Vomiting", category: "Digestive" },
  { name: "Sneezing", category: "Respiratory" },
  { name: "Coughing", category: "Respiratory" },
  { name: "Diarrhea", category: "Digestive" },
  { name: "Loss of appetite", category: "General" },
  { name: "Weight loss", category: "General" },
  { name: "Abdominal Pain", category: "Digestive" },
  { name: "Difficulty breathing", category: "Respiratory" },
  { name: "Labored breathing", category: "Respiratory" },
  { name: "Excessive thirst", category: "General" },
  { name: "Frequent urination", category: "Urinary" },
  { name: "Bloody stool", category: "Digestive" },
  { name: "Bloody urine", category: "Urinary" },
  { name: "Coughing", category: "Respiratory" },
  { name: "Sneezing", category: "Respiratory" },
  { name: "Nasal discharge", category: "Respiratory" },
  { name: "Eye discharge", category: "Eyes" },
  { name: "Redness of eye", category: "Eyes" },
  { name: "Swelling of eye", category: "Eyes" },
  { name: "Limping", category: "Movement" },
  { name: "Lameness", category: "Movement" },
  { name: "Joint swelling", category: "Movement" },
  { name: "Muscle weakness", category: "Movement" },
  { name: "Skin rash", category: "Skin" },
  { name: "Hair loss", category: "Skin" },
  { name: "Itching", category: "Skin" },
  { name: "Dry skin", category: "Skin" },
  { name: "Seizures", category: "Neurological" },
  { name: "Paralysis", category: "Neurological" },
  { name: "Head tilting", category: "Neurological" },
  { name: "Circling", category: "Neurological" },
  { name: "Bad breath", category: "Dental" },
  { name: "Bleeding gums", category: "Dental" },
  { name: "Excessive drooling", category: "Digestive" },
  { name: "Difficulty swallowing", category: "Digestive" },
  { name: "Constipation", category: "Digestive" },
  { name: "Bloating", category: "Digestive" },
  { name: "Dehydration", category: "General" },
  { name: "Pale gums", category: "General" },
  { name: "Jaundice", category: "General" },
  { name: "Swollen lymph nodes", category: "General" },
  { name: "Rapid breathing", category: "Respiratory" },
  { name: "Wheezing", category: "Respiratory" },
  { name: "Gagging", category: "Respiratory" },
  { name: "Choking", category: "Respiratory" },
  { name: "Snoring", category: "Respiratory" },
  { name: "Panting", category: "Respiratory" },
  { name: "Open mouth breathing", category: "Respiratory" },
  { name: "Stiffness", category: "Movement" },
  { name: "Inability to stand", category: "Movement" },
  { name: "Stumbling", category: "Movement" },
  { name: "Weakness", category: "General" },
  { name: "Collapse", category: "General" },
  { name: "Shock", category: "General" },
  { name: "Sudden death", category: "General" },
  { name: "Nausea", category: "Digestive" },
  { name: "Regurgitation", category: "Digestive" },
  { name: "Blood in vomit", category: "Digestive" },
  { name: "Mucus in stool", category: "Digestive" },
  { name: "Watery diarrhea", category: "Digestive" },
  { name: "Greenish diarrhea", category: "Digestive" },
  { name: "Black stool", category: "Digestive" },
  { name: "Straining to defecate", category: "Digestive" },
  { name: "Scooting", category: "Digestive" },
  { name: "Excessive gas", category: "Digestive" },
  { name: "Loss of weight", category: "General" },
  { name: "Poor growth", category: "General" },
  { name: "Emaciation", category: "General" },
  { name: "Pot belly", category: "General" },
  { name: "Deformed bones", category: "Movement" },
  { name: "Facial swelling", category: "General" },
  { name: "Ear infection", category: "Ears" },
  { name: "Head shaking", category: "Ears" },
  { name: "Ear discharge", category: "Ears" },
  { name: "Foul ear odor", category: "Ears" },
  { name: "Scratching ears", category: "Ears" },
  { name: "Eye watering", category: "Eyes" },
  { name: "Cloudy eye", category: "Eyes" },
  { name: "Blindness", category: "Eyes" },
  { name: "Squinting", category: "Eyes" },
  { name: "Pawing at eye", category: "Eyes" },
  { name: "Conjunctivitis", category: "Eyes" },
  { name: "Keratitis", category: "Eyes" },
  { name: "Glaucoma", category: "Eyes" },
  { name: "Cataracts", category: "Eyes" },
  { name: "Ulcer on eye", category: "Eyes" },
  { name: "Behavioral changes", category: "Neurological" },
  { name: "Aggression", category: "Neurological" },
  { name: "Excessive barking", category: "Neurological" },
  { name: "Restlessness", category: "Neurological" },
  { name: "Anxiety", category: "Neurological" },
  { name: "Fear", category: "Neurological" },
  { name: "Confusion", category: "Neurological" },
  { name: "Disorientation", category: "Neurological" },
  { name: "Memory loss", category: "Neurological" },
  { name: "Tremors", category: "Neurological" },
  { name: "Muscle spasms", category: "Neurological" },
  { name: "Facial paralysis", category: "Neurological" },
  { name: "Loss of balance", category: "Neurological" },
  { name: "Incoordination", category: "Neurological" },
  { name: "Abdominal swelling", category: "Digestive" },
  { name: "Distended abdomen", category: "Digestive" },
  { name: "Ascites", category: "Digestive" },
  { name: "Vaginal discharge", category: "Reproductive" },
  { name: "Blood from vulva", category: "Reproductive" },
  { name: "Abortion", category: "Reproductive" },
  { name: "Stillbirth", category: "Reproductive" },
  { name: "Difficulty giving birth", category: "Reproductive" },
  { name: "Retained placenta", category: "Reproductive" },
  { name: "Metritis", category: "Reproductive" },
  { name: "Mastitis", category: "Reproductive" },
  { name: "Swollen teats", category: "Reproductive" },
  { name: "Abnormal milk", category: "Reproductive" },
  { name: "No milk production", category: "Reproductive" },
  { name: "Testicular swelling", category: "Reproductive" },
  { name: "Penile discharge", category: "Reproductive" },
  { name: "Infertility", category: "Reproductive" },
  { name: "Crying during urination", category: "Urinary" },
  { name: "Straining to urinate", category: "Urinary" },
  { name: "Blood in urine", category: "Urinary" },
  { name: "Frequent urination", category: "Urinary" },
  { name: "Incontinence", category: "Urinary" },
  { name: "Kidney failure", category: "Urinary" },
  { name: "Polyuria", category: "Urinary" },
  { name: "Polydipsia", category: "Urinary" },
  { name: "Anemia", category: "General" },
  { name: "Pale mucous membranes", category: "General" },
  { name: "Weakness", category: "General" },
  { name: "Fatigue", category: "General" },
  { name: "Exercise intolerance", category: "General" },
  { name: "Rapid heart rate", category: "General" },
  { name: "Slow heart rate", category: "General" },
  { name: "Irregular heart rhythm", category: "General" },
  { name: "Heart murmur", category: "General" },
  { name: "Coughing up blood", category: "Respiratory" },
  { name: "Difficulty inhaling", category: "Respiratory" },
  { name: "Noisy breathing", category: "Respiratory" },
  { name: "Sore throat", category: "Respiratory" },
  { name: "Hoarseness", category: "Respiratory" },
  { name: "Runny nose", category: "Respiratory" },
  { name: "Sneezing", category: "Respiratory" },
  { name: "Coughing", category: "Respiratory" },
  { name: "Pneumonia", category: "Respiratory" },
  { name: "Bronchitis", category: "Respiratory" },
  { name: "Asthma", category: "Respiratory" },
  { name: "Lung disease", category: "Respiratory" },
  { name: "Liver disease", category: "General" },
  { name: "Jaundice", category: "General" },
  { name: "Vomiting bile", category: "Digestive" },
  { name: "Hepatitis", category: "General" },
  { name: "Liver failure", category: "General" },
  { name: "Enlarged liver", category: "General" },
  { name: "Pancreatitis", category: "Digestive" },
  { name: "Diabetes", category: "General" },
  { name: "Hyperthyroidism", category: "General" },
  { name: "Hypothyroidism", category: "General" },
  { name: "Cushing disease", category: "General" },
  { name: "Addison disease", category: "General" },
  { name: "Cancer", category: "General" },
  { name: "Tumors", category: "General" },
  { name: "Lumps", category: "General" },
  { name: "Weight gain", category: "General" },
  { name: "Obesity", category: "General" },
  { name: "Swollen glands", category: "General" },
  { name: "Enlarged lymph nodes", category: "General" },
  { name: "Infection", category: "General" },
  { name: "Fever", category: "General" },
  { name: "Swelling", category: "General" },
  { name: "Redness", category: "General" },
  { name: "Heat", category: "General" },
  { name: "Pain", category: "General" },
  { name: "Loss of function", category: "General" },
  { name: "Wounds", category: "Skin" },
  { name: "Bleeding", category: "Skin" },
  { name: "Bruising", category: "Skin" },
  { name: "Ulcers", category: "Skin" },
  { name: "Blisters", category: "Skin" },
  { name: "Pustules", category: "Skin" },
  { name: "Papules", category: "Skin" },
  { name: "Nodules", category: "Skin" },
  { name: "Tumors", category: "Skin" },
  { name: "Alopecia", category: "Skin" },
  { name: "Dandruff", category: "Skin" },
  { name: "Excessive shedding", category: "Skin" },
  { name: "Poor coat", category: "Skin" },
  { name: "Dull coat", category: "Skin" },
  { name: "Matted fur", category: "Skin" },
  { name: "Fleas", category: "Skin" },
  { name: "Ticks", category: "Skin" },
  { name: "Mites", category: "Skin" },
  { name: "Lice", category: "Skin" },
  { name: "Ringworm", category: "Skin" },
  { name: "Fungal infection", category: "Skin" },
  { name: "Bacterial infection", category: "Skin" },
  { name: "Hot spots", category: "Skin" },
  { name: "Anal gland problems", category: "Digestive" },
  { name: "Scooting", category: "Digestive" },
  { name: "Foul anal odor", category: "Digestive" },
  { name: "Licking anal area", category: "Digestive" },
  { name: "Hepatomegaly", category: "General" },
  { name: "Splenomegaly", category: "General" },
  { name: "Kidney enlargement", category: "General" },
  { name: "Bladder stones", category: "Urinary" },
  { name: "Urinary obstruction", category: "Urinary" },
  { name: "Crystals in urine", category: "Urinary" },
  { name: "Kidney stones", category: "Urinary" },
  { name: "Hernia", category: "General" },
  { name: "Prolapse", category: "General" },
  { name: "Edema", category: "General" },
  { name: "Ascites", category: "General" },
  { name: "Anasarca", category: "General" },
  { name: "Deformities", category: "Movement" },
  { name: "Broken bones", category: "Movement" },
  { name: "Fractures", category: "Movement" },
  { name: "Dislocations", category: "Movement" },
  { name: "Sprains", category: "Movement" },
  { name: "Strains", category: "Movement" },
  { name: "Arthritis", category: "Movement" },
  { name: "Hip dysplasia", category: "Movement" },
  { name: "Elbow dysplasia", category: "Movement" },
  { name: "Osteoarthritis", category: "Movement" },
  { name: "Degenerative joint disease", category: "Movement" },
  { name: "Cranial cruciate ligament rupture", category: "Movement" },
  { name: "Patellar luxation", category: "Movement" },
  { name: "Intervertebral disc disease", category: "Movement" },
  { name: "Spondylosis", category: "Movement" },
  { name: "Vertebral problems", category: "Movement" },
  { name: "Spinal cord injury", category: "Movement" },
  { name: "Neurological deficits", category: "Neurological" },
  { name: "Loss of sensation", category: "Neurological" },
  { name: "Hyperesthesia", category: "Neurological" },
  { name: "Self-mutilation", category: "Neurological" },
  { name: "Obsessive grooming", category: "Neurological" },
  { name: "Pica", category: "Neurological" },
  { name: "Coprophagia", category: "Neurological" },
  { name: "Anxiety", category: "Neurological" },
  { name: "Phobias", category: "Neurological" },
  { name: "Compulsive disorders", category: "Neurological" },
  { name: "Cognitive dysfunction", category: "Neurological" },
  { name: "Senility", category: "Neurological" },
  { name: "Dementia", category: "Neurological" },
  { name: "Brain tumor", category: "Neurological" },
  { name: "Meningitis", category: "Neurological" },
  { name: "Encephalitis", category: "Neurological" },
  { name: "Rabies", category: "Neurological" },
  { name: "Distemper", category: "Neurological" },
  { name: "Parvovirus", category: "Digestive" },
  { name: "Corona virus", category: "Digestive" },
  { name: "Leptospirosis", category: "General" },
  { name: "Lyme disease", category: "General" },
  { name: "Ehrlichiosis", category: "General" },
  { name: "Anaplasmosis", category: "General" },
  { name: "Heartworm disease", category: "General" },
  { name: "Kennel cough", category: "Respiratory" },
  { name: "Bordetella", category: "Respiratory" },
  { name: "Canine influenza", category: "Respiratory" },
  { name: "Feline leukemia", category: "General" },
  { name: "FIV", category: "General" },
  { name: "FIP", category: "General" },
  { name: "Panleukopenia", category: "General" },
  { name: "Upper respiratory infection", category: "Respiratory" },
  { name: "Asthma", category: "Respiratory" },
  { name: "Bronchitis", category: "Respiratory" },
  { name: "Chronic bronchitis", category: "Respiratory" },
  { name: "Allergic bronchitis", category: "Respiratory" },
  { name: "Allergies", category: "General" },
  { name: "Food allergy", category: "General" },
  { name: "Environmental allergy", category: "General" },
  { name: "Flea allergy dermatitis", category: "Skin" },
  { name: "Atopy", category: "Skin" },
  { name: "Hot spots", category: "Skin" },
  { name: "Acne", category: "Skin" },
  { name: "Dermatitis", category: "Skin" },
  { name: "Eczema", category: "Skin" },
  { name: "Psoriasis", category: "Skin" },
  { name: "Lupus", category: "Skin" },
  { name: "Pemphigus", category: "Skin" },
  { name: "Vasculitis", category: "Skin" },
  { name: "Pyoderma", category: "Skin" },
  { name: "Cellulitis", category: "Skin" },
  { name: "Abscess", category: "Skin" },
  { name: "Wound infection", category: "Skin" },
  { name: "Tetanus", category: "General" },
  { name: "Botulism", category: "General" },
  { name: "Poisoning", category: "General" },
  { name: "Toxin ingestion", category: "General" },
  { name: "Chocolate toxicity", category: "General" },
  { name: "Xylitol toxicity", category: "General" },
  { name: "Grape toxicity", category: "General" },
  { name: "Onion toxicity", category: "General" },
  { name: "Antifreeze poisoning", category: "General" },
  { name: "Rat poison ingestion", category: "General" },
  { name: "Medication overdose", category: "General" },
  { name: "Heatstroke", category: "General" },
  { name: "Hypothermia", category: "General" },
  { name: "Burns", category: "Skin" },
  { name: "Frostbite", category: "Skin" },
  { name: "Trauma", category: "General" },
  { name: "Bleeding", category: "General" },
  { name: "Shock", category: "General" },
  { name: "Fractures", category: "Movement" },
  { name: "Spinal injury", category: "Movement" },
  { name: "Head injury", category: "Neurological" },
  { name: "Concussion", category: "Neurological" },
  { name: "Internal bleeding", category: "General" },
  { name: "Organ rupture", category: "General" },
  { name: "Puncture wounds", category: "Skin" },
  { name: "Lacerations", category: "Skin" },
  { name: "Abrasions", category: "Skin" },
  { name: "Bite wounds", category: "Skin" },
  { name: "Eye injuries", category: "Eyes" },
  { name: "Foreign body", category: "General" },
  { name: "Choking", category: "Respiratory" },
  { name: "Drowning", category: "General" },
  { name: "Electrocution", category: "General" },
  { name: "Gunshot wounds", category: "General" },
  { name: "Animal attacks", category: "General" },
  { name: "Hit by car", category: "General" },
  { name: "Fall from height", category: "General" },
  { name: "Crushing injury", category: "General" },
  { name: "Burn injury", category: "Skin" },
  { name: "Chemical burn", category: "Skin" },
  { name: "Electric burn", category: "Skin" },
  { name: "Radiation exposure", category: "General" },
  { name: "Malnutrition", category: "General" },
  { name: "Vitamin deficiency", category: "General" },
  { name: "Mineral deficiency", category: "General" },
  { name: "Protein deficiency", category: "General" },
  { name: "Calorie deficiency", category: "General" },
  { name: "Overnutrition", category: "General" },
  { name: "Obesity", category: "General" },
  { name: "Malabsorption", category: "Digestive" },
  { name: "Malnutrition", category: "Digestive" },
  { name: "Chronic diarrhea", category: "Digestive" },
  { name: "Chronic vomiting", category: "Digestive" },
  { name: "Inflammatory bowel disease", category: "Digestive" },
  { name: "Gastritis", category: "Digestive" },
  { name: "Enteritis", category: "Digestive" },
  { name: "Colitis", category: "Digestive" },
  { name: "Stomatitis", category: "Dental" },
  { name: "Gingivitis", category: "Dental" },
  { name: "Periodontitis", category: "Dental" },
  { name: "Tooth abscess", category: "Dental" },
  { name: "Tooth fracture", category: "Dental" },
  { name: "Tooth loss", category: "Dental" },
  { name: "Oral tumors", category: "Dental" },
  { name: "Oral ulcers", category: "Dental" },
  { name: "Salivation", category: "Digestive" },
  { name: "Excessive thirst", category: "General" },
  { name: "Anorexia", category: "General" },
  { name: "Polyphagia", category: "General" },
  { name: "Pica", category: "General" },
  { name: "Dysphagia", category: "Digestive" },
  { name: "Regurgitation", category: "Digestive" },
  { name: "Rumination", category: "Digestive" },
  { name: "Eructation", category: "Digestive" },
  { name: "Flatulence", category: "Digestive" },
  { name: "Borborygmus", category: "Digestive" },
  { name: "Melena", category: "Digestive" },
  { name: "Hematochezia", category: "Digestive" },
  { name: "Steatorrhea", category: "Digestive" },
  { name: "Constipation", category: "Digestive" },
  { name: "Dyschezia", category: "Digestive" },
  { name: "Tenesmus", category: "Digestive" },
  { name: "Proctitis", category: "Digestive" },
  { name: "Perineal hernia", category: "Digestive" },
  { name: "Perianal fistula", category: "Digestive" },
  { name: "Perianal adenoma", category: "Digestive" },
  { name: "Perianal abscess", category: "Digestive" },
  { name: "Hepatobiliary disease", category: "General" },
  { name: "Cholangiohepatitis", category: "General" },
  { name: "Cholecystitis", category: "General" },
  { name: "Gallbladder disease", category: "General" },
  { name: "Biliary obstruction", category: "General" },
  { name: "Pancreatic disease", category: "General" },
  { name: "Pancreatitis", category: "General" },
  { name: "Exocrine pancreatic insufficiency", category: "Digestive" },
  { name: "Diabetes mellitus", category: "General" },
  { name: "Diabetic ketoacidosis", category: "General" },
  { name: "Hypoglycemia", category: "General" },
  { name: "Hyperglycemia", category: "General" },
  { name: "Electrolyte imbalance", category: "General" },
  { name: "Metabolic acidosis", category: "General" },
  { name: "Metabolic alkalosis", category: "General" },
  { name: "Respiratory acidosis", category: "General" },
  { name: "Respiratory alkalosis", category: "General" },
  { name: "Azotemia", category: "General" },
  { name: "Uremia", category: "General" },
  { name: "Kidney disease", category: "Urinary" },
  { name: "Renal failure", category: "Urinary" },
  { name: "Chronic kidney disease", category: "Urinary" },
  { name: "Acute kidney injury", category: "Urinary" },
  { name: "Glomerulonephritis", category: "Urinary" },
  { name: "Nephritis", category: "Urinary" },
  { name: "Nephrosis", category: "Urinary" },
  { name: "Pyelonephritis", category: "Urinary" },
  { name: "Renal calculi", category: "Urinary" },
  { name: "Renal cysts", category: "Urinary" },
  { name: "Renal neoplasia", category: "Urinary" },
  { name: "Urinary tract infection", category: "Urinary" },
  { name: "Cystitis", category: "Urinary" },
  { name: "Urethritis", category: "Urinary" },
  { name: "Urolithiasis", category: "Urinary" },
  { name: "Urinary obstruction", category: "Urinary" },
  { name: "Urinary incontinence", category: "Urinary" },
  { name: "Hematuria", category: "Urinary" },
  { name: "Proteinuria", category: "Urinary" },
  { name: "Glycosuria", category: "Urinary" },
  { name: "Cylindruria", category: "Urinary" },
  { name: "Bacteriuria", category: "Urinary" },
  { name: "Pyuria", category: "Urinary" },
  { name: "Hemoglobinuria", category: "Urinary" },
  { name: "Myoglobinuria", category: "Urinary" },
  { name: "Bilirubinuria", category: "Urinary" },
  { name: "Crystalluria", category: "Urinary" },
  { name: "Reproductive disorders", category: "Reproductive" },
  { name: "Estrus disorders", category: "Reproductive" },
  { name: "Anestrus", category: "Reproductive" },
  { name: "Prolonged estrus", category: "Reproductive" },
  { name: "Silent heat", category: "Reproductive" },
  { name: "False pregnancy", category: "Reproductive" },
  { name: "Pyometra", category: "Reproductive" },
  { name: "Metrritis", category: "Reproductive" },
  { name: "Endometritis", category: "Reproductive" },
  { name: "Vaginitis", category: "Reproductive" },
  { name: "Uterine torsion", category: "Reproductive" },
  { name: "Uterine rupture", category: "Reproductive" },
  { name: "Uterine prolapse", category: "Reproductive" },
  { name: "Dystocia", category: "Reproductive" },
  { name: "Eclampsia", category: "Reproductive" },
  { name: "Mastitis", category: "Reproductive" },
  { name: "Mammary gland tumor", category: "Reproductive" },
  { name: "Testicular disorders", category: "Reproductive" },
  { name: "Cryptorchidism", category: "Reproductive" },
  { name: "Monorchidism", category: "Reproductive" },
  { name: "Anorchidism", category: "Reproductive" },
  { name: "Testicular torsion", category: "Reproductive" },
  { name: "Testicular tumor", category: "Reproductive" },
  { name: "Epididymitis", category: "Reproductive" },
  { name: "Prostatitis", category: "Reproductive" },
  { name: "Prostatic abscess", category: "Reproductive" },
  { name: "Prostatic cyst", category: "Reproductive" },
  { name: "Prostatic neoplasia", category: "Reproductive" },
  { name: "Benign prostatic hyperplasia", category: "Reproductive" },
  { name: "Priapism", category: "Reproductive" },
  { name: "Paraphimosis", category: "Reproductive" },
  { name: "Phimosis", category: "Reproductive" },
  { name: "Hypospadias", category: "Reproductive" },
  { name: "Epispadias", category: "Reproductive" },
  { name: "Inguinal hernia", category: "General" },
  { name: "Umbilical hernia", category: "General" },
  { name: "Perineal hernia", category: "General" },
  { name: "Diaphragmatic hernia", category: "General" },
  { name: "Hiatal hernia", category: "General" },
  { name: "Gastric dilatation", category: "Digestive" },
  { name: "Gastric torsion", category: "Digestive" },
  { name: "Gastric ulcer", category: "Digestive" },
  { name: "Gastric neoplasia", category: "Digestive" },
  { name: "Intestinal obstruction", category: "Digestive" },
  { name: "Intussusception", category: "Digestive" },
  { name: "Volvulus", category: "Digestive" },
  { name: "Mesenteric torsion", category: "Digestive" },
  { name: "Peritonitis", category: "Digestive" },
  { name: "Hemoperitoneum", category: "Digestive" },
  { name: "Chyloperitoneum", category: "Digestive" },
  { name: "Pneumoperitoneum", category: "Digestive" },
  { name: "Retroperitoneal hemorrhage", category: "General" },
  { name: "Adrenal disease", category: "General" },
  { name: "Addison disease", category: "General" },
  { name: "Cushing disease", category: "General" },
  { name: "Hyperadrenocorticism", category: "General" },
  { name: "Hypoadrenocorticism", category: "General" },
  { name: "Pheochromocytoma", category: "General" },
  { name: "Neuroendocrine tumor", category: "General" },
  { name: "Thyroid disease", category: "General" },
  { name: "Hyperthyroidism", category: "General" },
  { name: "Hypothyroidism", category: "General" },
  { name: "Thyroiditis", category: "General" },
  { name: "Thyroid neoplasia", category: "General" },
  { name: "Parathyroid disease", category: "General" },
  { name: "Hyperparathyroidism", category: "General" },
  { name: "Hypoparathyroidism", category: "General" },
  { name: "Calcium imbalance", category: "General" },
  { name: "Phosphorus imbalance", category: "General" },
  { name: "Magnesium imbalance", category: "General" },
  { name: "Sodium imbalance", category: "General" },
  { name: "Potassium imbalance", category: "General" },
  { name: "Chloride imbalance", category: "General" },
  { name: "Acid-base imbalance", category: "General" },
  { name: "Respiratory disease", category: "Respiratory" },
  { name: "Upper respiratory disease", category: "Respiratory" },
  { name: "Lower respiratory disease", category: "Respiratory" },
  { name: "Tracheal disease", category: "Respiratory" },
  { name: "Bronchial disease", category: "Respiratory" },
  { name: "Lung disease", category: "Respiratory" },
  { name: "Pleural disease", category: "Respiratory" },
  { name: "Mediastinal disease", category: "Respiratory" },
  { name: "Nasal disease", category: "Respiratory" },
  { name: "Sinus disease", category: "Respiratory" },
  { name: "Pharyngeal disease", category: "Respiratory" },
  { name: "Laryngeal disease", category: "Respiratory" },
  { name: "Cardiovascular disease", category: "General" },
  { name: "Heart disease", category: "General" },
  { name: "Heart failure", category: "General" },
  { name: "Congestive heart failure", category: "General" },
  { name: "Valvular disease", category: "General" },
  { name: "Myocardial disease", category: "General" },
  { name: "Pericardial disease", category: "General" },
  { name: "Arrhythmia", category: "General" },
  { name: "Hypertension", category: "General" },
  { name: "Hypotension", category: "General" },
  { name: "Thromboembolism", category: "General" },
  { name: "Vasculitis", category: "General" },
  { name: "Anemia", category: "General" },
  { name: "Hemolytic anemia", category: "General" },
  { name: "Aplastic anemia", category: "General" },
  { name: "Hemorrhagic anemia", category: "General" },
  { name: "Nutritional anemia", category: "General" },
  { name: "Chronic disease anemia", category: "General" },
  { name: "Leukopenia", category: "General" },
  { name: "Leukocytosis", category: "General" },
  { name: "Neutropenia", category: "General" },
  { name: "Neutrophilia", category: "General" },
  { name: "Lymphopenia", category: "General" },
  { name: "Lymphocytosis", category: "General" },
  { name: "Eosinophilia", category: "General" },
  { name: "Basophilia", category: "General" },
  { name: "Monocytosis", category: "General" },
  { name: "Thrombocytopenia", category: "General" },
  { name: "Thrombocytosis", category: "General" },
  { name: "Pancytopenia", category: "General" },
  { name: "Pancytosis", category: "General" },
  { name: "Coagulopathy", category: "General" },
  { name: "Bleeding disorder", category: "General" },
  { name: "Thrombosis", category: "General" },
  { name: "Embolism", category: "General" },
  { name: "Lymphadenopathy", category: "General" },
  { name: "Lymphoma", category: "General" },
  { name: "Leukemia", category: "General" },
  { name: "Multiple myeloma", category: "General" },
  { name: "Plasmacytoma", category: "General" },
  { name: "Hemangiosarcoma", category: "General" },
  { name: "Osteosarcoma", category: "General" },
  { name: "Mast cell tumor", category: "General" },
  { name: "Melanoma", category: "General" },
  { name: "Squamous cell carcinoma", category: "General" },
  { name: "Basal cell carcinoma", category: "General" },
  { name: "Fibrosarcoma", category: "General" },
  { name: "Liposarcoma", category: "General" },
  { name: "Leiomyosarcoma", category: "General" },
  { name: "Rhabdomyosarcoma", category: "General" },
  { name: "Chondrosarcoma", category: "General" },
  { name: "Hemangioma", category: "General" },
  { name: "Papilloma", category: "General" },
  { name: "Adenoma", category: "General" },
  { name: "Carcinoma", category: "General" },
  { name: "Sarcoma", category: "General" },
  { name: "Neoplasia", category: "General" },
  { name: "Cancer metastasis", category: "General" },
  { name: "Paraneoplastic syndrome", category: "General" },
  { name: "Immune-mediated disease", category: "General" },
  { name: "Autoimmune disease", category: "General" },
  { name: "Immune deficiency", category: "General" },
  { name: "Hypersensitivity", category: "General" },
  { name: "Anaphylaxis", category: "General" },
  { name: "Autoimmune hemolytic anemia", category: "General" },
  { name: "Immune-mediated thrombocytopenia", category: "General" },
  { name: "Systemic lupus erythematosus", category: "General" },
  { name: "Rheumatoid arthritis", category: "Movement" },
  { name: "Polymyositis", category: "Movement" },
  { name: "Dermatomyositis", category: "Skin" },
  { name: "Vasculitis", category: "Skin" },
  { name: "Meningoencephalitis", category: "Neurological" },
  { name: "Granulomatous meningoencephalitis", category: "Neurological" },
  { name: "Steroid-responsive meningitis", category: "Neurological" },
  { name: "Epilepsy", category: "Neurological" },
  { name: "Seizure disorder", category: "Neurological" },
  { name: "Status epilepticus", category: "Neurological" },
  { name: "Cluster seizures", category: "Neurological" },
  { name: "Post-ictal period", category: "Neurological" },
  { name: "Syncope", category: "Neurological" },
  { name: "Vertigo", category: "Neurological" },
  { name: "Torticollis", category: "Neurological" },
  { name: "Facial nerve paralysis", category: "Neurological" },
  { name: "Trigeminal neuritis", category: "Neurological" },
  { name: "Vestibular disease", category: "Neurological" },
  { name: "Central vestibular disease", category: "Neurological" },
  { name: "Peripheral vestibular disease", category: "Neurological" },
  { name: "Horner syndrome", category: "Neurological" },
  { name: "Myasthenia gravis", category: "Neurological" },
  { name: "Polyneuropathy", category: "Neurological" },
  { name: "Mononeuropathy", category: "Neurological" },
  { name: "Polyradiculoneuritis", category: "Neurological" },
  { name: "Degenerative myelopathy", category: "Neurological" },
  { name: "Disk disease", category: "Neurological" },
  { name: "Wobbler syndrome", category: "Neurological" },
  { name: "Cervical spondylomyelopathy", category: "Neurological" },
  { name: "Atlantoaxial subluxation", category: "Neurological" },
  { name: "Syringomyelia", category: "Neurological" },
  { name: "Chiari malformation", category: "Neurological" },
  { name: "Hydrocephalus", category: "Neurological" },
  { name: "Cerebral edema", category: "Neurological" },
  { name: "Brain hemorrhage", category: "Neurological" },
  { name: "Brain tumor", category: "Neurological" },
  { name: "Spinal cord tumor", category: "Neurological" },
  { name: "Nerve sheath tumor", category: "Neurological" },
  { name: "Muscular dystrophy", category: "Movement" },
  { name: "Myopathy", category: "Movement" },
  { name: "Myositis", category: "Movement" },
  { name: "Rhabdomyolysis", category: "Movement" },
  { name: "Exertional rhabdomyolysis", category: "Movement" },
  { name: "Fibrosis", category: "Movement" },
  { name: "Contracture", category: "Movement" },
  { name: "Atrophy", category: "Movement" },
  { name: "Hypertrophy", category: "Movement" },
  { name: "Bursitis", category: "Movement" },
  { name: "Tenosynovitis", category: "Movement" },
  { name: "Tendinitis", category: "Movement" },
  { name: "Tendinopathy", category: "Movement" },
  { name: "Ligament injury", category: "Movement" },
  { name: "Cartilage injury", category: "Movement" },
  { name: "Bone disease", category: "Movement" },
  { name: "Osteomyelitis", category: "Movement" },
  { name: "Osteitis", category: "Movement" },
  { name: "Osteonecrosis", category: "Movement" },
  { name: "Osteopetrosis", category: "Movement" },
  { name: "Hypertrophic osteopathy", category: "Movement" },
  { name: "Panosteitis", category: "Movement" },
  { name: "Eosinophilic granuloma complex", category: "Skin" },
  { name: "Indolent ulcer", category: "Skin" },
  { name: "Plasmacytic dermatitis", category: "Skin" },
  { name: "Alopecia areata", category: "Skin" },
  { name: "Follicular dysplasia", category: "Skin" },
  { name: "Color dilution alopecia", category: "Skin" },
  { name: "Schnauzer comedo syndrome", category: "Skin" },
  { name: "Nasal planum disease", category: "Skin" },
  { name: "Pinnal disease", category: "Skin" },
  { name: "Aural hematoma", category: "Ears" },
  { name: "Otitis externa", category: "Ears" },
  { name: "Otitis media", category: "Ears" },
  { name: "Otitis interna", category: "Ears" },
  { name: "Eustachian tube disease", category: "Ears" },
  { name: "Hearing loss", category: "Ears" },
  { name: "Deafness", category: "Ears" },
  { name: "Vestibular disease", category: "Ears" },
  { name: "Eye discharge", category: "Eyes" },
  { name: "Epiphora", category: "Eyes" },
  { name: "Dacryocystitis", category: "Eyes" },
  { name: "Keratoconjunctivitis sicca", category: "Eyes" },
  { name: "Dry eye", category: "Eyes" },
  { name: "Conjunctivitis", category: "Eyes" },
  { name: "Keratitis", category: "Eyes" },
  { name: "Uveitis", category: "Eyes" },
  { name: "Glaucoma", category: "Eyes" },
  { name: "Cataracts", category: "Eyes" },
  { name: "Retinal disease", category: "Eyes" },
  { name: "Retinal detachment", category: "Eyes" },
  { name: "Blindness", category: "Eyes" },
  { name: "Lens luxation", category: "Eyes" },
  { name: "Corneal ulcer", category: "Eyes" },
  { name: "Corneal edema", category: "Eyes" },
  { name: "Entropion", category: "Eyes" },
  { name: "Ectropion", category: "Eyes" },
  { name: "Cherry eye", category: "Eyes" },
  { name: "Prolapsed gland of third eyelid", category: "Eyes" },
  { name: "Trichiasis", category: "Eyes" },
  { name: "Distichiasis", category: "Eyes" },
  { name: "Eyelid tumor", category: "Eyes" },
  { name: "Orbital disease", category: "Eyes" },
  { name: "Orbital cellulitis", category: "Eyes" },
  { name: "Exophthalmos", category: "Eyes" },
  { name: "Enophthalmos", category: "Eyes" },
  { name: "Strabismus", category: "Eyes" },
  { name: "Nystagmus", category: "Eyes" },
  { name: "Anisocoria", category: "Eyes" },
  { name: "Miosis", category: "Eyes" },
  { name: "Mydriasis", category: "Eyes" },
  { name: "Photophobia", category: "Eyes" },
  { name: "Blepharospasm", category: "Eyes" },
  { name: "Blepharitis", category: "Eyes" },
  { name: "Hordeolum", category: "Eyes" },
  { name: "Chalazion", category: "Eyes" },
  { name: "Dermatophytosis", category: "Skin" },
  { name: "Malassezia dermatitis", category: "Skin" },
  { name: "Candida infection", category: "Skin" },
  { name: "Bacterial pyoderma", category: "Skin" },
  { name: "Superficial pyoderma", category: "Skin" },
  { name: "Deep pyoderma", category: "Skin" },
  { name: "Folliculitis", category: "Skin" },
  { name: "Furunculosis", category: "Skin" },
  { name: "Cellulitis", category: "Skin" },
  { name: "Panniculitis", category: "Skin" },
  { name: "Vasculitis", category: "Skin" },
  { name: "Seborrhea", category: "Skin" },
  { name: "Sebaceous adenitis", category: "Skin" },
  { name: "Asteatotic dermatitis", category: "Skin" },
  { name: "Miliaria", category: "Skin" },
  { name: "Prurigo", category: "Skin" },
  { name: "Lichenification", category: "Skin" },
  { name: "Hyperkeratosis", category: "Skin" },
  { name: "Acanthosis nigricans", category: "Skin" },
  { name: "Cutaneous horns", category: "Skin" },
  { name: "Calcinosis cutis", category: "Skin" },
  { name: "Xanthomas", category: "Skin" },
  { name: "Cutaneous lymphoma", category: "Skin" },
  { name: "Mast cell tumor", category: "Skin" },
  { name: "Histiocytoma", category: "Skin" },
  { name: "Papillomatosis", category: "Skin" },
  { name: "Viral papillomatosis", category: "Skin" },
  { name: "Actinic keratosis", category: "Skin" },
  { name: "Solar dermatitis", category: "Skin" },
  { name: "Burns", category: "Skin" },
  { name: "Pressure sores", category: "Skin" },
  { name: "Decubital ulcers", category: "Skin" },
  { name: "Calluses", category: "Skin" },
  { name: "Corns", category: "Skin" },
  { name: "Interdigital cysts", category: "Skin" },
  { name: "Pododermatitis", category: "Skin" },
  { name: "Paw pad disease", category: "Skin" },
  { name: "Nail disease", category: "Skin" },
  { name: "Onychomycosis", category: "Skin" },
  { name: "Paronychia", category: "Skin" },
  { name: "Claw disease", category: "Skin" },
  { name: "Brachycephalic syndrome", category: "Respiratory" },
  { name: "Elongated soft palate", category: "Respiratory" },
  { name: "Stenotic nares", category: "Respiratory" },
  { name: "Everted laryngeal saccules", category: "Respiratory" },
  { name: "Laryngeal collapse", category: "Respiratory" },
  { name: "Tracheal collapse", category: "Respiratory" },
  { name: "Bronchomalacia", category: "Respiratory" },
  { name: "Dynamic airway collapse", category: "Respiratory" },
  { name: "Nasal mites", category: "Respiratory" },
  { name: "Nasal polyps", category: "Respiratory" },
  { name: "Nasal tumors", category: "Respiratory" },
  { name: "Sinusitis", category: "Respiratory" },
  { name: "Rhinitis", category: "Respiratory" },
  { name: "Sporadic respiratory disease", category: "Respiratory" },
  { name: "Chronic bronchitis", category: "Respiratory" },
  { name: "Chronic obstructive pulmonary disease", category: "Respiratory" },
  { name: "Emphysema", category: "Respiratory" },
  { name: "Pulmonary edema", category: "Respiratory" },
  { name: "Pulmonary fibrosis", category: "Respiratory" },
  { name: "Pneumonia", category: "Respiratory" },
  { name: "Aspiration pneumonia", category: "Respiratory" },
  { name: "Inhalation pneumonia", category: "Respiratory" },
  { name: "Neonatal pneumonia", category: "Respiratory" },
  { name: "Interstitial pneumonia", category: "Respiratory" },
  { name: "Bronchopneumonia", category: "Respiratory" },
  { name: "Lobar pneumonia", category: "Respiratory" },
  { name: "Pleural effusion", category: "Respiratory" },
  { name: "Pneumothorax", category: "Respiratory" },
  { name: "Hemothorax", category: "Respiratory" },
  { name: "Chylothorax", category: "Respiratory" },
  { name: "Pyothorax", category: "Respiratory" },
  { name: "Hydrothorax", category: "Respiratory" },
  { name: "Diaphragmatic hernia", category: "Respiratory" },
  { name: "Mediastinal mass", category: "Respiratory" },
  { name: "Tracheal stenosis", category: "Respiratory" },
  { name: "Tracheal rupture", category: "Respiratory" },
  { name: "Laryngeal disease", category: "Respiratory" },
  { name: "Laryngitis", category: "Respiratory" },
  { name: "Laryngeal edema", category: "Respiratory" },
  { name: "Laryngeal paralysis", category: "Respiratory" },
  { name: "Laryngeal tumor", category: "Respiratory" },
  { name: "Pharyngeal disease", category: "Respiratory" },
  { name: "Pharyngitis", category: "Respiratory" },
  { name: "Retropharyngeal abscess", category: "Respiratory" },
  { name: "Pharyngeal foreign body", category: "Respiratory" },
  { name: "Pharyngeal tumor", category: "Respiratory" },
  { name: "Dysphagia", category: "Digestive" },
  { name: "Regurgitation", category: "Digestive" },
  { name: "Esophagitis", category: "Digestive" },
  { name: "Esophageal ulcer", category: "Digestive" },
  { name: "Esophageal stricture", category: "Digestive" },
  { name: "Esophageal foreign body", category: "Digestive" },
  { name: "Megaesophagus", category: "Digestive" },
  { name: "Gastroesophageal intussusception", category: "Digestive" },
  { name: "Gastritis", category: "Digestive" },
  { name: "Gastric ulcer", category: "Digestive" },
  { name: "Gastric erosion", category: "Digestive" },
  { name: "Gastric foreign body", category: "Digestive" },
  { name: "Gastric tumor", category: "Digestive" },
  { name: "Gastric dilatation-volvulus", category: "Digestive" },
  { name: "Gastric stasis", category: "Digestive" },
  { name: "Pyloric stenosis", category: "Digestive" },
  { name: "Pyloric spasticity", category: "Digestive" },
  { name: "Inflammatory bowel disease", category: "Digestive" },
  { name: "Lymphocytic-plasmacytic enteritis", category: "Digestive" },
  { name: "Eosinophilic enteritis", category: "Digestive" },
  { name: "Granulomatous enteritis", category: "Digestive" },
  { name: "Ulcerative colitis", category: "Digestive" },
  { name: "Small intestinal disease", category: "Digestive" },
  { name: "Enteritis", category: "Digestive" },
  { name: "Duodenitis", category: "Digestive" },
  { name: "Jejunitis", category: "Digestive" },
  { name: "Ileitis", category: "Digestive" },
  { name: "Intestinal ulcer", category: "Digestive" },
  { name: "Intestinal perforation", category: "Digestive" },
  { name: "Intestinal obstruction", category: "Digestive" },
  { name: "Intestinal foreign body", category: "Digestive" },
  { name: "Intussusception", category: "Digestive" },
  { name: "Volvulus", category: "Digestive" },
  { name: "Mesenteric torsion", category: "Digestive" },
  { name: "Protein-losing enteropathy", category: "Digestive" },
  { name: "Small intestinal bacterial overgrowth", category: "Digestive" },
  { name: "Exocrine pancreatic insufficiency", category: "Digestive" },
  { name: "Pancreatitis", category: "Digestive" },
  { name: "Pancreatic pseudocyst", category: "Digestive" },
  { name: "Pancreatic abscess", category: "Digestive" },
  { name: "Pancreatic necrosis", category: "Digestive" },
  { name: "Colonic disease", category: "Digestive" },
  { name: "Colitis", category: "Digestive" },
  { name: "Colonic ulcer", category: "Digestive" },
  { name: "Colonic tumor", category: "Digestive" },
  { name: "Megacolon", category: "Digestive" },
  { name: "Constipation", category: "Digestive" },
  { name: "Dyschezia", category: "Digestive" },
  { name: "Rectal prolapse", category: "Digestive" },
  { name: "Perianal disease", category: "Digestive" },
  { name: "Perianal fistula", category: "Digestive" },
  { name: "Perianal adenoma", category: "Digestive" },
  { name: "Perianal abscess", category: "Digestive" },
  { name: "Anal sac disease", category: "Digestive" },
  { name: "Hepatobiliary disease", category: "General" },
  { name: "Hepatitis", category: "General" },
  { name: "Chronic hepatitis", category: "General" },
  { name: "Cirrhosis", category: "General" },
  { name: "Liver failure", category: "General" },
  { name: "Hepatic lipidosis", category: "General" },
  { name: "Hepatic neoplasia", category: "General" },
  { name: "Portosystemic shunt", category: "General" },
  { name: "Biliary disease", category: "General" },
  { name: "Cholangitis", category: "General" },
  { name: "Cholecystitis", category: "General" },
  { name: "Gallbladder mucocele", category: "General" },
  { name: "Biliary obstruction", category: "General" },
  { name: "Extrahepatic biliary obstruction", category: "General" },
  { name: "Pancreatic disease", category: "General" },
  { name: "Diabetes mellitus", category: "General" },
  { name: "Diabetic ketoacidosis", category: "General" },
  { name: "Hypoglycemia", category: "General" },
  { name: "Hyperglycemia", category: "General" },
  { name: "Adrenal disease", category: "General" },
  { name: "Hypoadrenocorticism", category: "General" },
  { name: "Hyperadrenocorticism", category: "General" },
  { name: "Primary hyperaldosteronism", category: "General" },
  { name: "Pheochromocytoma", category: "General" },
  { name: "Thyroid disease", category: "General" },
  { name: "Hyperthyroidism", category: "General" },
  { name: "Hypothyroidism", category: "General" },
  { name: "Thyroid neoplasia", category: "General" },
  { name: "Parathyroid disease", category: "General" },
  { name: "Hyperparathyroidism", category: "General" },
  { name: "Hypoparathyroidism", category: "General" },
  { name: "Nutritional disease", category: "General" },
  { name: "Malnutrition", category: "General" },
  { name: "Obesity", category: "General" },
  { name: "Vitamin deficiency", category: "General" },
  { name: "Mineral deficiency", category: "General" },
  { name: "Protein deficiency", category: "General" },
  { name: "Essential fatty acid deficiency", category: "General" },
  { name: "Zinc deficiency", category: "General" },
  { name: "Iron deficiency", category: "General" },
  { name: "Copper deficiency", category: "General" },
  { name: "Selenium deficiency", category: "General" },
  { name: "Calcium deficiency", category: "General" },
  { name: "Phosphorus deficiency", category: "General" },
  { name: "Magnesium deficiency", category: "General" },
  { name: "Potassium deficiency", category: "General" },
  { name: "Sodium deficiency", category: "General" },
  { name: "Vitamin A deficiency", category: "General" },
  { name: "Vitamin D deficiency", category: "General" },
  { name: "Vitamin E deficiency", category: "General" },
  { name: "Vitamin K deficiency", category: "General" },
  { name: "Vitamin B deficiency", category: "General" },
  { name: "Toxicity", category: "General" },
  { name: "Poisoning", category: "General" },
  { name: "Chocolate toxicity", category: "General" },
  { name: "Xylitol toxicity", category: "General" },
  { name: "Grape toxicity", category: "General" },
  { name: "Onion toxicity", category: "General" },
  { name: "Garlic toxicity", category: "General" },
  { name: "Macadamia nut toxicity", category: "General" },
  { name: "Avocado toxicity", category: "General" },
  { name: "Ethylene glycol toxicity", category: "General" },
  { name: "Antifreeze poisoning", category: "General" },
  { name: "Rat poison toxicity", category: "General" },
  { name: "Rodenticide toxicity", category: "General" },
  { name: "Insecticide toxicity", category: "General" },
  { name: "Pesticide toxicity", category: "General" },
  { name: "Heavy metal toxicity", category: "General" },
  { name: "Lead toxicity", category: "General" },
  { name: "Zinc toxicity", category: "General" },
  { name: "Iron toxicity", category: "General" },
  { name: "Arsenic toxicity", category: "General" },
  { name: "Mercury toxicity", category: "General" },
  { name: "Plant toxicity", category: "General" },
  { name: "Lilies toxicity", category: "General" },
  { name: "Sago palm toxicity", category: "General" },
  { name: "Oleander toxicity", category: "General" },
  { name: "Azalea toxicity", category: "General" },
  { name: "Lily of the valley toxicity", category: "General" },
  { name: "Tulip toxicity", category: "General" },
  { name: "Daffodil toxicity", category: "General" },
  { name: "Lily toxicity in cats", category: "General" },
  { name: "Marijuana toxicity", category: "General" },
  { name: "Cannabis toxicity", category: "General" },
  { name: "Alcohol toxicity", category: "General" },
  { name: "Caffeine toxicity", category: "General" },
  { name: "Medication toxicity", category: "General" },
  { name: "NSAID toxicity", category: "General" },
  { name: "Ibuprofen toxicity", category: "General" },
  { name: "Aspirin toxicity", category: "General" },
  { name: "Acetaminophen toxicity", category: "General" },
  { name: "Tylenol toxicity", category: "General" },
  { name: "Antidepressant toxicity", category: "General" },
  { name: "Beta blocker toxicity", category: "General" },
  { name: "Calcium channel blocker toxicity", category: "General" },
  { name: "Digoxin toxicity", category: "General" },
  { name: "Thyroid hormone toxicity", category: "General" },
  { name: "Steroid toxicity", category: "General" },
  { name: "Chemotherapy toxicity", category: "General" },
  { name: "Radiation toxicity", category: "General" },
  { name: "Carbon monoxide toxicity", category: "General" },
  { name: "Cyanide toxicity", category: "General" },
  { name: "Smoke inhalation", category: "General" },
  { name: "Heatstroke", category: "General" },
  { name: "Hypothermia", category: "General" },
  { name: "Frostbite", category: "General" },
  { name: "Burns", category: "General" },
  { name: "Electrical injury", category: "General" },
  { name: "Drowning", category: "General" },
  { name: "Near drowning", category: "General" },
  { name: "High altitude disease", category: "General" },
  { name: "Decompression sickness", category: "General" },
  { name: "Barotrauma", category: "General" },
  { name: "Electric shock", category: "General" },
  { name: "Lightning strike", category: "General" },
  { name: "Animal bites", category: "General" },
  { name: "Snake bite", category: "General" },
  { name: "Insect sting", category: "General" },
  { name: "Bee sting", category: "General" },
  { name: "Wasp sting", category: "General" },
  { name: "Scorpion sting", category: "General" },
  { name: "Spider bite", category: "General" },
  { name: "Tick paralysis", category: "General" },
  { name: "Botfly infestation", category: "General" },
  { name: "Myiasis", category: "General" },
  { name: "Warbles", category: "General" },
  { name: "Leishmaniasis", category: "General" },
  { name: "Trypanosomiasis", category: "General" },
  { name: "Babesiosis", category: "General" },
  { name: "Ehrlichiosis", category: "General" },
  { name: "Anaplasmosis", category: "General" },
  { name: "Rocky Mountain spotted fever", category: "General" },
  { name: "Canine distemper", category: "General" },
  { name: "Canine parvovirus", category: "General" },
  { name: "Canine coronavirus", category: "General" },
  { name: "Canine influenza", category: "General" },
  { name: "Canine kennel cough", category: "Respiratory" },
  { name: "Canine infectious tracheobronchitis", category: "Respiratory" },
  { name: "Canine adenovirus", category: "General" },
  { name: "Canine herpesvirus", category: "General" },
  { name: "Canine parainfluenza", category: "General" },
  { name: "Canine respiratory coronavirus", category: "Respiratory" },
  { name: "Feline viral rhinotracheitis", category: "Respiratory" },
  { name: "Feline calicivirus", category: "Respiratory" },
  { name: "Feline panleukopenia", category: "General" },
  { name: "Feline leukemia virus", category: "General" },
  { name: "Feline immunodeficiency virus", category: "General" },
  { name: "Feline infectious peritonitis", category: "General" },
  { name: "Feline coronavirus", category: "General" },
  { name: "Feline bordetellosis", category: "Respiratory" },
  { name: "Feline chlamydiosis", category: "Respiratory" },
  { name: "Feline pneumonitis", category: "Respiratory" },
  { name: "Feline asthma", category: "Respiratory" },
  { name: "Feline chronic bronchitis", category: "Respiratory" },
  { name: "Feline idiopathic cystitis", category: "Urinary" },
  { name: "Feline lower urinary tract disease", category: "Urinary" },
  { name: "Feline urological syndrome", category: "Urinary" },
  { name: "Feline eosinophilic granuloma complex", category: "Skin" },
  { name: "Feline indolent ulcer", category: "Skin" },
  { name: "Feline eosinophilic plaque", category: "Skin" },
  { name: "Feline eosinophilic granuloma", category: "Skin" },
  { name: "Feline acne", category: "Skin" },
  { name: "Feline dermatophytosis", category: "Skin" },
  { name: "Feline miliary dermatitis", category: "Skin" },
  { name: "Feline atopic dermatitis", category: "Skin" },
  { name: "Feline flea allergy dermatitis", category: "Skin" },
  { name: "Feline psychogenic alopecia", category: "Skin" },
  { name: "Feline hyperesthesia syndrome", category: "Neurological" },
  { name: "Feline idiopathic vestibular disease", category: "Neurological" },
  { name: "Feline cognitive dysfunction", category: "Neurological" },
  { name: "Feline hepatic lipidosis", category: "General" },
  { name: "Feline cholangitis", category: "General" },
  { name: "Feline triad disease", category: "General" },
  { name: "Feline chronic kidney disease", category: "Urinary" },
  { name: "Feline hyperthyroidism", category: "General" },
  { name: "Feline diabetes mellitus", category: "General" },
  { name: "Feline acromegaly", category: "General" },
  { name: "Feline hypertension", category: "General" },
  { name: "Feline cardiomyopathy", category: "General" },
  { name: "Feline hypertrophic cardiomyopathy", category: "General" },
  { name: "Feline dilated cardiomyopathy", category: "General" },
  { name: "Feline restrictive cardiomyopathy", category: "General" },
  {
    name: "Feline arrhythmogenic right ventricular cardiomyopathy",
    category: "General",
  },
  { name: "Feline hyperthyroid cardiomyopathy", category: "General" },
  { name: "Feline aortic thromboembolism", category: "General" },
  { name: "Feline cardiomyopathy", category: "General" },
];

const getUniqueSymptoms = (symptoms: SymptomData[]): string[] => {
  const uniqueNames = new Set<string>();
  const unique: string[] = [];

  symptoms.forEach((symptom) => {
    const normalizedName = symptom.name.toLowerCase().trim();
    if (!uniqueNames.has(normalizedName)) {
      uniqueNames.add(normalizedName);
      unique.push(symptom.name);
    }
  });

  return unique.sort();
};

const UNIQUE_SYMPTOMS = getUniqueSymptoms(SYMPTOMS);

const COMMON_SYMPTOMS = [
  "Fever",
  "Lethargy",
  "Vomiting",
  "Sneezing",
  "Coughing",
  "Diarrhea",
  "Loss of appetite",
  "Weight loss",
  "Abdominal Pain",
  "Difficulty breathing",
  "Labored breathing",
  "Excessive thirst",
  "Frequent urination",
  "Limping",
  "Lameness",
  "Skin rash",
  "Hair loss",
  "Itching",
  "Seizures",
  "Bad breath",
];

const API_BASE_URLS = [
  "https://pet-care-apis.onrender.com",
  "https://pet-care-apis-production.up.railway.app",
];

interface PredictionResult {
  predicted_disease: string;
  confidence: number;
  recommendations: string[];
  severity: string;
}

const Symptomchecker = () => {
  const theme = useTheme();
  const params = useLocalSearchParams<{ userId?: string; uid?: string }>();

  const [animalType, setAnimalType] = useState<"Dog" | "Cat">("Dog");
  const [sex, setSex] = useState<"Male" | "Female">("Male");
  const [breed, setBreed] = useState("");
  const [age, setAge] = useState("");
  const [weight, setWeight] = useState("");
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [appetiteLoss, setAppetiteLoss] = useState(false);
  const [vomiting, setVomiting] = useState(false);
  const [diarrhea, setDiarrhea] = useState(false);
  const [coughing, setCoughing] = useState(false);
  const [laboredBreathing, setLaboredBreathing] = useState(false);
  const [bodyTemperature, setBodyTemperature] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showSymptomModal, setShowSymptomModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  const filteredSymptoms = searchQuery
    ? UNIQUE_SYMPTOMS.filter((s) =>
        s.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : COMMON_SYMPTOMS;

  const addSymptom = useCallback(
    (symptom: string) => {
      if (selectedSymptoms.length < 4 && !selectedSymptoms.includes(symptom)) {
        setSelectedSymptoms((prev) => [...prev, symptom]);
      }
      setShowSymptomModal(false);
      setSearchQuery("");
    },
    [selectedSymptoms],
  );

  const removeSymptom = useCallback((symptom: string) => {
    setSelectedSymptoms((prev) => prev.filter((s) => s !== symptom));
  }, []);

  const getUserId = async (): Promise<string | null> => {
    if (params?.userId) return String(params.userId);
    if (params?.uid) return String(params.uid);
    try {
      const storedUid = await AsyncStorage.getItem("userId");
      return storedUid;
    } catch (error) {
      console.error("Error getting user ID in symptomchecker:", error);
      return null;
    }
  };

  const handlePredict = async () => {
    if (!breed.trim()) {
      Alert.alert("Validation Error", "Please enter the breed");
      return;
    }
    if (!age.trim()) {
      Alert.alert("Validation Error", "Please enter the age");
      return;
    }
    if (!weight.trim()) {
      Alert.alert("Validation Error", "Please enter the weight");
      return;
    }
    if (selectedSymptoms.length === 0) {
      Alert.alert("Validation Error", "Please select at least one symptom");
      return;
    }

    const ageNum = parseFloat(age);
    const weightNum = parseFloat(weight);
    
    if (isNaN(ageNum) || ageNum <= 0 || ageNum >= 30) {
      Alert.alert("Validation Error", "Please enter a valid age between 0 and 30 years");
      return;
    }
    
    if (isNaN(weightNum) || weightNum <= 0 || weightNum >= 100) {
      Alert.alert("Validation Error", "Please enter a valid weight between 0 and 100 kg");
      return;
    }

    let bodyTemp = 38.5;
    if (bodyTemperature && bodyTemperature.trim()) {
      bodyTemp = parseFloat(bodyTemperature);
      if (isNaN(bodyTemp) || bodyTemp < 35 || bodyTemp > 43) {
        Alert.alert("Validation Error", "Body temperature must be between 35°C and 43°C, or leave empty for default (38.5°C)");
        return;
      }
    }

    const uid = await getUserId();
    if (!uid) {
      Alert.alert("Error", "User not authenticated. Please log in again.");
      return;
    }

    setIsLoading(true);

    const symptomCount = selectedSymptoms.length;
    const lastSymptom = symptomCount > 0 ? selectedSymptoms[symptomCount - 1] : "None";
    const paddedSymptoms = [
      selectedSymptoms[0] || lastSymptom,
      selectedSymptoms[1] || lastSymptom,
      selectedSymptoms[2] || lastSymptom,
      selectedSymptoms[3] || lastSymptom,
    ];

    const payload = {
      Animal_Type: animalType,
      Sex: sex,
      Breed: breed.trim(),
      Age: ageNum,
      Weight: weightNum,
      Symptom_1: paddedSymptoms[0],
      Symptom_2: paddedSymptoms[1],
      Symptom_3: paddedSymptoms[2],
      Symptom_4: paddedSymptoms[3],
      Appetite_Loss: appetiteLoss ? 1 : 0,
      Vomiting: vomiting ? 1 : 0,
      Diarrhea: diarrhea ? 1 : 0,
      Coughing: coughing ? 1 : 0,
      Labored_Breathing: laboredBreathing ? 1 : 0,
      Body_Temperature_in_Celsius: bodyTemp,
    };

    try {
      let apiSuccess = false;
      let lastError: any = null;

      console.log("Sending payload to API:", JSON.stringify(payload, null, 2));

      for (const apiBaseUrl of API_BASE_URLS) {
        try {
          const endpoint =
            animalType === "Dog"
              ? `${apiBaseUrl}/predict/dog`
              : `${apiBaseUrl}/predict/cat`;

          console.log("Trying API:", endpoint);

          const response = await axios.post(endpoint, payload, {
            headers: { "Content-Type": "application/json" },
            timeout: 30000,
          });

          const apiData = response.data;
          console.log("API Response:", JSON.stringify(apiData, null, 2));

          const rawConfidence = apiData.confidence ?? 0;
          const normalizedConfidence =
            rawConfidence <= 1 ? rawConfidence * 100 : rawConfidence;

          const mappedResult: PredictionResult = {
            predicted_disease: apiData.prediction || apiData.predicted_disease || "Unknown",
            confidence: normalizedConfidence,
            recommendations: apiData.data?.recommendations || [
              "Consult with a veterinarian for proper diagnosis",
              "Monitor your pet's symptoms closely",
              "Keep your pet comfortable and hydrated",
            ],
            severity: apiData.data?.severity || "Unknown",
          };

          setResult(mappedResult);
          setShowResultModal(true);

          try {
            const healthRecordRef = collection(db, "users", uid, "healthRecords");
            await addDoc(healthRecordRef, {
              animalType,
              sex,
              breed: breed.trim(),
              age: ageNum,
              weight: weightNum,
              bodyTemperature: bodyTemp,
              selectedSymptoms,
              flags: {
                appetiteLoss,
                vomiting,
                diarrhea,
                coughing,
                laboredBreathing,
              },
              prediction: mappedResult.predicted_disease,
              confidence: mappedResult.confidence,
              severity: mappedResult.severity,
              recommendations: mappedResult.recommendations,
              source: "symptomchecker",
              createdAt: serverTimestamp(),
            });
          } catch (saveError) {
            console.error("Error saving prediction to health records:", saveError);
          }

          apiSuccess = true;
          break;
        } catch (error: any) {
          lastError = error;
          console.log(`Failed with ${apiBaseUrl}, trying next...`);
          continue;
        }
      }

      if (!apiSuccess) {
        console.error("Prediction error:", lastError);
        
        let errorMessage = "Failed to get prediction. Please try again.";

        if (lastError.response?.data) {
          console.log("Server response data:", JSON.stringify(lastError.response.data, null, 2));
          
          if (lastError.response.status === 422 && lastError.response.data.detail) {
            const validationErrors = lastError.response.data.detail;
            if (Array.isArray(validationErrors) && validationErrors.length > 0) {
              const firstError = validationErrors[0];
              const fieldName = Array.isArray(firstError.loc) ? firstError.loc.slice(-1)[0] : 'field';
              errorMessage = `Validation error: ${fieldName} - ${firstError.msg}`;
            } else if (typeof validationErrors === 'string') {
              errorMessage = `Validation error: ${validationErrors}`;
            }
          } else if (lastError.response.data.message) {
            errorMessage = lastError.response.data.message;
          } else if (lastError.response.data.prediction) {
            errorMessage = `Prediction error: ${lastError.response.data.prediction}`;
          }
        } else if (lastError.code === "ECONNABORTED") {
          errorMessage = "Request timed out. Please check your connection.";
        } else if (lastError.request) {
          errorMessage = "Cannot connect to server. Please check your internet connection.";
        } else if (lastError.message) {
          errorMessage = lastError.message;
        }

        Alert.alert("Error", errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const renderSymptomItem = ({ item }: { item: string }) => (
    <TouchableOpacity
      style={[
        styles.symptomChip,
        selectedSymptoms.includes(item) && styles.selectedSymptomChip,
      ]}
      onPress={() => addSymptom(item)}
      disabled={selectedSymptoms.includes(item) || selectedSymptoms.length >= 4}
    >
      <Text
        style={[
          styles.symptomChipText,
          selectedSymptoms.includes(item) && styles.selectedSymptomChipText,
        ]}
      >
        {item}
      </Text>
    </TouchableOpacity>
  );

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: currentColors.background }]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={[styles.title, { color: currentColors.primary }]}>
            Disease Prediction
          </Text>
          <Text
            style={[styles.subtitle, { color: currentColors.textSecondary }]}
          >
            Enter your pet&apos;s symptoms to get a disease prediction
          </Text>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Animal Type
            </Text>
            <View style={styles.toggleContainer}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  animalType === "Dog" && {
                    backgroundColor: currentColors.primary,
                  },
                ]}
                onPress={() => setAnimalType("Dog")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    animalType === "Dog" && { color: currentColors.white },
                  ]}
                >
                  🐕 Dog
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  animalType === "Cat" && {
                    backgroundColor: currentColors.primary,
                  },
                ]}
                onPress={() => setAnimalType("Cat")}
              >
                <Text
                  style={[
                    styles.toggleText,
                    animalType === "Cat" && { color: currentColors.white },
                  ]}
                >
                  🐱 Cat
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Pet Details
            </Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text
                  style={[styles.label, { color: currentColors.textSecondary }]}
                >
                  Sex
                </Text>
                <View style={styles.sexContainer}>
                  <TouchableOpacity
                    style={[
                      styles.sexButton,
                      sex === "Male" && {
                        backgroundColor: currentColors.primary,
                      },
                    ]}
                    onPress={() => setSex("Male")}
                  >
                    <Text
                      style={[
                        styles.sexText,
                        sex === "Male" && { color: currentColors.white },
                      ]}
                    >
                      Male
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.sexButton,
                      sex === "Female" && {
                        backgroundColor: currentColors.primary,
                      },
                    ]}
                    onPress={() => setSex("Female")}
                  >
                    <Text
                      style={[
                        styles.sexText,
                        sex === "Female" && { color: currentColors.white },
                      ]}
                    >
                      Female
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text
                style={[styles.label, { color: currentColors.textSecondary }]}
              >
                Breed *
              </Text>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: currentColors.text,
                    backgroundColor: "#F1F5F9",
                    borderRadius: BorderRadius.md,
                  },
                ]}
                placeholder="Enter breed"
                placeholderTextColor={currentColors.textTertiary}
                value={breed}
                onChangeText={setBreed}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                <Text
                  style={[styles.label, { color: currentColors.textSecondary }]}
                >
                  Age (years) *
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: currentColors.text,
                      backgroundColor: "#F1F5F9",
                      borderRadius: BorderRadius.md,
                    },
                  ]}
                  placeholder="Enter age"
                  placeholderTextColor={currentColors.textTertiary}
                  value={age}
                  onChangeText={setAge}
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text
                  style={[styles.label, { color: currentColors.textSecondary }]}
                >
                  Weight (kg) *
                </Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: currentColors.text,
                      backgroundColor: "#F1F5F9",
                      borderRadius: BorderRadius.md,
                    },
                  ]}
                  placeholder="Enter weight"
                  placeholderTextColor={currentColors.textTertiary}
                  value={weight}
                  onChangeText={setWeight}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text
                style={[styles.sectionTitle, { color: currentColors.text }]}
              >
                Symptoms *
              </Text>
              <Text
                style={[
                  styles.symptomCount,
                  { color: currentColors.textSecondary },
                ]}
              >
                {selectedSymptoms.length}/4 selected
              </Text>
            </View>

            <View style={styles.selectedSymptoms}>
              {selectedSymptoms.map((symptom, index) => (
                <Chip
                  key={index}
                  style={styles.selectedChip}
                  textStyle={{ color: currentColors.white }}
                  onClose={() => removeSymptom(symptom)}
                >
                  {symptom}
                </Chip>
              ))}
              {selectedSymptoms.length < 4 && (
                <TouchableOpacity
                  style={styles.addSymptomButton}
                  onPress={() => setShowSymptomModal(true)}
                >
                  <Text
                    style={[
                      styles.addSymptomText,
                      { color: currentColors.primary },
                    ]}
                  >
                    + Add Symptom
                  </Text>
                </TouchableOpacity>
              )}
            </View>

            <Text
              style={[
                styles.quickSelectLabel,
                { color: currentColors.textSecondary },
              ]}
            >
              Quick Select:
            </Text>
            <View style={styles.quickSymptoms}>
              {COMMON_SYMPTOMS.slice(0, 10).map((symptom) => (
                <TouchableOpacity
                  key={symptom}
                  style={[
                    styles.quickSymptomChip,
                    selectedSymptoms.includes(symptom) &&
                      styles.selectedQuickSymptomChip,
                  ]}
                  onPress={() => addSymptom(symptom)}
                  disabled={
                    selectedSymptoms.includes(symptom) ||
                    selectedSymptoms.length >= 4
                  }
                >
                  <Text
                    style={[
                      styles.quickSymptomText,
                      selectedSymptoms.includes(symptom) &&
                        styles.selectedQuickSymptomText,
                    ]}
                  >
                    {symptom}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Additional Symptoms
            </Text>

            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: currentColors.text }]}>
                Appetite Loss
              </Text>
              <Switch
                value={appetiteLoss}
                onValueChange={setAppetiteLoss}
                color={currentColors.primary}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: currentColors.text }]}>
                Vomiting
              </Text>
              <Switch
                value={vomiting}
                onValueChange={setVomiting}
                color={currentColors.primary}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: currentColors.text }]}>
                Diarrhea
              </Text>
              <Switch
                value={diarrhea}
                onValueChange={setDiarrhea}
                color={currentColors.primary}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: currentColors.text }]}>
                Coughing
              </Text>
              <Switch
                value={coughing}
                onValueChange={setCoughing}
                color={currentColors.primary}
              />
            </View>
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: currentColors.text }]}>
                Labored Breathing
              </Text>
              <Switch
                value={laboredBreathing}
                onValueChange={setLaboredBreathing}
                color={currentColors.primary}
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: currentColors.text }]}>
              Body Temperature (°C) <Text style={{ fontSize: 12, color: currentColors.textTertiary }}>(Default: 38.5°C)</Text>
            </Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={[
                  styles.textInput,
                  {
                    color: currentColors.text,
                    backgroundColor: "#F1F5F9",
                    borderRadius: BorderRadius.md,
                  },
                ]}
                placeholder="e.g., 38.5 (leave empty for default)"
                placeholderTextColor={currentColors.textTertiary}
                value={bodyTemperature}
                onChangeText={setBodyTemperature}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Button
            mode="contained"
            onPress={handlePredict}
            loading={isLoading}
            disabled={isLoading}
            style={styles.predictButton}
            contentStyle={styles.predictButtonContent}
            labelStyle={styles.predictButtonLabel}
          >
            {isLoading ? "Analyzing..." : "Get Prediction"}
          </Button>

          <View style={{ height: 40 }} />
        </ScrollView>
      </TouchableWithoutFeedback>

      <Modal
        visible={showSymptomModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowSymptomModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: currentColors.surface },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: currentColors.text }]}>
                Select Symptom
              </Text>
              <TouchableOpacity onPress={() => setShowSymptomModal(false)}>
                <Text
                  style={[styles.modalClose, { color: currentColors.primary }]}
                >
                  ✕
                </Text>
              </TouchableOpacity>
            </View>

            <Searchbar
              placeholder="Search symptoms..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              style={styles.searchBar}
            />

            <FlatList
              data={filteredSymptoms}
              renderItem={renderSymptomItem}
              keyExtractor={(item) => item}
              numColumns={2}
              contentContainerStyle={styles.symptomList}
              showsVerticalScrollIndicator={false}
            />
          </View>
        </View>
      </Modal>

      <Modal
        visible={showResultModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowResultModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.resultModalContent,
              { backgroundColor: currentColors.surface },
            ]}
          >
            {result && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.resultHeader}>
                  <Text
                    style={[
                      styles.resultTitle,
                      { color: currentColors.primary },
                    ]}
                  >
                    Prediction Result
                  </Text>
                </View>

                <View style={styles.resultSection}>
                  <Text
                    style={[
                      styles.resultLabel,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    Predicted Disease
                  </Text>
                  <Text
                    style={[styles.resultValue, { color: currentColors.text }]}
                  >
                    {result.predicted_disease}
                  </Text>
                </View>

                <View style={styles.resultSection}>
                  <Text
                    style={[
                      styles.resultLabel,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    Confidence
                  </Text>
                  <View style={styles.confidenceContainer}>
                    <View
                      style={[
                        styles.confidenceBar,
                        { backgroundColor: currentColors.surfaceVariant },
                      ]}
                    >
                      <View
                        style={[
                          styles.confidenceFill,
                          {
                            width: `${result.confidence}%`,
                            backgroundColor:
                              result.confidence > 70
                                ? currentColors.success
                                : result.confidence > 40
                                  ? currentColors.warning
                                  : currentColors.error,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[
                        styles.confidenceText,
                        { color: currentColors.text },
                      ]}
                    >
                      {result.confidence.toFixed(1)}%
                    </Text>
                  </View>
                </View>

                <View style={styles.resultSection}>
                  <Text
                    style={[
                      styles.resultLabel,
                      { color: currentColors.textSecondary },
                    ]}
                  >
                    Severity
                  </Text>
                  <Chip
                    style={[
                      styles.severityChip,
                      {
                        backgroundColor:
                          result.severity === "High"
                            ? "#FEE2E2"
                            : result.severity === "Medium"
                              ? "#FEF3C7"
                              : "#D1FAE5",
                      },
                    ]}
                    textStyle={{
                      color:
                        result.severity === "High"
                          ? "#DC2626"
                          : result.severity === "Medium"
                            ? "#D97706"
                            : "#059669",
                    }}
                  >
                    {result.severity}
                  </Chip>
                </View>

                {result.recommendations &&
                  result.recommendations.length > 0 && (
                    <View style={styles.resultSection}>
                      <Text
                        style={[
                          styles.resultLabel,
                          { color: currentColors.textSecondary },
                        ]}
                      >
                        Recommendations
                      </Text>
                      {result.recommendations.map((rec, index) => (
                        <View key={index} style={styles.recommendationItem}>
                          <Text
                            style={[
                              styles.recommendationBullet,
                              { color: currentColors.primary },
                            ]}
                          >
                            •
                          </Text>
                          <Text
                            style={[
                              styles.recommendationText,
                              { color: currentColors.text },
                            ]}
                          >
                            {rec}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                <View style={styles.disclaimerSection}>
                  <Text
                    style={[
                      styles.disclaimer,
                      { color: currentColors.textTertiary },
                    ]}
                  >
                    ⚠️ This is an AI-based prediction and should not replace
                    professional veterinary advice. Please consult a
                    veterinarian for accurate diagnosis.
                  </Text>
                </View>

                <Button
                  mode="contained"
                  onPress={() => setShowResultModal(false)}
                  style={styles.closeButton}
                >
                  Close
                </Button>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      <View style={styles.bottomNavContainer}>
        <BottomNavigationBar />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  title: {
    fontSize: FontSize.xxl,
    fontWeight: FontWeight.bold,
    textAlign: "center",
    marginTop: Spacing.md,
  },
  subtitle: {
    fontSize: FontSize.md,
    textAlign: "center",
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  section: {
    marginBottom: Spacing.lg,
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
    marginBottom: Spacing.sm,
  },
  symptomCount: {
    fontSize: FontSize.sm,
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  toggleButton: {
    flex: 1,
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    backgroundColor: "#F1F5F9",
    marginHorizontal: 4,
    alignItems: "center",
  },
  toggleText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
  },
  row: {
    flexDirection: "row",
  },
  inputGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    backgroundColor: "#F1F5F9",
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
  },
  input: {
    fontSize: FontSize.md,
  },
  textInput: {
    padding: Spacing.md,
    fontSize: FontSize.md,
  },
  sexContainer: {
    flexDirection: "row",
  },
  sexButton: {
    flex: 1,
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    backgroundColor: "#F1F5F9",
    marginRight: 8,
    alignItems: "center",
  },
  sexText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.medium,
  },
  selectedSymptoms: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: Spacing.md,
  },
  selectedChip: {
    backgroundColor: "#3B82F6",
    marginRight: 8,
    marginBottom: 8,
  },
  addSymptomButton: {
    padding: Spacing.sm,
    borderWidth: 1,
    borderColor: "#3B82F6",
    borderRadius: BorderRadius.md,
    borderStyle: "dashed",
  },
  addSymptomText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
  },
  quickSelectLabel: {
    fontSize: FontSize.sm,
    marginBottom: Spacing.xs,
  },
  quickSymptoms: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  quickSymptomChip: {
    backgroundColor: "#F1F5F9",
    paddingVertical: Spacing.xs,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.full,
    marginRight: 8,
    marginBottom: 8,
  },
  selectedQuickSymptomChip: {
    backgroundColor: "#3B82F6",
  },
  quickSymptomText: {
    fontSize: FontSize.xs,
    color: "#64748B",
  },
  selectedQuickSymptomText: {
    color: "#FFFFFF",
  },
  symptomChip: {
    backgroundColor: "#F1F5F9",
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    margin: 4,
    flex: 1,
    minWidth: "45%",
    alignItems: "center",
  },
  selectedSymptomChip: {
    backgroundColor: "#3B82F6",
  },
  symptomChipText: {
    fontSize: FontSize.sm,
    color: "#64748B",
    textAlign: "center",
  },
  selectedSymptomChipText: {
    color: "#FFFFFF",
  },
  switchRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: "#E2E8F0",
  },
  switchLabel: {
    fontSize: FontSize.md,
  },
  predictButton: {
    marginTop: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  predictButtonContent: {
    paddingVertical: Spacing.sm,
  },
  predictButtonLabel: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    maxHeight: "80%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  modalTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  modalClose: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  searchBar: {
    marginBottom: Spacing.md,
  },
  symptomList: {
    paddingBottom: Spacing.lg,
  },
  resultModalContent: {
    maxHeight: "85%",
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
  },
  resultHeader: {
    alignItems: "center",
    marginBottom: Spacing.lg,
  },
  resultTitle: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  resultSection: {
    marginBottom: Spacing.lg,
  },
  resultLabel: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    marginBottom: Spacing.xs,
  },
  resultValue: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.bold,
  },
  confidenceContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  confidenceBar: {
    flex: 1,
    height: 12,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
    overflow: "hidden",
  },
  confidenceFill: {
    height: "100%",
    borderRadius: BorderRadius.full,
  },
  confidenceText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    minWidth: 50,
    textAlign: "right",
  },
  severityChip: {
    alignSelf: "flex-start",
  },
  recommendationItem: {
    flexDirection: "row",
    marginBottom: Spacing.xs,
  },
  recommendationBullet: {
    fontSize: FontSize.md,
    marginRight: Spacing.xs,
  },
  recommendationText: {
    flex: 1,
    fontSize: FontSize.md,
  },
  disclaimerSection: {
    backgroundColor: "#FEF3C7",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  disclaimer: {
    fontSize: FontSize.xs,
    textAlign: "center",
    lineHeight: 18,
  },
  closeButton: {
    marginBottom: Spacing.lg,
  },
  bottomNavContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
});

export default Symptomchecker;
