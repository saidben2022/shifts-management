import { Router } from 'express';
import { createShift, getShifts, getShift, updateShift, deleteShift } from '../controllers/shiftController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// All routes are protected with authentication
router.use(authenticateToken);

// Create a new shift
router.post('/', createShift);

// Get all shifts
router.get('/', getShifts);

// Get a specific shift
router.get('/:id', getShift);

// Update a shift
router.put('/:id', updateShift);

// Delete a shift
router.delete('/:id', deleteShift);

export default router;
