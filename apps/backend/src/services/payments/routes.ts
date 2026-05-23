import { Router, Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { pool } from '../../config/database';
import { BadRequest } from '../../middleware/errorHandler';

const router = Router();

// POST /api/v1/payments/process - Process payment (MOCKED)
router.post('/process', async (req: Request, res: Response) => {
  let inTransaction = false;
  try {
    const { ride_id, amount, method } = req.body;

    if (!ride_id || !amount || !method) {
      throw new BadRequest('Missing required fields');
    }

    if (typeof amount !== 'number' || amount <= 0) {
      throw new BadRequest('amount must be a positive number');
    }

    // Validate payment method
    const valid_methods = ['yape', 'plin', 'card', 'wallet'];
    if (!valid_methods.includes(method)) {
      throw new BadRequest('Invalid payment method');
    }

    const rideResult = await pool.query('SELECT id, payment_status FROM rides WHERE id = $1', [ride_id]);
    if (rideResult.rows.length === 0) {
      throw new BadRequest('Ride not found');
    }

    if (rideResult.rows[0].payment_status === 'success') {
      throw new BadRequest('Ride payment already processed');
    }

    const paymentId = uuidv4();
    const transactionId = `TXN_${Date.now()}`;

    await pool.query('BEGIN');
    inTransaction = true;

    // Mock payment processing (always successful for MVP)
    const result = await pool.query(
      `INSERT INTO payments (id, ride_id, amount, method, status, transaction_id, created_at)
       VALUES ($1, $2, $3, $4, 'success', $5, NOW())
       RETURNING *`,
      [paymentId, ride_id, amount, method, transactionId]
    );

    await pool.query('UPDATE rides SET payment_status = $1, payment_method = $2 WHERE id = $3', [
      'success',
      method,
      ride_id,
    ]);

    await pool.query('COMMIT');
    inTransaction = false;

    res.status(201).json({
      payment: result.rows[0],
      message: 'Payment processed successfully',
    });
  } catch (err) {
    if (inTransaction) {
      await pool.query('ROLLBACK');
    }
    throw err;
  }
});

// GET /api/v1/payments/:id - Get payment details
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM payments WHERE id = $1', [req.params.id]);
    res.json({ payment: result.rows[0] });
  } catch (err) {
    throw err;
  }
});

// GET /api/v1/payments/ride/:ride_id - Get payment for ride
router.get('/ride/:ride_id', async (req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM payments WHERE ride_id = $1 LIMIT 1', [
      req.params.ride_id,
    ]);
    res.json({ payment: result.rows[0] });
  } catch (err) {
    throw err;
  }
});

// POST /api/v1/payments/refund - Refund payment
router.post('/refund', async (req: Request, res: Response) => {
  let inTransaction = false;
  try {
    const { payment_id } = req.body;

    if (!payment_id) {
      throw new BadRequest('payment_id is required');
    }

    await pool.query('BEGIN');
    inTransaction = true;

    const result = await pool.query(
      `UPDATE payments SET status = 'refunded' WHERE id = $1 RETURNING *`,
      [payment_id]
    );

    if (result.rows.length === 0) {
      throw new BadRequest('Payment not found');
    }

    await pool.query('UPDATE rides SET payment_status = $1 WHERE id = $2', [
      'failed',
      result.rows[0].ride_id,
    ]);

    await pool.query('COMMIT');
    inTransaction = false;

    res.json({ payment: result.rows[0], message: 'Payment refunded' });
  } catch (err) {
    if (inTransaction) {
      await pool.query('ROLLBACK');
    }
    throw err;
  }
});

export default router;
