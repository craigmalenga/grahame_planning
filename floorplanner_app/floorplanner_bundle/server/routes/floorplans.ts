import { Router } from 'express';
import { prisma } from '../db';

export const floorPlanRoutes = Router();

// Get floor plan with rooms
floorPlanRoutes.get('/:id', async (req, res) => {
  try {
    const floorPlan = await prisma.floorPlan.findUnique({
      where: { id: req.params.id },
      include: { rooms: true, project: true },
    });
    if (!floorPlan) return res.status(404).json({ error: 'Floor plan not found' });
    res.json(floorPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch floor plan' });
  }
});

// Create floor plan
floorPlanRoutes.post('/', async (req, res) => {
  try {
    const { projectId, name, originalImageUrl, processedData } = req.body;
    const floorPlan = await prisma.floorPlan.create({
      data: { projectId, name, originalImageUrl, processedData },
      include: { rooms: true },
    });
    res.status(201).json(floorPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create floor plan' });
  }
});

// Update floor plan scene config
floorPlanRoutes.put('/:id', async (req, res) => {
  try {
    const { sceneConfig, processedData, name } = req.body;
    const floorPlan = await prisma.floorPlan.update({
      where: { id: req.params.id },
      data: {
        ...(sceneConfig && { sceneConfig }),
        ...(processedData && { processedData }),
        ...(name && { name }),
      },
      include: { rooms: true },
    });
    res.json(floorPlan);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update floor plan' });
  }
});

// Delete floor plan
floorPlanRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.floorPlan.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete floor plan' });
  }
});

// Add/update room
floorPlanRoutes.post('/:id/rooms', async (req, res) => {
  try {
    const { name, walls, ceilingHeight, wallTexture, floorTexture, ceilingTexture } = req.body;
    const room = await prisma.room.create({
      data: {
        floorPlanId: req.params.id,
        name,
        walls,
        ceilingHeight: ceilingHeight || 2.7,
        wallTexture: wallTexture || 'plaster-white',
        floorTexture: floorTexture || 'hardwood-oak',
        ceilingTexture: ceilingTexture || 'plaster-white',
      },
    });
    res.status(201).json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create room' });
  }
});

// Update room textures
floorPlanRoutes.put('/rooms/:roomId', async (req, res) => {
  try {
    const { wallTexture, floorTexture, ceilingTexture, ceilingHeight, name, walls } = req.body;
    const room = await prisma.room.update({
      where: { id: req.params.roomId },
      data: {
        ...(wallTexture && { wallTexture }),
        ...(floorTexture && { floorTexture }),
        ...(ceilingTexture && { ceilingTexture }),
        ...(ceilingHeight && { ceilingHeight }),
        ...(name && { name }),
        ...(walls && { walls }),
      },
    });
    res.json(room);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update room' });
  }
});
