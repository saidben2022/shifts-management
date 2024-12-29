import express, { Response, Request, NextFunction } from 'express';
import { AppDataSource } from '../data-source';
import { Contract } from '../entities/Contract';
import { Worker } from '../entities/Worker';
import { body, validationResult } from 'express-validator';
import { auth, adminAuth } from '../middleware/auth';
import { AuthRequest } from '../types/express';

const router = express.Router();
const contractRepository = AppDataSource.getRepository(Contract);
const workerRepository = AppDataSource.getRepository(Worker);

// All routes are protected with authentication
router.use(auth as (req: Request, res: Response, next: NextFunction) => void);

// Validation middleware for contract creation/update
const validateContract = [
  body('workerId').notEmpty().withMessage('Worker ID is required'),
  body('startDate').isISO8601().withMessage('Valid start date is required'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be a positive integer'),
];

// Get all contracts
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const contracts = await contractRepository.find({
      relations: ['worker'],
      order: { startDate: 'DESC' }
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contracts', error });
  }
});

// Get a single contract
router.get('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const contract = await contractRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['worker']
    });
    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }
    res.json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching contract', error });
  }
});

// Create a new contract
router.post('/', validateContract, adminAuth as (req: Request, res: Response, next: NextFunction) => void, async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { workerId, startDate, duration } = req.body;

    const worker = await workerRepository.findOne({
      where: { id: workerId }
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const contract = contractRepository.create({
      worker,
      startDate: new Date(startDate),
      duration
    });

    await contractRepository.save(contract);
    res.status(201).json(contract);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ message: 'Error creating contract' });
  }
});

// Update a contract
router.put('/:id', validateContract, adminAuth as (req: Request, res: Response, next: NextFunction) => void, async (req: AuthRequest, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { workerId, startDate, duration } = req.body;

    const contract = await contractRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['worker']
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    const worker = await workerRepository.findOne({
      where: { id: workerId }
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    contract.worker = worker;
    contract.startDate = new Date(startDate);
    contract.duration = duration;

    await contractRepository.save(contract);
    res.json(contract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(500).json({ message: 'Error updating contract' });
  }
});

// Delete a contract
router.delete('/:id', adminAuth as (req: Request, res: Response, next: NextFunction) => void, async (req: AuthRequest, res: Response) => {
  try {
    const contract = await contractRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    await contractRepository.delete(contract.id);
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(500).json({ message: 'Error deleting contract' });
  }
});

export default router;
