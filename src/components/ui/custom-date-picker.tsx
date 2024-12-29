import React from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { cn } from '@/lib/utils';

interface CustomDatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CustomDatePicker({
  selected,
  onChange,
  placeholder = "Select date",
  className,
  disabled = false
}: CustomDatePickerProps) {
  return (
    <div className={cn("relative", className)}>
      <DatePicker
        selected={selected}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        placeholderText={placeholder}
        disabled={disabled}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        showPopperArrow={false}
        popperClassName="react-datepicker-popper"
        calendarClassName="react-datepicker-calendar"
        wrapperClassName="react-datepicker-wrapper"
      />
    </div>
  );
}
