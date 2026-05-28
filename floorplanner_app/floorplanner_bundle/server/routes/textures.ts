import { Router } from 'express';
import multer from 'multer';
import { prisma } from '../db';

export const textureRoutes = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

// List all built-in textures
textureRoutes.get('/', async (req, res) => {
  try {
    const { category } = req.query;
    const textures = await prisma.textureLibrary.findMany({
      ...(category && { where: { category: category as string } }),
      orderBy: { name: 'asc' },
    });
    res.json(textures);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch textures' });
  }
});

// List custom textures for a project
textureRoutes.get('/custom/:projectId', async (req, res) => {
  try {
    const textures = await prisma.customTexture.findMany({
      where: { projectId: req.params.projectId },
      select: { id: true, name: true, category: true, mimeType: true, tileSize: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(textures);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch custom textures' });
  }
});

// Get custom texture image data (served as image)
textureRoutes.get('/custom/:projectId/:textureId/image', async (req, res) => {
  try {
    const texture = await prisma.customTexture.findFirst({
      where: { id: req.params.textureId, projectId: req.params.projectId },
    });
    if (!texture) return res.status(404).json({ error: 'Texture not found' });

    res.set('Content-Type', texture.mimeType);
    res.set('Cache-Control', 'public, max-age=31536000');
    res.send(Buffer.from(texture.imageData));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch texture image' });
  }
});

// Upload custom texture
textureRoutes.post('/custom/:projectId', upload.single('texture'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const { name, category, tileSize } = req.body;
    const texture = await prisma.customTexture.create({
      data: {
        projectId: req.params.projectId,
        name: name || req.file.originalname.replace(/\.[^.]+$/, ''),
        category: category || 'wall',
        imageData: req.file.buffer,
        mimeType: req.file.mimetype,
        tileSize: tileSize ? parseFloat(tileSize) : 1.0,
      },
      select: { id: true, name: true, category: true, mimeType: true, tileSize: true, createdAt: true },
    });
    res.status(201).json(texture);
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload texture' });
  }
});

// Delete custom texture
textureRoutes.delete('/custom/:projectId/:textureId', async (req, res) => {
  try {
    await prisma.customTexture.delete({
      where: { id: req.params.textureId },
    });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete texture' });
  }
});

// Seed default textures
textureRoutes.post('/seed', async (_req, res) => {
  try {
    const defaults = [
      { name: 'White Plaster', category: 'wall', imageUrl: '/textures/plaster-white.jpg', tileSize: 2.0 },
      { name: 'Light Grey', category: 'wall', imageUrl: '/textures/plaster-grey.jpg', tileSize: 2.0 },
      { name: 'Brick Red', category: 'wall', imageUrl: '/textures/brick-red.jpg', tileSize: 1.0 },
      { name: 'Brick White', category: 'wall', imageUrl: '/textures/brick-white.jpg', tileSize: 1.0 },
      { name: 'Concrete', category: 'wall', imageUrl: '/textures/concrete.jpg', tileSize: 2.0 },
      { name: 'Wood Panel', category: 'wall', imageUrl: '/textures/wood-panel.jpg', tileSize: 1.0 },
      { name: 'Oak Hardwood', category: 'floor', imageUrl: '/textures/hardwood-oak.jpg', tileSize: 1.0 },
      { name: 'Walnut Hardwood', category: 'floor', imageUrl: '/textures/hardwood-walnut.jpg', tileSize: 1.0 },
      { name: 'White Marble', category: 'floor', imageUrl: '/textures/marble-white.jpg', tileSize: 2.0 },
      { name: 'Grey Tile', category: 'floor', imageUrl: '/textures/tile-grey.jpg', tileSize: 0.5 },
      { name: 'Carpet Beige', category: 'floor', imageUrl: '/textures/carpet-beige.jpg', tileSize: 1.0 },
      { name: 'White Ceiling', category: 'ceiling', imageUrl: '/textures/plaster-white.jpg', tileSize: 2.0 },
      { name: 'Wood Ceiling', category: 'ceiling', imageUrl: '/textures/wood-panel.jpg', tileSize: 1.0 },
    ];

    for (const tex of defaults) {
      await prisma.textureLibrary.upsert({
        where: { id: tex.name.toLowerCase().replace(/\s+/g, '-') },
        update: tex,
        create: { id: tex.name.toLowerCase().replace(/\s+/g, '-'), ...tex },
      });
    }

    res.json({ success: true, count: defaults.length });
  } catch (error) {
    res.status(500).json({ error: 'Failed to seed textures' });
  }
});
