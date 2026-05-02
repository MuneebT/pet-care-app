export type TipCategory = 'Health' | 'Grooming' | 'Behavior' | 'Nutrition' | 'Safety' | 'Exercise';

export interface PetTip {
  id: number;
  category: TipCategory;
  text: string;
}

export const CATEGORY_CONFIG: Record<TipCategory, { gradient: string[]; icon: string; color: string }> = {
  Health: {
    gradient: ['#ECFDF5', '#D1FAE5'],
    icon: 'heart-pulse',
    color: '#10B981',
  },
  Grooming: {
    gradient: ['#FEF3C7', '#FDE68A'],
    icon: 'content-cut',
    color: '#F59E0B',
  },
  Behavior: {
    gradient: ['#DBEAFE', '#BFDBFE'],
    icon: 'emoticon-happy',
    color: '#3B82F6',
  },
  Nutrition: {
    gradient: ['#FEE2E2', '#FECACA'],
    icon: 'food-apple',
    color: '#EF4444',
  },
  Safety: {
    gradient: ['#F3E8FF', '#E9D5FF'],
    icon: 'shield-check',
    color: '#8B5CF6',
  },
  Exercise: {
    gradient: ['#FFEDD5', '#FED7AA'],
    icon: 'run',
    color: '#F97316',
  },
};

export const petTips: PetTip[] = [
  // Health Tips (25 tips)
  { id: 1, category: 'Health', text: "Check your pet's eyes for redness or discharge." },
  { id: 2, category: 'Health', text: "Look inside your pet's ears for dirt or unusual smell." },
  { id: 3, category: 'Health', text: "Observe your pet's breathing for anything unusual." },
  { id: 4, category: 'Health', text: "Check if your pet is eating normally today." },
  { id: 5, category: 'Health', text: "Monitor your pet's water intake." },
  { id: 6, category: 'Health', text: "Check your pet's nose for dryness or discharge." },
  { id: 7, category: 'Health', text: "Feel your pet's body for lumps or swelling." },
  { id: 8, category: 'Health', text: "Watch your pet's walking or movement for limping." },
  { id: 9, category: 'Health', text: "Check your pet's gums — they should be pink and healthy." },
  { id: 10, category: 'Health', text: "Look for excessive scratching or itching." },
  { id: 11, category: 'Health', text: "Monitor your pet's weight regularly." },
  { id: 12, category: 'Health', text: "Watch for signs of illness like lethargy." },
  { id: 13, category: 'Health', text: "Check vaccination schedules are up to date." },
  { id: 14, category: 'Health', text: "Listen for coughing or sneezing." },
  { id: 15, category: 'Health', text: "Watch for excessive licking of paws." },
  { id: 16, category: 'Health', text: "Monitor shedding levels for changes." },
  { id: 17, category: 'Health', text: "Notice appetite changes." },
  { id: 18, category: 'Health', text: "Check hydration levels by skin elasticity." },
  { id: 19, category: 'Health', text: "Observe sleep patterns for unusual changes." },
  { id: 20, category: 'Health', text: "Track your pet's daily activities." },
  { id: 21, category: 'Health', text: "Note any unusual habits or behaviors." },
  { id: 22, category: 'Health', text: "Schedule regular vet visits." },
  { id: 23, category: 'Health', text: "Keep medical records updated." },
  { id: 24, category: 'Health', text: "Note unusual symptoms immediately." },
  { id: 25, category: 'Health', text: "Use flea prevention if recommended." },

  // Grooming Tips (25 tips)
  { id: 26, category: 'Grooming', text: "Brush your pet's fur to prevent tangles." },
  { id: 27, category: 'Grooming', text: "Check your pet's coat for fleas or ticks." },
  { id: 28, category: 'Grooming', text: "Wipe your pet's paws after outdoor walks." },
  { id: 29, category: 'Grooming', text: "Clean your pet's eyes gently if needed." },
  { id: 30, category: 'Grooming', text: "Check nails for overgrowth." },
  { id: 31, category: 'Grooming', text: "Remove loose hair with a grooming brush." },
  { id: 32, category: 'Grooming', text: "Inspect the tail area for dirt or irritation." },
  { id: 33, category: 'Grooming', text: "Make sure your pet smells clean and fresh." },
  { id: 34, category: 'Grooming', text: "Check for skin dryness or flakes." },
  { id: 35, category: 'Grooming', text: "Keep grooming tools clean and ready." },
  { id: 36, category: 'Grooming', text: "Clean your cat's litter box daily." },
  { id: 37, category: 'Grooming', text: "Check your dog's bathroom routine." },
  { id: 38, category: 'Grooming', text: "Watch for diarrhea or constipation." },
  { id: 39, category: 'Grooming', text: "Look for changes in urination habits." },
  { id: 40, category: 'Grooming', text: "Make sure litter is fresh." },
  { id: 41, category: 'Grooming', text: "Provide enough litter boxes for cats." },
  { id: 42, category: 'Grooming', text: "Clean up accidents quickly." },
  { id: 43, category: 'Grooming', text: "Observe stool for unusual color." },
  { id: 44, category: 'Grooming', text: "Ensure bathroom areas are hygienic." },
  { id: 45, category: 'Grooming', text: "Maintain regular toilet schedules." },
  { id: 46, category: 'Grooming', text: "Check bedding for cleanliness." },
  { id: 47, category: 'Grooming', text: "Maintain grooming routines." },
  { id: 48, category: 'Grooming', text: "Keep parasite prevention updated." },
  { id: 49, category: 'Grooming', text: "Provide a comfortable sleeping space." },
  { id: 50, category: 'Grooming', text: "Allow pets a quiet place to relax." },

  // Behavior Tips (25 tips)
  { id: 51, category: 'Behavior', text: "Notice changes in your pet's mood." },
  { id: 52, category: 'Behavior', text: "Observe your pet's energy level." },
  { id: 53, category: 'Behavior', text: "Check if your pet is unusually quiet." },
  { id: 54, category: 'Behavior', text: "Look for signs of anxiety." },
  { id: 55, category: 'Behavior', text: "Reward good behavior with praise." },
  { id: 56, category: 'Behavior', text: "Avoid yelling at your pet." },
  { id: 57, category: 'Behavior', text: "Encourage calm behavior indoors." },
  { id: 58, category: 'Behavior', text: "Watch for aggression or fear responses." },
  { id: 59, category: 'Behavior', text: "Provide reassurance if your pet seems stressed." },
  { id: 60, category: 'Behavior', text: "Spend time observing your pet daily." },
  { id: 61, category: 'Behavior', text: "Teach simple commands during playtime." },
  { id: 62, category: 'Behavior', text: "Practice basic training commands." },
  { id: 63, category: 'Behavior', text: "Introduce new toys occasionally." },
  { id: 64, category: 'Behavior', text: "Hide treats for fun searching games." },
  { id: 65, category: 'Behavior', text: "Use puzzle feeders." },
  { id: 66, category: 'Behavior', text: "Teach a new trick." },
  { id: 67, category: 'Behavior', text: "Encourage curiosity and exploration." },
  { id: 68, category: 'Behavior', text: "Change play routines to prevent boredom." },
  { id: 69, category: 'Behavior', text: "Provide climbing spaces for cats." },
  { id: 70, category: 'Behavior', text: "Use scent-based toys for dogs." },
  { id: 71, category: 'Behavior', text: "Keep playtime engaging and fun." },
  { id: 72, category: 'Behavior', text: "Watch your pet's posture." },
  { id: 73, category: 'Behavior', text: "Check tail movement and expression." },
  { id: 74, category: 'Behavior', text: "Notice ear positioning." },
  { id: 75, category: 'Behavior', text: "Learn your pet's body language." },

  // Nutrition Tips (25 tips)
  { id: 76, category: 'Nutrition', text: "Provide fresh clean water every day." },
  { id: 77, category: 'Nutrition', text: "Serve balanced meals at regular times." },
  { id: 78, category: 'Nutrition', text: "Avoid feeding human junk food." },
  { id: 79, category: 'Nutrition', text: "Monitor if your pet finishes their meal." },
  { id: 80, category: 'Nutrition', text: "Measure food portions correctly." },
  { id: 81, category: 'Nutrition', text: "Give healthy treats in moderation." },
  { id: 82, category: 'Nutrition', text: "Make sure food bowls are clean." },
  { id: 83, category: 'Nutrition', text: "Watch for signs of food allergies." },
  { id: 84, category: 'Nutrition', text: "Store pet food properly." },
  { id: 85, category: 'Nutrition', text: "Check expiration dates of pet food." },
  { id: 86, category: 'Nutrition', text: "Maintain a regular feeding schedule." },
  { id: 87, category: 'Nutrition', text: "Keep feeding areas clean." },
  { id: 88, category: 'Nutrition', text: "Avoid sudden diet changes." },
  { id: 89, category: 'Nutrition', text: "Provide appropriate portion sizes." },
  { id: 90, category: 'Nutrition', text: "Include variety in meals." },
  { id: 91, category: 'Nutrition', text: "Ensure access to clean drinking water." },
  { id: 92, category: 'Nutrition', text: "Limit table scraps." },
  { id: 93, category: 'Nutrition', text: "Choose quality pet food brands." },
  { id: 94, category: 'Nutrition', text: "Monitor treat intake daily." },
  { id: 95, category: 'Nutrition', text: "Keep food storage airtight." },
  { id: 96, category: 'Nutrition', text: "Wash food bowls regularly." },
  { id: 97, category: 'Nutrition', text: "Provide fresh water at room temperature." },
  { id: 98, category: 'Nutrition', text: "Avoid toxic foods for pets." },
  { id: 99, category: 'Nutrition', text: "Consult vet for dietary needs." },
  { id: 100, category: 'Nutrition', text: "Track daily food consumption." },

  // Safety Tips (25 tips)
  { id: 101, category: 'Safety', text: "Ensure your pet's collar fits properly." },
  { id: 102, category: 'Safety', text: "Check the ID tag is attached." },
  { id: 103, category: 'Safety', text: "Inspect the home for pet hazards." },
  { id: 104, category: 'Safety', text: "Keep toxic foods away from pets." },
  { id: 105, category: 'Safety', text: "Make sure electrical cords are safe." },
  { id: 106, category: 'Safety', text: "Check fences or gates in your yard." },
  { id: 107, category: 'Safety', text: "Secure trash cans." },
  { id: 108, category: 'Safety', text: "Remove small choking hazards." },
  { id: 109, category: 'Safety', text: "Keep medications out of reach." },
  { id: 110, category: 'Safety', text: "Watch your pet near water or pools." },
  { id: 111, category: 'Safety', text: "Supervise interactions with children." },
  { id: 112, category: 'Safety', text: "Introduce pets to new animals slowly." },
  { id: 113, category: 'Safety', text: "Encourage positive social behavior." },
  { id: 114, category: 'Safety', text: "Avoid stressful social situations." },
  { id: 115, category: 'Safety', text: "Reward calm interactions." },
  { id: 116, category: 'Safety', text: "Allow supervised outdoor socialization." },
  { id: 117, category: 'Safety', text: "Monitor body language during play." },
  { id: 118, category: 'Safety', text: "Encourage gentle interactions." },
  { id: 119, category: 'Safety', text: "Give pets personal space when needed." },
  { id: 120, category: 'Safety', text: "Keep emergency vet contacts handy." },
  { id: 121, category: 'Safety', text: "Update your pet's ID information." },
  { id: 122, category: 'Safety', text: "Maintain a comfortable room temperature." },
  { id: 123, category: 'Safety', text: "Provide shade in hot weather." },
  { id: 124, category: 'Safety', text: "Keep pets warm in cold weather." },
  { id: 125, category: 'Safety', text: "Allow access to fresh air." },

  // Exercise Tips (25 tips)
  { id: 126, category: 'Exercise', text: "Take your dog for a daily walk." },
  { id: 127, category: 'Exercise', text: "Play interactive games with your pet." },
  { id: 128, category: 'Exercise', text: "Encourage running or active play." },
  { id: 129, category: 'Exercise', text: "Provide toys for mental stimulation." },
  { id: 130, category: 'Exercise', text: "Rotate toys to keep things interesting." },
  { id: 131, category: 'Exercise', text: "Allow safe outdoor exploration." },
  { id: 132, category: 'Exercise', text: "Make sure indoor pets get enough activity." },
  { id: 133, category: 'Exercise', text: "Use puzzle toys for brain stimulation." },
  { id: 134, category: 'Exercise', text: "Avoid over-exercising your pet." },
  { id: 135, category: 'Exercise', text: "Adjust activity for your pet's age." },
  { id: 136, category: 'Exercise', text: "Spend quality time with your pet every day." },
  { id: 137, category: 'Exercise', text: "Talk to your pet in a calm voice." },
  { id: 138, category: 'Exercise', text: "Pet and cuddle your animal regularly." },
  { id: 139, category: 'Exercise', text: "Play your pet's favorite game." },
  { id: 140, category: 'Exercise', text: "Show affection often." },
  { id: 141, category: 'Exercise', text: "Give your pet attention after you return home." },
  { id: 142, category: 'Exercise', text: "Let your pet feel part of the family." },
  { id: 143, category: 'Exercise', text: "Sit quietly with your pet sometimes." },
  { id: 144, category: 'Exercise', text: "Reward your pet with love and patience." },
  { id: 145, category: 'Exercise', text: "Stay consistent with daily routines." },
  { id: 146, category: 'Exercise', text: "Be patient while training." },
  { id: 147, category: 'Exercise', text: "Allow pets to interact safely with family." },
  { id: 148, category: 'Exercise', text: "Celebrate your pet's happy moments." },
  { id: 149, category: 'Exercise', text: "Always prioritize your pet's comfort." },
  { id: 150, category: 'Exercise', text: "Build a strong relationship with your pet." },
];

export const CATEGORIES: TipCategory[] = ['Health', 'Grooming', 'Behavior', 'Nutrition', 'Safety', 'Exercise'];

export const getTipsByCategory = (category: TipCategory): PetTip[] => {
  return petTips.filter(tip => tip.category === category);
};

export const getRandomTip = (category: TipCategory, excludeIds: number[] = []): PetTip => {
  const categoryTips = getTipsByCategory(category);
  const availableTips = categoryTips.filter(tip => !excludeIds.includes(tip.id));
  
  if (availableTips.length === 0) {
    return categoryTips[Math.floor(Math.random() * categoryTips.length)];
  }
  
  return availableTips[Math.floor(Math.random() * availableTips.length)];
};
