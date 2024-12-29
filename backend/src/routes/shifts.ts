import express from 'express';
import { Between, In } from 'typeorm';
import { AppDataSource } from '../data-source';
import { Shift, ShiftType } from '../entities/Shift';
import { Worker } from '../entities/Worker';
import { WorkerPeriodHours } from '../entities/WorkerPeriodHours';
import { auth, adminAuth } from '../middleware/auth';

const router = express.Router();
const shiftRepository = AppDataSource.getRepository(Shift);
const workerRepository = AppDataSource.getRepository(Worker);
const periodHoursRepository = AppDataSource.getRepository(WorkerPeriodHours);

// Helper function to calculate hours worked
const calculateHoursWorked = (startTime: Date, endTime: Date): number => {
  const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
  return Number(hours.toFixed(2));
};

// Helper function to check if shift type is a leave type
const isLeaveType = (shiftType: ShiftType): boolean => {
  return [ShiftType.VACATION, ShiftType.SICK_LEAVE, ShiftType.UNPAID_LEAVE].includes(shiftType);
};

// Get all shifts
router.get('/', auth, async (req, res) => {
  try {
    const shifts = await shiftRepository.find({
      relations: ['worker'],
      order: { startTime: 'DESC' }
    });
    res.json(shifts || []);
  } catch (error: any) {
    console.error('Error fetching shifts:', error);
    res.status(500).json({ 
      message: 'Error fetching shifts', 
      error: error?.message || 'Unknown error' 
    });
  }
});

// Get shifts for a specific worker
router.get('/worker/:workerId', auth, async (req, res) => {
  try {
    const shifts = await shiftRepository.find({
      where: { worker: { id: parseInt(req.params.workerId) } },
      relations: ['worker'],
      order: { startTime: 'DESC' }
    });
    res.json(shifts || []);
  } catch (error: any) {
    console.error('Error fetching worker shifts:', error);
    res.status(500).json({ 
      message: 'Error fetching worker shifts', 
      error: error?.message || 'Unknown error' 
    });
  }
});

// Get shifts within a date range
router.get('/range', auth, async (req, res) => {
  try {
    const { start, end } = req.query;
    const shifts = await shiftRepository.find({
      where: {
        startTime: Between(new Date(start as string), new Date(end as string))
      },
      relations: ['worker'],
      order: { startTime: 'ASC' }
    });
    res.json(shifts || []);
  } catch (error: any) {
    console.error('Error fetching shifts in range:', error);
    res.status(500).json({ 
      message: 'Error fetching shifts in range', 
      error: error?.message || 'Unknown error' 
    });
  }
});

// Get current day worker status
router.get('/current-day-status', auth, async (req, res) => {
  try {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

    // Get all workers
    const workers = await workerRepository.find();
    
    // Get all shifts for today
    const todayShifts = await shiftRepository.find({
      where: {
        startTime: Between(startOfDay, endOfDay)
      },
      relations: ['worker']
    }) || [];

    // Prepare worker status map
    const workerStatus = workers.map(worker => {
      const workerShift = todayShifts.find(shift => shift.worker?.id === worker.id);
      
      return {
        workerId: worker.id,
        workerName: `${worker.firstName} ${worker.lastName}`,
        status: workerShift ? workerShift.shiftType : 'NOT_WORKING',
        location: workerShift?.location || null,
        shiftStart: workerShift?.startTime || null,
        shiftEnd: workerShift?.endTime || null
      };
    });

    res.json(workerStatus);
  } catch (error: any) {
    console.error('Error fetching current day status:', error);
    res.status(500).json({ 
      message: 'Error fetching current day status', 
      error: error?.message || 'Unknown error' 
    });
  }
});

// Create shift
router.post('/', auth, adminAuth, async (req, res) => {
  try {
    console.log('Received shift data:', req.body);
    const { workerId, startTime, endTime, shiftType, hoursWorked, location } = req.body;
    
    if (!workerId || !startTime || !endTime || !shiftType) {
      return res.status(400).json({ 
        message: 'Missing required fields', 
        required: ['workerId', 'startTime', 'endTime', 'shiftType'],
        received: req.body 
      });
    }

    const worker = await workerRepository.findOne({
      where: { id: parseInt(workerId) }
    });

    if (!worker) {
      return res.status(404).json({ 
        message: 'Worker not found',
        workerId 
      });
    }

    // Skip hours validation for leave types
    if (!isLeaveType(shiftType)) {
      // Check worker's period hours
      const shiftStartDate = new Date(startTime);
      const periodStart = new Date(shiftStartDate.getFullYear(), shiftStartDate.getMonth(), 1);
      const periodEnd = new Date(shiftStartDate.getFullYear(), shiftStartDate.getMonth() + 1, 0);

      const workerPeriodHours = await periodHoursRepository
        .findOne({
          where: {
            workerId: worker.id,
            periodStart: Between(periodStart, periodEnd)
          }
        });

      if (!workerPeriodHours || workerPeriodHours.maxHours === 0) {
        return res.status(400).json({
          message: 'Cannot create shift: Worker has no available hours for this period',
          workerId,
          periodStart,
          periodEnd
        });
      }

      // Calculate total hours worked in this period (only for non-leave shifts)
      const periodShifts = await shiftRepository.find({
        where: {
          worker: { id: worker.id },
          startTime: Between(periodStart, periodEnd),
          shiftType: In([ShiftType.NORMAL_WORKDAY, ShiftType.WEEKEND_DAY, ShiftType.HOLIDAY])
        }
      });

      const totalHoursWorked = periodShifts.reduce((total, shift) => total + shift.hoursWorked, 0);
      const newShiftHours = hoursWorked || calculateHoursWorked(new Date(startTime), new Date(endTime));

      if (totalHoursWorked + newShiftHours > workerPeriodHours.maxHours) {
        return res.status(400).json({
          message: 'Cannot create shift: Worker would exceed maximum hours for this period',
          workerId,
          currentHours: totalHoursWorked,
          newShiftHours,
          maxHours: workerPeriodHours.maxHours,
          remainingHours: workerPeriodHours.maxHours - totalHoursWorked
        });
      }
    }

    const shift = new Shift();
    shift.worker = worker;
    shift.startTime = new Date(startTime);
    shift.endTime = new Date(endTime);
    shift.shiftType = shiftType;
    shift.hoursWorked = hoursWorked || calculateHoursWorked(new Date(startTime), new Date(endTime));
    shift.location = location || null;

    await shiftRepository.save(shift);
    
    const savedShift = await shiftRepository.findOne({
      where: { id: shift.id },
      relations: ['worker']
    });

    res.json(savedShift);
  } catch (error: any) {
    console.error('Error creating shift:', error);
    res.status(500).json({ 
      message: 'Error creating shift', 
      error: error?.message || 'Unknown error' 
    });
  }
});

// Update shift
router.put('/:id', auth, adminAuth, async (req, res) => {
  try {
    const { startTime, endTime, shiftType, location } = req.body;
    const shift = await shiftRepository.findOne({
      where: { id: parseInt(req.params.id) },
      relations: ['worker']
    });
    
    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    shift.startTime = new Date(startTime);
    shift.endTime = new Date(endTime);
    shift.shiftType = shiftType;
    shift.location = location || null;
    shift.hoursWorked = calculateHoursWorked(shift.startTime, shift.endTime);

    await shiftRepository.save(shift);
    res.json(shift);
  } catch (error: any) {
    console.error('Error updating shift:', error);
    res.status(400).json({ 
      message: 'Error updating shift',
      error: error?.message || 'Unknown error' 
    });
  }
});

// Delete shift
router.delete('/:id', auth, adminAuth, async (req, res) => {
  try {
    const shift = await shiftRepository.findOne({
      where: { id: parseInt(req.params.id) }
    });

    if (!shift) {
      return res.status(404).json({ message: 'Shift not found' });
    }

    await shiftRepository.remove(shift);
    res.json({ message: 'Shift deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting shift:', error);
    res.status(500).json({ 
      message: 'Error deleting shift',
      error: error?.message || 'Unknown error' 
    });
  }
});

export default router;
