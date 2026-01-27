import { auth } from '@/src/config/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useRouter, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { useTheme } from 'react-native-paper';

type AppRoute = 
  | '/home'
  | '/mypets'
  | '/symptomchecker'
  | '/appointments'
  | '/imagechecker';

type NavItem = {
  name: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  route: AppRoute;
  color: string;
};

const BottomNavigationBar = () => {
  const theme = useTheme();
  const colorScheme = useColorScheme();
  const router = useRouter();
  const segments = useSegments();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [activeRoute, setActiveRoute] = useState('home');

  // Get current user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  // Update active route when segments change
  useEffect(() => {
    if (segments.length > 0) {
      setActiveRoute(segments[segments.length - 1]);
    }
  }, [segments]);

  const navItems: NavItem[] = [
    { 
      name: 'Home', 
      icon: 'home', 
      route: '/home',
      color: theme.colors.primary
    },
    { 
      name: 'My Pets', 
      icon: 'paw', 
      route: '/mypets',
      color: theme.colors.secondary
    },
    { 
      name: 'AI Checker', 
      icon: 'robot', 
      route: '/symptomchecker',
      color: '#6a5acd'
    },
    { 
      name: 'Appointments', 
      icon: 'calendar', 
      route: '/appointments',
      color: '#ff6b6b'
    },
    { 
      name: 'Detector', 
      icon: 'camera', 
      route: '/imagechecker',
      color: '#4ecdc4'
    }
  ];

  if (!currentUser) {
    return null; // Don't show navigation if user is not logged in
  }

  return (
    <View style={[styles.container, { 
      backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#ffffff',
      borderTopColor: colorScheme === 'dark' ? '#333' : '#e0e0e0'
    }]}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = activeRoute === item.route.split('/').pop();
          return (
            <Link 
              key={item.name}
              href={item.route}
              style={styles.navButton}
              asChild
            >
              <TouchableOpacity activeOpacity={0.7}>
                <View style={[
                  styles.iconContainer,
                  isActive && styles.activeIconContainer,
                  { backgroundColor: isActive ? `${item.color}20` : 'transparent' }
                ]}>
                  <MaterialCommunityIcons
                    name={item.icon}
                    size={24}
                    color={isActive ? item.color : colorScheme === 'dark' ? '#a0a0a0' : '#666666'}
                  />
                </View>
                <Text style={[
                  styles.navText,
                  { 
                    color: isActive ? item.color : colorScheme === 'dark' ? '#a0a0a0' : '#666666',
                    fontWeight: isActive ? 'bold' : 'normal'
                  }
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            </Link>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navButton: {
    alignItems: 'center',
    padding: 4,
    borderRadius: 8,
    flex: 1,
  },
  iconContainer: {
    padding: 8,
    borderRadius: 20,
    marginBottom: 4,
  },
  activeIconContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
  navText: {
    fontSize: 10,
    marginTop: 2,
    textAlign: 'center',
    fontFamily: 'System',
  },
});

export default BottomNavigationBar;