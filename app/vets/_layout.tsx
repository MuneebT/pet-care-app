import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, usePathname, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useTheme } from 'react-native-paper';
import VetBottomNavigationBar from './bootomna';

export default function VetLayout() {
  const theme = useTheme();
  const router = useRouter();
  const segments = useSegments();
  const pathname = usePathname();
  const [isCheckingCredentials, setIsCheckingCredentials] = useState(true);

  // Check if credentials are filled on initial load
  useEffect(() => {
    const checkCredentials = async () => {
      try {
        const hasFilledCredentials = await AsyncStorage.getItem('@vet_credentials_filled');
        const currentRoute = segments[segments.length - 1] || 'home';
        
        if (!hasFilledCredentials && currentRoute !== 'credentials') {
          router.replace('/vets/credentials');
        } else if (hasFilledCredentials && currentRoute === 'credentials') {
          router.replace('/vets/home');
        }
      } catch (error) {
        console.error('Error checking credentials:', error);
      } finally {
        setIsCheckingCredentials(false);
      }
    };

    checkCredentials();
  }, [segments]);

  // Show loading state while checking credentials
  if (isCheckingCredentials) {
    return null; // Or a loading spinner
  }

  // Debug: Log the current pathname and segments
  console.log('Pathname:', pathname);
  console.log('Segments:', segments);
  
  // Don't show bottom nav on home screen or credentials screen
  const shouldShowBottomNav = !['/vets/home', '/vets/credentials', '/(vets)/home', '/(vets)/credentials'].includes(pathname || '');
  console.log('Show bottom nav?', shouldShowBottomNav);

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: theme.colors.background },
        }}
      />
      <VetBottomNavigationBar show={shouldShowBottomNav} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 0,
    borderTopWidth: 0,
    height: 60,
    paddingBottom: 10,
  },
  tabBarLabel: {
    fontSize: 12,
    marginBottom: 5,
  },
});
