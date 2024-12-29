import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "../../lib/utils";
import { Button } from "./button";
import { Calendar } from "./calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./popover";

interface DatePickerProps {
  date?: Date;
  onSelect?: (date: Date | undefined) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function DatePicker({
  date,
  onSelect,
  disabled,
  placeholder = "Pick a date",
}: DatePickerProps) {
  const [selectedDate, setSelectedDate] = React.useState<Date | undefined>(date);

  React.useEffect(() => {
    setSelectedDate(date);
  }, [date]);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-[240px] justify-start text-left font-normal",
            !selectedDate && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {selectedDate ? format(selectedDate, "dd/MM/yyyy") : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-white rounded-md shadow-lg" align="start">
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => {
            setSelectedDate(date);
            onSelect?.(date);
          }}
          initialFocus
          className="rounded-md border"
        />
      </PopoverContent>
    </Popover>
  );
}
