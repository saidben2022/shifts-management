export enum ShiftType {
  NORMAL_WORKDAY = 'NORMAL_WORKDAY',
  WEEKEND_DAY = 'WEEKEND_DAY',
  HOLIDAY = 'HOLIDAY',
  SICK_LEAVE = 'SICK_LEAVE',
  VACATION = 'VACATION',
  UNPAID_LEAVE = 'UNPAID_LEAVE'
}

export interface Worker {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

export interface ShiftInput {
  workerId: number | string;
  shiftType: ShiftType;
  startTime: string;
  endTime: string;
  hoursWorked: number;
  location?: string;
}

export interface Shift extends Omit<ShiftInput, 'workerId'> {
  id: number;
  worker?: Worker;
  location: string | null;
  createdAt: string;
  updatedAt: string;
}
