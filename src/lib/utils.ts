import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { addWeeks, startOfWeek, getWeek, endOfWeek, addDays, getISOWeek, startOfYear, format } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFirstMondayOfYear(year: number): Date {
  // Get the last Monday of the previous year
  const lastDayPrevYear = new Date(year - 1, 11, 31);
  const firstDayOfYear = new Date(year, 0, 1);
  
  // Find the first Monday of the ISO year
  let currentDate = startOfWeek(firstDayOfYear, { weekStartsOn: 1 });
  
  // If January 1st is after Thursday, we need to move to next week
  // as per ISO week definition
  if (firstDayOfYear.getDay() > 4) {
    currentDate = addDays(currentDate, 7);
  }
  
  return currentDate;
}

// Cache for period calculations
const periodCache = new Map<number, { start: Date; end: Date; label: string; weeks: number[] }[]>();

export function getPeriods(year: number): { start: Date; end: Date; label: string; weeks: number[] }[] {
  // Check cache first
  const cached = periodCache.get(year);
  if (cached) {
    return cached;
  }

  const firstMonday = getFirstMondayOfYear(year);
  const periods = [];

  // Calculate number of complete 4-week periods
  // Each period starts on Monday and ends on Sunday after 4 weeks
  for (let i = 0; i < 13; i++) {
    const startDate = addWeeks(firstMonday, i * 4);
    const endDate = addDays(addWeeks(startDate, 4), -1); // End on Sunday
    
    // Set hours for start date (Monday 00:00:00)
    startDate.setHours(0, 0, 0, 0);
    
    // Set hours for end date (Sunday 23:59:59.999)
    endDate.setHours(23, 59, 59, 999);
    
    // Calculate the ISO weeks within this period
    const periodWeeks = [];
    let currentDate = new Date(startDate);
    
    // Add the 4 weeks of the period
    while (currentDate <= endDate) {
      const week = getISOWeek(currentDate);
      if (!periodWeeks.includes(week)) {
        periodWeeks.push(week);
      }
      currentDate = addDays(currentDate, 7);
    }

    periods.push({
      start: new Date(startDate),
      end: new Date(endDate),
      label: `P${i + 1}`,
      weeks: periodWeeks
    });
  }

  // Store in cache
  periodCache.set(year, periods);
  return periods;
}

export function getCurrentPeriod(date: Date = new Date()): number {
  const year = date.getFullYear();
  const periods = getPeriods(year);
  const timestamp = date.getTime();
  
  return periods.findIndex(period => 
    timestamp >= period.start.getTime() && timestamp <= period.end.getTime()
  );
}

export function formatDate(date: Date): string {
  // Format to UTC date string and ensure time is set to start of day
  return date.toISOString().split('T')[0] + 'T00:00:00.000Z';
}

export function getPeriodsAlternative(year: number) {
  const startDate = startOfYear(new Date(year, 0, 1));
  const periods = [];
  
  // Calculate periods
  for (let i = 0; i < 12; i++) {
    const periodStart = addWeeks(startDate, i * 4);
    const periodEnd = addWeeks(periodStart, 4);
    
    // Get weeks in this period
    const weeks = [];
    let currentWeek = getISOWeek(periodStart);
    const endWeek = getISOWeek(periodEnd);
    
    while (currentWeek < endWeek) {
      weeks.push(currentWeek);
      currentWeek++;
    }
    
    // Format dates to UTC to avoid timezone issues
    const formattedStart = periodStart.toISOString().split('T')[0] + 'T00:00:00.000Z';
    const formattedEnd = periodEnd.toISOString().split('T')[0] + 'T23:59:59.999Z';
    
    periods.push({
      start: formattedStart,
      end: formattedEnd,
      weeks
    });
  }
  
  return periods;
}
