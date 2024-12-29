import express from 'express';
import { Between } from 'typeorm';
import { AppDataSource } from '../data-source';
import { WorkerPeriodHours } from '../entities/WorkerPeriodHours';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();
const workerPeriodHoursRepository = AppDataSource.getRepository(WorkerPeriodHours);

// Get worker period hours
router.get('/', auth, async (req, res) => {
  try {
    const { workerId, periodStart, periodEnd } = req.query;

    if (!workerId || !periodStart || !periodEnd) {
      console.error('Missing required parameters:', { workerId, periodStart, periodEnd });
      return res.status(400).json({ message: 'workerId, periodStart, and periodEnd are required' });
    }

    // Parse dates and ensure they are valid
    const startDate = new Date(periodStart as string);
    const endDate = new Date(periodEnd as string);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid date format:', { periodStart, periodEnd });
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Format dates to UTC to match the frontend
    const formattedStart = startDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
    const formattedEnd = endDate.toISOString().split('T')[0] + 'T23:59:59.999Z';

    console.log('Searching for period hours:', {
      workerId: parseInt(workerId as string),
      periodStart: formattedStart,
      periodEnd: formattedEnd
    });

    const periodHours = await workerPeriodHoursRepository.findOne({
      where: {
        workerId: parseInt(workerId as string),
        periodStart: new Date(formattedStart),
        periodEnd: new Date(formattedEnd)
      }
    });

    console.log('Found period hours:', periodHours);

    if (!periodHours) {
      console.log('No period hours found, returning 0');
      return res.json({ maxHours: 0 });
    }

    console.log('Returning maxHours:', periodHours.maxHours);
    res.json({ maxHours: periodHours.maxHours });
  } catch (error) {
    console.error('Error fetching worker period hours:', error);
    res.status(500).json({ message: 'Error fetching worker period hours' });
  }
});

// Create or update worker period hours
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    const { workerId, periodStart, periodEnd, maxHours } = req.body;

    if (!workerId || !periodStart || !periodEnd || maxHours === undefined) {
      return res.status(400).json({ message: 'workerId, periodStart, periodEnd, and maxHours are required' });
    }

    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return res.status(400).json({ message: 'Invalid date format' });
    }

    // Format dates to UTC
    const formattedStart = startDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
    const formattedEnd = endDate.toISOString().split('T')[0] + 'T23:59:59.999Z';

    // Check if period hours already exist for this worker and period
    let periodHours = await workerPeriodHoursRepository.findOne({
      where: {
        workerId,
        periodStart: new Date(formattedStart),
        periodEnd: new Date(formattedEnd)
      }
    });

    if (periodHours) {
      // Update existing record
      periodHours.maxHours = maxHours;
      await workerPeriodHoursRepository.save(periodHours);
      console.log('Updated period hours:', periodHours);
      return res.json(periodHours);
    }

    // Create new record
    periodHours = workerPeriodHoursRepository.create({
      workerId,
      periodStart: new Date(formattedStart),
      periodEnd: new Date(formattedEnd),
      maxHours
    });

    await workerPeriodHoursRepository.save(periodHours);
    console.log('Created period hours:', periodHours);
    res.json(periodHours);
  } catch (error) {
    console.error('Error saving worker period hours:', error);
    res.status(500).json({ message: 'Error saving worker period hours' });
  }
});

// Update worker period hours
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { periodStart, periodEnd, maxHours } = req.body;
    const periodHours = await workerPeriodHoursRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['worker']
    });

    if (!periodHours) {
      return res.status(404).json({ message: 'Worker period hours not found' });
    }

    periodHours.periodStart = periodStart ? new Date(periodStart) : periodHours.periodStart;
    periodHours.periodEnd = periodEnd ? new Date(periodEnd) : periodHours.periodEnd;
    periodHours.maxHours = maxHours !== undefined ? maxHours : periodHours.maxHours;

    await workerPeriodHoursRepository.save(periodHours);
    res.json(periodHours);
  } catch (error) {
    console.error('Error updating worker period hours:', error);
    res.status(500).json({ message: 'Error updating worker period hours' });
  }
});

// Delete worker period hours
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const periodHours = await workerPeriodHoursRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!periodHours) {
      return res.status(404).json({ message: 'Worker period hours not found' });
    }

    await workerPeriodHoursRepository.remove(periodHours);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting worker period hours:', error);
    res.status(500).json({ message: 'Error deleting worker period hours' });
  }
});

export default router;
