import "reflect-metadata";
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { AppDataSource } from "./data-source";
import { errorHandler } from './middleware/errorHandler';
import { authRoutes } from './routes/auth';
import workerRoutes from './routes/workers';
import shiftRoutes from './routes/shifts';
import workerPeriodHoursRoutes from './routes/workerPeriodHours';
import contractRoutes from './routes/contractRoutes';

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Vite default port
  credentials: true
}));
app.use(express.json());

// Health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/worker-period-hours', workerPeriodHoursRoutes);
app.use('/api/contracts', contractRoutes);

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
const startServer = async () => {
  try {
    await AppDataSource.initialize();
    console.log("Database initialized successfully");

    // Create initial admin user if it doesn't exist
    const userRepo = AppDataSource.getRepository('User');
    const adminExists = await userRepo.findOne({ where: { username: 'admin' } });
    
    if (!adminExists) {
      await userRepo.save({
        username: 'admin',
        password: 'admin123', // This will be hashed by the entity
        isAdmin: true
      });
      console.log('Admin user created');
    }

    app.listen(port, () => {
      console.log(`Server is running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
    process.exit(1);
  }
};

startServer();
