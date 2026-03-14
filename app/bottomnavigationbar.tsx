import { auth } from '@/services/firebase';
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
import { Colors, BorderRadius, Spacing, FontSize, Shadow, FontWeight, currentColors } from '@/constants/theme';

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
  const isDark = colorScheme === 'dark';
  const router = useRouter();
  const segments = useSegments();
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const [activeRoute, setActiveRoute] = useState('home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

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
      color: currentColors.primary
    },
    { 
      name: 'Pets', 
      icon: 'paw', 
      route: '/mypets',
      color: '#8B5CF6'
    },
    { 
      name: 'AI Check', 
      icon: 'robot', 
      route: '/symptomchecker',
      color: '#EC4899'
    },
    { 
      name: 'Appts', 
      icon: 'calendar', 
      route: '/appointments',
      color: '#F59E0B'
    },
    { 
      name: 'Scan', 
      icon: 'camera', 
      route: '/imagechecker',
      color: '#10B981'
    }
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.navBar, {
        backgroundColor: currentColors.surface,
      }]}>
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
                  { backgroundColor: isActive ? `${item.color}15` : 'transparent' }
                ]}>
                  <MaterialCommunityIcons
                    name={item.icon as any}
                    size={22}
                    color={isActive ? item.color : currentColors.textTertiary}
                  />
                </View>
                <Text style={[
                  styles.navText,
                  { 
                    color: isActive ? item.color : currentColors.textTertiary,
                    fontWeight: isActive ? FontWeight.semibold : FontWeight.regular
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
    bottom: Spacing.md,
    left: Spacing.md,
    right: Spacing.md,
    ...Shadow.lg,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    borderRadius: BorderRadius.xl,
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    flex: 1,
  },
  iconContainer: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    marginBottom: 2,
  },
  activeIconContainer: {
  },
  navText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});

export default BottomNavigationBar;
