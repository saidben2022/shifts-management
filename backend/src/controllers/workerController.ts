import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { Worker } from '../entities/Worker';

const workerRepository = AppDataSource.getRepository(Worker);

export const createWorker = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, workerId, contractStartDate, contractDuration } = req.body;

    // Validate required fields
    if (!firstName || !lastName || !workerId || !contractStartDate || !contractDuration) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if worker ID already exists
    const existingWorker = await workerRepository.findOne({ where: { workerId } });
    if (existingWorker) {
      return res.status(400).json({ message: 'Worker ID already exists' });
    }

    // Calculate contract end date
    const startDate = new Date(contractStartDate);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + contractDuration);

    // Create new worker
    const worker = workerRepository.create({
      firstName,
      lastName,
      workerId,
      contractStartDate: startDate,
      contractDuration,
      contractEndDate: endDate
    });

    await workerRepository.save(worker);
    res.status(201).json(worker);
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorkers = async (_req: Request, res: Response) => {
  try {
    const workers = await workerRepository.find({
      order: {
        lastName: 'ASC',
        firstName: 'ASC'
      }
    });
    res.json(workers);
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getWorkerById = async (req: Request, res: Response) => {
  try {
    const worker = await workerRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    res.json(worker);
  } catch (error) {
    console.error('Error fetching worker:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const updateWorker = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, contractStartDate, contractDuration } = req.body;
    const workerId = parseInt(req.params.id);

    const worker = await workerRepository.findOne({ where: { id: workerId } });
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Update worker fields
    if (firstName) worker.firstName = firstName;
    if (lastName) worker.lastName = lastName;
    if (contractStartDate) {
      worker.contractStartDate = new Date(contractStartDate);
      // Recalculate end date if start date changes
      const endDate = new Date(worker.contractStartDate);
      endDate.setMonth(endDate.getMonth() + (contractDuration || worker.contractDuration));
      worker.contractEndDate = endDate;
    }
    if (contractDuration) {
      worker.contractDuration = contractDuration;
      // Recalculate end date if duration changes
      const endDate = new Date(worker.contractStartDate);
      endDate.setMonth(endDate.getMonth() + contractDuration);
      worker.contractEndDate = endDate;
    }

    await workerRepository.save(worker);
    res.json(worker);
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const deleteWorker = async (req: Request, res: Response) => {
  try {
    const result = await workerRepository.delete(req.params.id);
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting worker:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};
