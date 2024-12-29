import { AppDataSource } from "../data-source";
import { User } from "../entities/User";
import { Worker } from "../entities/Worker";
import { Contract } from "../entities/Contract";
import * as bcrypt from "bcrypt";

async function seedDatabase() {
    await AppDataSource.initialize();

    try {
        // Clear existing data
        await AppDataSource.getRepository(Contract).clear();
        await AppDataSource.getRepository(Worker).clear();
        await AppDataSource.getRepository(User).clear();

        // Create admin user
        const userRepository = AppDataSource.getRepository(User);
        const admin = userRepository.create({
            username: "admin",
            password: "admin123",
            isAdmin: true
        });
        await userRepository.save(admin);

        // Create workers with diverse names
        const workerRepository = AppDataSource.getRepository(Worker);
        const contractRepository = AppDataSource.getRepository(Contract);

        const workers = [
            { firstName: "Mohammed", lastName: "Al-Saidi", workerId: "W001" },
            { firstName: "Jan", lastName: "van der Berg", workerId: "W002" },
            { firstName: "Ahmed", lastName: "El-Mansouri", workerId: "W003" },
            { firstName: "Willem", lastName: "de Vries", workerId: "W004" },
            { firstName: "Fatima", lastName: "Al-Rashid", workerId: "W005" },
            { firstName: "Hendrik", lastName: "Bakker", workerId: "W006" },
            { firstName: "Layla", lastName: "El-Amrani", workerId: "W007" },
            { firstName: "Sophie", lastName: "van Dijk", workerId: "W008" },
            { firstName: "Omar", lastName: "Al-Hassan", workerId: "W009" },
            { firstName: "Emma", lastName: "Jansen", workerId: "W010" }
        ];

        // Current date for reference
        const currentDate = new Date();

        for (const workerData of workers) {
            // Create worker
            const worker = workerRepository.create(workerData);
            await workerRepository.save(worker);

            // Create initial contract (started 6 months ago)
            const contractStartDate = new Date(currentDate);
            contractStartDate.setMonth(contractStartDate.getMonth() - 6);
            
            const contractEndDate = new Date(contractStartDate);
            contractEndDate.setMonth(contractEndDate.getMonth() + 12);

            const contract = contractRepository.create({
                workerId: worker.id,
                startDate: contractStartDate,
                duration: 12,
                endDate: contractEndDate,
                worker: worker
            });
            await contractRepository.save(contract);

            // For some workers, add a previous contract
            if (worker.id % 3 === 0) {
                const previousStartDate = new Date(contractStartDate);
                previousStartDate.setMonth(previousStartDate.getMonth() - 12);
                
                const previousEndDate = new Date(contractStartDate);
                previousEndDate.setDate(previousEndDate.getDate() - 1);

                const previousContract = contractRepository.create({
                    workerId: worker.id,
                    startDate: previousStartDate,
                    duration: 12,
                    endDate: previousEndDate,
                    worker: worker
                });
                await contractRepository.save(previousContract);
            }
        }

        console.log("Database seeded successfully!");
    } catch (error) {
        console.error("Error seeding database:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

seedDatabase();
