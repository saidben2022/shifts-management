import * as React from "react";
import { useState, useEffect } from "react";
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { format } from 'date-fns';
import { useToast } from "./ui/use-toast";
import { Worker } from '@/types/Worker';
import { Shift, ShiftType, ShiftInput } from '@/types/Shift';
import { cn } from '@/lib/utils';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import { AlertCircle, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useTranslation } from 'react-i18next';

interface ShiftDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: any) => Promise<void>;
  shifts: any[];
  workers: any[];
  selectedDate: Date | undefined;
  currentPeriod: {
    start: string;
    end: string;
  };
  getWorkerPeriodMaxHours: (workerId: number, periodStart: string, periodEnd: string) => Promise<number | undefined>;
}

export function ShiftDialog({ 
  open, 
  onOpenChange, 
  onSave, 
  shifts, 
  workers,
  selectedDate,
  currentPeriod,
  getWorkerPeriodMaxHours
}: ShiftDialogProps) {
  const { register, handleSubmit, reset, setValue, watch, formState: { isSubmitting } } = useForm<ShiftInput>();
  const { toast } = useToast();
  const { t } = useTranslation();

  const isLeaveType = (type: ShiftType) => {
    return [ShiftType.SICK_LEAVE, ShiftType.VACATION, ShiftType.UNPAID_LEAVE].includes(type);
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
  };

  const getInitialState = (date: Date | undefined) => ({
    workerId: '',
    shiftType: date ? (isWeekend(date) ? ShiftType.WEEKEND_DAY : ShiftType.NORMAL_WORKDAY) : ShiftType.NORMAL_WORKDAY,
    hoursWorked: '8',
    startDate: date || null,
    endDate: null,
    location: ''
  });

  const [shiftData, setShiftData] = useState(getInitialState(selectedDate));
  const [hoursError, setHoursError] = useState<string | null>(null);
  const [selectedWorkerHours, setSelectedWorkerHours] = useState<{
    maxHours: number | null;
    totalWorkedHours: number;
    remainingHours: number | null;
  }>({
    maxHours: null,
    totalWorkedHours: 0,
    remainingHours: null
  });

  useEffect(() => {
    const fetchWorkerHours = async () => {
      if (!shiftData.workerId) return;

      try {
        const maxHours = await getWorkerPeriodMaxHours(parseInt(shiftData.workerId), currentPeriod.start, currentPeriod.end);
        const workerShifts = shifts.filter(shift => 
          shift.worker?.id === parseInt(shiftData.workerId) && 
          new Date(shift.startTime) >= new Date(currentPeriod.start) && 
          new Date(shift.endTime) <= new Date(currentPeriod.end) &&
          ![ShiftType.SICK_LEAVE, ShiftType.VACATION, ShiftType.UNPAID_LEAVE].includes(shift.shiftType)
        );
        const totalWorkedHours = workerShifts.reduce((sum, s) => sum + s.hoursWorked, 0);
        const remainingHours = maxHours ? maxHours - totalWorkedHours : null;

        setSelectedWorkerHours({
          maxHours,
          totalWorkedHours,
          remainingHours
        });
      } catch (error) {
        console.error('Error fetching worker hours:', error);
        setSelectedWorkerHours({
          maxHours: null,
          totalWorkedHours: 0,
          remainingHours: null
        });
      }
    };

    fetchWorkerHours();
  }, [shiftData.workerId, currentPeriod.start, currentPeriod.end, getWorkerPeriodMaxHours, shifts]);

  useEffect(() => {
    if (open) {
      setShiftData(getInitialState(selectedDate));
    }
  }, [open, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      const newShiftType = isWeekend(selectedDate) ? ShiftType.WEEKEND_DAY : ShiftType.NORMAL_WORKDAY;
      setShiftData(prev => ({
        ...prev,
        startDate: selectedDate,
        shiftType: isLeaveType(prev.shiftType) ? prev.shiftType : newShiftType
      }));
    }
  }, [selectedDate]);

  const handleShiftTypeChange = (value: ShiftType) => {
    if (shiftData.startDate) {
      const date = shiftData.startDate;
      const isWeekendDay = isWeekend(date);
      
      if ((value === ShiftType.WEEKEND_DAY && !isWeekendDay) || 
          (value === ShiftType.NORMAL_WORKDAY && isWeekendDay)) {
        toast({
          title: t('shifts.dialog.errors.invalidShiftType'),
          description: isWeekendDay 
            ? t('shifts.dialog.errors.cannotSetNormalWorkdayOnWeekends') 
            : t('shifts.dialog.errors.cannotSetWeekendDayOnWeekdays'),
          variant: "destructive",
          duration: 3000
        });
        return;
      }
    }

    setShiftData(prev => ({ 
      ...prev, 
      shiftType: value,
      endDate: isLeaveType(value) ? prev.endDate : null
    }));
  };

  const validateHours = (hours: number): boolean => {
    if (!shiftData.workerId || isLeaveType(shiftData.shiftType)) {
      setHoursError(null);
      return true;
    }

    // Get worker's maximum hours for this period
    const maxHours = selectedWorkerHours.maxHours;
    if (!maxHours) {
      setHoursError(t('shifts.dialog.errors.maxHoursNotSet'));
      return false;
    }

    if (hours <= 0 || hours > 24) {
      setHoursError(t('shifts.dialog.errors.hoursMustBeBetween0And24'));
      return false;
    }

    // Skip further validation for leave types
    if (isLeaveType(shiftData.shiftType)) {
      setHoursError(null);
      return true;
    }

    if (!hours || isNaN(hours)) {
      setHoursError(t('shifts.dialog.errors.pleaseEnterValidHours'));
      return false;
    }

    setHoursError(null);
    return true;
  };

  const handleHoursChange = (value: string) => {
    const hours = parseFloat(value);
    if (isNaN(hours)) {
      setHoursError(t('shifts.dialog.errors.pleaseEnterValidHours'));
      setShiftData(prev => ({ ...prev, hoursWorked: value }));
      return;
    }
    
    const isValid = validateHours(hours);
    if (isValid) {
      setShiftData(prev => ({ ...prev, hoursWorked: value }));
    }
  };

  const handleLocationChange = (value: string) => {
    setShiftData(prev => ({ ...prev, location: value }));
  };

  const onSubmit = async () => {
    try {
      // Validate worker selection
      if (!shiftData.workerId) {
        toast({
          title: t('shifts.dialog.errors.error'),
          description: t('shifts.dialog.errors.pleaseSelectAWorker'),
          variant: 'destructive',
        });
        return;
      }

      // Ensure dates are properly set before submitting
      if (!shiftData.startDate) {
        toast({
          title: t('shifts.dialog.errors.error'),
          description: t('shifts.dialog.errors.pleaseSelectAStartDate'),
          variant: 'destructive',
        });
        return;
      }

      if ([ShiftType.SICK_LEAVE, ShiftType.VACATION, ShiftType.UNPAID_LEAVE].includes(shiftData.shiftType as ShiftType) && !shiftData.endDate) {
        toast({
          title: t('shifts.dialog.errors.error'),
          description: t('shifts.dialog.errors.pleaseSelectAnEndDateForLeavePeriod'),
          variant: 'destructive',
        });
        return;
      }

      // Validate hours for work shifts
      if ([ShiftType.NORMAL_WORKDAY, ShiftType.WEEKEND_DAY, ShiftType.HOLIDAY].includes(shiftData.shiftType as ShiftType)) {
        if (!shiftData.hoursWorked) {
          toast({
            title: t('shifts.dialog.errors.error'),
            description: t('shifts.dialog.errors.pleaseEnterHoursWorked'),
            variant: 'destructive',
          });
          return;
        }

        const hours = parseFloat(shiftData.hoursWorked);
        if (!validateHours(hours)) {
          toast({
            title: t('shifts.dialog.errors.error'),
            description: hoursError || t('shifts.dialog.errors.invalidHours'),
            variant: 'destructive',
          });
          return;
        }

        // Check if worker would exceed max hours
        if (selectedWorkerHours.maxHours !== null) {
          const totalHours = selectedWorkerHours.totalWorkedHours + hours;
          if (totalHours > selectedWorkerHours.maxHours) {
            const excessHours = totalHours - selectedWorkerHours.maxHours;
            toast({
              title: t('shifts.dialog.warnings.exceedingHours'),
              description: t('shifts.dialog.warnings.exceedingHoursBy', { hours: excessHours }),
              variant: 'destructive',
            });
            return;
          }
        }
      }

      const formData = {
        workerId: parseInt(shiftData.workerId),
        shiftType: shiftData.shiftType as ShiftType,
        startTime: new Date(shiftData.startDate).toISOString(),
        endTime: new Date(shiftData.endDate || shiftData.startDate).toISOString(),
        hoursWorked: isLeaveType(shiftData.shiftType) ? 0 : parseFloat(shiftData.hoursWorked) || 0,
        location: isLeaveType(shiftData.shiftType) ? null : shiftData.location || null
      };

      await onSave(formData);
      setShiftData(getInitialState(undefined));
      onOpenChange(false);
    } catch (error: any) {
      console.error('Error adding shift:', error);
      toast({
        title: t('shifts.dialog.errors.error'),
        description: error?.message || t('shifts.dialog.errors.failedToAddShift'),
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setShiftData(getInitialState(undefined));
    onOpenChange(false);
  };

  const handleWorkerChange = (value: string) => {
    setValue('workerId', value);
  };

  const getShiftTypeColor = (type: ShiftType) => {
    switch (type) {
      case ShiftType.NORMAL_WORKDAY:
        return 'bg-green-50 text-green-800 border-green-200';
      case ShiftType.WEEKEND_DAY:
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case ShiftType.HOLIDAY:
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case ShiftType.SICK_LEAVE:
        return 'bg-red-50 text-red-800 border-red-200';
      case ShiftType.VACATION:
        return 'bg-orange-50 text-orange-800 border-orange-200';
      case ShiftType.UNPAID_LEAVE:
        return 'bg-gray-50 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  const formatShiftType = (type: ShiftType): string => {
    return type.toString().split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
          <DialogHeader className="text-white">
            <DialogTitle className="text-2xl font-bold">
              {t('shifts.dialog.title')}
            </DialogTitle>
            <DialogDescription className="text-indigo-100">
              {t('shifts.dialog.description')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-4">
            {/* Worker Selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('shifts.dialog.labels.selectWorker')}
              </Label>
              <Select
                value={shiftData.workerId}
                onValueChange={(value) => setShiftData(prev => ({ ...prev, workerId: value }))}
              >
                <SelectTrigger className="w-full bg-white border-gray-200">
                  <SelectValue placeholder={t('shifts.dialog.labels.selectWorker')} />
                </SelectTrigger>
                <SelectContent>
                  {workers.map((worker) => (
                    <SelectItem
                      key={worker.id}
                      value={worker.id.toString()}
                      className="cursor-pointer transition-colors hover:bg-indigo-50"
                    >
                      {worker.firstName} {worker.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Shift Type */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-gray-700">
                {t('shifts.dialog.labels.shiftType')}
              </Label>
              <Select
                value={shiftData.shiftType}
                onValueChange={(value) => handleShiftTypeChange(value as ShiftType)}
              >
                <SelectTrigger>
                  <SelectValue>
                    <div className={cn(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                      getShiftTypeColor(shiftData.shiftType as ShiftType)
                    )}>
                      {formatShiftType(shiftData.shiftType as ShiftType)}
                    </div>
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {Object.values(ShiftType).map((type) => (
                    <SelectItem 
                      key={type} 
                      value={type}
                      className={cn(
                        "cursor-pointer transition-colors hover:bg-gray-50",
                        "flex items-center space-x-2"
                      )}
                    >
                      <div className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium w-full",
                        getShiftTypeColor(type)
                      )}>
                        {formatShiftType(type)}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Date Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t('shifts.dialog.labels.startDate')}
                </Label>
                <div className="relative">
                  <DatePicker
                    selected={shiftData.startDate}
                    onChange={(date) => setShiftData(prev => ({ ...prev, startDate: date }))}
                    dateFormat="dd/MM/yyyy"
                    className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    wrapperClassName="w-full"
                    customInput={
                      <div className="flex items-center justify-between cursor-pointer bg-white border border-gray-200 rounded-md px-3 py-2">
                        <span>{shiftData.startDate ? format(shiftData.startDate, 'dd/MM/yyyy') : t('shifts.dialog.labels.selectDate')}</span>
                        <CalendarIcon className="h-4 w-4 text-gray-500" />
                      </div>
                    }
                  />
                </div>
              </div>

              {isLeaveType(shiftData.shiftType) && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    {t('shifts.dialog.labels.endDate')}
                  </Label>
                  <div className="relative">
                    <DatePicker
                      selected={shiftData.endDate}
                      onChange={(date) => setShiftData(prev => ({ ...prev, endDate: date }))}
                      dateFormat="dd/MM/yyyy"
                      className="w-full rounded-md border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      wrapperClassName="w-full"
                      customInput={
                        <div className="flex items-center justify-between cursor-pointer bg-white border border-gray-200 rounded-md px-3 py-2">
                          <span>{shiftData.endDate ? format(shiftData.endDate, 'dd/MM/yyyy') : t('shifts.dialog.labels.selectDate')}</span>
                          <CalendarIcon className="h-4 w-4 text-gray-500" />
                        </div>
                      }
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Hours Worked */}
            {!isLeaveType(shiftData.shiftType) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t('shifts.dialog.labels.hoursWorked')}
                </Label>
                <Input
                  type="number"
                  value={shiftData.hoursWorked}
                  onChange={(e) => handleHoursChange(e.target.value)}
                  className="bg-white border-gray-200"
                />
                {hoursError && (
                  <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle className="h-4 w-4" />
                    <span>{hoursError}</span>
                  </div>
                )}
              </div>
            )}

            {/* Location */}
            {!isLeaveType(shiftData.shiftType) && (
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">
                  {t('shifts.dialog.labels.location')}
                </Label>
                <Input
                  type="text"
                  value={shiftData.location}
                  onChange={(e) => handleLocationChange(e.target.value)}
                  className="bg-white border-gray-200"
                  placeholder={t('shifts.dialog.labels.enterLocation')}
                />
              </div>
            )}

            {/* Worker Hours Info */}
            {shiftData.workerId && !isLeaveType(shiftData.shiftType) && (
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-4">
                <div className="flex items-start gap-3">
                  <Info className="h-5 w-5 text-indigo-500 mt-0.5" />
                  <div className="space-y-1">
                    <h4 className="font-medium text-indigo-900">
                      {t('shifts.dialog.labels.workerHoursInfo')}
                    </h4>
                    <div className="space-y-1 text-sm text-indigo-700">
                      {selectedWorkerHours.maxHours !== null && (
                        <>
                          <p>{t('shifts.dialog.labels.maxHours')}: {selectedWorkerHours.maxHours}</p>
                          <p>{t('shifts.dialog.labels.workedHours')}: {selectedWorkerHours.totalWorkedHours}</p>
                          <p>{t('shifts.dialog.labels.remainingHours')}: {selectedWorkerHours.remainingHours}</p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 border border-gray-300"
            >
              {t('common.cancel')}
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || !!hoursError}
              className={cn(
                "bg-gradient-to-r from-indigo-500 to-purple-500 text-white",
                "hover:from-indigo-600 hover:to-purple-600",
                "shadow-md hover:shadow-lg transition-all duration-200"
              )}
            >
              {isSubmitting ? t('common.saving') : t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
