import { Colors, ThemeName, updateCurrentColors } from "@/constants/theme";
import { AppThemeProvider } from "@/context/ThemeContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { auth, db } from "@/services/firebase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import * as NavigationBar from "expo-navigation-bar";
import { Stack, useFocusEffect } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import { useCallback, useEffect, useState } from "react";
import {
  MD3DarkTheme as PaperDarkTheme,
  MD3LightTheme as PaperDefaultTheme,
  PaperProvider,
} from "react-native-paper";
import "react-native-reanimated";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [appTheme, setAppTheme] = useState<ThemeName>("blue");
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      let themeFromDB = null;
      const user = auth.currentUser;

      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists() && userDoc.data().theme) {
          themeFromDB = userDoc.data().theme;
        }
      }

      if (themeFromDB && ["blue", "green", "purple"].includes(themeFromDB)) {
        setAppTheme(themeFromDB as ThemeName);
        await AsyncStorage.setItem("@app_theme", themeFromDB);
      } else {
        const savedTheme = await AsyncStorage.getItem("@app_theme");
        if (savedTheme && ["blue", "green", "purple"].includes(savedTheme)) {
          setAppTheme(savedTheme as ThemeName);
        }
      }
    } catch (error) {
      console.log("Error loading theme:", error);
      const savedTheme = await AsyncStorage.getItem("@app_theme");
      if (savedTheme && ["blue", "green", "purple"].includes(savedTheme)) {
        setAppTheme(savedTheme as ThemeName);
      }
    } finally {
      setThemeLoaded(true);
    }
  };

  useEffect(() => {
    if (!themeLoaded) return;

    updateCurrentColors(appTheme);

    const user = auth.currentUser;
    if (!user) return;

    const unsubscribe = onSnapshot(doc(db, "users", user.uid), (docSnap) => {
      if (docSnap.exists() && docSnap.data().theme) {
        const newTheme = docSnap.data().theme;
        if (["blue", "green", "purple"].includes(newTheme)) {
          setAppTheme(newTheme as ThemeName);
          updateCurrentColors(newTheme as ThemeName);
        }
      }
    });

    return () => unsubscribe();
  }, [themeLoaded, appTheme]);

  const themeColors = Colors[appTheme];
  const baseColors = isDark ? Colors.dark : Colors.light;

  const mergedColors = {
    ...baseColors,
    primary: themeColors.primary,
    primaryLight: themeColors.primaryLight,
    primaryDark: themeColors.primaryDark,
    secondary: themeColors.secondary,
    accent: themeColors.accent,
    tint: themeColors.tint,
    tabIconSelected: themeColors.tabIconSelected,
  };

  const hideSystemBars = async () => {
    try {
      await NavigationBar.setVisibilityAsync("hidden");
      await NavigationBar.setBehaviorAsync("overlay-swipe");
    } catch (error) {
      console.log("NavigationBar error:", error);
    }
  };

  useEffect(() => {
    hideSystemBars();
  }, []);

  useFocusEffect(
    useCallback(() => {
      hideSystemBars();
    }, []),
  );

  const paperTheme = isDark
    ? {
        ...PaperDarkTheme,
        colors: {
          ...PaperDarkTheme.colors,
          primary: mergedColors.primary,
          secondary: mergedColors.secondary,
          background: baseColors.background,
          surface: baseColors.surface,
        },
      }
    : {
        ...PaperDefaultTheme,
        colors: {
          ...PaperDefaultTheme.colors,
          primary: mergedColors.primary,
          secondary: mergedColors.secondary,
          background: baseColors.background,
          surface: baseColors.surface,
        },
      };

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: mergedColors.primary,
          background: baseColors.background,
          card: baseColors.surface,
          text: baseColors.text,
          border: baseColors.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: mergedColors.primary,
          background: baseColors.background,
          card: baseColors.surface,
          text: baseColors.text,
          border: baseColors.border,
        },
      };

  if (!themeLoaded) {
    return null;
  }

  return (
    <AppThemeProvider key={appTheme}>
      <PaperProvider theme={paperTheme}>
        <ThemeProvider value={navigationTheme}>
          <Stack screenOptions={{ headerShown: false }} />
          <StatusBar hidden />
        </ThemeProvider>
      </PaperProvider>
    </AppThemeProvider>
  );
}
