import { Request, Response } from 'express';
import { AppDataSource } from '../data-source';
import { WorkerPeriodHours } from '../entities/WorkerPeriodHours';
import { Between } from 'typeorm';

const workerPeriodHoursRepository = AppDataSource.getRepository(WorkerPeriodHours);

export const setWorkerPeriodHours = async (req: Request, res: Response) => {
    try {
        const { workerId, periodStart, periodEnd, maxHours } = req.body;
        console.log('Received request:', { workerId, periodStart, periodEnd, maxHours });

        if (!workerId || !periodStart || !periodEnd || maxHours === undefined) {
            return res.status(400).json({
                message: 'Missing required fields: workerId, periodStart, periodEnd, maxHours'
            });
        }

        const workerIdNum = Number(workerId);
        const maxHoursNum = Number(maxHours);
        const startDate = new Date(periodStart);
        const endDate = new Date(periodEnd);

        // First, try to find any existing record for this worker and period
        const existingRecord = await workerPeriodHoursRepository.findOne({
            where: {
                workerId: workerIdNum,
                periodStart: Between(
                    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
                    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
                )
            }
        });

        if (existingRecord) {
            console.log('Found existing record:', existingRecord);
            
            // Update the existing record
            existingRecord.maxHours = maxHoursNum;
            existingRecord.periodEnd = endDate;
            
            const updatedRecord = await workerPeriodHoursRepository.save(existingRecord);
            console.log('Updated record:', updatedRecord);
            return res.status(200).json(updatedRecord);
        }

        // If no existing record found, create a new one
        console.log('Creating new record');
        const newRecord = workerPeriodHoursRepository.create({
            workerId: workerIdNum,
            periodStart: startDate,
            periodEnd: endDate,
            maxHours: maxHoursNum
        });

        const savedRecord = await workerPeriodHoursRepository.save(newRecord);
        console.log('Created new record:', savedRecord);
        return res.status(201).json(savedRecord);

    } catch (error) {
        console.error('Error in setWorkerPeriodHours:', error);
        return res.status(500).json({
            message: 'Failed to set worker period hours',
            error: error.message
        });
    }
};

export const getWorkerPeriodHours = async (req: Request, res: Response) => {
    try {
        const { workerId, periodStart, periodEnd } = req.query;
        
        if (!workerId || !periodStart || !periodEnd) {
            return res.status(400).json({
                message: 'Worker ID, period start date, and period end date are required'
            });
        }

        const startDate = new Date(periodStart as string);
        
        // Find record for this worker and period
        const record = await workerPeriodHoursRepository.findOne({
            where: {
                workerId: Number(workerId),
                periodStart: Between(
                    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()),
                    new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 1)
                )
            }
        });

        if (!record) {
            return res.json({ maxHours: 0 });
        }

        return res.status(200).json({ maxHours: record.maxHours });
    } catch (error) {
        console.error('Error in getWorkerPeriodHours:', error);
        return res.status(500).json({
            message: 'Failed to get worker period hours',
            error: error.message
        });
    }
};

export const clearWorkerPeriodHours = async (req: Request, res: Response) => {
    try {
        await workerPeriodHoursRepository.clear();
        return res.status(200).json({ message: 'All worker period hours cleared' });
    } catch (error) {
        console.error('Error in clearWorkerPeriodHours:', error);
        return res.status(500).json({
            message: 'Failed to clear worker period hours',
            error: error.message
        });
    }
};
