import express from 'express';
import { Worker } from '../models/Worker';
import { Contract } from '../models/Contract';
import { body, validationResult } from 'express-validator';
import { authenticateToken } from '../middleware/auth';
import { AppDataSource } from '../data-source';

const router = express.Router();

// All routes are protected with authentication
router.use(authenticateToken);

// Validation middleware for worker creation/update
const validateWorker = [
  body('firstName').trim().isLength({ min: 2 }).withMessage('First name must be at least 2 characters'),
  body('lastName').trim().isLength({ min: 2 }).withMessage('Last name must be at least 2 characters'),
  body('workerId').trim().isLength({ min: 2 }).withMessage('Worker ID must be at least 2 characters'),
];

// Validation middleware for contract creation
const validateContract = [
  body('startDate').isISO8601().withMessage('Invalid start date'),
  body('duration').isInt({ min: 1 }).withMessage('Duration must be at least 1 month'),
  body('endDate').isISO8601().withMessage('Invalid end date'),
];

// Get all workers with their latest contracts
router.get('/', async (req, res) => {
  try {
    const workerRepository = AppDataSource.getRepository(Worker);
    const workers = await workerRepository.find({
      relations: {
        contracts: true,
      },
      order: {
        createdAt: 'DESC',
      },
    });

    // For each worker, only keep the most recent contract
    const workersWithLatestContract = workers.map(worker => ({
      ...worker,
      contracts: worker.contracts.sort((a, b) => 
        new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      ).slice(0, 1)
    }));

    res.json(workersWithLatestContract);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workers', error });
  }
});

// Get a single worker with contracts
router.get('/:id', async (req, res) => {
  try {
    const workerRepository = AppDataSource.getRepository(Worker);
    const worker = await workerRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: {
        contracts: true,
      },
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker', error });
  }
});

// Get worker's contracts
router.get('/:id/contracts', async (req, res) => {
  try {
    const contractRepository = AppDataSource.getRepository(Contract);
    const contracts = await contractRepository.find({
      where: { workerId: parseInt(req.params.id) },
      order: { startDate: 'DESC' },
    });
    res.json(contracts);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker contracts', error });
  }
});

// Create a new worker with initial contract
router.post('/', [...validateWorker, ...validateContract], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { firstName, lastName, workerId, startDate, duration, endDate } = req.body;

  try {
    const workerRepository = AppDataSource.getRepository(Worker);
    const contractRepository = AppDataSource.getRepository(Contract);

    // Start a transaction
    await AppDataSource.transaction(async transactionalEntityManager => {
      // Create worker
      const worker = workerRepository.create({
        firstName,
        lastName,
        workerId,
      });
      await transactionalEntityManager.save(worker);

      // Create initial contract
      const contract = contractRepository.create({
        workerId: worker.id,
        startDate,
        duration,
        endDate,
      });
      await transactionalEntityManager.save(contract);

      res.status(201).json({ worker, contract });
    });
  } catch (error) {
    res.status(500).json({ message: 'Error creating worker', error });
  }
});

// Add a new contract to existing worker
router.post('/:id/contracts', validateContract, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const contractRepository = AppDataSource.getRepository(Contract);
    const contract = contractRepository.create({
      workerId: parseInt(req.params.id),
      ...req.body,
    });
    await contractRepository.save(contract);
    res.status(201).json(contract);
  } catch (error) {
    res.status(500).json({ message: 'Error adding contract', error });
  }
});

// Update a worker
router.put('/:id', validateWorker, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const workerRepository = AppDataSource.getRepository(Worker);
    const worker = await workerRepository.findOne({
      where: { id: parseInt(req.params.id) },
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    workerRepository.merge(worker, req.body);
    const result = await workerRepository.save(worker);
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Error updating worker', error });
  }
});

// Delete a worker (this will also delete all associated contracts due to CASCADE)
router.delete('/:id', async (req, res) => {
  try {
    const workerRepository = AppDataSource.getRepository(Worker);
    const result = await workerRepository.delete(parseInt(req.params.id));
    
    if (result.affected === 0) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.json({ message: 'Worker deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting worker', error });
  }
});

export default router;
