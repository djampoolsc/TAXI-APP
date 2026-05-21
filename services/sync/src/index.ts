import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', service: 'sync-server' });
});

// Sync endpoints
app.post('/api/v1/sync/pull', (req: Request, res: Response) => {
  // TODO: Implement PouchDB pull sync
  res.json({ status: 'success', changes: [] });
});

app.post('/api/v1/sync/push', (req: Request, res: Response) => {
  // TODO: Implement PouchDB push sync
  res.json({ status: 'success' });
});

app.listen(PORT, () => {
  console.log(`Sync server running on port ${PORT}`);
});
