import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useSegments } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  LayoutAnimation,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { BorderRadius, Spacing, FontSize, Shadow, FontWeight, currentColors } from '@/constants/theme';

type VetNavItem = {
  name: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  route: '/vets/home' | '/vets/appointments' | '/vets/mypatients' | '/settings/vet';
  color: string;
};

const TAB_COLORS = {
  home: '#6366F1',
  appointments: '#8B5CF6',
  mypatients: '#10B981',
  vet: '#F59E0B',
};

const ACCENT_COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B'];
const AUTO_HIDE_DELAY_MS = 2500;

interface VetBottomNavigationBarProps {
  show: boolean;
}

const VetBottomNavigationBar = ({ show }: VetBottomNavigationBarProps) => {
  const segments = useSegments();
  const [activeRoute, setActiveRoute] = useState<string>(
    segments.length > 0 ? segments[segments.length - 1] : 'home'
  );
  const [isVisible, setIsVisible] = useState(true);
  const [navAnimation] = useState(() => new Animated.Value(1));
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const resetAutoHide = () => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => {
      Animated.timing(navAnimation, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start(({ finished }) => {
        if (finished) setIsVisible(false);
      });
    }, AUTO_HIDE_DELAY_MS);
  };

  useEffect(() => {
    if (segments.length > 0) {
      setActiveRoute(segments[segments.length - 1]);
    }
  }, [segments]);

  useEffect(() => {
    if (!show) return;
    setIsVisible(true);
    Animated.timing(navAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    resetAutoHide();
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, [activeRoute, show, navAnimation]);

  useEffect(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  }, [activeRoute]);

  const showNavigation = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setIsVisible(true);
    Animated.timing(navAnimation, {
      toValue: 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    resetAutoHide();
  };

  if (!show) return null;

  const navItems: VetNavItem[] = [
    { name: 'Home', icon: 'home', route: '/vets/home', color: TAB_COLORS.home },
    { name: 'Appointments', icon: 'calendar', route: '/vets/appointments', color: TAB_COLORS.appointments },
    { name: 'Patients', icon: 'account-group', route: '/vets/mypatients', color: TAB_COLORS.mypatients },
    { name: 'Settings', icon: 'cog-outline', route: '/settings/vet', color: TAB_COLORS.vet },
  ];

  return (
    <>
      {!isVisible && (
        <Pressable style={styles.revealOverlay} onPress={showNavigation} />
      )}

      <Animated.View
        pointerEvents={isVisible ? 'auto' : 'none'}
        style={[
          styles.container,
          {
            opacity: navAnimation,
            transform: [
              {
                translateY: navAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [110, 0],
                }),
              },
            ],
          },
        ]}
      >
        <View style={styles.navBarWrapper}>
          <View style={styles.accentBorder}>
            {ACCENT_COLORS.map((color, index) => (
              <View
                key={index}
                style={[styles.accentSegment, { backgroundColor: color, flex: 1 }]}
              />
            ))}
          </View>

          <View style={styles.navBar}>
            {navItems.map((item) => {
              const routeKey = item.route.split('/').pop() as keyof typeof TAB_COLORS;
              const itemColor = TAB_COLORS[routeKey] || item.color;
              const isActive = activeRoute === routeKey;

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
                      showNavigation();
                      setActiveRoute(routeKey);
                    }}
                  >
                    <View style={[
                      styles.iconContainer,
                      isActive && [styles.activeIconContainer, { backgroundColor: itemColor }],
                    ]}>
                      <MaterialCommunityIcons
                        name={item.icon}
                        size={24}
                        color={isActive ? '#FFFFFF' : currentColors.textTertiary}
                        style={isActive ? styles.activeIcon : undefined}
                      />
                    </View>
                    <Text style={[
                      styles.navText,
                      {
                        color: isActive ? itemColor : currentColors.textTertiary,
                        fontWeight: isActive ? FontWeight.semibold : FontWeight.regular,
                      },
                    ]}>
                      {item.name}
                    </Text>
                  </TouchableOpacity>
                </Link>
              );
            })}
          </View>
        </View>
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  revealOverlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 20,
  },
  container: {
    position: 'absolute',
    bottom: Spacing.lg,
    left: Spacing.md,
    right: Spacing.md,
    zIndex: 30,
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
    backgroundColor: currentColors.surface,
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

export default VetBottomNavigationBar;