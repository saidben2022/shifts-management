import { useState, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "./ui/use-toast";
import { Worker } from '@/types/Worker';
import { AlertTriangle } from "lucide-react";
import { ShiftType } from '@/types/Shift';
import { useTranslation } from "react-i18next";
import { format } from 'date-fns';

interface WorkerPeriodHoursProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  worker: Worker;
  currentPeriod: { start: string; end: string };
  onSave: (data: { workerId: number; maxHours: number; periodStart: string; periodEnd: string }) => Promise<void>;
  shifts: Array<{ hoursWorked: number; shiftType: ShiftType; startTime: string; endTime: string; worker?: { id: number } }>;
  initialMaxHours?: number;
}

export function WorkerPeriodHours({ 
  open, 
  onOpenChange, 
  worker, 
  currentPeriod, 
  onSave,
  shifts,
  initialMaxHours 
}: WorkerPeriodHoursProps) {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [maxHours, setMaxHours] = useState(initialMaxHours ? initialMaxHours.toString() : '');
  const [currentWorkedHours, setCurrentWorkedHours] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [excessHours, setExcessHours] = useState(0);

  // Calculate total worked hours for the worker in the current period
  useEffect(() => {
    console.log('Calculating worked hours:', {
      workerId: worker.id,
      periodStart: currentPeriod.start,
      periodEnd: currentPeriod.end,
      totalShifts: shifts.length
    });

    // Set start and end dates with precise boundaries
    const periodStart = new Date(currentPeriod.start);
    periodStart.setHours(0, 0, 0, 0);
    
    const periodEnd = new Date(currentPeriod.end);
    periodEnd.setHours(23, 59, 59, 999);

    const workerShifts = shifts.filter(s => {
      const shiftStart = new Date(s.startTime);
      const shiftEnd = new Date(s.endTime);
      
      return s.worker?.id === worker.id &&
        (s.shiftType === ShiftType.NORMAL_WORKDAY || 
         s.shiftType === ShiftType.WEEKEND_DAY || 
         s.shiftType === ShiftType.HOLIDAY) &&
        shiftStart >= periodStart &&
        shiftEnd <= periodEnd;
    });
    
    console.log('Filtered worker shifts:', {
      totalWorkerShifts: workerShifts.length,
      shifts: workerShifts.map(s => ({
        startTime: s.startTime,
        endTime: s.endTime,
        hours: s.hoursWorked
      }))
    });
    
    const totalHours = workerShifts.reduce((sum, shift) => sum + shift.hoursWorked, 0);
    console.log('Setting currentWorkedHours:', totalHours);
    setCurrentWorkedHours(totalHours);
  }, [worker.id, currentPeriod, shifts]);

  // Single effect to handle warning state updates
  useEffect(() => {
    console.log('Updating warning state:', {
      maxHours,
      currentWorkedHours,
      parsedMaxHours: parseFloat(maxHours)
    });

    const newMaxHours = parseFloat(maxHours);
    if (!isNaN(newMaxHours)) {
      const excess = Math.max(0, currentWorkedHours - newMaxHours);
      console.log('Warning calculation:', {
        newMaxHours,
        currentWorkedHours,
        excess,
        shouldShowWarning: newMaxHours < currentWorkedHours
      });
      setExcessHours(excess);
      setShowWarning(newMaxHours < currentWorkedHours);
    } else {
      console.log('Invalid maxHours value, resetting warning state');
      setExcessHours(0);
      setShowWarning(false);
    }
  }, [maxHours, currentWorkedHours]);

  // Initialize maxHours when dialog opens
  useEffect(() => {
    if (initialMaxHours !== undefined) {
      setMaxHours(initialMaxHours.toString());
    }
  }, [initialMaxHours, open]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newMaxHours = parseFloat(formData.get("maxHours") as string);
    if (!newMaxHours) return;

    try {
      await onSave({
        workerId: worker.id,
        maxHours: newMaxHours,
        periodStart: currentPeriod.start,
        periodEnd: currentPeriod.end
      });
      toast({
        title: "Success",
        description: "Successfully updated maximum hours!",
        variant: "success",
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while updating maximum hours. Please try again.",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
          <DialogHeader className="text-white">
            <DialogTitle className="text-lg font-semibold">
              {t('workers.periodHours.title', { 
                name: `${worker.firstName} ${worker.lastName}` 
              })}
            </DialogTitle>
            <DialogDescription className="text-sm text-white-500">
              {format(new Date(currentPeriod.start), 'MMMM d')} - {format(new Date(currentPeriod.end), 'MMMM d, yyyy')}
            </DialogDescription>
          </DialogHeader>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="maxHours">{t('workers.periodHours.hoursLabel')}</Label>
              <Input
                id="maxHours"
                name="maxHours"
                type="number"
                defaultValue={maxHours}
                onChange={(e) => setMaxHours(e.target.value)}
                step="0.5"
                min="0"
                className="w-full border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            {showWarning && (
              <div className="flex items-start gap-3 rounded-lg border border-yellow-300 bg-yellow-50/50 p-4">
                <AlertTriangle className="h-5 w-5 mt-0.5 text-yellow-600 flex-shrink-0" />
                <div className="space-y-1 flex-1">
                  <p className="text-sm font-medium leading-none text-yellow-800">
                    {t('shifts.periodHours.warningTitle')}
                  </p>
                  <p className="text-sm text-yellow-700 leading-relaxed">
                    {t('shifts.periodHours.currentWorkedHours')}: <span className="font-medium">{currentWorkedHours.toFixed(1)}</span>
                    {excessHours > 0 && (
                      <>
                        <br />
                        {t('shifts.periodHours.excessHours')}: <span className="font-medium text-yellow-800">{excessHours.toFixed(1)}</span>
                      </>
                    )}
                  </p>
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
              className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white"
            >
              {t('common.save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
