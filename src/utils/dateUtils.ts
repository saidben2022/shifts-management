import { format } from 'date-fns';

export const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

const holidays = [
  { date: '2024-01-01', name: 'New Year\'s Day' },
  { date: '2024-12-25', name: 'Christmas Day' },
  { date: '2024-12-26', name: 'Boxing Day' },
  { date: '2024-05-27', name: 'Spring Bank Holiday' },
  { date: '2024-08-26', name: 'Summer Bank Holiday' },
  { date: '2024-04-01', name: 'Easter Monday' },
  // Add more holidays as needed
];

export const isHoliday = (date: Date): boolean => {
  const dateStr = format(date, 'yyyy-MM-dd');
  return holidays.some(holiday => holiday.date === dateStr);
};

export const getHolidayName = (date: Date): string | null => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const holiday = holidays.find(h => h.date === dateStr);
  return holiday ? holiday.name : null;
};
