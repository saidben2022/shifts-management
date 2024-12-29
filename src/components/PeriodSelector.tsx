import { useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { getPeriods, formatDate } from '../lib/utils';
import { Label } from './ui/label';

interface PeriodSelectorProps {
  selectedYear: number;
  selectedPeriod: number;
  onYearChange: (year: number) => void;
  onPeriodChange: (period: number) => void;
}

export function PeriodSelector({ 
  selectedYear, 
  selectedPeriod, 
  onYearChange, 
  onPeriodChange 
}: PeriodSelectorProps) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i);
  const periods = getPeriods(selectedYear);

  return (
    <div className="flex gap-4 items-end">
      <div className="space-y-2">
        <Label>Year</Label>
        <Select
          value={selectedYear.toString()}
          onValueChange={(value) => onYearChange(parseInt(value))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>Period</Label>
        <Select
          value={selectedPeriod.toString()}
          onValueChange={(value) => onPeriodChange(parseInt(value))}
        >
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period, index) => (
              <SelectItem key={index + 1} value={(index + 1).toString()}>
                {`${period.label} (${formatDate(period.start)} - ${formatDate(period.end)})`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
