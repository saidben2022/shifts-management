import "reflect-metadata";
import { AppDataSource } from "./data-source";
import { User } from "./entities/User";
import { Worker } from "./entities/Worker";
import { WorkerPeriodHours } from "./entities/WorkerPeriodHours";

async function seed() {
  try {
    // Initialize the database connection
    await AppDataSource.initialize();
    console.log("Database connection initialized");

    // Run migrations
    await AppDataSource.runMigrations();
    console.log("Migrations completed");

    // Clear existing data
    await AppDataSource.getRepository(WorkerPeriodHours).clear();
    await AppDataSource.getRepository(Worker).clear();
    await AppDataSource.getRepository(User).clear();
    console.log("Existing data cleared");

    // Create admin user
    const userRepository = AppDataSource.getRepository(User);
    const admin = new User();
    admin.username = "admin";
    admin.password = "admin123";
    admin.isAdmin = true;
    await userRepository.save(admin);
    console.log("Admin user created");

    // Create test workers
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const workersData = [
      { 
        firstName: "John", 
        lastName: "Doe", 
        workerId: "W001",
        contractStartDate: new Date(currentYear, 0, 1),
        contractDuration: 12,
        contractEndDate: new Date(currentYear, 11, 31),
        maxHours: 160
      },
      { 
        firstName: "Jane", 
        lastName: "Smith", 
        workerId: "W002",
        contractStartDate: new Date(currentYear, 0, 1),
        contractDuration: 12,
        contractEndDate: new Date(currentYear, 11, 31),
        maxHours: 140
      },
      { 
        firstName: "Mike", 
        lastName: "Johnson", 
        workerId: "W003",
        contractStartDate: new Date(currentYear, 0, 1),
        contractDuration: 12,
        contractEndDate: new Date(currentYear, 11, 31),
        maxHours: 120
      }
    ];

    const workerRepository = AppDataSource.getRepository(Worker);
    const periodHoursRepository = AppDataSource.getRepository(WorkerPeriodHours);
    
    for (const data of workersData) {
      const worker = new Worker();
      worker.firstName = data.firstName;
      worker.lastName = data.lastName;
      worker.workerId = data.workerId;
      worker.contractStartDate = data.contractStartDate;
      worker.contractDuration = data.contractDuration;
      worker.contractEndDate = data.contractEndDate;
      
      const savedWorker = await workerRepository.save(worker);
      console.log(`Worker ${worker.firstName} ${worker.lastName} created`);

      // Create period hours for each month of 2024
      for (let month = 0; month < 12; month++) {
        const periodHours = new WorkerPeriodHours();
        periodHours.workerId = savedWorker.id;
        periodHours.periodStart = new Date(2024, month, 1);
        periodHours.periodEnd = new Date(2024, month + 1, 0); // Last day of the month
        periodHours.maxHours = data.maxHours;
        await periodHoursRepository.save(periodHours);
      }
      console.log(`Period hours created for ${worker.firstName} ${worker.lastName}`);
    }

    console.log("Seed completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during seeding:", error);
    process.exit(1);
  } finally {
    try {
      await AppDataSource.destroy();
      console.log("Database connection closed");
    } catch (error) {
      console.error("Error closing database connection:", error);
    }
  }
}

seed();
