import express from 'express';
import { AppDataSource } from '../data-source';
import { Worker } from '../entities/Worker';
import { Contract } from '../entities/Contract';
import { auth, adminAuth } from '../middleware/auth';
import { AuthRequest } from '../types/express';
import { addMonths, subDays } from 'date-fns';

const router = express.Router();
const workerRepository = AppDataSource.getRepository(Worker);
const contractRepository = AppDataSource.getRepository(Contract);

// Helper function to check for contract overlap
const hasOverlappingContract = async (workerId: number, startDate: Date, endDate: Date, excludeContractId?: number) => {
  const query = contractRepository.createQueryBuilder('contract')
    .where('contract.workerId = :workerId', { workerId })
    .andWhere(
      '(contract.startDate BETWEEN :startDate AND :endDate OR ' +
      'contract.endDate BETWEEN :startDate AND :endDate OR ' +
      '(:startDate BETWEEN contract.startDate AND contract.endDate))',
      { startDate, endDate }
    );

  if (excludeContractId) {
    query.andWhere('contract.id != :excludeContractId', { excludeContractId });
  }

  const overlappingContract = await query.getOne();
  return !!overlappingContract;
};

// Get all workers
router.get('/', auth, async (req: AuthRequest, res) => {
  try {
    const workers = await workerRepository.find({
      relations: ['contracts'],
      order: { createdAt: 'DESC' }
    });
    res.json(workers);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching workers' });
  }
});

// Get worker by ID
router.get('/:id', auth, async (req: AuthRequest, res) => {
  try {
    const worker = await workerRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['contracts']
    });
    
    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }
    
    res.json(worker);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching worker' });
  }
});

// Create worker
router.post('/', auth, adminAuth, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, workerId, contractStartDate, contractDuration } = req.body;
    
    const existingWorker = await workerRepository.findOne({ where: { workerId } });
    if (existingWorker) {
      return res.status(400).json({ message: 'Worker with this ID already exists' });
    }

    // Parse dates properly
    const startDate = new Date(contractStartDate);
    
    // Calculate end date using date-fns
    const endDate = subDays(addMonths(startDate, contractDuration), 1);

    // Check for overlapping contracts
    const hasOverlap = await hasOverlappingContract(workerId, startDate, endDate);
    if (hasOverlap) {
      return res.status(400).json({ message: 'Contract period overlaps with an existing contract' });
    }

    // Create worker
    const worker = new Worker();
    worker.firstName = firstName;
    worker.lastName = lastName;
    worker.workerId = workerId;
    
    // Save worker first
    const savedWorker = await workerRepository.save(worker);

    // Create initial contract if dates are provided
    if (contractStartDate && contractDuration) {
      const contract = new Contract();
      contract.workerId = savedWorker.id;
      contract.worker = savedWorker;
      contract.startDate = startDate;
      contract.duration = contractDuration;
      contract.endDate = endDate;
      await contractRepository.save(contract);
    }

    // Return worker with contract
    const workerWithContract = await workerRepository.findOne({
      where: { id: savedWorker.id },
      relations: ['contracts']
    });

    res.status(201).json(workerWithContract);
  } catch (error) {
    console.error('Error creating worker:', error);
    res.status(500).json({ 
      message: 'Error creating worker',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Update worker
router.put('/:id', auth, adminAuth, async (req: AuthRequest, res) => {
  try {
    const { firstName, lastName, workerId, contractStartDate, contractDuration } = req.body;
    const worker = await workerRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['contracts']
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    // Check if workerId is being changed and if it's already in use
    if (workerId !== worker.workerId) {
      const existingWorker = await workerRepository.findOne({ where: { workerId } });
      if (existingWorker) {
        return res.status(400).json({ message: 'Worker ID already in use' });
      }
    }

    // Update worker details
    worker.firstName = firstName;
    worker.lastName = lastName;
    worker.workerId = workerId;
    await workerRepository.save(worker);

    // Update or create contract if contract details are provided
    if (contractStartDate && contractDuration) {
      let contract = worker.contracts[0]; // Get the most recent contract
      if (!contract) {
        contract = new Contract();
        contract.workerId = worker.id;
        contract.worker = worker;
      }
      const newStartDate = new Date(contractStartDate);
      contract.startDate = newStartDate;
      contract.duration = contractDuration;
      contract.endDate = subDays(addMonths(newStartDate, contractDuration), 1);
      await contractRepository.save(contract);
    }

    // Return updated worker with contracts
    const updatedWorker = await workerRepository.findOne({
      where: { id: worker.id },
      relations: ['contracts']
    });
    res.json(updatedWorker);
  } catch (error) {
    console.error('Error updating worker:', error);
    res.status(400).json({ message: 'Error updating worker' });
  }
});

// Update contract
router.put('/:workerId/contract/:contractId', auth, adminAuth, async (req: AuthRequest, res) => {
  try {
    const { startDate: newStartDateStr, duration } = req.body;
    const workerId = parseInt(req.params.workerId);
    const contractId = parseInt(req.params.contractId);

    const contract = await contractRepository.findOne({
      where: { 
        id: contractId,
        workerId: workerId
      }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    // Parse dates properly
    const newStartDate = new Date(newStartDateStr);
    
    // Calculate new end date using date-fns
    const newEndDate = subDays(addMonths(newStartDate, duration), 1);

    // Check for overlapping contracts (excluding current contract)
    const hasOverlap = await hasOverlappingContract(workerId, newStartDate, newEndDate, contractId);
    if (hasOverlap) {
      return res.status(400).json({ message: 'Contract period overlaps with an existing contract' });
    }

    // Update contract
    contract.startDate = newStartDate;
    contract.duration = duration;
    contract.endDate = newEndDate;
    await contractRepository.save(contract);

    res.json(contract);
  } catch (error) {
    console.error('Error updating contract:', error);
    res.status(400).json({ message: 'Error updating contract' });
  }
});

// Create a new contract for a worker
router.post('/:workerId/contracts', auth, adminAuth, async (req: AuthRequest, res) => {
  try {
    const workerId = parseInt(req.params.workerId);
    const { startDate: startDateStr, duration } = req.body;

    const worker = await workerRepository.findOne({
      where: { id: workerId },
      relations: ['contracts']
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    const startDate = new Date(startDateStr);
    const endDate = subDays(addMonths(startDate, duration), 1);

    // Check for overlapping contracts
    const hasOverlap = await hasOverlappingContract(workerId, startDate, endDate);
    if (hasOverlap) {
      return res.status(400).json({ message: 'Contract period overlaps with an existing contract' });
    }

    const contract = contractRepository.create({
      worker,
      workerId: worker.id,
      startDate,
      endDate,
      duration
    });

    await contractRepository.save(contract);

    // Return worker with updated contracts
    const updatedWorker = await workerRepository.findOne({
      where: { id: workerId },
      relations: ['contracts']
    });

    res.status(201).json(updatedWorker);
  } catch (error) {
    console.error('Error creating contract:', error);
    res.status(500).json({ 
      message: 'Error creating contract',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Delete worker
router.delete('/:id', auth, adminAuth, async (req: AuthRequest, res) => {
  try {
    const worker = await workerRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!worker) {
      return res.status(404).json({ message: 'Worker not found' });
    }

    await workerRepository.remove(worker);
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: 'Error deleting worker' });
  }
});

// Delete contract
router.delete('/:workerId/contract/:contractId', auth, adminAuth, async (req: AuthRequest, res) => {
  try {
    const contract = await contractRepository.findOne({
      where: { 
        id: parseInt(req.params.contractId),
        workerId: parseInt(req.params.workerId)
      }
    });

    if (!contract) {
      return res.status(404).json({ message: 'Contract not found' });
    }

    await contractRepository.remove(contract);
    res.json({ message: 'Contract deleted successfully' });
  } catch (error) {
    console.error('Error deleting contract:', error);
    res.status(400).json({ message: 'Error deleting contract' });
  }
});

export default router;
