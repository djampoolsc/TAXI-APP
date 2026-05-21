-- Enable PostGIS extension
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  document_id VARCHAR(20) UNIQUE,
  user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('passenger', 'driver')),
  kyc_status VARCHAR(20) DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'verified', 'rejected')),
  reputation_score FLOAT DEFAULT 5.0,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'banned')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_status ON users(status);

-- User profiles
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  display_name VARCHAR(255),
  avatar_url VARCHAR(500),
  bio TEXT,
  verification_status VARCHAR(20),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- KYC documents
CREATE TABLE kyc_documents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  document_type VARCHAR(50), -- 'passport', 'id_card', 'license', 'vehicle_registration'
  document_url VARCHAR(500),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);

-- Rides
CREATE TABLE rides (
  id UUID PRIMARY KEY,
  passenger_id UUID REFERENCES users(id),
  driver_id UUID REFERENCES users(id),
  origin_lat FLOAT NOT NULL,
  origin_lon FLOAT NOT NULL,
  destination_lat FLOAT NOT NULL,
  destination_lon FLOAT NOT NULL,
  origin_point GEOMETRY(POINT, 4326),
  destination_point GEOMETRY(POINT, 4326),
  status VARCHAR(30) DEFAULT 'requested' CHECK (status IN ('requested', 'accepted', 'in_progress', 'completed', 'cancelled')),
  fare_amount DECIMAL(10, 2),
  payment_method VARCHAR(50),
  payment_status VARCHAR(20),
  rating_passenger INT,
  rating_driver INT,
  feedback_passenger TEXT,
  feedback_driver TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  started_at TIMESTAMP,
  ended_at TIMESTAMP,
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rides_passenger_id ON rides(passenger_id);
CREATE INDEX idx_rides_driver_id ON rides(driver_id);
CREATE INDEX idx_rides_status ON rides(status);
CREATE INDEX idx_rides_created_at ON rides(created_at);
CREATE INDEX idx_rides_origin_point ON rides USING GIST(origin_point);
CREATE INDEX idx_rides_destination_point ON rides USING GIST(destination_point);

-- Payments
CREATE TABLE payments (
  id UUID PRIMARY KEY,
  ride_id UUID REFERENCES rides(id),
  amount DECIMAL(10, 2) NOT NULL,
  method VARCHAR(50), -- 'yape', 'plin', 'card', 'wallet'
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  transaction_id VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_payments_ride_id ON payments(ride_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Wallets
CREATE TABLE wallets (
  id UUID PRIMARY KEY,
  user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  balance DECIMAL(10, 2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'PEN',
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(id),
  amount DECIMAL(10, 2),
  transaction_type VARCHAR(50), -- 'deposit', 'withdrawal', 'ride_charge', 'refund'
  related_id UUID, -- ride_id or other reference
  created_at TIMESTAMP DEFAULT NOW()
);

-- GPS tracks (using TimescaleDB for time-series)
CREATE TABLE gps_tracks (
  ride_id UUID NOT NULL REFERENCES rides(id),
  user_id UUID NOT NULL,
  latitude FLOAT NOT NULL,
  longitude FLOAT NOT NULL,
  accuracy FLOAT,
  location GEOMETRY(POINT, 4326),
  timestamp BIGINT NOT NULL
);

CREATE INDEX idx_gps_tracks_ride_id ON gps_tracks(ride_id);
CREATE INDEX idx_gps_tracks_timestamp ON gps_tracks(timestamp DESC);
CREATE INDEX idx_gps_tracks_location ON gps_tracks USING GIST(location);

-- Incidents (Emergency/Panic)
CREATE TABLE incidents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ride_id UUID REFERENCES rides(id),
  incident_type VARCHAR(50), -- 'panic_button', 'emergency_call', 'accident'
  latitude FLOAT,
  longitude FLOAT,
  location GEOMETRY(POINT, 4326),
  status VARCHAR(20) DEFAULT 'reported' CHECK (status IN ('reported', 'in_progress', 'resolved')),
  audio_url VARCHAR(500),
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_ride_id ON incidents(ride_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_location ON incidents USING GIST(location);

-- Fraud incidents
CREATE TABLE fraud_incidents (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  fraud_type VARCHAR(50),
  score FLOAT,
  risk_level VARCHAR(20), -- 'low', 'medium', 'high'
  action_taken VARCHAR(50),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_fraud_incidents_user_id ON fraud_incidents(user_id);
CREATE INDEX idx_fraud_incidents_score ON fraud_incidents(score DESC);

-- Create view for active rides
CREATE VIEW active_rides AS
SELECT r.* FROM rides r
WHERE r.status IN ('requested', 'accepted', 'in_progress');

-- Create view for ride metrics
CREATE VIEW ride_metrics AS
SELECT
  DATE_TRUNC('day', r.created_at) as ride_date,
  COUNT(*) as total_rides,
  COUNT(CASE WHEN r.status = 'completed' THEN 1 END) as completed_rides,
  AVG(r.fare_amount) as avg_fare,
  COUNT(DISTINCT r.driver_id) as unique_drivers,
  COUNT(DISTINCT r.passenger_id) as unique_passengers
FROM rides r
GROUP BY DATE_TRUNC('day', r.created_at);
