import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Shift } from '../entities/Shift';
import { Worker } from '../entities/Worker';

export const createShift = async (req: Request, res: Response) => {
  try {
    const { workerId, startTime, endTime } = req.body;

    // Validate required fields
    if (!workerId || !startTime || !endTime) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the worker
    const workerRepository = AppDataSource.getRepository(Worker);
    const worker = await workerRepository.findOne({ where: { id: workerId } });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Create new shift
    const shiftRepository = AppDataSource.getRepository(Shift);
    const shift = new Shift();
    shift.worker = worker;
    shift.startTime = new Date(startTime);
    shift.endTime = new Date(endTime);

    // Save the shift
    const savedShift = await shiftRepository.save(shift);

    // Return the shift with worker details
    const shiftWithWorker = await shiftRepository.findOne({
      where: { id: savedShift.id },
      relations: ['worker']
    });

    res.status(201).json(shiftWithWorker);
  } catch (error) {
    console.error('Error creating shift:', error);
    res.status(500).json({ message: 'Error creating shift' });
  }
};

export const getShifts = async (_req: Request, res: Response) => {
  try {
    const shiftRepository = AppDataSource.getRepository(Shift);
    const shifts = await shiftRepository.find({
      relations: ['worker'],
      order: { startTime: 'ASC' }
    });
    res.json(shifts);
  } catch (error) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ message: 'Error fetching shifts' });
  }
};

export const getShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shiftRepository = AppDataSource.getRepository(Shift);
    const shift = await shiftRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['worker']
    });

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    res.json(shift);
  } catch (error) {
    console.error('Error fetching shift:', error);
    res.status(500).json({ message: 'Error fetching shift' });
  }
};

export const updateShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { workerId, startTime, endTime } = req.body;

    const shiftRepository = AppDataSource.getRepository(Shift);
    const shift = await shiftRepository.findOne({
      where: { id: parseInt(id) },
      relations: ['worker']
    });

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    if (workerId) {
      const workerRepository = AppDataSource.getRepository(Worker);
      const worker = await workerRepository.findOne({ where: { id: workerId } });
      if (!worker) {
        return res.status(404).json({ message: 'Worker not found' });
      }
      shift.worker = worker;
    }

    if (startTime) shift.startTime = new Date(startTime);
    if (endTime) shift.endTime = new Date(endTime);

    const updatedShift = await shiftRepository.save(shift);
    res.json(updatedShift);
  } catch (error) {
    console.error('Error updating shift:', error);
    res.status(500).json({ message: 'Error updating shift' });
  }
};

export const deleteShift = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const shiftRepository = AppDataSource.getRepository(Shift);
    const shift = await shiftRepository.findOne({
      where: { id: parseInt(id) }
    });

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    await shiftRepository.remove(shift);
    res.json({ message: 'Shift deleted successfully' });
  } catch (error) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ message: 'Error deleting shift' });
  }
};
