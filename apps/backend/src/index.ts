import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import 'express-async-errors';
import dotenv from 'dotenv';
import pinoHttp from 'pino-http';

import { initializeDatabase } from './config/database';
import { initializeRedis } from './config/redis';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/auth';

// Import service routes
import authRoutes from './services/auth/routes';
import matchingRoutes from './services/matching/routes';
import paymentsRoutes from './services/payments/routes';
import telemetryRoutes from './services/telemetry/routes';
import emergencyRoutes from './services/emergency/routes';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(pinoHttp());

// Initialize databases
async function initializeDatabases() {
  try {
    await initializeDatabase();
    await initializeRedis();
    console.log('✓ All databases initialized');
  } catch (err) {
    console.error('Database initialization failed:', err);
    process.exit(1);
  }
}

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API v1 routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/rides', matchingRoutes);
app.use('/api/v1/payments', paymentsRoutes);
app.use('/api/v1/telemetry', telemetryRoutes);
app.use('/api/v1/emergency', emergencyRoutes);

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
async function startServer() {
  try {
    await initializeDatabases();

    app.listen(PORT, () => {
      console.log(`
╔════════════════════════════════════╗
║  Axiom Backend API                 ║
║  Running on port ${PORT}              ║
║  Environment: ${process.env.NODE_ENV || 'development'}   ║
╚════════════════════════════════════╝
      `);
    });
  } catch (err) {
    console.error('Server start failed:', err);
    process.exit(1);
  }
}

startServer();

