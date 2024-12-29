import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { WorkerPeriodHours } from './WorkerPeriodHours';
import { ShiftType } from '@/types/Shift';
import { cn } from '@/lib/utils';
import { AlertTriangle, Clock, User2, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { WorkerDetailsPopover } from './WorkerDetailsPopover';
import { differenceInBusinessDays } from 'date-fns';
import { TableSkeleton } from "@/components/TableSkeleton";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format } from 'date-fns';
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
import { ShiftDialog } from './ShiftDialog';
import { useWorkerPeriodHours } from '@/hooks/useWorkerPeriodHours';
import { toast } from '@/lib/toast';

interface WorkerStatisticsTableProps {
  workers: Worker[];
  shifts: Shift[];
  currentPeriodDates: {
    start: string;
    end: string;
  };
  onSetMaxHours: (data: { workerId: number; maxHours: number; periodStart: string; periodEnd: string }) => Promise<void>;
  getWorkerPeriodMaxHours: (workerId: number, periodStart: string, periodEnd: string) => Promise<number | undefined>;
  isLoading: boolean;
  onSaveShift: (data: any) => Promise<void>;
}

export function WorkerStatisticsTable({ 
  workers, 
  shifts, 
  currentPeriodDates, 
  onSetMaxHours,
  getWorkerPeriodMaxHours,
  isLoading,
  onSaveShift,
}: WorkerStatisticsTableProps) {
  const { t } = useTranslation();
  const [periodHoursDialogOpen, setPeriodHoursDialogOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [periodHours, setPeriodHours] = useState<{ [key: string]: number }>({});

  // Load period hours for all workers
  useEffect(() => {
    const loadPeriodHours = async () => {
      if (!workers || workers.length === 0 || !currentPeriodDates.start || !currentPeriodDates.end) return;

      const hours: { [key: string]: number } = {};
      for (const worker of workers) {
        try {
          const maxHours = await getWorkerPeriodMaxHours(
            worker.id,
            currentPeriodDates.start,
            currentPeriodDates.end
          );
          if (maxHours !== undefined) {
            hours[worker.id] = maxHours;
          }
        } catch (error) {
          console.error(`Error loading period hours for worker ${worker.id}:`, error);
        }
      }
      setPeriodHours(hours);
    };

    loadPeriodHours();
  }, [workers, currentPeriodDates, getWorkerPeriodMaxHours]);

  // Handle setting max hours
  const handleSetMaxHours = async (data: { workerId: number; maxHours: number; periodStart: string; periodEnd: string }) => {
    if (selectedWorkerId) {
      await onSetMaxHours({
        workerId: selectedWorkerId,
        maxHours: data.maxHours,
        periodStart: currentPeriodDates.start,
        periodEnd: currentPeriodDates.end
      });
      
      // Update local state after successful save
      setPeriodHours(prev => ({
        ...prev,
        [selectedWorkerId]: data.maxHours
      }));
    }
    setPeriodHoursDialogOpen(false);
  };

  const getWorkerStats = (workerId: number) => {
    const workerShifts = shifts.filter(shift => {
      const shiftStart = new Date(shift.startTime);
      const shiftEnd = new Date(shift.endTime);
      const periodStart = new Date(currentPeriodDates.start);
      const periodEnd = new Date(currentPeriodDates.end);
      return shift.worker?.id === workerId && 
             shiftStart >= periodStart && 
             shiftEnd <= periodEnd;
    });

    const normalDays = workerShifts.filter(s => s.shiftType === ShiftType.NORMAL_WORKDAY).length;
    const weekendDays = workerShifts.filter(s => s.shiftType === ShiftType.WEEKEND_DAY).length;
    const holidays = workerShifts.filter(s => s.shiftType === ShiftType.HOLIDAY).length;
    const sickLeaveDays = workerShifts.filter(s => s.shiftType === ShiftType.SICK_LEAVE).length;
    const vacationDays = workerShifts.filter(s => s.shiftType === ShiftType.VACATION).length;
    const unpaidLeaveDays = workerShifts.filter(s => s.shiftType === ShiftType.UNPAID_LEAVE).length;

    const normalHours = workerShifts
      .filter(s => s.shiftType === ShiftType.NORMAL_WORKDAY)
      .reduce((sum, s) => sum + s.hoursWorked, 0);

    const weekendHours = workerShifts
      .filter(s => s.shiftType === ShiftType.WEEKEND_DAY)
      .reduce((sum, s) => sum + s.hoursWorked, 0);

    const holidayHours = workerShifts
      .filter(s => s.shiftType === ShiftType.HOLIDAY)
      .reduce((sum, s) => sum + s.hoursWorked, 0);

    const totalWorkDays = normalDays + weekendDays + holidays;
    const totalWorkHours = normalHours + weekendHours + holidayHours;
    const maxHours = periodHours[workerId] || 0;
    
    // Calculate adjusted max hours based on leave days
    const totalLeaveDays = sickLeaveDays + vacationDays + unpaidLeaveDays;
    const workDaysInPeriod = maxHours / 8; // Assuming 8 hours per work day
    const adjustedMaxHours = maxHours * ((workDaysInPeriod - totalLeaveDays) / workDaysInPeriod);
    
    const completionRate = adjustedMaxHours > 0 
      ? ((totalWorkHours / adjustedMaxHours) * 100).toFixed(1)
      : '0';

    return {
      totalShifts: workerShifts.length,
      normalDays,
      weekendDays,
      holidays,
      sickLeaveDays,
      vacationDays,
      unpaidLeaveDays,
      normalHours,
      weekendHours,
      holidayHours,
      totalWorkHours,
      completionRate
    };
  };

  const getShiftsByType = (workerId: number, type: ShiftType = ShiftType.NORMAL_WORKDAY) => {
    return shifts
      .filter(s => {
        const shiftStart = new Date(s.startTime);
        const shiftEnd = new Date(s.endTime);
        const periodStart = new Date(currentPeriodDates.start);
        const periodEnd = new Date(currentPeriodDates.end);
        
        return s.worker?.id === workerId && 
               s.shiftType === type &&
               shiftStart >= periodStart && 
               shiftEnd <= periodEnd;
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  };

  const ShiftList = ({ shifts }: { shifts: Shift[] }) => (
    <div className="space-y-2">
      {shifts.map(shift => (
        <div 
          key={shift.id} 
          className="flex justify-between items-center text-sm py-1.5 px-2 rounded-md hover:bg-gray-50 transition-colors cursor-default"
        >
          <span className="text-gray-700 font-medium">
            {format(new Date(shift.startTime), 'EEE, dd MMM yyyy')}
          </span>
          <Badge variant="secondary" className="font-mono bg-blue-50 text-blue-700 hover:bg-blue-100">
            {shift.hoursWorked.toFixed(1)}h
          </Badge>
        </div>
      ))}
      {shifts.length === 0 && (
        <div className="text-sm text-gray-500 italic text-center py-2">
          No shifts found
        </div>
      )}
    </div>
  );

  const handleSetHoursClick = (workerId: number) => {
    setSelectedWorkerId(workerId);
    setPeriodHoursDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">
          {format(new Date(currentPeriodDates.start), 'MMMM d')} - {format(new Date(currentPeriodDates.end), 'MMMM d, yyyy')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <TableSkeleton columns={7} rows={5} />
        ) : (
          <div>
            {(() => {
              const workersOverLimit = workers
                .map(worker => {
                  const stats = getWorkerStats(worker.id);
                  const maxHours = periodHours[worker.id] || 0;
                  const remainingHours = maxHours - stats.totalWorkHours;
                  return {
                    worker,
                    remainingHours,
                    totalHours: stats.totalWorkHours,
                    maxHours
                  };
                })
                .filter(({ remainingHours }) => remainingHours < 0);

              if (workersOverLimit.length > 0) {
                return (
                  <div className="mx-4 mt-4">
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                      <div className="flex gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-red-800">
                            {workersOverLimit.length} {workersOverLimit.length === 1 ? 'worker has' : 'workers have'} exceeded their period hours
                          </h3>
                          <div className="mt-1 text-sm text-red-700">
                            <ul className="list-disc pl-5 space-y-1">
                              {workersOverLimit.map(({ worker, remainingHours, totalHours, maxHours }) => (
                                <li key={worker.id}>
                                  {worker.firstName} {worker.lastName}: {totalHours.toFixed(1)}h / {maxHours}h
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              }
              return null;
            })()}

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/60">
                    <TableHead>Worker</TableHead>
                    <TableHead className="text-right">Period</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Remaining</TableHead>
                    <TableHead className="text-right">Progress</TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Days</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {workers.map(worker => {
                    const stats = getWorkerStats(worker.id);
                    const maxHours = periodHours[worker.id] || 0;
                    const remainingHours = maxHours - stats.totalWorkHours;
                    const completionRate = stats.completionRate;

                    return (
                      <TableRow key={worker.id} className="hover:bg-gray-50/60 transition-colors">
                        <TableCell>
                          <WorkerDetailsPopover
                            worker={worker}
                            shifts={shifts}
                            periodStart={currentPeriodDates.start}
                            periodEnd={currentPeriodDates.end}
                            periodHours={periodHours[worker.id] || 0}
                          >
                            <button className="group flex items-center gap-2 hover:bg-blue-50 px-2 py-1 rounded-md transition-all">
                              <User2 className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors" />
                              <span className="text-left font-medium text-gray-600 group-hover:text-blue-600 transition-colors">
                                {worker.firstName} {worker.lastName}
                              </span>
                            </button>
                          </WorkerDetailsPopover>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={maxHours === 0 ? "destructive" : "secondary"}
                            className={cn(
                              "font-mono",
                              maxHours > 0 ? "bg-blue-50 text-blue-700 hover:bg-blue-100" : ""
                            )}
                          >
                            {maxHours > 0 ? maxHours : '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {stats.totalWorkHours.toFixed(1)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge 
                            variant={remainingHours < 0 ? "destructive" : remainingHours > 10 ? "default" : "warning"}
                            className={cn(
                              "font-mono",
                              remainingHours >= 0 ? "bg-green-50 text-green-700 hover:bg-green-100" : "bg-red-50 text-red-700 hover:bg-red-100"
                            )}
                          >
                            {remainingHours !== null ? remainingHours.toFixed(1) : '-'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Progress 
                              value={parseFloat(completionRate)} 
                              className="w-16 h-2"
                              indicatorClassName={cn(
                                parseFloat(completionRate) >= 100 ? "bg-green-500" :
                                parseFloat(completionRate) >= 75 ? "bg-blue-500" :
                                parseFloat(completionRate) >= 50 ? "bg-yellow-500" :
                                "bg-red-500"
                              )}
                            />
                            <span className="text-sm font-mono w-12">{completionRate}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-4">
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <div className="inline-flex items-center gap-1 cursor-help hover:text-blue-600 transition-colors">
                                  <span className="font-mono">{stats.normalDays + stats.weekendDays + stats.holidays}</span>
                                  <span className="text-xs text-gray-500">total</span>
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-52" align="end">
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Normal</span>
                                    <span className="font-mono text-sm">{stats.normalDays}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Weekend</span>
                                    <span className="font-mono text-sm">{stats.weekendDays}</span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600">Holiday</span>
                                    <span className="font-mono text-sm">{stats.holidays}</span>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                         
                          </div>
                        </TableCell>
                        <TableCell className="text-center">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleSetHoursClick(worker.id)}
                            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          >
                            Set Hours
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {periodHoursDialogOpen && selectedWorkerId && (
          <WorkerPeriodHours
            open={periodHoursDialogOpen}
            onOpenChange={setPeriodHoursDialogOpen}
            worker={workers.find(w => w.id === selectedWorkerId)!}
            currentPeriod={currentPeriodDates}
            onSave={handleSetMaxHours}
            shifts={shifts}
            initialMaxHours={periodHours[selectedWorkerId] || 0}
          />
        )}
        {shiftDialogOpen && (
          <ShiftDialog
            open={shiftDialogOpen}
            onOpenChange={setShiftDialogOpen}
            onSave={onSaveShift}
            shifts={shifts}
            workers={workers}
            selectedDate={new Date()}
            currentPeriod={currentPeriodDates}
            getWorkerPeriodMaxHours={getWorkerPeriodMaxHours}
          />
        )}
      </CardContent>
    </Card>
  );
}
