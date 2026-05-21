import { create } from 'zustand';

interface AuthStore {
  user: any;
  token: string | null;
  setUser: (user: any) => void;
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
  activeRide: any;
  rides: any[];
  setActiveRide: (ride: any) => void;
  setRides: (rides: any[]) => void;
  updateRide: (ride: any) => void;
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
