import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../../config/redis';
import { BadRequest } from '../../middleware/errorHandler';

const router = Router();

// POST /api/v1/telemetry/gps - Send GPS location during ride
router.post('/gps', async (req: Request, res: Response) => {
  try {
    const { ride_id, user_id, latitude, longitude, accuracy } = req.body;

    if (!ride_id || !latitude || !longitude) {
      throw new BadRequest('Missing required fields');
    }

    const timestamp = Date.now();

    // Store in Redis for real-time access
    const gpsKey = `gps:${ride_id}`;
    await redisClient.lPush(
      gpsKey,
      JSON.stringify({
        latitude,
        longitude,
        accuracy,
        timestamp,
      })
    );

    // Keep only last 1000 GPS points per ride (100 min at 10s intervals)
    await redisClient.lTrim(gpsKey, 0, 999);

    // Set expiration to 24 hours
    await redisClient.expire(gpsKey, 86400);

    res.json({ message: 'GPS location recorded' });
  } catch (err) {
    throw err;
  }
});

// GET /api/v1/telemetry/ride/:ride_id - Get GPS track for ride
router.get('/ride/:ride_id', async (req: Request, res: Response) => {
  try {
    const gpsKey = `gps:${req.params.ride_id}`;
    const gpsData = await redisClient.lRange(gpsKey, 0, -1);

    const track = gpsData.map((point) => JSON.parse(point)).reverse();

    res.json({
      ride_id: req.params.ride_id,
      track_points: track.length,
      track,
    });
  } catch (err) {
    throw err;
  }
});

export default router;
