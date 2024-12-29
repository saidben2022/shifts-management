import { Router } from 'express';
import { 
    setWorkerPeriodHours, 
    getWorkerPeriodHours,
    clearWorkerPeriodHours 
} from '../controllers/workerPeriodHours.controller';

const router = Router();

router.post('/', setWorkerPeriodHours);
router.get('/', getWorkerPeriodHours);
router.delete('/clear', clearWorkerPeriodHours);

export default router;
