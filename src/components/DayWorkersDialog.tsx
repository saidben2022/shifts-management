import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from 'date-fns';
import { useTranslation } from 'react-i18next';
import { Shift, ShiftType } from '@/types/Shift';
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Calendar, Users } from "lucide-react";
import { TableSkeleton } from "@/components/TableSkeleton";

interface DayWorkersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  shifts: Shift[];
  isLoading: boolean;
}

export function DayWorkersDialog({
  open,
  onOpenChange,
  selectedDate,
  shifts,
  isLoading,
}: DayWorkersDialogProps) {
  const { t } = useTranslation();

  const dayShifts = shifts.filter(shift => {
    const shiftStart = new Date(shift.startTime);
    const shiftEnd = new Date(shift.endTime);
    const currentDate = new Date(selectedDate);
    
    // Set all dates to midnight for proper comparison
    currentDate.setHours(0, 0, 0, 0);
    const startDate = new Date(shiftStart);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(shiftEnd);
    endDate.setHours(0, 0, 0, 0);

    // For leave types, check if the date falls within the range
    if ([ShiftType.VACATION, ShiftType.SICK_LEAVE, ShiftType.UNPAID_LEAVE].includes(shift.shiftType)) {
      return currentDate >= startDate && currentDate <= endDate;
    }
    
    // For work shifts, check if it's on the same day
    return currentDate.getTime() === startDate.getTime();
  });

  const getShiftTypeBadge = (shiftType: ShiftType) => {
    const variants = {
      [ShiftType.NORMAL_WORKDAY]: {
        variant: "default",
        className: "bg-green-50 text-green-800 border-green-200 hover:bg-green-100"
      },
      [ShiftType.WEEKEND_DAY]: {
        variant: "secondary",
        className: "bg-blue-50 text-blue-800 border-blue-200 hover:bg-blue-100"
      },
      [ShiftType.HOLIDAY]: {
        variant: "destructive",
        className: "bg-purple-50 text-purple-800 border-purple-200 hover:bg-purple-100"
      },
      [ShiftType.SICK_LEAVE]: {
        variant: "warning",
        className: "bg-red-50 text-red-800 border-red-200 hover:bg-red-100"
      },
      [ShiftType.VACATION]: {
        variant: "success",
        className: "bg-orange-50 text-orange-800 border-orange-200 hover:bg-orange-100"
      },
      [ShiftType.UNPAID_LEAVE]: {
        variant: "outline",
        className: "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
      }
    };

    const style = variants[shiftType];
    return (
      <Badge variant={style.variant as any} className={style.className}>
        {t(`shifts.types.${shiftType.toLowerCase()}`)}
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b">
          <div className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <DialogTitle className="text-xl font-semibold">
              {t('shifts.daySchedule')} - {format(selectedDate, 'EEEE, MMMM d, yyyy')}
            </DialogTitle>
          </div>
        </DialogHeader>

        {isLoading ? (
          <div className="mt-4">
            <TableSkeleton columns={4} rows={3} />
          </div>
        ) : dayShifts.length > 0 ? (
          <div className="relative overflow-x-auto rounded-md mt-4">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{t('workers.fields.fullName')}</TableHead>
                  <TableHead className="font-semibold">{t('shifts.fields.type')}</TableHead>
                  <TableHead className="font-semibold">{t('shifts.fields.location')}</TableHead>
                  <TableHead className="text-right font-semibold">{t('shifts.fields.hours')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {dayShifts.map((shift) => (
                  <TableRow 
                    key={shift.id}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      shift.shiftType === ShiftType.VACATION && "bg-green-50/50",
                      shift.shiftType === ShiftType.SICK_LEAVE && "bg-orange-50/50",
                      shift.shiftType === ShiftType.UNPAID_LEAVE && "bg-yellow-50/50"
                    )}
                  >
                    <TableCell className="font-medium">
                      {shift.worker?.firstName} {shift.worker?.lastName}
                    </TableCell>
                    <TableCell>
                      {getShiftTypeBadge(shift.shiftType)}
                    </TableCell>
                    <TableCell>{shift.location || '-'}</TableCell>
                    <TableCell className="text-right">
                      {shift.hoursWorked?.toFixed(1) || '-'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Users className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-center text-lg font-medium text-gray-500">{t('shifts.noWorkersScheduled')}</p>
            <p className="text-center text-sm text-gray-400 mt-1">{t('shifts.addShiftPrompt')}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
