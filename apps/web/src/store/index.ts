import { create } from 'zustand';

type UserType = 'passenger' | 'driver';

interface AuthUser {
  id: string;
  email: string;
  user_type: UserType;
}

interface Ride {
  id: string;
  passenger_id: string;
  driver_id?: string;
  origin?: { latitude: number; longitude: number };
  destination?: { latitude: number; longitude: number };
  status: 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  fare_amount?: number;
}

interface AuthStore {
  user: AuthUser | null;
  token: string | null;
  setUser: (user: AuthUser | null) => void;
  setToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: localStorage.getItem('token'),
  setUser: (user) => set({ user }),
  setToken: (token) => {
    localStorage.setItem('token', token);
    set({ token });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
}));

interface RideStore {
  activeRide: Ride | null;
  rides: Ride[];
  setActiveRide: (ride: Ride | null) => void;
  setRides: (rides: Ride[]) => void;
  updateRide: (ride: Ride) => void;
}

export const useRideStore = create<RideStore>((set) => ({
  activeRide: null,
  rides: [],
  setActiveRide: (ride) => set({ activeRide: ride }),
  setRides: (rides) => set({ rides }),
  updateRide: (ride) =>
    set((state) => ({
      rides: state.rides.map((r) => (r.id === ride.id ? ride : r)),
      activeRide: state.activeRide?.id === ride.id ? ride : state.activeRide,
    })),
}));
