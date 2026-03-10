import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { MD3DarkTheme as PaperDarkTheme, MD3LightTheme as PaperDefaultTheme, PaperProvider } from 'react-native-paper';
import { Colors } from '@/constants/theme';
import 'react-native-reanimated';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const themeColors = isDark ? Colors.dark : Colors.light;

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
    }, [])
  );

  const paperTheme = isDark 
    ? { 
        ...PaperDarkTheme, 
        colors: { 
          ...PaperDarkTheme.colors, 
          primary: themeColors.primary,
          secondary: themeColors.secondary,
          background: themeColors.background,
          surface: themeColors.surface,
        } 
      }
    : { 
        ...PaperDefaultTheme, 
        colors: { 
          ...PaperDefaultTheme.colors, 
          primary: themeColors.primary,
          secondary: themeColors.secondary,
          background: themeColors.background,
          surface: themeColors.surface,
        } 
      };

  const navigationTheme = isDark 
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: themeColors.primary,
          background: themeColors.background,
          card: themeColors.surface,
          text: themeColors.text,
          border: themeColors.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: themeColors.primary,
          background: themeColors.background,
          card: themeColors.surface,
          text: themeColors.text,
          border: themeColors.border,
        },
      };

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={navigationTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar hidden />
      </ThemeProvider>
    </PaperProvider>
  );
}
