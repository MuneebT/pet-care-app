import 'expo-router';

declare global {
  namespace ReactNavigation {
    interface RootParamList {
      // Vet routes
      'vets/home': undefined;
      'vets/appointments': undefined;
      'vets/mypatients': undefined;
      'vets/myprofile': undefined;
      'vets/credentials': undefined;
      'vets/patient/[id]': { id: string };
      
      // Add other routes as needed
    }
  }
}

type VetRoute = 
  | '/vets/home'
  | '/vets/appointments'
  | '/vets/mypatients'
  | '/vets/myprofile'
  | '/vets/credentials'
  | `/vets/patient/${string}`;

// This extends the type of expo router
declare module 'expo-router' {
  export interface LinkProps extends Omit<React.ComponentProps<typeof import('expo-router').Link>,
    'href'
  > {
    href: VetRoute | import('expo-router').Href<ReactNavigation.RootParamList>;
  }

  // Extend the router type to include our custom routes
  export interface Router {
    push: (route: VetRoute | import('expo-router').Href<ReactNavigation.RootParamList>) => void;
    replace: (route: VetRoute | import('expo-router').Href<ReactNavigation.RootParamList>) => void;
  }
}
