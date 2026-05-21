import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { pool } from '../config/database';

describe('Auth Service', () => {
  beforeAll(async () => {
    // Setup test database
    await pool.query('DELETE FROM users WHERE email LIKE \'%test%\'');
  });

  afterAll(async () => {
    await pool.end();
  });

  it('should register a new user', async () => {
    const response = await pool.query(
      `INSERT INTO users (id, email, phone, password_hash, user_type, kyc_status, status, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
       RETURNING id, email`,
      ['test-id', 'test@axiom.pe', '+51999999999', 'hashed', 'passenger', 'verified', 'active']
    );

    expect(response.rows).toHaveLength(1);
    expect(response.rows[0].email).toBe('test@axiom.pe');
  });

  it('should retrieve user by email', async () => {
    const response = await pool.query('SELECT * FROM users WHERE email = $1', ['test@axiom.pe']);

    expect(response.rows).toHaveLength(1);
    expect(response.rows[0].user_type).toBe('passenger');
  });
});

describe('Rides Service', () => {
  it('should create a new ride request', async () => {
    const response = await pool.query(
      `INSERT INTO rides (id, passenger_id, status, origin_lat, origin_lon, destination_lat, destination_lon, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING id, status`,
      ['ride-123', 'test-id', 'requested', -12.0464, -77.0428, -12.0556, -77.0496]
    );

    expect(response.rows).toHaveLength(1);
    expect(response.rows[0].status).toBe('requested');
  });

  it('should accept a ride', async () => {
    const response = await pool.query(
      `UPDATE rides SET driver_id = $1, status = 'accepted' WHERE id = $2 RETURNING *`,
      ['driver-123', 'ride-123']
    );

    expect(response.rows).toHaveLength(1);
    expect(response.rows[0].status).toBe('accepted');
    expect(response.rows[0].driver_id).toBe('driver-123');
  });
});
