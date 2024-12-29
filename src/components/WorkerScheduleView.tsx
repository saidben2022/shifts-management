import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { format, startOfDay, endOfDay } from 'date-fns';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { CalendarIcon, Users2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Worker } from '@/types/Worker';
import { Shift, ShiftType } from '@/types/Shift';
import { Badge } from "@/components/ui/badge";
import { TableSkeleton } from "@/components/TableSkeleton";

interface WorkerScheduleViewProps {
  workers: Worker[];
  shifts: Shift[];
}

export function WorkerScheduleView({ workers, shifts }: WorkerScheduleViewProps) {
  const { t } = useTranslation();
  const today = new Date();
  const [startDate, setStartDate] = useState<Date>(startOfDay(today));
  const [endDate, setEndDate] = useState<Date>(endOfDay(today));
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [groupByLocation, setGroupByLocation] = useState(false);

  // Get unique locations from shifts
  const locations = useMemo(() => {
    const uniqueLocations = new Set<string>();
    shifts.forEach(shift => {
      if (shift.location) {
        uniqueLocations.add(shift.location);
      }
    });
    return Array.from(uniqueLocations);
  }, [shifts]);

  // Filter shifts based on date range and location
  const filteredShifts = useMemo(() => {
    return shifts.filter(shift => {
      if (!shift.startTime || !shift.endTime) return false;
      
      try {
        const shiftStart = new Date(shift.startTime);
        const shiftEnd = new Date(shift.endTime);
        
        if (isNaN(shiftStart.getTime()) || isNaN(shiftEnd.getTime())) return false;
        
        const isInDateRange = shiftStart >= startDate && shiftEnd <= endDate;
        const isInLocation = selectedLocation === 'all' || shift.location === selectedLocation;
        
        return isInDateRange && isInLocation;
      } catch (error) {
        console.error('Error processing shift dates:', error);
        return false;
      }
    });
  }, [shifts, startDate, endDate, selectedLocation]);

  // Group shifts by worker or location
  const groupedShifts = useMemo(() => {
    if (groupByLocation) {
      const byLocation: { [key: string]: Shift[] } = {};
      filteredShifts.forEach(shift => {
        const location = shift.location || 'Unknown';
        if (!byLocation[location]) {
          byLocation[location] = [];
        }
        byLocation[location].push(shift);
      });
      return byLocation;
    } else {
      const byWorker: { [key: number]: Shift[] } = {};
      filteredShifts.forEach(shift => {
        if (shift.worker) {
          if (!byWorker[shift.worker.id]) {
            byWorker[shift.worker.id] = [];
          }
          byWorker[shift.worker.id].push(shift);
        }
      });
      return byWorker;
    }
  }, [filteredShifts, groupByLocation]);

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

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return format(date, 'PP');
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const formatTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid date');
      }
      return format(date, 'p');
    } catch (error) {
      console.error('Error formatting time:', error);
      return 'Invalid time';
    }
  };

  const isLoading = false;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Start Date Picker */}
        <div className="grid gap-3">
          <Label className="text-sm font-medium text-gray-700">{t('shifts.fields.startDate')}</Label>
          <div className="relative">
            <DatePicker
              selected={startDate}
              onChange={(date: Date | null) => date && setStartDate(startOfDay(date))}
              className={cn(
                "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:border-blue-500 transition-colors"
              )}
              dateFormat="yyyy-MM-dd"
              placeholderText={t('shifts.fields.selectStartDate')}
              popperPlacement="bottom"
              popperProps={{
                positionFixed: true,
                strategy: "fixed"
              }}
              portalId="calendar-portal"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* End Date Picker */}
        <div className="grid gap-3">
          <Label className="text-sm font-medium text-gray-700">{t('shifts.fields.endDate')}</Label>
          <div className="relative">
            <DatePicker
              selected={endDate}
              onChange={(date: Date | null) => date && setEndDate(endOfDay(date))}
              minDate={startDate}
              className={cn(
                "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer hover:border-blue-500 transition-colors"
              )}
              dateFormat="yyyy-MM-dd"
              placeholderText={t('shifts.fields.selectEndDate')}
              popperPlacement="bottom"
              popperProps={{
                positionFixed: true,
                strategy: "fixed"
              }}
              portalId="calendar-portal"
            />
            <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* Location Filter */}
        <div className="space-y-2">
          <Label>{t('shifts.fields.location')}</Label>
          <Select value={selectedLocation} onValueChange={setSelectedLocation}>
            <SelectTrigger>
              <SelectValue placeholder={t('shifts.fields.selectLocation')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('shifts.fields.selectLocation')}</SelectItem>
              {locations.map((location) => (
                <SelectItem key={location} value={location}>
                  {location}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Group By Toggle */}
        <div className="space-y-2">
          <Label>{t('shifts.grouping.groupBy')}</Label>
          <Select value={groupByLocation ? 'location' : 'worker'} onValueChange={(value) => setGroupByLocation(value === 'location')}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="worker">{t('shifts.grouping.groupByWorker')}</SelectItem>
              <SelectItem value="location">{t('shifts.grouping.groupByLocation')}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="mt-8">
        {isLoading ? (
          <TableSkeleton columns={groupByLocation ? 4 : 5} rows={5} />
        ) : filteredShifts.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">{t('shifts.fields.date')}</TableHead>
                  {groupByLocation && (
                    <TableHead className="font-semibold">{t('workers.fields.fullName')}</TableHead>
                  )}
                  <TableHead className="font-semibold">{t('shifts.fields.type')}</TableHead>
                  <TableHead className="font-semibold text-right">{t('shifts.fields.hours')}</TableHead>
                  {!groupByLocation && (
                    <TableHead className="font-semibold">{t('shifts.fields.location')}</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShifts.map((shift) => (
                  <TableRow
                    key={shift.id}
                    className={cn(
                      "hover:bg-muted/50 transition-colors",
                      shift.shiftType === ShiftType.VACATION && "bg-green-50/50",
                      shift.shiftType === ShiftType.SICK_LEAVE && "bg-orange-50/50",
                      shift.shiftType === ShiftType.UNPAID_LEAVE && "bg-yellow-50/50"
                    )}
                  >
                    <TableCell>{format(new Date(shift.startTime), 'EEEE, MMMM d')}</TableCell>
                    {groupByLocation && (
                      <TableCell className="font-medium">
                        {shift.worker?.firstName} {shift.worker?.lastName}
                      </TableCell>
                    )}
                    <TableCell>
                      {getShiftTypeBadge(shift.shiftType)}
                    </TableCell>
                    <TableCell className="text-right">
                      {shift.hoursWorked?.toFixed(1) || '-'}
                    </TableCell>
                    {!groupByLocation && (
                      <TableCell>{shift.location || '-'}</TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground bg-muted/5 rounded-lg border border-dashed">
            <Users2 className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-center text-lg font-medium text-gray-500">{t('shifts.noShiftsFound')}</p>
            <p className="text-center text-sm text-gray-400 mt-1">{t('shifts.adjustFilters')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
