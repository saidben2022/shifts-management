import { AppDataSource } from '../data-source';
import { WorkerPeriodHours } from '../entities/WorkerPeriodHours';
import { Worker } from '../entities/Worker';

async function seedWorkerPeriodHours() {
    try {
        // Initialize the database connection
        await AppDataSource.initialize();
        
        const workerRepository = AppDataSource.getRepository(Worker);
        const workerPeriodHoursRepository = AppDataSource.getRepository(WorkerPeriodHours);

        // Clear existing records
        await workerPeriodHoursRepository.clear();
        console.log('Cleared existing worker period hours records');

        // Get all workers
        const workers = await workerRepository.find();
        console.log(`Found ${workers.length} workers`);
        
        // Current period start (beginning of current month)
        const now = new Date('2024-12-09T22:10:08+01:00'); // Using the provided current time
        const currentPeriodStart = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1));
        const currentPeriodEnd = new Date(Date.UTC(now.getFullYear(), now.getMonth() + 1, 0));

        console.log('Period:', {
            start: currentPeriodStart.toISOString(),
            end: currentPeriodEnd.toISOString()
        });

        // Default max hours for each worker (168 hours = approximately 21 working days * 8 hours)
        const defaultMaxHours = 168;

        // Create period hours records for each worker
        for (const worker of workers) {
            const periodHours = workerPeriodHoursRepository.create({
                workerId: worker.id,
                periodStart: currentPeriodStart,
                periodEnd: currentPeriodEnd,
                maxHours: defaultMaxHours
            });
            await workerPeriodHoursRepository.save(periodHours);
            console.log(`Created period hours record for worker ${worker.id} for period:`, {
                start: currentPeriodStart.toISOString(),
                end: currentPeriodEnd.toISOString()
            });
        }
        
        console.log('Successfully seeded worker period hours!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding worker period hours:', error);
        process.exit(1);
    }
}

seedWorkerPeriodHours();
