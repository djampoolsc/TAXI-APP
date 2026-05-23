import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../config/database';
import { BadRequest } from '../../middleware/errorHandler';

const router = Router();

function isValidCoordinate(value: unknown) {
  return typeof value === 'number' && Number.isFinite(value);
}

// GET /api/v1/rides/active/list - Get active rides for user
router.get('/active/list', async (req: Request, res: Response) => {
  try {
    const { user_id, user_type } = req.query;

    let query = `SELECT * FROM rides WHERE status IN ('requested', 'accepted', 'in_progress')`;
    const params: string[] = [];

    if (user_type === 'passenger') {
      if (!user_id || typeof user_id !== 'string') {
        throw new BadRequest('user_id is required for passengers');
      }
      query += ' AND passenger_id = $1';
      params.push(user_id);
    } else if (user_type === 'driver') {
      if (!user_id || typeof user_id !== 'string') {
        throw new BadRequest('user_id is required for drivers');
      }
      query += ' AND driver_id = $1';
      params.push(user_id);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json({ rides: result.rows });
  } catch (err) {
    throw err;
  }
});

// POST /api/v1/rides - Request a ride
router.post('/request', async (req: Request, res: Response) => {
  try {
    const { passenger_id, origin, destination } = req.body;

    if (!passenger_id || !origin || !destination) {
      throw new BadRequest('Missing required fields');
    }

    if (
      !isValidCoordinate(origin.latitude) ||
      !isValidCoordinate(origin.longitude) ||
      !isValidCoordinate(destination.latitude) ||
      !isValidCoordinate(destination.longitude)
    ) {
      throw new BadRequest('Invalid origin or destination coordinates');
    }

    const rideId = uuidv4();

    // Create ride in 'requested' status
    const result = await pool.query(
      `INSERT INTO rides (
        id, passenger_id, origin_lat, origin_lon, destination_lat, destination_lon,
        origin_point, destination_point, status, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6,
               ST_GeomFromText('POINT(' || $4 || ' ' || $3 || ')', 4326),
               ST_GeomFromText('POINT(' || $6 || ' ' || $5 || ')', 4326),
               'requested', NOW())
       RETURNING *`,
      [rideId, passenger_id, origin.latitude, origin.longitude, destination.latitude, destination.longitude]
    );

    res.status(201).json({ ride: result.rows[0] });
  } catch (err) {
    throw err;
  }
});

// GET /api/v1/rides/:id - Get ride details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM rides WHERE id = $1', [req.params.id]);

    if (result.rows.length === 0) {
      throw new BadRequest('Ride not found');
    }

    res.json({ ride: result.rows[0] });
  } catch (err) {
    throw err;
  }
});

// POST /api/v1/rides/:id/accept - Driver accepts ride
router.post('/:id/accept', async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.body;

    if (!driver_id) {
      throw new BadRequest('driver_id is required');
    }

    const result = await pool.query(
      `UPDATE rides
       SET driver_id = $1, status = 'accepted', updated_at = NOW()
       WHERE id = $2 AND status = 'requested'
       RETURNING *`,
      [driver_id, req.params.id]
    );

    if (result.rows.length === 0) {
      throw new BadRequest('Ride already accepted or not found');
    }

    res.json({ ride: result.rows[0] });
  } catch (err) {
    throw err;
  }
});

// POST /api/v1/rides/:id/start - Start ride
router.post('/:id/start', async (req: Request, res: Response) => {
  try {
    const { driver_id } = req.body;

    if (!driver_id) {
      throw new BadRequest('driver_id is required');
    }

    const result = await pool.query(
      `UPDATE rides
       SET status = 'in_progress', started_at = NOW(), updated_at = NOW()
       WHERE id = $1 AND status = 'accepted' AND driver_id = $2
       RETURNING *`,
      [req.params.id, driver_id]
    );

    if (result.rows.length === 0) {
      throw new BadRequest('Ride must be accepted by this driver before starting');
    }

    res.json({ ride: result.rows[0] });
  } catch (err) {
    throw err;
  }
});

// POST /api/v1/rides/:id/complete - Complete ride
router.post('/:id/complete', async (req: Request, res: Response) => {
  try {
    const { fare_amount, driver_id } = req.body;

    if (!driver_id) {
      throw new BadRequest('driver_id is required');
    }

    if (typeof fare_amount !== 'number' || fare_amount <= 0) {
      throw new BadRequest('fare_amount must be a positive number');
    }

    const result = await pool.query(
      `UPDATE rides
       SET status = 'completed', fare_amount = $1, ended_at = NOW(), updated_at = NOW()
       WHERE id = $2 AND status = 'in_progress' AND driver_id = $3
       RETURNING *`,
      [fare_amount, req.params.id, driver_id]
    );

    if (result.rows.length === 0) {
      throw new BadRequest('Ride must be in progress and owned by this driver');
    }

    res.json({ ride: result.rows[0] });
  } catch (err) {
    throw err;
  }
});

export default router;
