// Minimal production server: serves React static files + proxies /api/ to backend
import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 80;
const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3000';

// Proxy /api/ to backend
app.use(
  '/api',
  createProxyMiddleware({
    target: BACKEND_URL,
    changeOrigin: true,
    on: {
      error: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(502).json({ error: 'Backend unavailable' });
      },
    },
  })
);

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Fallback for SPA routes.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Web server running on port ${PORT}`);
  console.log(`Proxying /api → ${BACKEND_URL}`);
});
