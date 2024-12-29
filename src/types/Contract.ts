export interface Contract {
  id: string;
  workerId: string;
  type: string;
  startDate: string;
  endDate: string | null;
  hoursPerPeriod: number;
  createdAt: string;
  updatedAt: string;
}
