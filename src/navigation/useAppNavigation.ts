import { useRouter } from 'expo-router';
import { AppRoute } from './types';

// Type for navigation parameters
type NavigationParams = {
  pathname: string;
  params?: Record<string, any>;
};

export function useAppNavigation() {
  const router = useRouter();

  const navigate = (route: AppRoute | NavigationParams) => {
    if (typeof route === 'string') {
      router.push(route as any);
    } else {
      router.push(route as any);
    }
  };

  return { navigate };
}
