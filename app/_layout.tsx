import { useColorScheme } from '@/hooks/use-color-scheme';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import * as NavigationBar from 'expo-navigation-bar';
import { Stack, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect } from 'react';
import { MD3DarkTheme as PaperDarkTheme, MD3LightTheme as PaperDefaultTheme, PaperProvider } from 'react-native-paper';
import 'react-native-reanimated';

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

  const paperTheme = colorScheme === 'dark' 
    ? { ...PaperDarkTheme, colors: { ...PaperDarkTheme.colors, primary: '#BB86FC' } }
    : { ...PaperDefaultTheme, colors: { ...PaperDefaultTheme.colors, primary: '#6200EE' } };

  return (
    <PaperProvider theme={paperTheme}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack screenOptions={{ headerShown: false }} />
        <StatusBar hidden />
      </ThemeProvider>
    </PaperProvider>
  );
}
