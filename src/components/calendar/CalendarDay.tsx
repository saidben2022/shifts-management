import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format, isToday } from "date-fns";
import { Shift } from "@/types/shift";
import { ShiftCard } from "./ShiftCard";
import { useTranslation } from 'react-i18next';
import { isWeekend, isHoliday, getHolidayName } from '@/utils/dateUtils';
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface CalendarDayProps {
  day: string;
  name?: string;
  date: Date;
  shifts: Shift[];
  onDayClick: (date: Date) => void;
  onAddClick: (date: Date) => void;
  onShiftClick: (e: React.MouseEvent, shift: Shift) => void;
  onDeleteClick: (e: React.MouseEvent, shiftId: number) => void;
  isLoading?: boolean;
}

const CalendarDay: React.FC<CalendarDayProps> = ({ 
  day, 
  date, 
  shifts = [], 
  onDayClick, 
  onAddClick,
  onShiftClick, 
  onDeleteClick,
  isLoading,
}) => {
  const { t } = useTranslation();
  const isWeekendDay = isWeekend(date);
  const isHolidayDay = isHoliday(date);
  const holidayName = isHolidayDay ? getHolidayName(date) : null;
  const isTodayDate = isToday(date);

  const handleAddClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddClick(date);
  };

  return (
    <div className="min-h-[120px]">
      <Card 
        className={cn(
          "h-full p-3 space-y-2 cursor-pointer transition-all duration-200 hover:shadow-md",
          "border border-gray-200",
          isWeekendDay && "bg-gradient-to-br from-purple-50 to-purple-100/50",
          isHolidayDay && "bg-gradient-to-br from-blue-50 to-blue-100/50",
          isTodayDate && "ring-2 ring-indigo-500 ring-offset-2",
        )}
        onClick={() => onDayClick(date)}
      >
        <div className="flex justify-between items-center">
          <div className={cn(
            "text-sm font-medium",
            isWeekendDay ? "text-purple-700" : isHolidayDay ? "text-blue-700" : "text-gray-700"
          )}>
            {t(`days.${day}`)}
          </div>
          <div className="flex items-center gap-2">
            <span className={cn(
              "text-sm font-semibold",
              isWeekendDay ? "text-purple-600" : isHolidayDay ? "text-blue-600" : "text-gray-600"
            )}>
              {format(date, "d")}
            </span>
            <Button
              size="icon"
              variant="ghost"
              className={cn(
                "h-7 w-7 rounded-full",
                "bg-white/50 hover:bg-white",
                "border border-gray-200 shadow-sm",
                "transition-all duration-200",
                isWeekendDay && "hover:bg-purple-100 hover:text-purple-600 hover:border-purple-200",
                isHolidayDay && "hover:bg-blue-100 hover:text-blue-600 hover:border-blue-200",
                !isWeekendDay && !isHolidayDay && "hover:bg-indigo-100 hover:text-indigo-600 hover:border-indigo-200"
              )}
              onClick={handleAddClick}
              title="Add Shift"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {holidayName && (
          <p className="text-xs font-medium text-blue-600 bg-blue-100/50 py-0.5 px-2 rounded-full inline-block">
            {holidayName}
          </p>
        )}
        <div className="space-y-2">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-16" />
            </>
          ) : (
            shifts.map((shift) => (
              <ShiftCard
                key={shift.id}
                shift={shift}
                onClick={(e) => onShiftClick(e, shift)}
                onDelete={onDeleteClick}
              />
            ))
          )}
        </div>
      </Card>
    </div>
  );
};

export default CalendarDay;
