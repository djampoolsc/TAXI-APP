import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../config/database';
import { BadRequest } from '../../middleware/errorHandler';

const router = Router();

// POST /api/v1/emergency/panic - Trigger panic button
router.post('/panic', async (req: Request, res: Response) => {
  try {
    const { user_id, ride_id, latitude, longitude, audio_url } = req.body;

    if (!user_id || !latitude || !longitude) {
      throw new BadRequest('Missing required fields');
    }

    const incidentId = uuidv4();

    const result = await pool.query(
      `INSERT INTO incidents (
        id, user_id, ride_id, incident_type, latitude, longitude,
        location, status, audio_url, created_at
      ) VALUES ($1, $2, $3, 'panic_button', $4, $5,
               ST_GeomFromText('POINT(' || $4 || ' ' || $5 || ')', 4326),
               'reported', $6, NOW())
       RETURNING *`,
      [incidentId, user_id, ride_id || null, latitude, longitude, audio_url || null]
    );

    // TODO: Notify emergency services, police, SOS contacts

    res.status(201).json({
      incident: result.rows[0],
      message: 'Emergency alert sent. Help is on the way.',
    });
  } catch (err) {
    throw err;
  }
});

// GET /api/v1/emergency/incidents - List incidents for admin
router.get('/incidents', async (req: Request, res: Response) => {
  try {
    const { limit = 50, offset = 0, status } = req.query;

    let query = 'SELECT * FROM incidents WHERE 1=1';
    const params: any[] = [];

    if (status) {
      query += ' AND status = $' + (params.length + 1);
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await pool.query(query, params);
    res.json({ incidents: result.rows });
  } catch (err) {
    throw err;
  }
});

// POST /api/v1/emergency/incidents/:id/resolve - Resolve incident
router.post('/incidents/:id/resolve', async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `UPDATE incidents SET status = 'resolved', updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );

    res.json({ incident: result.rows[0] });
  } catch (err) {
    throw err;
  }
});

export default router;
