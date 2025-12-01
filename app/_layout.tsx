import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import * as NavigationBar from 'expo-navigation-bar';
import { useCallback, useEffect } from 'react';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  const hideSystemBars = async () => {
    try {
      await NavigationBar.setVisibilityAsync("hidden");
      await NavigationBar.setBehaviorAsync("overlay-swipe");
    } catch (error) {
      console.log("NavigationBar error:", error);
    }
  };

  // Run once on app startup
  useEffect(() => {
    hideSystemBars();
  }, []);

  // Run again every time the screen is focused (after picking image/document)
  useFocusEffect(
    useCallback(() => {
      hideSystemBars();
    }, [])
  );

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false }} />
      <StatusBar hidden />
    </ThemeProvider>
  );
}
