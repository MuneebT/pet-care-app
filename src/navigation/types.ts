type RouteParams = {
  '/vets/health-records/[petId]': { petId: string };
  '/vets/[id]': { id: string };
  [key: string]: object | undefined;
};

type RouteName = 
  | '/login'
  | '/vets/home'
  | '/vets/appointments'
  | '/vets/mypatients'
  | '/vets/myprofile'
  | '/vets/credentials'
  | '/vets/[id]'
  | '/vets/health-records/[petId]';

export type RootStackParamList = {
  [K in RouteName]: K extends keyof RouteParams ? RouteParams[K] : undefined;
};

// This type will allow any string that starts with /vets/patient/
export type DynamicVetPatientRoute = `/vets/patient/${string}`;

// This combines our static routes with the dynamic routes
export type AppRoute = 
  | RouteName
  | `/vets/health-records/${string}`
  | `/vets/${string}`  // Allow any route that starts with /vets/
  | `/${string}`;  // Fallback for any other route

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
