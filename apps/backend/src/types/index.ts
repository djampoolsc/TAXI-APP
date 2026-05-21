// User types
export type UserType = 'passenger' | 'driver';
export type KYCStatus = 'pending' | 'verified' | 'rejected';
export type UserStatus = 'active' | 'inactive' | 'banned';

export interface User {
  id: string;
  email: string;
  phone: string;
  document_id?: string;
  user_type: UserType;
  kyc_status: KYCStatus;
  reputation_score: number;
  status: UserStatus;
  created_at: Date;
  updated_at: Date;
}

// Ride types
export type RideStatus = 'requested' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export interface Ride {
  id: string;
  passenger_id: string;
  driver_id?: string;
  origin: { latitude: number; longitude: number };
  destination: { latitude: number; longitude: number };
  status: RideStatus;
  fare_amount?: number;
  payment_method?: string;
  payment_status?: 'pending' | 'success' | 'failed';
  rating_passenger?: number;
  rating_driver?: number;
  created_at: Date;
  started_at?: Date;
  ended_at?: Date;
}

// Payment types
export interface Payment {
  id: string;
  ride_id: string;
  amount: number;
  method: 'yape' | 'plin' | 'card' | 'wallet';
  status: 'pending' | 'success' | 'failed';
  transaction_id: string;
  created_at: Date;
}

// Fraud score
export interface FraudScore {
  score: number; // 0-1
  risk_level: 'low' | 'medium' | 'high';
  factors: string[];
}

// GPS location
export interface GPSLocation {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
}

// Emergency incident
export interface Incident {
  id: string;
  user_id: string;
  ride_id?: string;
  incident_type: string;
  location: { latitude: number; longitude: number };
  status: 'reported' | 'in_progress' | 'resolved';
  created_at: Date;
}

// API Response
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
  status: number;
}
