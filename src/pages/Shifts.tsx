import { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, addDays, getISOWeek, getWeeksInYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from "../components/ui/button";
import { useToast } from '../components/ui/use-toast';
import { ShiftDialog } from "../components/ShiftDialog";
import { ShiftDetailsDialog } from "../components/ShiftDetailsDialog";
import { useWorkers } from '@/hooks/useWorkers';
import { useShifts } from '@/hooks/useShifts';
import { Shift, ShiftType } from '@/types/Shift';
import { getPeriods } from '@/lib/utils';
import CalendarDay from '@/components/calendar/CalendarDay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useQueryClient } from '@tanstack/react-query';
import { Label } from '@/components/ui/label';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { WorkerStatsTable } from '@/components/WorkerStatsTable';
import { useWorkerPeriodHours } from '@/hooks/useWorkerPeriodHours';
import { WorkerStatisticsTable } from '../components/WorkerStatisticsTable';
import { useTranslation } from 'react-i18next';
import { Spinner } from "@/components/ui/spinner";

export default function Shifts() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const queryClient = useQueryClient();
  const { shifts, isLoading: isLoadingShifts, deleteShift, addShift } = useShifts();
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [shiftDetailsDialogOpen, setShiftDetailsDialogOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const currentYear = new Date().getFullYear();
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const currentDate = new Date();
  const currentWeek = getISOWeek(currentDate);

  // Get current period index
  const allPeriods = useMemo(() => getPeriods(currentYear), [currentYear]);
  const initialPeriodIndex = useMemo(() => {
    return allPeriods.findIndex(period => 
      period.weeks.includes(currentWeek)
    );
  }, [allPeriods, currentWeek]);

  const [currentPeriodIndex, setCurrentPeriodIndex] = useState(Math.max(0, initialPeriodIndex));
  const [selectedWeek, setSelectedWeek] = useState<number>(currentWeek);

  const { workers, isLoading: isLoadingWorkers } = useWorkers();
  const { data: periodHours, isLoading: isLoadingPeriodHours } = useWorkerPeriodHours();

  const isLoading = isLoadingWorkers || isLoadingShifts || isLoadingPeriodHours;

  const { setWorkerPeriodHours, getWorkerPeriodMaxHours } = useWorkerPeriodHours();

  const years = useMemo(() => {
    const startYear = 2010;
    const endYear = 2200;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, []);

  const periods = useMemo(() => getPeriods(selectedYear), [selectedYear]);
  const currentPeriodDates = periods[currentPeriodIndex];

  const weekDays = useMemo(() => {
    if (!currentPeriodDates?.start || !selectedWeek) {
      return [];
    }
    
    // Find the start date of the selected week
    let currentDate = new Date(currentPeriodDates.start);
    while (getISOWeek(currentDate) !== selectedWeek) {
      currentDate = addDays(currentDate, 7);
    }
    
    // Get the start of the week (Monday)
    const startDate = startOfWeek(currentDate, { weekStartsOn: 1 });
    
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(startDate, i);
      return {
        date,
        name: format(date, 'EEEE')
      };
    });
  }, [currentPeriodDates, selectedWeek]);

  useEffect(() => {
    const verifyAuth = async () => {
      const isValid = await checkAuthStatus();
      if (!isValid) {
        toast({
          title: 'Authentication Required',
          description: 'Please log in to access this page',
          variant: 'destructive',
        });
        navigate('/login');
      }
    };
    verifyAuth();
  }, [checkAuthStatus, navigate, toast]);

  const handleYearChange = (year: string) => {
    const newYear = parseInt(year);
    setSelectedYear(newYear);
    setCurrentPeriodIndex(0);
    const newPeriods = getPeriods(newYear);
    if (newPeriods.length > 0) {
      setSelectedWeek(newPeriods[0].weeks[0]);
    }
  };

  const handlePeriodChange = (periodIndex: string) => {
    const index = parseInt(periodIndex);
    setCurrentPeriodIndex(index);
    if (periods[index]) {
      setSelectedWeek(periods[index].weeks[0]);
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setShiftDetailsDialogOpen(true);
  };

  const handleAddClick = (date: Date) => {
    setSelectedDate(date);
    setShiftDialogOpen(true);
  };

  const handleShiftClick = (e: React.MouseEvent, shift: Shift) => {
    e.stopPropagation();
    setSelectedShift(shift);
    setShiftDetailsDialogOpen(true);
  };

  const formatToLocalMidnight = (date: Date) => {
    if (!date) return new Date();
    const newDate = new Date(date);
    newDate.setHours(0, 0, 0, 0);
    return newDate;
  };

  const handleShiftSave = async (shiftData: any) => {
    try {
      const { startDate, endDate, ...rest } = shiftData;
      
      // For leave types, set end time to end of day
      const isLeaveShift = [ShiftType.VACATION, ShiftType.SICK_LEAVE, ShiftType.UNPAID_LEAVE].includes(rest.shiftType);
      
      const formattedData = {
        ...rest,
        startTime: startDate ? formatToLocalMidnight(startDate).toISOString() : new Date().toISOString(),
        endTime: isLeaveShift && endDate
          ? new Date(new Date(endDate).setHours(23, 59, 59, 999)).toISOString()
          : startDate 
            ? formatToLocalMidnight(startDate).toISOString()
            : new Date().toISOString()
      };

      await addShift(formattedData);
      
      toast({
        title: "Success",
        description: "Successfully added shift!",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error saving shift:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while adding the shift. Please try again.",
      });
      throw error;
    }
  };

  const handleShiftDelete = async () => {
    if (!shiftToDelete) return;

    try {
      await deleteShift(shiftToDelete);
      setDeleteConfirmationOpen(false);
      setShiftToDelete(null);
      setShiftDetailsDialogOpen(false);
      toast({
        title: "Success",
        description: "Successfully deleted shift!",
        variant: "success",
      });
    } catch (error: any) {
      console.error('Error deleting shift:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "An error occurred while deleting the shift. Please try again.",
      });
    }
  };

  const YearSelect = () => (
    <div>
      <Label className="text-sm font-medium text-gray-700">{t('shifts.year')}</Label>
      <Select
        value={selectedYear.toString()}
        onValueChange={(value) => {
          setSelectedYear(parseInt(value));
          setCurrentPeriodIndex(0);
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-scroll scrollbar scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {years.map((year) => (
            <SelectItem
              key={year}
              value={year.toString()}
              className={cn(
                "cursor-pointer transition-colors",
                year === currentYear && "font-medium"
              )}
            >
              {year}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <Spinner size="lg" className="text-indigo-500" />
        </div>
      ) : (
        <div className="container mx-auto p-6 space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Shifts Management
              </h1>
              <p className="text-gray-600 mt-2">
                Schedule and manage worker shifts efficiently
              </p>
            </div>
            <div>
              <Button
                onClick={() => setShiftDialogOpen(true)}
                className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Shift
              </Button>
            </div>
          </div>

          <div className="grid gap-4">
            {/* Calendar Controls */}
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
                  <div>
                    <Label className="text-white mb-2 block">{t('shifts.year')}</Label>
                    <Select
                      value={selectedYear.toString()}
                      onValueChange={(value) => {
                        setSelectedYear(parseInt(value));
                        setCurrentPeriodIndex(0);
                      }}
                    >
                      <SelectTrigger className="w-[120px] bg-white/10 border-white/20 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px] overflow-y-scroll bg-white">
                        {years.map((year) => (
                          <SelectItem
                            key={year}
                            value={year.toString()}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-indigo-50",
                              year === currentYear && "bg-indigo-50 font-medium"
                            )}
                          >
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white mb-2 block">{t('shifts.period')}</Label>
                    <Select
                      value={currentPeriodIndex.toString()}
                      onValueChange={(value) => {
                        const index = parseInt(value);
                        setCurrentPeriodIndex(index);
                        const periodWeeks = periods[index].weeks;
                        setSelectedWeek(periodWeeks[0]);
                      }}
                    >
                      <SelectTrigger className="w-[300px] bg-white/10 border-white/20 text-white">
                        <SelectValue>
                          {currentPeriodDates ? (
                            <span>
                              {format(new Date(currentPeriodDates.start), 'dd/MM/yyyy')} - {format(new Date(currentPeriodDates.end), 'dd/MM/yyyy')}
                            </span>
                          ) : (
                            t('shifts.selectPeriod')
                          )}
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {periods.map((period, index) => (
                          <SelectItem
                            key={index}
                            value={index.toString()}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-indigo-50",
                              index === initialPeriodIndex && "bg-indigo-50 font-medium"
                            )}
                          >
                            {format(new Date(period.start), 'dd/MM/yyyy')} - {format(new Date(period.end), 'dd/MM/yyyy')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-white mb-2 block">{t('shifts.periods.week')}</Label>
                    <Select
                      value={selectedWeek.toString()}
                      onValueChange={(value) => setSelectedWeek(parseInt(value))}
                    >
                      <SelectTrigger className="w-[180px] bg-white/10 border-white/20 text-white">
                        <SelectValue placeholder={t('shifts.periods.selectWeek')} />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {currentPeriodDates?.weeks.map((week) => (
                          <SelectItem 
                            key={week} 
                            value={week.toString()}
                            className={cn(
                              "cursor-pointer transition-colors hover:bg-indigo-50",
                              week === currentWeek && "bg-indigo-50 font-medium"
                            )}
                          >
                            {t('shifts.periods.week')} {week}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="p-6">
                <div className="grid grid-cols-7 gap-4">
                  {weekDays.map(({ date, name }) => (
                    <CalendarDay
                      key={date.toISOString()}
                      date={date}
                      day={format(date, 'EEEE').toLowerCase()}
                      name={name}
                      shifts={shifts?.filter(shift => {
                        const shiftStart = new Date(shift.startTime);
                        const shiftEnd = new Date(shift.endTime);
                        const currentDate = new Date(date);
                        
                        currentDate.setHours(0, 0, 0, 0);
                        const startDate = new Date(shiftStart);
                        startDate.setHours(0, 0, 0, 0);
                        const endDate = new Date(shiftEnd);
                        endDate.setHours(0, 0, 0, 0);

                        if ([ShiftType.VACATION, ShiftType.SICK_LEAVE, ShiftType.UNPAID_LEAVE].includes(shift.shiftType)) {
                          return currentDate >= startDate && currentDate <= endDate;
                        }
                        
                        return currentDate.getTime() === startDate.getTime();
                      }) || []}
                      onDayClick={handleDayClick}
                      onAddClick={handleAddClick}
                      onShiftClick={handleShiftClick}
                      onDeleteClick={(e, shiftId) => {
                        e.stopPropagation();
                        setShiftToDelete(shiftId);
                        setDeleteConfirmationOpen(true);
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Worker Statistics */}
            <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <h2 className="text-2xl font-bold text-white">
                  Worker Statistics
                </h2>
              </div>
              <div className="p-6">
                <WorkerStatisticsTable
                  workers={workers || []}
                  shifts={shifts || []}
                  currentPeriodDates={{
                    start: currentPeriodDates?.start || '',
                    end: currentPeriodDates?.end || ''
                  }}
                  onSetMaxHours={setWorkerPeriodHours}
                  getWorkerPeriodMaxHours={getWorkerPeriodMaxHours}
                  isLoading={isLoading}
                  onSaveShift={handleShiftSave}
                />
              </div>
            </div>

            {selectedDate && (
              <ShiftDialog
                open={shiftDialogOpen}
                onOpenChange={setShiftDialogOpen}
                selectedDate={selectedDate}
                onSave={handleShiftSave}
                workers={workers || []}
                shifts={shifts || []}
                currentPeriod={{
                  start: currentPeriodDates?.start || '',
                  end: currentPeriodDates?.end || ''
                }}
                getWorkerPeriodMaxHours={getWorkerPeriodMaxHours}
              />
            )}

            {selectedShift && (
              <ShiftDetailsDialog
                open={shiftDetailsDialogOpen}
                onOpenChange={setShiftDetailsDialogOpen}
                shift={selectedShift}
                onDelete={() => {
                  setShiftToDelete(selectedShift.id);
                  setDeleteConfirmationOpen(true);
                }}
                isLoading={isLoading}
              />
            )}

            <DeleteConfirmationDialog
              open={deleteConfirmationOpen}
              onOpenChange={setDeleteConfirmationOpen}
              onConfirm={handleShiftDelete}
              title="Delete Shift"
              description="Are you sure you want to delete this shift? This action cannot be undone."
            />
          </div>
        </div>
      )}
    </div>
  );
}
