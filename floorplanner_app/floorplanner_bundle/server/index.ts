import express from 'express';
import cors from 'cors';
import compression from 'compression';
import path from 'path';
import { projectRoutes } from './routes/projects';
import { floorPlanRoutes } from './routes/floorplans';
import { textureRoutes } from './routes/textures';
import { uploadRoutes } from './routes/upload';

const app = express();
const PORT = process.env.PORT || 3001;
const ROOT_DIR = process.cwd(); // /app in Docker

app.use(cors());
app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check — must be before DB-dependent routes
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: !!process.env.DATABASE_URL,
  });
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(ROOT_DIR, 'uploads')));

// API routes (these require DATABASE_URL)
app.use('/api/projects', projectRoutes);
app.use('/api/floorplans', floorPlanRoutes);
app.use('/api/textures', textureRoutes);
app.use('/api/upload', uploadRoutes);

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  const clientPath = path.join(ROOT_DIR, 'dist/client');
  app.use(express.static(clientPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`FloorVision 3D server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
  console.log(`Database configured: ${!!process.env.DATABASE_URL}`);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err);
});

export default app;
