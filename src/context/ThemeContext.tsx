import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Colors, ThemeName } from '@/constants/theme';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, onSnapshot } from 'firebase/firestore';

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
  colors: typeof Colors.blue;
  loading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>('blue');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  useEffect(() => {
    if (!loading) {
      const unsubscribe = auth.onAuthStateChanged(async (user) => {
        if (user) {
          const unsubscribeSnapshot = onSnapshot(doc(db, 'users', user.uid), (docSnap) => {
            if (docSnap.exists() && docSnap.data().theme) {
              const newTheme = docSnap.data().theme;
              if (['blue', 'green', 'purple'].includes(newTheme)) {
                setThemeState(newTheme as ThemeName);
              }
            }
          });
          return () => unsubscribeSnapshot();
        }
      });
      return () => unsubscribe();
    }
  }, [loading]);

  const loadTheme = async () => {
    try {
      let themeFromDB = null;
      const user = auth.currentUser;
      
      if (user) {
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists() && userDoc.data().theme) {
          themeFromDB = userDoc.data().theme;
        }
      }
      
      if (themeFromDB && ['blue', 'green', 'purple'].includes(themeFromDB)) {
        setThemeState(themeFromDB as ThemeName);
      } else {
        const savedTheme = await AsyncStorage.getItem('@app_theme');
        if (savedTheme && ['blue', 'green', 'purple'].includes(savedTheme)) {
          setThemeState(savedTheme as ThemeName);
        }
      }
    } catch (error) {
      console.log('Error loading theme:', error);
      const savedTheme = await AsyncStorage.getItem('@app_theme');
      if (savedTheme && ['blue', 'green', 'purple'].includes(savedTheme)) {
        setThemeState(savedTheme as ThemeName);
      }
    } finally {
      setLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeName) => {
    try {
      const user = auth.currentUser;
      if (user) {
        await doc(db, 'users', user.uid);
        const { updateDoc } = await import('firebase/firestore');
        await updateDoc(doc(db, 'users', user.uid), { theme: newTheme });
      }
      await AsyncStorage.setItem('@app_theme', newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.log('Error saving theme:', error);
      await AsyncStorage.setItem('@app_theme', newTheme);
      setThemeState(newTheme);
    }
  };

  const colors = Colors[theme];

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, loading }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useAppTheme must be used within an AppThemeProvider');
  }
  return context;
}
