import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useSegments } from 'expo-router';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from 'react-native-paper';

type VetRoute = 
  | '/vets/home'
  | '/vets/appointments'
  | '/vets/mypatients'
  | '/vets/myprofile'
  | '/vets/credentials'

type VetNavItem = {
  name: string;
  icon: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  route: VetRoute;
};

interface VetBottomNavigationBarProps {
  show: boolean;
}

const VetBottomNavigationBar = ({ show }: VetBottomNavigationBarProps) => {
  const theme = useTheme();
  const segments = useSegments();
  const activeRoute = segments[segments.length - 1] || 'home';
  
  // Don't render anything if show is false
  if (!show) {
    return null;
  }

  const navItems: VetNavItem[] = [
    { 
      name: 'Home', 
      icon: 'home', 
      route: '/vets/home' as const
    },
    { 
      name: 'Appointments', 
      icon: 'calendar', 
      route: '/vets/appointments' as const
    },
    { 
      name: 'Patients', 
      icon: 'account-group', 
      route: '/vets/mypatients' as const
    },
    { 
      name: 'Profile', 
      icon: 'account', 
      route: '/vets/myprofile' as const
    }
  ];

  return (
    <View style={[styles.container, { 
      backgroundColor: theme.colors.surface,
      borderTopColor: theme.colors.outline
    }]}>
      <View style={styles.navBar}>
        {navItems.map((item) => {
          const isActive = activeRoute === item.route.split('/').pop();
          return (
            <Link 
              key={item.name}
              href={item.route as any}
              style={styles.navItem}
            >
              <MaterialCommunityIcons
                name={item.icon}
                size={24}
                color={isActive ? theme.colors.primary : theme.colors.onSurfaceVariant}
              />
              <Text 
                style={[
                  styles.navText, 
                  { 
                    color: isActive ? theme.colors.primary : theme.colors.onSurfaceVariant,
                    fontFamily: isActive ? 'sans-serif-medium' : 'sans-serif'
                  }
                ]}
              >
                {item.name}
              </Text>
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
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  navBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    paddingBottom: 24, // Extra padding for iPhone home indicator
  },
  navItem: {
    alignItems: 'center',
    padding: 8,
    minWidth: 64,
  },
  navText: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default VetBottomNavigationBar;
