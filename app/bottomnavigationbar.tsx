import { auth } from '@/services/firebase';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useSegments } from 'expo-router';
import { onAuthStateChanged } from 'firebase/auth';
import React, { useEffect, useState } from 'react';
import {
  LayoutAnimation,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme
} from 'react-native';
import { BorderRadius, Spacing, FontSize, Shadow, FontWeight, currentColors } from '@/constants/theme';

type AppRoute = 
  | '/home'
  | '/mypets'
  | '/symptomchecker'
  | '/appointments'
  | '/imagechecker';

type NavItem = {
  name: string;
  icon: string;
  route: AppRoute;
  color: string;
};

const TAB_COLORS = {
  home: '#6366F1',
  mypets: '#8B5CF6',
  symptomchecker: '#EC4899',
  appointments: '#F59E0B',
  imagechecker: '#10B981',
};

const GRADIENT_COLORS = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B', '#10B981'];

const BottomNavigationBar = () => {
  const [currentUser, setCurrentUser] = useState(auth.currentUser);
  const segments = useSegments();
  const [activeRoute, setActiveRoute] = useState<string>(segments.length > 0 ? segments[segments.length - 1] : 'home');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeRoute]);

  useEffect(() => {
    if (segments.length > 0) {
      const currentRoute = segments[segments.length - 1];
      setActiveRoute(currentRoute);
    }
  }, [segments]);

  const navItems: NavItem[] = [
    { 
      name: 'Home', 
      icon: 'home', 
      route: '/home',
      color: TAB_COLORS.home
    },
    { 
      name: 'Pets', 
      icon: 'paw', 
      route: '/mypets',
      color: TAB_COLORS.mypets
    },
    { 
      name: 'AI Check', 
      icon: 'robot', 
      route: '/symptomchecker',
      color: TAB_COLORS.symptomchecker
    },
    { 
      name: 'Appts', 
      icon: 'calendar', 
      route: '/appointments',
      color: TAB_COLORS.appointments
    },
    { 
      name: 'Scan', 
      icon: 'camera', 
      route: '/imagechecker',
      color: TAB_COLORS.imagechecker
    }
  ];

  if (!currentUser) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.navBarWrapper}>
        <View style={styles.accentBorder}>
          {GRADIENT_COLORS.map((color, index) => (
            <View 
              key={index} 
              style={[
                styles.accentSegment, 
                { backgroundColor: color, flex: 1 }
              ]} 
            />
          ))}
        </View>
        
        <View style={styles.navBar}>
          {navItems.map((item) => {
            const isActive = activeRoute === item.route.split('/').pop();
            const routeKey = item.route.split('/').pop() as keyof typeof TAB_COLORS;
            const itemColor = TAB_COLORS[routeKey] || item.color;
            
            return (
              <Link 
                key={item.name}
                href={item.route}
                style={styles.navButton}
                asChild
              >
                <TouchableOpacity 
                  activeOpacity={0.7}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    setActiveRoute(item.route.split('/').pop() || 'home');
                  }}
                >
                  <View style={[
                    styles.iconContainer,
                    isActive && [styles.activeIconContainer, { backgroundColor: itemColor }],
                  ]}>
                    <MaterialCommunityIcons
                      name={item.icon as any}
                      size={24}
                      color={isActive ? '#FFFFFF' : '#94A3B8'}
                      style={isActive ? styles.activeIcon : undefined}
                    />
                  </View>
                  <Text style={[
                    styles.navText,
                    { 
                      color: isActive ? itemColor : '#94A3B8',
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
  },
  navBarWrapper: {
    borderRadius: BorderRadius.xxl,
    overflow: 'hidden',
    ...Shadow.xl,
  },
  accentBorder: {
    height: 4,
    flexDirection: 'row',
  },
  accentSegment: {
    height: '100%',
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    flex: 1,
  },
  iconContainer: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    marginBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconContainer: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  activeIcon: {
    transform: [{ scale: 1.05 }],
  },
  navText: {
    fontSize: FontSize.xs,
    textAlign: 'center',
  },
});

export default BottomNavigationBar;
