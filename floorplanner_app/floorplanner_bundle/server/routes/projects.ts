import { Router } from 'express';
import { prisma } from '../db';

export const projectRoutes = Router();

// List all projects
projectRoutes.get('/', async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({
      include: { floorPlans: { select: { id: true, name: true } } },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(projects);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch projects' });
  }
});

// Get single project
projectRoutes.get('/:id', async (req, res) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        floorPlans: {
          include: { rooms: true },
        },
      },
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch project' });
  }
});

// Create project
projectRoutes.post('/', async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.create({
      data: { name, description },
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create project' });
  }
});

// Update project
projectRoutes.put('/:id', async (req, res) => {
  try {
    const { name, description } = req.body;
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
    });
    res.json(project);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update project' });
  }
});

// Delete project
projectRoutes.delete('/:id', async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete project' });
  }
});
