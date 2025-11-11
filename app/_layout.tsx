import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';



export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="splashscreen" options={{headerShown:false}}/>
        <Stack.Screen name="login" options={{headerShown:false}}/>
        <Stack.Screen name="signup" options={{headerShown:false}}/>
        <Stack.Screen name='bookapointment' options={{headerShown:false}}/>
        <Stack.Screen name="mypets" options={{headerShown:false}}/>
        <Stack.Screen name="mypetrecords" options={{headerShown:false}}/>
        <Stack.Screen name="editpets" options={{headerShown:false}}/>
        <Stack.Screen name="symptomchecker" options={{headerShown:false}}/>
        <Stack.Screen name="appointments" options={{headerShown:false}}/>
        <Stack.Screen name="reminders" options={{headerShown:false}}/>
        <Stack.Screen name="healthrecords" options={{headerShown:false}}/>
        <Stack.Screen name="imagechecker" options={{headerShown:false}}/>
        <Stack.Screen name='home' options={{headerShown:false}}/>
        <Stack.Screen name='bottomnavigationbar' options={{headerShown:false}}/>
        
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
