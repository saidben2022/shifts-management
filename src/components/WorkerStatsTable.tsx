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
import { Spinner } from "@/components/ui/spinner";
import { WorkerDialog } from './WorkerDialog';
import { WorkerPeriodHours } from './WorkerPeriodHours';
import { WorkerStatsHoverCard } from './WorkerStatsHoverCard';
import { ShiftType } from '@/types/Shift';
import { cn } from '@/lib/utils';
import { AlertTriangle } from 'lucide-react';
import { Clock } from 'lucide-react';
import { WorkerStatusCards } from './WorkerStatusCards';
import { useTranslation } from 'react-i18next';
import { Settings } from 'lucide-react';

interface WorkerStatsTableProps {
  workers: Worker[];
  shifts: Shift[];
  currentPeriodDates: {
    start: string;
    end: string;
  };
  onSetMaxHours: (data: { workerId: number; maxHours: number; periodStart: string; periodEnd: string }) => Promise<void>;
  getWorkerPeriodMaxHours: (workerId: number, periodStart: string, periodEnd: string) => Promise<number | undefined>;
  showStatusCards?: boolean;
}

export function WorkerStatsTable({ 
  workers, 
  shifts, 
  currentPeriodDates, 
  onSetMaxHours,
  getWorkerPeriodMaxHours,
  showStatusCards = true
}: WorkerStatsTableProps) {
  const { t } = useTranslation();
  const [workerDialogOpen, setWorkerDialogOpen] = useState(false);
  const [periodHoursDialogOpen, setPeriodHoursDialogOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);
  const [periodHours, setPeriodHours] = useState<{ [key: string]: number }>({});
  
  useEffect(() => {
    const loadPeriodHours = async () => {
      const hours: { [key: string]: number } = {};
      for (const worker of workers) {
        try {
          console.log('Fetching hours for worker:', worker.id);
          const maxHours = await getWorkerPeriodMaxHours(
            worker.id, 
            currentPeriodDates.start,
            currentPeriodDates.end
          );
          console.log('Received maxHours:', maxHours);
          hours[worker.id] = maxHours;
        } catch (error) {
          console.error('Error fetching hours for worker:', worker.id, error);
        }
      }
      console.log('Setting period hours:', hours);
      setPeriodHours(hours);
    };

    loadPeriodHours();
  }, [workers, currentPeriodDates.start, currentPeriodDates.end, getWorkerPeriodMaxHours]);

  const getWorkerStats = (workerId: number) => {
    // Filter shifts for the current worker and period
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
    const sickLeave = workerShifts.filter(s => s.shiftType === ShiftType.SICK_LEAVE).length;
    const vacation = workerShifts.filter(s => s.shiftType === ShiftType.VACATION).length;
    const unpaidLeave = workerShifts.filter(s => s.shiftType === ShiftType.UNPAID_LEAVE).length;

    const normalHours = workerShifts
      .filter(s => s.shiftType === ShiftType.NORMAL_WORKDAY)
      .reduce((sum, s) => sum + s.hoursWorked, 0);

    const weekendHours = workerShifts
      .filter(s => s.shiftType === ShiftType.WEEKEND_DAY)
      .reduce((sum, s) => sum + s.hoursWorked, 0);

    const holidayHours = workerShifts
      .filter(s => s.shiftType === ShiftType.HOLIDAY)
      .reduce((sum, s) => sum + s.hoursWorked, 0);

    return {
      totalShifts: workerShifts.length,
      normalDays,
      weekendDays,
      holidays,
      sickLeave,
      vacation,
      unpaidLeave,
      normalHours,
      weekendHours,
      holidayHours,
      totalWorkHours: normalHours + weekendHours + holidayHours
    };
  };

  const handleSetHoursClick = (workerId: number) => {
    setSelectedWorkerId(workerId);
    setPeriodHoursDialogOpen(true);
  };

  const handleSaveHours = async (data: { maxHours: number }) => {
    if (selectedWorkerId) {
      await onSetMaxHours({
        workerId: selectedWorkerId,
        maxHours: data.maxHours,
        periodStart: currentPeriodDates.start,
        periodEnd: currentPeriodDates.end
      });
      
      // Update local state
      setPeriodHours(prev => ({
        ...prev,
        [selectedWorkerId]: data.maxHours
      }));
    }
    setPeriodHoursDialogOpen(false);
  };

  return (
    <>
      {showStatusCards && (
        <WorkerStatusCards 
          workers={workers}
          shifts={shifts}
          periodHours={periodHours}
          currentPeriodDates={currentPeriodDates}
        />
      )}
      
      {/* <Card className="mt-4">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>{t('workers.statistics.title')}</CardTitle>
          </div>
        </CardHeader>
        <CardContent> */}
          {/* {(() => {
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
                <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <AlertTriangle className="h-5 w-5 text-red-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-800">
                        {t('workers.statistics.warnings.exceededHours')}
                      </h3>
                      <div className="mt-2 text-sm text-red-700">
                        <ul className="list-disc pl-5 space-y-1">
                          {workersOverLimit.map(({ worker, remainingHours, totalHours, maxHours }) => (
                            <li key={worker.id}>
                              {t('workers.statistics.warnings.workerExceeded', {
                                name: `${worker.firstName} ${worker.lastName}`,
                                total: totalHours.toFixed(1),
                                max: maxHours,
                                exceeded: Math.abs(remainingHours).toFixed(1)
                              })}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
            return null;
          })()} */}
{/* 
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t('workers.fields.name')}</TableHead>
                <TableHead className="text-right">{t('workers.statistics.periodHours')}</TableHead>
                <TableHead className="text-right">{t('workers.statistics.totalHours')}</TableHead>
                <TableHead className="text-right">{t('workers.statistics.remainingHours')}</TableHead>
                <TableHead className="text-right">{t('workers.statistics.normalWorkdays')}</TableHead>
                <TableHead className="text-right">{t('workers.statistics.weekendDays')}</TableHead>
                <TableHead className="text-right">{t('workers.statistics.holidays')}</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map(worker => {
                const stats = getWorkerStats(worker.id);
                const maxHours = periodHours[worker.id] || 0;
                const remainingHours = maxHours - stats.totalWorkHours;

                return (
                  <TableRow key={worker.id}>
                    <TableCell>
                      <WorkerStatsHoverCard
                        worker={worker}
                        shifts={shifts}
                        periodStart={currentPeriodDates.start}
                        periodEnd={currentPeriodDates.end}
                        periodHours={periodHours[worker.id] || 0}
                      >
                        <button className="hover:text-blue-600 transition-colors">
                          {worker.firstName} {worker.lastName}
                        </button>
                      </WorkerStatsHoverCard>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cn(
                          maxHours === 0 && "text-red-500"
                        )}>
                          {maxHours > 0 ? maxHours : t('workers.status.notSet')}
                        </span>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleSetHoursClick(worker.id)}
                          className="flex items-center gap-2"
                        >
                          <Clock className="h-4 w-4" />
                          <span>{t('workers.statistics.setHours')}</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{stats.totalWorkHours.toFixed(1)}</TableCell>
                    <TableCell className="text-right">
                      {remainingHours !== null ? remainingHours.toFixed(1) : '-'}
                    </TableCell>
                    <TableCell className="text-right">{stats.normalDays}</TableCell>
                    <TableCell className="text-right">{stats.weekendDays}</TableCell>
                    <TableCell className="text-right">{stats.holidays}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table> */}
        {/* </CardContent>
      </Card> */}
      <WorkerDialog 
        open={workerDialogOpen} 
        onOpenChange={setWorkerDialogOpen}
      />
      {periodHoursDialogOpen && selectedWorkerId && (
        <WorkerPeriodHours
          open={periodHoursDialogOpen}
          onOpenChange={setPeriodHoursDialogOpen}
          worker={workers.find(w => w.id === selectedWorkerId) || null}
          currentPeriod={currentPeriodDates}
          onSave={handleSaveHours}
          shifts={shifts}
          initialMaxHours={periodHours[selectedWorkerId]}
        />
      )}
    </>
  );
}
