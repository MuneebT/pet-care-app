export type MedicineAttributes = {
  Vet_Visit_Required: string;
  Treatment_Duration_Days: string;
  Dosage_Frequency: string;
  Route_of_Administration: string;
  Side_Effects: string;
};

export type MedicineInfo = {
  disease: string;
  medicine: string;
  medicineClass?: string;
  attributes?: MedicineAttributes;
};

// Key format: `${disease}|||${medicine}`
export const medicineAttributes: Record<string, MedicineAttributes> = {
  // Gastrointestinal Disease
  "Gastrointestinal Disease|||Sucralfate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "2-3 times daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Constipation, nausea",
  },
  "Gastrointestinal Disease|||Ondansetron": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Constipation, diarrhea, lethargy",
  },
  "Gastrointestinal Disease|||Metronidazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, anorexia, neurotoxicity (high doses)",
  },
  "Gastrointestinal Disease|||Famotidine": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Rare; headache, dizziness possible",
  },
  "Gastrointestinal Disease|||Amoxicillin-Clavulanate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-10 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, appetite loss",
  },
  "Gastrointestinal Disease|||Probiotics (FortiFlora, Proviable)": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "10-30 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Mild GI upset initially",
  },
  "Gastrointestinal Disease|||Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-14 days (tapered)",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Increased thirst/urination, panting, immunosuppression",
  },
  "Gastrointestinal Disease|||Famotidine (Pepcid)": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Rare; headache, dizziness possible",
  },
  "Gastrointestinal Disease|||Maropitant (Cerenia)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Drooling, lethargy, injection site pain",
  },
  "Gastrointestinal Disease|||Omeprazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-28 days",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, decreased appetite",
  },
  "Gastrointestinal Disease|||Tylosin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, lethargy",
  },

  // Arthritis
  "Arthritis|||Gabapentin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Sedation, ataxia, lethargy",
  },
  "Arthritis|||Glucosamine + Chondroitin": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Mild GI upset, diarrhea",
  },
  "Arthritis|||Meloxicam (Metacam)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "GI ulcers, kidney/liver issues, vomiting",
  },
  "Arthritis|||Omega-3 fish oil": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Fishy breath, loose stools",
  },
  "Arthritis|||Adequan (Polysulfated glycosaminoglycan)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "4-6 weeks initial",
    Dosage_Frequency: "Twice weekly injections",
    Route_of_Administration: "Injection",
    Side_Effects: "Injection site pain, bleeding disorders risk",
  },
  "Arthritis|||Buprenorphine": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Sedation, constipation, respiratory depression",
  },
  "Arthritis|||Robenacoxib (Onsior)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Vomiting, diarrhea, appetite loss",
  },

  // Hyperthyroidism
  "Hyperthyroidism|||Methimazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, anorexia, itching, liver issues",
  },
  "Hyperthyroidism|||Radioactive Iodine (I-131)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "One-time treatment",
    Dosage_Frequency: "Single dose",
    Route_of_Administration: "Injection",
    Side_Effects: "Temporary swelling at injection site, isolation required",
  },
  "Hyperthyroidism|||Carbimazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, appetite loss, lethargy",
  },
  "Hyperthyroidism|||Atenolol": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Lethargy, low heart rate, weakness",
  },

  // Feline Leukemia Virus
  "Feline Leukemia Virus|||Interferon omega": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days per cycle",
    Dosage_Frequency: "Once daily for 3-5 days",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Mild fever, lethargy",
  },
  "Feline Leukemia Virus|||Chemotherapy (Vincristine, Cyclophosphamide)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As prescribed",
    Dosage_Frequency: "Weekly or bi-weekly",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Bone marrow suppression, GI upset, hair loss",
  },
  "Feline Leukemia Virus|||Antibiotics (Doxycycline, Clavamox)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, appetite loss",
  },
  "Feline Leukemia Virus|||Erythropoietin/Darbepoetin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Weekly to monthly",
    Route_of_Administration: "Injection",
    Side_Effects: "Rare; fever, joint pain",
  },
  "Feline Leukemia Virus|||Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, immunosuppression",
  },

  // Canine Parvovirus
  "Canine Parvovirus|||IV Fluids + Electrolytes": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Continuous",
    Route_of_Administration: "IV",
    Side_Effects: "Fluid overload, electrolyte imbalances",
  },
  "Canine Parvovirus|||Maropitant (Cerenia)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Drooling, lethargy",
  },
  "Canine Parvovirus|||Plasma transfusion": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "One-time",
    Dosage_Frequency: "Single transfusion",
    Route_of_Administration: "IV",
    Side_Effects: "Allergic reactions, fever, infection risk",
  },
  "Canine Parvovirus|||Ondansetron": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Constipation, mild GI upset",
  },
  "Canine Parvovirus|||Metronidazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Vomiting, neurotoxicity at high doses",
  },
  "Canine Parvovirus|||Cefazolin / Ceftriaxone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Injection",
    Side_Effects: "Allergic reactions, GI upset",
  },
  "Canine Parvovirus|||Ampicillin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Vomiting, diarrhea, allergic reactions",
  },

  // Respiratory Disease
  "Respiratory Disease|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "10-21 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting, diarrhea",
  },
  "Respiratory Disease|||Enrofloxacin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Vomiting, appetite loss, cartilage issues in young animals",
  },
  "Respiratory Disease|||Azithromycin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, vomiting, diarrhea",
  },
  "Respiratory Disease|||Prednisone / Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-14 days (tapered)",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, panting, immunosuppression",
  },
  "Respiratory Disease|||Amoxicillin-Clavulanate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, appetite loss",
  },
  "Respiratory Disease|||Theophylline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Restlessness, vomiting, increased heart rate",
  },
  "Respiratory Disease|||Enrofloxacin (Baytril)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Vomiting, appetite loss, retinal damage in cats",
  },
  "Respiratory Disease|||Terbutaline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Tremors, increased heart rate, restlessness",
  },
  "Respiratory Disease|||Nebulization saline": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "2-3 times daily",
    Route_of_Administration: "Inhalation",
    Side_Effects: "Minimal; may cause mild coughing",
  },
  "Respiratory Disease|||Nebulized Saline": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "2-3 times daily",
    Route_of_Administration: "Inhalation",
    Side_Effects: "Minimal",
  },

  // Feline Asthma
  "Feline Asthma|||Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, weight gain, diabetes risk",
  },
  "Feline Asthma|||Fluticasone inhaler": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Inhalation",
    Side_Effects: "Minimal systemic effects; coughing with inhaler use",
  },
  "Feline Asthma|||Albuterol (Salbutamol)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "As needed for rescue",
    Route_of_Administration: "Inhalation",
    Side_Effects: "Increased heart rate, restlessness, tremors",
  },
  "Feline Asthma|||Theophylline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Restlessness, vomiting, increased heart rate",
  },
  "Feline Asthma|||Terbutaline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Tremors, increased heart rate",
  },

  // Feline Calicivirus
  "Feline Calicivirus|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "10-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting, diarrhea",
  },
  "Feline Calicivirus|||Fluids": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "As needed",
    Route_of_Administration: "Subcutaneous/IV",
    Side_Effects: "Fluid overload if excessive",
  },
  "Feline Calicivirus|||Nebulization": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "2-3 times daily",
    Route_of_Administration: "Inhalation",
    Side_Effects: "Minimal",
  },
  "Feline Calicivirus|||Meloxicam": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, kidney issues",
  },
  "Feline Calicivirus|||Amoxicillin-Clavulanate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-10 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Feline Calicivirus|||Buprenorphine": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Sedation, euphoria",
  },

  // Feline Herpesvirus
  "Feline Herpesvirus|||Cidofovir eye drops": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "2-3 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Eye irritation, conjunctival hyperemia",
  },
  "Feline Herpesvirus|||Terramycin eye ointment": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "2-4 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Mild eye irritation",
  },
  "Feline Herpesvirus|||Artificial tears": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "As needed",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Minimal",
  },
  "Feline Herpesvirus|||Famciclovir": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-21 days",
    Dosage_Frequency: "2-3 times daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, lethargy",
  },
  "Feline Herpesvirus|||Lysine": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Minimal; mild GI upset",
  },

  // Canine Leptospirosis
  "Canine Leptospirosis|||IV Fluids": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Continuous",
    Route_of_Administration: "IV",
    Side_Effects: "Fluid overload, electrolyte imbalances",
  },
  "Canine Leptospirosis|||Amoxicillin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "10-14 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Canine Leptospirosis|||Ampicillin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "10-14 days",
    Dosage_Frequency: "Every 6-8 hours",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Vomiting, diarrhea, allergic reactions",
  },
  "Canine Leptospirosis|||Penicillin G": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "10-14 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Injection",
    Side_Effects: "Allergic reactions, injection site pain",
  },
  "Canine Leptospirosis|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },

  // Feline Chlamydiosis
  "Feline Chlamydiosis|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal strictures, vomiting",
  },
  "Feline Chlamydiosis|||Erythromycin eye ointment": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "3-4 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Eye irritation, stinging",
  },
  "Feline Chlamydiosis|||Azithromycin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, vomiting",
  },
  "Feline Chlamydiosis|||Terramycin ophthalmic": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "3-4 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Mild eye irritation",
  },

  // Fungal Infection
  "Fungal Infection|||Terbinafine": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, elevated liver enzymes",
  },
  "Fungal Infection|||Ketoconazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, liver toxicity, anorexia",
  },
  "Fungal Infection|||Amphotericin B": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As prescribed",
    Dosage_Frequency: "Weekly",
    Route_of_Administration: "IV",
    Side_Effects: "Nephrotoxicity, fever, vomiting",
  },
  "Fungal Infection|||Itraconazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "21-60 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Liver toxicity, GI upset, anorexia",
  },
  "Fungal Infection|||Fluconazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Liver toxicity, nausea",
  },

  // Skin Condition
  "Skin Condition|||Terbinafine": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, elevated liver enzymes",
  },
  "Skin Condition|||Prednisone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days (tapered)",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, panting, immunosuppression",
  },
  "Skin Condition|||Cephalexin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, appetite loss",
  },
  "Skin Condition|||Ketoconazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral/Topical",
    Side_Effects: "Vomiting, liver toxicity",
  },
  "Skin Condition|||Lime sulfur dip": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Weekly for 4-8 weeks",
    Dosage_Frequency: "Once weekly",
    Route_of_Administration: "Topical",
    Side_Effects: "Staining, foul smell, irritation",
  },
  "Skin Condition|||Dexamethasone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Increased thirst/urination, panting, immunosuppression",
  },
  "Skin Condition|||Clindamycin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-21 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Skin Condition|||Apoquel (Oclacitinib)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours initially",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, demodicosis risk",
  },
  "Skin Condition|||Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, panting",
  },
  "Skin Condition|||Chlorhexidine shampoo": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "2-3 times weekly",
    Route_of_Administration: "Topical",
    Side_Effects: "Dry skin, irritation",
  },
  "Skin Condition|||Itraconazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Liver toxicity, GI upset",
  },
  "Skin Condition|||Cytopoint (Lokivetmab)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Monthly",
    Dosage_Frequency: "Every 4-8 weeks",
    Route_of_Administration: "Injection",
    Side_Effects: "Lethargy, vomiting, injection site reaction",
  },
  "Skin Condition|||Selamectin (Revolution)": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Monthly",
    Dosage_Frequency: "Once monthly",
    Route_of_Administration: "Topical",
    Side_Effects: "Hair loss at site, irritation",
  },
  "Skin Condition|||Antihistamines (Chlorpheniramine, Cetirizine)": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Sedation, dry mouth",
  },
  "Skin Condition|||Ivermectin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As prescribed",
    Dosage_Frequency: "Variable",
    Route_of_Administration: "Oral/Topical",
    Side_Effects: "Neurotoxicity in sensitive breeds",
  },
  "Skin Condition|||Fipronil": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Monthly",
    Dosage_Frequency: "Once monthly",
    Route_of_Administration: "Topical",
    Side_Effects: "Skin irritation, drooling if ingested",
  },

  // Chronic Illness
  "Chronic Illness|||Benazepril / Enalapril": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Low blood pressure, kidney function changes",
  },
  "Chronic Illness|||Furosemide": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Dehydration, electrolyte imbalances",
  },
  "Chronic Illness|||Carprofen / Meloxicam": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI ulcers, liver/kidney issues",
  },
  "Chronic Illness|||Insulin (Glargine/Lantus, PZI)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Injection",
    Side_Effects: "Hypoglycemia, injection site reactions",
  },
  "Chronic Illness|||Amlodipine": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Low blood pressure, lethargy",
  },
  "Chronic Illness|||Gabapentin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Sedation, ataxia",
  },
  "Chronic Illness|||Erythropoietin/Darbepoetin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Weekly to monthly",
    Route_of_Administration: "Injection",
    Side_Effects: "Rare; fever, joint pain",
  },
  "Chronic Illness|||Tramadol": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Sedation, constipation, vomiting",
  },
  "Chronic Illness|||Denamarin (SAMe + Silybin)": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Mild GI upset",
  },
  "Chronic Illness|||Prednisone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, panting, immunosuppression",
  },
  "Chronic Illness|||Benazepril": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Low blood pressure, kidney function changes",
  },

  // Feline Renal Disease
  "Feline Renal Disease|||Benazepril": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Low blood pressure, kidney function changes",
  },
  "Feline Renal Disease|||Potassium gluconate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset if high dose",
  },
  "Feline Renal Disease|||Subcutaneous fluids": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Daily to weekly",
    Route_of_Administration: "Subcutaneous",
    Side_Effects: "Fluid pocket under skin, infection risk",
  },
  "Feline Renal Disease|||Famotidine / Omeprazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Minimal",
  },
  "Feline Renal Disease|||Telmisartan": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Feline Renal Disease|||Maropitant": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Lethargy, drooling",
  },
  "Feline Renal Disease|||Amlodipine": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Low blood pressure, lethargy",
  },
  "Feline Renal Disease|||Phosphate binders (Aluminum hydroxide, Sevelamer)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "With meals",
    Route_of_Administration: "Oral",
    Side_Effects: "Constipation",
  },
  "Feline Renal Disease|||Darbepoetin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Weekly to monthly",
    Route_of_Administration: "Injection",
    Side_Effects: "Rare; fever, joint pain",
  },

  // Tick-Borne Disease
  "Tick-Borne Disease|||Imidocarb dipropionate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "One-time or repeat in 2 weeks",
    Dosage_Frequency: "Once or twice",
    Route_of_Administration: "Injection",
    Side_Effects: "Pain at injection site, salivation, diarrhea",
  },
  "Tick-Borne Disease|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },
  "Tick-Borne Disease|||Prednisone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-14 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, panting",
  },

  // Feline Immunodeficiency Virus
  "Feline Immunodeficiency Virus|||Antibiotics (Clavamox, Doxycycline)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Feline Immunodeficiency Virus|||Antifungals (Itraconazole, Fluconazole)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Liver toxicity, GI upset",
  },
  "Feline Immunodeficiency Virus|||Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As prescribed",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, immunosuppression",
  },
  "Feline Immunodeficiency Virus|||Interferon omega": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days per cycle",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Mild fever, lethargy",
  },

  // Kennel Cough
  "Kennel Cough|||Hydrocodone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Sedation, constipation",
  },
  "Kennel Cough|||Amoxicillin-Clavulanate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-10 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Kennel Cough|||Butorphanol": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Sedation, anorexia",
  },
  "Kennel Cough|||Azithromycin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset",
  },
  "Kennel Cough|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },
  "Kennel Cough|||Theophylline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Restlessness, vomiting",
  },

  // Canine Distemper
  "Canine Distemper|||Diazepam": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Sedation, ataxia, paradoxical excitement",
  },
  "Canine Distemper|||Phenobarbital": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Sedation, ataxia, increased thirst/urination",
  },
  "Canine Distemper|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },
  "Canine Distemper|||Amoxicillin-Clavulanate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-10 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Canine Distemper|||IV Fluids + Vitamins": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Continuous",
    Route_of_Administration: "IV",
    Side_Effects: "Fluid overload",
  },
  "Canine Distemper|||Prednisone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, panting",
  },

  // Feline Panleukopenia
  "Feline Panleukopenia|||Vitamin B complex": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Injection",
    Side_Effects: "Rare; mild allergic reactions",
  },
  "Feline Panleukopenia|||IV Fluids (Lactated Ringer's, saline)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Continuous",
    Route_of_Administration: "IV",
    Side_Effects: "Fluid overload",
  },
  "Feline Panleukopenia|||Metronidazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Vomiting, neurotoxicity",
  },
  "Feline Panleukopenia|||Ondansetron": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Constipation",
  },
  "Feline Panleukopenia|||Maropitant": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Injection",
    Side_Effects: "Lethargy, drooling",
  },
  "Feline Panleukopenia|||Plasma transfusion": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "One-time",
    Dosage_Frequency: "Single transfusion",
    Route_of_Administration: "IV",
    Side_Effects: "Allergic reactions, fever",
  },
  "Feline Panleukopenia|||Ampicillin / Cefazolin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Injection",
    Side_Effects: "Allergic reactions",
  },

  // Canine Heartworm Disease
  "Canine Heartworm Disease|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "28-30 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },
  "Canine Heartworm Disease|||Melarsomine (Immiticide)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "One-time or series",
    Dosage_Frequency: "Single or multiple injections",
    Route_of_Administration: "Injection",
    Side_Effects: "Injection site pain, lung inflammation",
  },
  "Canine Heartworm Disease|||Prednisone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "During treatment",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination",
  },
  "Canine Heartworm Disease|||Ivermectin / Milbemycin oxime": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Monthly",
    Dosage_Frequency: "Once monthly",
    Route_of_Administration: "Oral",
    Side_Effects: "Minimal at preventive doses",
  },

  // Ringworm
  "Ringworm|||Griseofulvin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "21-60 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, teratogenic",
  },
  "Ringworm|||Terbinafine": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, elevated liver enzymes",
  },
  "Ringworm|||Miconazole shampoo": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Weekly for 4-8 weeks",
    Dosage_Frequency: "1-2 times weekly",
    Route_of_Administration: "Topical",
    Side_Effects: "Skin irritation",
  },
  "Ringworm|||Itraconazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Liver toxicity, GI upset",
  },
  "Ringworm|||Lime sulfur dip": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Weekly for 4-8 weeks",
    Dosage_Frequency: "Once weekly",
    Route_of_Administration: "Topical",
    Side_Effects: "Staining, foul smell, irritation",
  },

  // Lyme Disease
  "Lyme Disease|||Carprofen / Meloxicam": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, kidney/liver issues",
  },
  "Lyme Disease|||Amoxicillin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-21 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Lyme Disease|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },
  "Lyme Disease|||Cefuroxime": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-21 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, diarrhea",
  },

  // Feline Infectious Peritonitis
  "Feline Infectious Peritonitis|||Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, immunosuppression",
  },
  "Feline Infectious Peritonitis|||Appetite stimulants (Mirtazapine)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 48-72 hours",
    Route_of_Administration: "Oral/Topical",
    Side_Effects: "Vocalization, hyperactivity",
  },
  "Feline Infectious Peritonitis|||Interferon omega": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days per cycle",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Mild fever, lethargy",
  },
  "Feline Infectious Peritonitis|||GS-441524": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "84 days",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Injection site pain, kidney values increase",
  },
  "Feline Infectious Peritonitis|||Remdesivir": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As prescribed",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Injection",
    Side_Effects: "Liver enzyme elevation",
  },

  // Inflammatory Bowel Disease
  "Inflammatory Bowel Disease|||Prednisone / Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, immunosuppression",
  },
  "Inflammatory Bowel Disease|||Metronidazole": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, neurotoxicity",
  },
  "Inflammatory Bowel Disease|||Cyclosporine": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea, gum overgrowth",
  },
  "Inflammatory Bowel Disease|||Budesonide": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Minimal systemic effects",
  },
  "Inflammatory Bowel Disease|||Probiotics": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Mild GI upset",
  },
  "Inflammatory Bowel Disease|||Tylosin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "14-28 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset",
  },

  // Reproductive Disorder
  "Reproductive Disorder|||Amoxicillin-Clavulanate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Reproductive Disorder|||Enrofloxacin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Vomiting, appetite loss",
  },
  "Reproductive Disorder|||Oxytocin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "1-3 days",
    Dosage_Frequency: "As needed",
    Route_of_Administration: "Injection",
    Side_Effects: "Uterine rupture if overused",
  },
  "Reproductive Disorder|||Cloprostenol": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "1-2 doses",
    Dosage_Frequency: "Single or double dose",
    Route_of_Administration: "Injection",
    Side_Effects: "Panting, vomiting, diarrhea",
  },
  "Reproductive Disorder|||Pain meds (Buprenorphine)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Sedation, constipation",
  },
  "Reproductive Disorder|||Alizin (Aglepristone)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "2 doses",
    Dosage_Frequency: "24 hours apart",
    Route_of_Administration: "Injection",
    Side_Effects: "Injection site pain, transient lethargy",
  },
  "Reproductive Disorder|||Cabergoline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "5-7 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, anorexia",
  },

  // Bordetella Infection
  "Bordetella Infection|||Azithromycin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Every 24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset",
  },
  "Bordetella Infection|||Enrofloxacin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, appetite loss",
  },
  "Bordetella Infection|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },
  "Bordetella Infection|||Nebulization therapy": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "2-3 times daily",
    Route_of_Administration: "Inhalation",
    Side_Effects: "Minimal",
  },

  // Chronic Bronchitis
  "Chronic Bronchitis|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "10-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },
  "Chronic Bronchitis|||Hydrocodone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Sedation, constipation",
  },
  "Chronic Bronchitis|||Theophylline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Restlessness, vomiting",
  },
  "Chronic Bronchitis|||Prednisone / Prednisolone": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Increased thirst/urination, panting",
  },
  "Chronic Bronchitis|||Terbutaline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "Every 8-12 hours",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Tremors, increased heart rate",
  },
  "Chronic Bronchitis|||Albuterol (inhaler)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "As needed",
    Route_of_Administration: "Inhalation",
    Side_Effects: "Tremors, increased heart rate",
  },

  // Conjunctivitis
  "Conjunctivitis|||Tobramycin drops": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "3-4 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Eye irritation",
  },
  "Conjunctivitis|||Artificial tears": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "As needed",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Minimal",
  },
  "Conjunctivitis|||Prednisolone eye drops": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "2-4 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Increased intraocular pressure, corneal ulcers risk",
  },
  "Conjunctivitis|||Erythromycin ointment": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "3-4 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Mild eye irritation",
  },
  "Conjunctivitis|||Cidofovir drops": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "2-3 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Eye irritation",
  },
  "Conjunctivitis|||Terramycin (Oxytetracycline + Polymyxin B)": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "3-4 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Mild eye irritation",
  },
  "Conjunctivitis|||Chloramphenicol drops": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "3-4 times daily",
    Route_of_Administration: "Topical (eye)",
    Side_Effects: "Rare; bone marrow suppression in humans",
  },

  // Infectious Canine Hepatitis
  "Infectious Canine Hepatitis|||Vitamin K1": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Every 12-24 hours",
    Route_of_Administration: "Injection/Oral",
    Side_Effects: "Rare; injection site reaction",
  },
  "Infectious Canine Hepatitis|||Enrofloxacin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Vomiting, appetite loss",
  },
  "Infectious Canine Hepatitis|||Amoxicillin-Clavulanate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Infectious Canine Hepatitis|||S-Adenosylmethionine (SAMe)": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Mild GI upset",
  },
  "Infectious Canine Hepatitis|||Silymarin / Milk Thistle": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Mild GI upset",
  },
  "Infectious Canine Hepatitis|||IV Fluids": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Continuous",
    Route_of_Administration: "IV",
    Side_Effects: "Fluid overload",
  },

  // Canine Influenza
  "Canine Influenza|||Amoxicillin-Clavulanate": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-10 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Vomiting, diarrhea",
  },
  "Canine Influenza|||Enrofloxacin": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral/Injection",
    Side_Effects: "Vomiting, appetite loss",
  },
  "Canine Influenza|||NSAIDs (Carprofen, Meloxicam)": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-5 days",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "GI upset, kidney/liver issues",
  },
  "Canine Influenza|||IV Fluids": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "3-7 days",
    Dosage_Frequency: "Continuous",
    Route_of_Administration: "IV",
    Side_Effects: "Fluid overload",
  },
  "Canine Influenza|||Doxycycline": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "7-14 days",
    Dosage_Frequency: "Every 12 hours",
    Route_of_Administration: "Oral",
    Side_Effects: "Esophageal irritation, vomiting",
  },

  // Feline Coronavirus
  "Feline Coronavirus|||Fluids": {
    Vet_Visit_Required: "Yes",
    Treatment_Duration_Days: "As needed",
    Dosage_Frequency: "As needed",
    Route_of_Administration: "Subcutaneous/IV",
    Side_Effects: "Fluid overload",
  },
  "Feline Coronavirus|||Probiotics": {
    Vet_Visit_Required: "No",
    Treatment_Duration_Days: "Ongoing",
    Dosage_Frequency: "Once daily",
    Route_of_Administration: "Oral",
    Side_Effects: "Mild GI upset",
  },
};

export const originalTuples: MedicineInfo[] = [
  ["Gastrointestinal Disease", "Sucralfate", "Gastroprotectant / Ulcer coating agent"],
  ["Gastrointestinal Disease", "Ondansetron", "Antiemetic / 5-HT3 antagonist"],
  ["Gastrointestinal Disease", "Ondansetron", "Antiemetic (5-HT3 receptor antagonist)"],
  ["Arthritis", "Gabapentin", "Neuropathic pain medication"],
  ["Hyperthyroidism", "Methimazole", "Antithyroid drug (thyroid hormone synthesis inhibitor)"],
  ["Feline Leukemia Virus", "Interferon omega", "Immunomodulator"],
  ["Canine Parvovirus", "IV Fluids + Electrolytes", "Supportive care"],
  ["Respiratory Disease", "Doxycycline", "Antibiotic (Tetracycline class)"],
  ["Gastrointestinal Disease", "Metronidazole", "Antibiotic + Antiprotozoal (Nitroimidazole)"],
  ["Canine Parvovirus", "Maropitant (Cerenia)", "Antiemetic / NK1 blocker"],
  ["Feline Asthma", "Prednisolone", "Systemic corticosteroid"],
  ["Feline Calicivirus", "Doxycycline", "Antibiotic (secondary infection control)"],
  ["Feline Herpesvirus", "Cidofovir eye drops", "Antiviral (DNA polymerase inhibitor)"],
  ["Gastrointestinal Disease", "Famotidine", "H2 Blocker"],
  ["Feline Asthma", "Fluticasone inhaler", "Corticosteroid (inhaled anti-inflammatory)"],
  ["Canine Leptospirosis", "IV Fluids", "Supportive therapy"],
  ["Feline Calicivirus", "Fluids", "Supportive therapy"],
  ["Gastrointestinal Disease", "Amoxicillin-Clavulanate", "Beta-lactam antibiotic"],
  ["Feline Chlamydiosis", "Doxycycline", "Antibiotic (Tetracycline)"],
  ["Fungal Infection", "Terbinafine", "Allylamine antifungal"],
  ["Gastrointestinal Disease", "Probiotics (FortiFlora, Proviable)", "GI microbiome support"],
  ["Skin Condition", "Terbinafine", "Antifungal (allylamine)"],
  ["Respiratory Disease", "Enrofloxacin", "Fluoroquinolone antibiotic"],
  ["Chronic Illness", "Benazepril / Enalapril", "ACE inhibitor"],
  ["Respiratory Disease", "Azithromycin", "Antibiotic (Macrolide)"],
  ["Gastrointestinal Disease", "Prednisolone", "Corticosteroid (anti-inflammatory / immunosuppressive)"],
  ["Feline Infectious Peritonitis", "Prednisolone", "Corticosteroid (inflammation control)"],
  ["Feline Renal Disease", "Benazepril", "ACE inhibitor"],
  ["Gastrointestinal Disease", "Famotidine (Pepcid)", "H2 blocker (acid reducer)"],
  ["Respiratory Disease", "Prednisone / Prednisolone", "Corticosteroid anti-inflammatory"],
  ["Tick-Borne Disease", "Imidocarb dipropionate", "Antiprotozoal antiparasitic"],
  ["Canine Leptospirosis", "Amoxicillin", "Beta-lactam antibiotic"],
  ["Respiratory Disease", "Doxycycline", "Tetracycline antibiotic"],
  ["Arthritis", "Glucosamine + Chondroitin", "Nutraceutical supplement"],
  ["Feline Leukemia Virus", "Chemotherapy (Vincristine, Cyclophosphamide)", "Antineoplastic agents"],
  ["Feline Immunodeficiency Virus", "Antibiotics (Clavamox, Doxycycline)", "Antibiotic for secondary infections"],
  ["Gastrointestinal Disease", "Maropitant (Cerenia)", "Antiemetic (NK1 receptor antagonist)"],
  ["Gastrointestinal Disease", "Omeprazole", "Proton Pump Inhibitor (PPI)"],
  ["Respiratory Disease", "Amoxicillin-Clavulanate (Clavamox)", "Antibiotic (Penicillin + beta-lactamase inhibitor)"],
  ["Feline Leukemia Virus", "Antibiotics (Doxycycline, Clavamox)", "Antibiotics for secondary infections"],
  ["Skin Condition", "Prednisone", "Corticosteroid anti-inflammatory"],
  ["Chronic Illness", "Furosemide", "Loop diuretic (heart failure fluid control)"],
  ["Hyperthyroidism", "Radioactive Iodine (I-131)", "Radiotherapy treatment"],
  ["Canine Distemper", "Diazepam", "Benzodiazepine anticonvulsant"],
  ["Chronic Illness", "Carprofen / Meloxicam", "NSAID pain reliever"],
  ["Gastrointestinal Disease", "Metronidazole", "Antibiotic + Antiprotozoal"],
  ["Reproductive Disorder", "Amoxicillin-Clavulanate", "Antibiotic"],
  ["Kennel Cough", "Hydrocodone", "Antitussive / cough suppressant opioid"],
  ["Tick-Borne Disease", "Doxycycline", "Tetracycline antibiotic"],
  ["Feline Panleukopenia", "Vitamin B complex", "Supportive supplement"],
  ["Canine Heartworm Disease", "Doxycycline", "Antibiotic against Wolbachia bacteria"],
  ["Feline Calicivirus", "Buprenorphine", "Opioid analgesic"],
  ["Hyperthyroidism", "Carbimazole", "Antithyroid drug"],
  ["Canine Heartworm Disease", "Melarsomine (Immiticide)", "Adulticide antiparasitic"],
  ["Skin Condition", "Cephalexin", "Cephalosporin antibiotic"],
  ["Respiratory Disease", "Theophylline", "Bronchodilator (Methylxanthine)"],
  ["Feline Herpesvirus", "Terramycin eye ointment", "Antibiotic ophthalmic"],
  ["Gastrointestinal Disease", "Omeprazole", "Proton Pump Inhibitor / PPI"],
  ["Feline Panleukopenia", "IV Fluids (Lactated Ringer's, saline)", "Fluid therapy"],
  ["Gastrointestinal Disease", "Tylosin", "Antibiotic (Macrolide)"],
  ["Respiratory Disease", "Theophylline", "Bronchodilator / Methylxanthine"],
  ["Respiratory Disease", "Enrofloxacin (Baytril)", "Antibiotic (Fluoroquinolone)"],
  ["Chronic Illness", "Insulin (Glargine/Lantus, PZI)", "Antidiabetic hormone therapy"],
  ["Kennel Cough", "Amoxicillin-Clavulanate", "Beta-lactam antibiotic"],
  ["Feline Herpesvirus", "Artificial tears", "Ocular lubricant"],
  ["Canine Distemper", "Phenobarbital", "Anticonvulsant"],
  ["Respiratory Disease", "Terbutaline", "Bronchodilator / Beta-2 agonist"],
  ["Canine Influenza", "Amoxicillin-Clavulanate", "Beta-lactam antibiotic"],
  ["Canine Distemper", "Doxycycline", "Tetracycline antibiotic"],
  ["Feline Leukemia Virus", "Erythropoietin/Darbepoetin", "Anemia management"],
  ["Canine Heartworm Disease", "Prednisone", "Corticosteroid anti-inflammatory"],
  ["Canine Parvovirus", "Plasma transfusion", "Supportive / immune therapy"],
  ["Ringworm", "Griseofulvin", "Antifungal / mitotic inhibitor"],
  ["Feline Herpesvirus", "Famciclovir", "Antiviral (nucleoside analog)"],
  ["Feline Panleukopenia", "Metronidazole", "Antibiotic/antiprotozoal"],
  ["Lyme Disease", "Carprofen / Meloxicam", "NSAID anti-inflammatory"],
  ["Feline Asthma", "Albuterol (Salbutamol)", "Bronchodilator (Beta-2 agonist)"],
  ["Feline Immunodeficiency Virus", "Antifungals (Itraconazole, Fluconazole)", "Azole antifungal"],
  ["Reproductive Disorder", "Enrofloxacin", "Fluoroquinolone antibiotic"],
  ["Canine Parvovirus", "Ondansetron", "Antiemetic / 5HT3 blocker"],
  ["Canine Leptospirosis", "Ampicillin", "Beta-lactam antibiotic"],
  ["Feline Renal Disease", "Potassium gluconate", "Electrolyte supplement"],
  ["Feline Coronavirus", "Fluids", "Supportive therapy"],
  ["Canine Parvovirus", "Metronidazole", "Antibiotic + antiprotozoal"],
  ["Respiratory Disease", "Amoxicillin-Clavulanate", "Beta-lactam antibiotic"],
  ["Canine Influenza", "Enrofloxacin", "Fluoroquinolone antibiotic"],
  ["Kennel Cough", "Azithromycin", "Macrolide antibiotic"],
  ["Respiratory Disease", "Nebulization saline", "Supportive therapy"],
  ["Canine Distemper", "Amoxicillin-Clavulanate", "Beta-lactam antibiotic"],
  ["Kennel Cough", "Butorphanol", "Opioid antitussive"],
  ["Infectious Canine Hepatitis", "Vitamin K1", "Coagulation support"],
  ["Gastrointestinal Disease", "Maropitant (Cerenia)", "Antiemetic / NK1 receptor antagonist"],
  ["Fungal Infection", "Ketoconazole", "Azole antifungal"],
  ["Arthritis", "Meloxicam (Metacam)", "NSAID"],
  ["Chronic Illness", "Amlodipine", "Calcium Channel Blocker (antihypertensive)"],
  ["Chronic Illness", "Gabapentin", "Neuropathic pain modulator / anticonvulsant"],
  ["Feline Coronavirus", "Probiotics", "GI support"],
  ["Feline Panleukopenia", "Ondansetron", "Antiemetic"],
  ["Fungal Infection", "Amphotericin B", "Polyene antifungal"],
  ["Gastrointestinal Disease", "Sucralfate", "Gastroprotectant (ulcer coating agent)"],
  ["Feline Renal Disease", "Subcutaneous fluids", "Fluid therapy"],
  ["Feline Leukemia Virus", "Prednisolone", "Corticosteroid (anti-inflammatory/immunosuppressive)"],
  ["Feline Chlamydiosis", "Erythromycin eye ointment", "Macrolide antibiotic"],
  ["Feline Immunodeficiency Virus", "Prednisolone", "Corticosteroid (for inflammation)"],
  ["Skin Condition", "Ketoconazole", "Azole antifungal"],
  ["Skin Condition", "Lime sulfur dip", "Antifungal/antiparasitic topical"],
  ["Skin Condition", "Dexamethasone", "Corticosteroid"],
  ["Skin Condition", "Clindamycin", "Lincosamide antibiotic"],
  ["Ringworm", "Terbinafine", "Allylamine antifungal"],
  ["Feline Infectious Peritonitis", "Appetite stimulants (Mirtazapine)", "Tetracyclic antidepressant / appetite stimulant"],
  ["Skin Condition", "Apoquel (Oclacitinib)", "JAK inhibitor / anti-itch immunomodulator"],
  ["Feline Calicivirus", "Nebulization", "Supportive care"],
  ["Feline Renal Disease", "Famotidine / Omeprazole", "Acid reducer"],
  ["Feline Asthma", "Theophylline", "Bronchodilator (Methylxanthine)"],
  ["Respiratory Disease", "Nebulized Saline", "Supportive airway therapy"],
  ["Lyme Disease", "Amoxicillin", "Beta-lactam antibiotic"],
  ["Feline Infectious Peritonitis", "Interferon omega", "Immunomodulator (antiviral support)"],
  ["Canine Heartworm Disease", "Ivermectin / Milbemycin oxime", "Macrocyclic lactone antiparasitic"],
  ["Skin Condition", "Prednisolone", "Corticosteroid"],
  ["Chronic Illness", "Prednisone", "Corticosteroid immunosuppressant"],
  ["Infectious Canine Hepatitis", "Enrofloxacin", "Fluoroquinolone antibiotic"],
  ["Canine Influenza", "NSAIDs (Carprofen, Meloxicam)", "Anti-inflammatory / fever reducer"],
  ["Chronic Illness", "Amlodipine", "Calcium channel blocker / antihypertensive"],
  ["Skin Condition", "Chlorhexidine shampoo", "Antiseptic topical"],
  ["Bordetella Infection", "Azithromycin", "Macrolide antibiotic"],
  ["Chronic Illness", "Benazepril", "ACE inhibitor (blood pressure / kidney support)"],
  ["Lyme Disease", "Doxycycline", "Tetracycline antibiotic"],
  ["Feline Immunodeficiency Virus", "Interferon omega", "Immunomodulator"],
  ["Inflammatory Bowel Disease", "Prednisone / Prednisolone", "Corticosteroid immunosuppressant"],
  ["Kennel Cough", "Doxycycline", "Tetracycline antibiotic"],
  ["Reproductive Disorder", "Enrofloxacin", "Antibiotic (Fluoroquinolone)"],
  ["Bordetella Infection", "Enrofloxacin", "Fluoroquinolone antibiotic"],
  ["Canine Distemper", "IV Fluids + Vitamins", "Supportive therapy"],
  ["Arthritis", "Omega-3 fish oil", "Anti-inflammatory supplement"],
  ["Arthritis", "Adequan (Polysulfated glycosaminoglycan)", "Joint protective agent"],
  ["Feline Asthma", "Terbutaline", "Bronchodilator (Beta-2 agonist)"],
  ["Bordetella Infection", "Doxycycline", "Tetracycline antibiotic"],
  ["Feline Calicivirus", "Meloxicam", "NSAID pain reliever"],
  ["Canine Influenza", "IV Fluids", "Supportive care"],
  ["Feline Chlamydiosis", "Azithromycin", "Antibiotic (Macrolide)"],
  ["Ringworm", "Miconazole shampoo", "Azole topical antifungal"],
  ["Bordetella Infection", "Nebulization therapy", "Supportive respiratory care"],
  ["Feline Infectious Peritonitis", "GS-441524", "Antiviral (nucleoside analog)"],
  ["Gastrointestinal Disease", "Probiotics (FortiFlora etc.)", "GI Microbiome support"],
  ["Chronic Bronchitis", "Doxycycline", "Antibiotic, if infection suspected"],
  ["Inflammatory Bowel Disease", "Metronidazole", "Antibiotic + antiprotozoal"],
  ["Reproductive Disorder", "Oxytocin", "Uterotonic hormone"],
  ["Feline Panleukopenia", "Maropitant", "Antiemetic"],
  ["Chronic Illness", "Erythropoietin/Darbepoetin", "Erythropoiesis-stimulating agent (for anemia in CKD)"],
  ["Chronic Illness", "Tramadol", "Opioid-like analgesic"],
  ["Skin Condition", "Cephalexin", "Antibiotic (Cephalosporin)"],
  ["Reproductive Disorder", "Cloprostenol", "Prostaglandin (induces uterine contraction)"],
  ["Inflammatory Bowel Disease", "Cyclosporine", "Immunosuppressant / calcineurin inhibitor"],
  ["Arthritis", "Buprenorphine", "Opioid analgesic"],
  ["Infectious Canine Hepatitis", "S-Adenosylmethionine (SAMe)", "Hepatoprotective supplement"],
  ["Tick-Borne Disease", "Prednisone", "Corticosteroid, sometimes used for immune-mediated complications"],
  ["Feline Renal Disease", "Telmisartan", "ARB (angiotensin receptor blocker)"],
  ["Feline Herpesvirus", "Lysine", "Supplement (immune support)"],
  ["Lyme Disease", "Cefuroxime", "Cephalosporin antibiotic"],
  ["Feline Chlamydiosis", "Terramycin ophthalmic", "Topical antibiotic (tetracycline class)"],
  ["Canine Influenza", "Doxycycline", "Tetracycline antibiotic"],
  ["Hyperthyroidism", "Atenolol", "Beta blocker (controls high heart rate)"],
  ["Canine Parvovirus", "Cefazolin / Ceftriaxone", "Cephalosporin antibiotic"],
  ["Fungal Infection", "Itraconazole", "Azole antifungal"],
  ["Canine Parvovirus", "Ampicillin", "Beta-lactam antibiotic"],
  ["Infectious Canine Hepatitis", "Amoxicillin-Clavulanate", "Beta-lactam antibiotic"],
  ["Chronic Illness", "Gabapentin", "Neuropathic pain modulator (anticonvulsant class)"],
  ["Feline Infectious Peritonitis", "Remdesivir", "Antiviral (RNA polymerase inhibitor)"],
  ["Feline Renal Disease", "Maropitant", "Antiemetic"],
  ["Ringworm", "Itraconazole", "Azole antifungal"],
  ["Canine Leptospirosis", "Penicillin G", "Beta-lactam antibiotic"],
  ["Feline Panleukopenia", "Plasma transfusion", "Immunotherapy/supportive"],
  ["Skin Condition", "Ivermectin", "Antiparasitic (macrocyclic lactone)"],
  ["Chronic Illness", "Denamarin (SAMe + Silybin)", "Liver support supplement"],
  ["Chronic Bronchitis", "Hydrocodone", "Antitussive / opioid cough suppressant"],
  ["Chronic Bronchitis", "Theophylline", "Bronchodilator / methylxanthine"],
  ["Conjunctivitis", "Tobramycin drops", "Aminoglycoside antibiotic"],
  ["Conjunctivitis", "Artificial tears", "Lubricant/supportive"],
  ["Infectious Canine Hepatitis", "Silymarin / Milk Thistle", "Liver protectant supplement"],
  ["Feline Calicivirus", "Amoxicillin-Clavulanate", "Antibiotic"],
  ["Skin Condition", "Itraconazole", "Antifungal (azole)"],
  ["Fungal Infection", "Fluconazole", "Azole antifungal"],
  ["Inflammatory Bowel Disease", "Budesonide", "Steroid anti-inflammatory"],
  ["Skin Condition", "Cytopoint (Lokivetmab)", "Monoclonal antibody anti-itch therapy"],
  ["Reproductive Disorder", "Pain meds (Buprenorphine)", "Opioid analgesic"],
  ["Feline Panleukopenia", "Ampicillin / Cefazolin", "Antibiotic (Beta-lactam)"],
  ["Skin Condition", "Selamectin (Revolution)", "Antiparasitic (macrocyclic lactone)"],
  ["Infectious Canine Hepatitis", "IV Fluids", "Supportive therapy"],
  ["Reproductive Disorder", "Alizin (Aglepristone)", "Progesterone antagonist"],
  ["Canine Distemper", "Prednisone", "Corticosteroid, sometimes used for inflammation"],
  ["Conjunctivitis", "Prednisolone eye drops", "Corticosteroid ophthalmic (ONLY if no corneal ulcer)"],
  ["Feline Renal Disease", "Amlodipine", "Calcium channel blocker"],
  ["Ringworm", "Lime sulfur dip", "Topical antifungal treatment"],
  ["Reproductive Disorder", "Cabergoline", "Dopamine agonist / prolactin inhibitor"],
  ["Canine Leptospirosis", "Doxycycline", "Tetracycline antibiotic"],
  ["Chronic Bronchitis", "Prednisone / Prednisolone", "Corticosteroid anti-inflammatory"],
  ["Kennel Cough", "Theophylline", "Bronchodilator"],
  ["Reproductive Disorder", "Oxytocin", "Uterotonic hormone drug"],
  ["Inflammatory Bowel Disease", "Probiotics", "GI microbiome support"],
  ["Conjunctivitis", "Erythromycin ointment", "Macrolide antibiotic"],
  ["Feline Renal Disease", "Phosphate binders (Aluminum hydroxide, Sevelamer)", "Phosphate binder"],
  ["Skin Condition", "Antihistamines (Chlorpheniramine, Cetirizine)", "Antihistamine"],
  ["Reproductive Disorder", "Cloprostenol", "Prostaglandin / luteolytic agent"],
  ["Conjunctivitis", "Cidofovir drops", "Antiviral (for herpes-related conjunctivitis)"],
  ["Chronic Bronchitis", "Terbutaline", "Bronchodilator / beta-2 agonist"],
  ["Inflammatory Bowel Disease", "Tylosin", "Macrolide antibiotic"],
  ["Conjunctivitis", "Terramycin (Oxytetracycline + Polymyxin B)", "Ophthalmic antibiotic"],
  ["Skin Condition", "Fipronil", "Insecticide (phenylpyrazole)"],
  ["Arthritis", "Robenacoxib (Onsior)", "NSAID"],
  ["Feline Renal Disease", "Darbepoetin", "Erythropoiesis stimulating agent"],
  ["Chronic Bronchitis", "Albuterol (inhaler)", "Beta-2 agonist bronchodilator"],
  ["Conjunctivitis", "Chloramphenicol drops", "Broad-spectrum antibiotic"],
].map(([disease, medicine, medicineClass]) => ({
  disease,
  medicine,
  medicineClass,
}));

// For your ImageChecker model, classes follow names like:
// "Cat-Alopecia", "Dog-Ringworm", etc. Your medicine dataset is bucket-based
// ("Skin Condition", "Ringworm", ...). This mapping lets us return a dedicated
// treatment list per each image class by translating to the correct bucket and
// (optionally) filtering medicines to be more class-specific.
const imageClassToTreatmentBucket: Record<
  string,
  { bucket: string | null; whitelist?: string[] }
> = {
  // Cat
  "cat-alopecia": {
    bucket: "Skin Condition",
    whitelist: [
      "Apoquel (Oclacitinib)",
      "Cytopoint (Lokivetmab)",
      "Antihistamines (Chlorpheniramine, Cetirizine)",
    ],
  },
  "cat-dental infection": {
    bucket: "Skin Condition",
    whitelist: ["Cephalexin", "Clindamycin"],
  },
  "cat-ear mites": {
    bucket: "Skin Condition",
    whitelist: ["Ivermectin", "Selamectin (Revolution)"],
  },
  "cat-eye infection": { bucket: "Conjunctivitis" },
  "cat-flea allergy": {
    bucket: "Skin Condition",
    whitelist: [
      "Antihistamines (Chlorpheniramine, Cetirizine)",
      "Fipronil",
    ],
  },
  "cat-fungal infection": { bucket: "Fungal Infection" },
  "cat-healthy": { bucket: null },
  "cat-miliary dermatitis": {
    bucket: "Skin Condition",
    whitelist: [
      "Apoquel (Oclacitinib)",
      "Cytopoint (Lokivetmab)",
      "Antihistamines (Chlorpheniramine, Cetirizine)",
    ],
  },
  "cat-ringworm": { bucket: "Ringworm" },
  "cat-scabies": {
    bucket: "Skin Condition",
    whitelist: [
      "Ivermectin",
      "Selamectin (Revolution)",
      "Fipronil",
    ],
  },

  // Dog
  "dog-bacterial dermatosis": {
    bucket: "Skin Condition",
    whitelist: [
      "Cephalexin",
      "Clindamycin",
      "Chlorhexidine shampoo",
    ],
  },
  "dog-demodicosis": {
    bucket: "Skin Condition",
    whitelist: ["Ivermectin", "Selamectin (Revolution)"],
  },
  "dog-dental infection": {
    bucket: "Skin Condition",
    whitelist: ["Cephalexin", "Clindamycin"],
  },
  "dog-eye infection": { bucket: "Conjunctivitis" },
  "dog-flea allergy": {
    bucket: "Skin Condition",
    whitelist: [
      "Antihistamines (Chlorpheniramine, Cetirizine)",
      "Fipronil",
    ],
  },
  "dog-fungal infection": { bucket: "Fungal Infection" },
  "dog-healthy": { bucket: null },
  "dog-hypersensitivity dermatitis": {
    bucket: "Skin Condition",
    whitelist: [
      "Apoquel (Oclacitinib)",
      "Cytopoint (Lokivetmab)",
      "Antihistamines (Chlorpheniramine, Cetirizine)",
    ],
  },
  "dog-mange": {
    bucket: "Skin Condition",
    whitelist: [
      "Ivermectin",
      "Selamectin (Revolution)",
      "Lime sulfur dip",
    ],
  },
  "dog-ringworm": { bucket: "Ringworm" },
  "dog-scabies": {
    bucket: "Skin Condition",
    whitelist: [
      "Ivermectin",
      "Selamectin (Revolution)",
      "Fipronil",
    ],
  },
};

function getMedicinesForBucket(bucketDisease: string): MedicineInfo[] {
  const bucketNormalized = bucketDisease.trim().toLowerCase();

  const fromTuples = originalTuples.filter(
    (item) => item.disease.trim().toLowerCase() === bucketNormalized,
  );

  const withAttributes: MedicineInfo[] = fromTuples.map((item) => {
    const key = `${bucketDisease}|||${item.medicine}`;
    const attributes = medicineAttributes[key];
    return attributes ? { ...item, attributes } : item;
  });

  const extraFromAttributes: MedicineInfo[] = Object.entries(medicineAttributes)
    .filter(([key]) => key.startsWith(`${bucketDisease}|||`))
    .map(([key, attributes]) => {
      const [, medicine] = key.split("|||");
      const alreadyIncluded = withAttributes.some(
        (m) => m.medicine.toLowerCase() === medicine.toLowerCase(),
      );
      if (alreadyIncluded) return null;
      return {
        disease: bucketDisease,
        medicine,
        attributes,
      } as MedicineInfo;
    })
    .filter((v): v is MedicineInfo => Boolean(v));

  return [...withAttributes, ...extraFromAttributes];
}

export function getMedicinesForDisease(disease: string): MedicineInfo[] {
  const normalized = disease.trim().toLowerCase();

  const mapped = imageClassToTreatmentBucket[normalized];
  if (mapped) {
    if (!mapped.bucket) return [];

    const medicines = getMedicinesForBucket(mapped.bucket);
    const whitelist = mapped.whitelist?.map((w) => w.toLowerCase()) ?? [];

    const filtered =
      whitelist.length > 0
        ? medicines.filter((m) =>
            whitelist.includes(m.medicine.toLowerCase()),
          )
        : medicines;

    // Return medicines but with disease field set to the original class name.
    return filtered.map((m) => ({ ...m, disease }));
  }

  const fromTuples = originalTuples.filter(
    (item) => item.disease.trim().toLowerCase() === normalized,
  );

  const withAttributes: MedicineInfo[] = fromTuples.map((item) => {
    const key = `${item.disease}|||${item.medicine}`;
    const attributes = medicineAttributes[key];
    return attributes ? { ...item, attributes } : item;
  });

  const extraFromAttributes: MedicineInfo[] = Object.entries(
    medicineAttributes,
  )
    .filter(([key]) => key.startsWith(`${disease}|||`))
    .map(([key, attributes]) => {
      const [, medicine] = key.split("|||");
      const alreadyIncluded = withAttributes.some(
        (m) => m.medicine.toLowerCase() === medicine.toLowerCase(),
      );
      if (alreadyIncluded) return null;
      return {
        disease,
        medicine,
        attributes,
      } as MedicineInfo;
    })
    .filter((v): v is MedicineInfo => Boolean(v));

  return [...withAttributes, ...extraFromAttributes];
}
