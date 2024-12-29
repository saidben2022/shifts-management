export interface Contract {
  id: number;
  workerId: number;
  startDate: string;
  duration: number;
  endDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Worker {
  id: number;
  firstName: string;
  lastName: string;
  workerId: string;
  contracts?: Contract[];
  createdAt: string;
  updatedAt: string;
}
