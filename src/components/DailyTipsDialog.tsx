import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BorderRadius, Spacing, FontSize, FontWeight, Shadow } from '@/constants/theme';
import {
  PetTip,
  TipCategory,
  CATEGORIES,
  CATEGORY_CONFIG,
  getRandomTip,
} from '@/data/petTips';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH * 0.85;

const STORAGE_KEYS = {
  LAST_TIPS_DATE: 'daily_tips_last_date',
  SHOWN_TIP_IDS: 'daily_tips_shown_ids',
  CATEGORY_INDEX: 'daily_tips_category_index',
  TIPS_COMPLETED: 'daily_tips_completed',
  TIPS_SHOWN_FOR_SESSION: 'daily_tips_shown_for_session',
};

export const checkAndShowTips = async (): Promise<boolean> => {
  try {
    const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TIPS_DATE);
    const today = new Date().toDateString();
    const completed = await AsyncStorage.getItem(STORAGE_KEYS.TIPS_COMPLETED);
    const shownForSession = await AsyncStorage.getItem(STORAGE_KEYS.TIPS_SHOWN_FOR_SESSION);
    
    if (shownForSession === 'true') {
      return false;
    }
    
    if (lastDate !== today) {
      await AsyncStorage.setItem(STORAGE_KEYS.LAST_TIPS_DATE, today);
      await AsyncStorage.setItem(STORAGE_KEYS.TIPS_COMPLETED, 'false');
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_INDEX, '0');
      await AsyncStorage.setItem(STORAGE_KEYS.SHOWN_TIP_IDS, '[]');
      await AsyncStorage.setItem(STORAGE_KEYS.TIPS_SHOWN_FOR_SESSION, 'false');
      return true;
    }
    
    if (completed !== 'true') {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error checking tips completion:', error);
    return false;
  }
};

export const markTipsAsShownForSession = async (): Promise<void> => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.TIPS_SHOWN_FOR_SESSION, 'true');
  } catch (error) {
    console.error('Error marking tips as shown for session:', error);
  }
};

export const resetTipsForTesting = async (): Promise<void> => {
  try {
    const today = new Date().toDateString();
    await AsyncStorage.setItem(STORAGE_KEYS.LAST_TIPS_DATE, today);
    await AsyncStorage.setItem(STORAGE_KEYS.TIPS_COMPLETED, 'false');
    await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_INDEX, '0');
    await AsyncStorage.setItem(STORAGE_KEYS.SHOWN_TIP_IDS, '[]');
    await AsyncStorage.setItem(STORAGE_KEYS.TIPS_SHOWN_FOR_SESSION, 'false');
    console.log('Tips reset for testing');
  } catch (error) {
    console.error('Error resetting tips:', error);
  }
};

interface DailyTipsDialogProps {
  visible: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

const DailyTipsDialog: React.FC<DailyTipsDialogProps> = ({ 
  visible, 
  onClose, 
  onComplete 
}) => {
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [currentTip, setCurrentTip] = useState<PetTip | null>(null);
  const [shownTipIds, setShownTipIds] = useState<number[]>([]);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const hasInitialized = useRef(false);

  const today = new Date().toDateString();

  const getStoredData = useCallback(async () => {
    try {
      const lastDate = await AsyncStorage.getItem(STORAGE_KEYS.LAST_TIPS_DATE);
      const storedIds = await AsyncStorage.getItem(STORAGE_KEYS.SHOWN_TIP_IDS);
      const categoryIndex = await AsyncStorage.getItem(STORAGE_KEYS.CATEGORY_INDEX);

      const ids = storedIds ? JSON.parse(storedIds) : [];
      setShownTipIds(ids);

      const catIndex = categoryIndex ? parseInt(categoryIndex, 10) : 0;

      if (lastDate !== today) {
        await AsyncStorage.setItem(STORAGE_KEYS.LAST_TIPS_DATE, today);
        await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_INDEX, '0');
        setCurrentCategoryIndex(0);
        return { ids: [], categoryIndex: 0 };
      }

      setCurrentCategoryIndex(catIndex);
      return { ids, categoryIndex: catIndex };
    } catch (error) {
      console.error('Error reading tip storage:', error);
      return { ids: [], categoryIndex: 0 };
    }
  }, [today]);

  const loadNextTip = useCallback(async () => {
    try {
      const { ids, categoryIndex } = await getStoredData();
      
      const currentCategory = CATEGORIES[categoryIndex];
      const tip = getRandomTip(currentCategory, ids);
      setCurrentTip(tip);

      const newShownIds = [...ids, tip.id];
      setShownTipIds(newShownIds);
      await AsyncStorage.setItem(STORAGE_KEYS.SHOWN_TIP_IDS, JSON.stringify(newShownIds));
    } catch (error) {
      console.error('Error loading tip:', error);
    }
  }, [getStoredData]);

  const handleNext = async () => {
    try {
      const nextIndex = currentCategoryIndex + 1;
      
      if (nextIndex >= CATEGORIES.length) {
        await AsyncStorage.setItem(STORAGE_KEYS.TIPS_COMPLETED, 'true');
        await markTipsAsShownForSession();
        onComplete?.();
        onClose();
        return;
      }

      setCurrentCategoryIndex(nextIndex);
      await AsyncStorage.setItem(STORAGE_KEYS.CATEGORY_INDEX, nextIndex.toString());

      const currentCategory = CATEGORIES[nextIndex];
      const tip = getRandomTip(currentCategory, shownTipIds);
      setCurrentTip(tip);

      const newShownIds = [...shownTipIds, tip.id];
      setShownTipIds(newShownIds);
      await AsyncStorage.setItem(STORAGE_KEYS.SHOWN_TIP_IDS, JSON.stringify(newShownIds));
    } catch (error) {
      console.error('Error moving to next tip:', error);
    }
  };

  const handleClose = async () => {
    await markTipsAsShownForSession();
    onClose();
  };

  useEffect(() => {
    if (visible && !hasInitialized.current) {
      hasInitialized.current = true;
      loadNextTip();
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (!visible) {
      fadeAnim.setValue(0);
      slideAnim.setValue(50);
      hasInitialized.current = false;
    }
  }, [visible, loadNextTip, fadeAnim, slideAnim]);

  if (!currentTip) return null;

  const config = CATEGORY_CONFIG[currentTip.category];
  const isLastTip = currentCategoryIndex === CATEGORIES.length - 1;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <StatusBar translucent backgroundColor="rgba(0,0,0,0.4)" />
      <TouchableWithoutFeedback onPress={handleClose}>
        <View style={styles.overlay}>
          <TouchableWithoutFeedback>
            <Animated.View
              style={[
                styles.card,
                {
                  opacity: fadeAnim,
                  transform: [{ translateY: slideAnim }],
                },
              ]}
            >
              <View style={[styles.gradientHeader, { backgroundColor: config.color }]}>
                <View style={styles.categoryBadge}>
                  <MaterialCommunityIcons
                    name={config.icon as any}
                    size={16}
                    color={config.color}
                  />
                  <Text style={[styles.categoryText, { color: config.color }]}>
                    {currentTip.category}
                  </Text>
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                  <MaterialCommunityIcons name="close" size={22} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.content}>
                <View style={styles.iconContainer}>
                  <MaterialCommunityIcons
                    name={config.icon as any}
                    size={40}
                    color={config.color}
                  />
                </View>

                <Text style={styles.tipText}>{currentTip.text}</Text>

                <View style={styles.progressContainer}>
                  <Text style={styles.progressText}>
                    {currentCategoryIndex + 1} of {CATEGORIES.length}
                  </Text>
                  <View style={styles.progressBar}>
                    <View
                      style={[
                        styles.progressFill,
                        {
                          width: `${((currentCategoryIndex + 1) / CATEGORIES.length) * 100}%`,
                          backgroundColor: config.color,
                        },
                      ]}
                    />
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.nextButton, { backgroundColor: config.color }]}
                  onPress={handleNext}
                  activeOpacity={0.8}
                >
                  <Text style={styles.nextButtonText}>
                    {isLastTip ? 'Got it!' : 'Next Tip'}
                  </Text>
                  {!isLastTip && (
                    <MaterialCommunityIcons
                      name="arrow-right"
                      size={20}
                      color="#FFF"
                      style={styles.nextIcon}
                    />
                  )}
                </TouchableOpacity>
              </View>
            </Animated.View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#FFF',
    borderRadius: BorderRadius.xl,
    overflow: 'hidden',
    ...Shadow.xl,
  },
  gradientHeader: {
    paddingTop: Spacing.lg,
    paddingBottom: Spacing.xl,
    paddingHorizontal: Spacing.lg,
    position: 'relative',
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  categoryText: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.semibold,
  },
  closeButton: {
    position: 'absolute',
    top: Spacing.md,
    right: Spacing.md,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: Spacing.lg,
    alignItems: 'center',
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#F8FAFC',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    ...Shadow.md,
  },
  tipText: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.medium,
    color: '#1E293B',
    textAlign: 'center',
    lineHeight: 26,
    marginBottom: Spacing.lg,
  },
  progressContainer: {
    width: '100%',
    marginBottom: Spacing.lg,
  },
  progressText: {
    fontSize: FontSize.sm,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 3,
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.xl,
    borderRadius: BorderRadius.full,
    ...Shadow.md,
  },
  nextButtonText: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.bold,
    color: '#FFF',
  },
  nextIcon: {
    marginLeft: Spacing.xs,
  },
});

export default DailyTipsDialog;
