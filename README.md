# Workers Management System

A comprehensive web application for managing workers and their shifts.

## Technologies Used

- Frontend:
  - React with TypeScript
  - Tailwind CSS
  - Shadcn/ui
  - React Query
  - Sonner (Toast notifications)

- Backend:
  - Express.js with TypeScript
  - SQLite with TypeORM
  - JWT Authentication

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd workers-management-system-react
```

2. Install frontend dependencies:
```bash
npm install
```

3. Install backend dependencies:
```bash
cd backend
npm install
```

### Database Setup

1. Create a `.env` file in the backend directory:
```env
PORT=5000
JWT_SECRET=your-super-secret-key-change-this-in-production
```

2. Seed the database:
```bash
cd backend
npx ts-node src/seed.ts
```

This will create:
- Admin user (username: "admin", password: "admin123")
- Sample workers
- Sample shifts

### Running the Application

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. In a new terminal, start the frontend:
```bash
cd ..
npm run dev
```

3. Access the application:
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

### Default Admin Credentials
- Username: admin
- Password: admin123

## Features

- User authentication
- Worker management (CRUD operations)
- Shift scheduling
- Calendar view
- Toast notifications
- Error handling
- Loading states
- Form validation

## Development

- Backend API runs on port 5000
- Frontend dev server runs on port 5173
- SQLite database is created automatically
- Seeder can be run multiple times (it clears existing data)

## Error Handling

The application includes:
- Backend error middleware
- Frontend toast notifications
- Form validation
- Loading states
- Confirmation dialogs for destructive actions

## API Endpoints

- Auth:
  - POST /api/auth/login
  - POST /api/auth/register
  - GET /api/auth/me

- Workers:
  - GET /api/workers
  - POST /api/workers
  - PUT /api/workers/:id
  - DELETE /api/workers/:id

- Shifts:
  - GET /api/shifts
  - POST /api/shifts
  - PUT /api/shifts/:id
  - DELETE /api/shifts/:id
  - GET /api/shifts/worker/:workerId
  - GET /api/shifts/range
