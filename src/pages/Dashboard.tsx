import { useState, useMemo, useEffect } from 'react';
import { format, startOfWeek, addDays, isSameDay, getISOWeek, setISOWeek, getWeeksInYear, getWeek, startOfYear } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
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
import { X } from 'lucide-react';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { cn } from '@/lib/utils';
import { Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { DayWorkersDialog } from '@/components/DayWorkersDialog';
import { WorkerScheduleView } from '@/components/WorkerScheduleView';
import { useWorkerPeriodHours } from '@/hooks/useWorkerPeriodHours';
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const queryClient = useQueryClient();
  const { getWorkerPeriodMaxHours } = useWorkerPeriodHours();
  const [shiftDialogOpen, setShiftDialogOpen] = useState(false);
  const [shiftDetailsDialogOpen, setShiftDetailsDialogOpen] = useState(false);
  const [deleteConfirmationOpen, setDeleteConfirmationOpen] = useState(false);
  const [shiftToDelete, setShiftToDelete] = useState<number | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [dayWorkersDialogOpen, setDayWorkersDialogOpen] = useState(false);
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

  const { workers, isLoading } = useWorkers();
  const { shifts, addShift, deleteShift } = useShifts();

  const years = useMemo(() => {
    const startYear = 2010;
    const endYear = 2200;
    return Array.from({ length: endYear - startYear + 1 }, (_, i) => startYear + i);
  }, []);

  const periods = useMemo(() => getPeriods(selectedYear), [selectedYear]);
  const currentPeriodDates = periods[currentPeriodIndex];

  const weekDays = useMemo(() => {
    if (!selectedWeek) return [];

    const weekStart = startOfWeek(setISOWeek(new Date(currentYear, 0, 1), selectedWeek), { weekStartsOn: 1 });
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(weekStart, i);
      return {
        date,
        name: t(`days.${format(date, 'EEEE').toLowerCase()}`),
      };
    });
  }, [selectedWeek, currentYear, t]);

  const getShiftBackgroundColor = (shiftType: ShiftType) => {
    switch (shiftType) {
      case ShiftType.NORMAL_WORKDAY:
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case ShiftType.WEEKEND_DAY:
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case ShiftType.HOLIDAY:
        return 'bg-red-100 text-red-800 border-red-200';
      case ShiftType.SICK_LEAVE:
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case ShiftType.VACATION:
        return 'bg-green-100 text-green-800 border-green-200';
      case ShiftType.UNPAID_LEAVE:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setDayWorkersDialogOpen(true);
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

  const handleShiftSave = async (shift: Partial<Shift>) => {
    try {
      await addShift(shift);
      toast({
        title: "Success",
        description: "Shift added successfully",
        variant: "success",
      });
      setShiftDialogOpen(false);
    } catch (error) {
      console.error('Error saving shift:', error);
      toast({
        title: "Error",
        description: "Failed to add shift",
        variant: 'destructive'
      });
    }
  };

  const handleDeleteShift = async (shiftId: number) => {
    setShiftToDelete(shiftId);
    setDeleteConfirmationOpen(true);
    setShiftDetailsDialogOpen(false);
  };

  const handleConfirmDelete = async () => {
    if (shiftToDelete) {
      try {
        await deleteShift(shiftToDelete);
        toast({
          title: "Success",
          description: "Shift deleted successfully",
          variant: "success",
        });
      } catch (error) {
        console.error('Error deleting shift:', error);
        toast({
          title: "Error",
          description: "Failed to delete shift",
          variant: 'destructive'
        });
      }
    }
    setDeleteConfirmationOpen(false);
    setShiftToDelete(null);
  };

  useEffect(() => {
    const verifyAuth = async () => {
      const isAuth = await checkAuthStatus();
      if (!isAuth) {
        navigate('/login');
      }
    };
    verifyAuth();
  }, [checkAuthStatus, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            {t('dashboard.title')}
          </h1>
          <Button
            onClick={() => {
              setSelectedDate(new Date());
              setShiftDialogOpen(true);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            <Plus className="mr-2 h-5 w-5" />
            {t('shifts.add')}
          </Button>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('dashboard.calendar.title')}
            </h2>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label className="text-white">{t('dashboard.calendar.year')}</Label>
                <Select
                  value={selectedYear.toString()}
                  onValueChange={(value) => setSelectedYear(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {years.map((year) => (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <Label className="text-white">{t('dashboard.calendar.week')}</Label>
                <Select
                  value={selectedWeek.toString()}
                  onValueChange={(value) => setSelectedWeek(parseInt(value))}
                >
                  <SelectTrigger className="w-[100px] bg-white/10 border-white/20 text-white hover:bg-white/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="h-[200px] overflow-y-auto">
                    {Array.from({ length: 53 }, (_, i) => {
                      const weekNumber = i + 1;
                      return (
                        <SelectItem key={weekNumber} value={weekNumber.toString()}>
                          {t('dashboard.calendar.weekNumber', { week: weekNumber })}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="p-6">
            {isLoading ? (
              <div className="flex items-center justify-center h-48">
                <Spinner size="lg" className="text-indigo-500" />
              </div>
            ) : (
              <div className="space-y-4">
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
            )}
          </div>
        </div>

        {/* Worker Schedule View */}
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6">
            <h2 className="text-2xl font-semibold text-white mb-4">
              {t('dashboard.schedule.title')}
            </h2>
          </div>
          <div className="p-6">
            <WorkerScheduleView workers={workers} shifts={shifts} />
          </div>
        </div>

        {/* Dialogs */}
        <ShiftDialog
          open={shiftDialogOpen}
          onOpenChange={setShiftDialogOpen}
          onSave={handleShiftSave}
          shifts={shifts}
          workers={workers}
          selectedDate={selectedDate}
          currentPeriod={currentPeriodDates}
          getWorkerPeriodMaxHours={getWorkerPeriodMaxHours}
        />

        <ShiftDetailsDialog
          shift={selectedShift}
          open={shiftDetailsDialogOpen}
          onOpenChange={setShiftDetailsDialogOpen}
          onDelete={handleDeleteShift}
        />

        <DeleteConfirmationDialog
          open={deleteConfirmationOpen}
          onOpenChange={setDeleteConfirmationOpen}
          onConfirm={handleConfirmDelete}
          title={t('dashboard.shifts.deleteConfirmation.title')}
          description={t('dashboard.shifts.deleteConfirmation.description')}
        />

        {selectedDate && (
          <DayWorkersDialog
            open={dayWorkersDialogOpen}
            onOpenChange={setDayWorkersDialogOpen}
            selectedDate={selectedDate}
            shifts={shifts}
          />
        )}
      </div>
    </div>
  );
}
