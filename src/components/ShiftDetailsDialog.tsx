import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Shift } from '@/types/Shift';
import { format } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from 'react-i18next';

interface ShiftDetailsDialogProps {
  shift: Shift | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: (shiftId: number) => Promise<void>;
}

export function ShiftDetailsDialog({
  shift,
  open,
  onOpenChange,
  onDelete,
}: ShiftDetailsDialogProps) {
  const { t } = useTranslation();
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = React.useState(false);

  const handleDelete = async () => {
    if (!shift) return;
    
    setIsDeleting(true);
    try {
      await onDelete(shift.id);
      setShowDeleteConfirm(false);
      onOpenChange(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatShiftTime = (shift: Shift) => {
    const isWorkShift = ['NORMAL_WORKDAY', 'WEEKEND_DAY', 'HOLIDAY'].includes(shift.shiftType);
    if (isWorkShift) {
      return `${shift.hoursWorked} ${t('shifts.details.labels.hours')}`;
    } else {
      const startDate = new Date(shift.startTime);
      const endDate = new Date(shift.endTime);
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1; 
      return `${diffDays} ${diffDays === 1 ? t('shifts.details.labels.day') : t('shifts.details.labels.days')} (${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')})`;
    }
  };

  const formatShiftType = (shiftType: string) => {
    return shiftType.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  if (!shift) return null;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <DialogHeader className="text-white">
              <DialogTitle className="text-2xl font-bold">
                {t('shifts.details.title')}
              </DialogTitle>
              <DialogDescription className="text-indigo-100">
                {t('shifts.details.description')}
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="p-6 space-y-6">
            <div className="space-y-4">
              {/* Worker Info */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-medium text-gray-500">{t('shifts.details.labels.worker')}</h4>
                <p className="text-base font-medium text-gray-900">
                  {shift.worker?.firstName} {shift.worker?.lastName}
                </p>
              </div>

              {/* Shift Type */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-medium text-gray-500">{t('shifts.details.labels.shiftType')}</h4>
                <div className={cn(
                  "inline-flex items-center px-2.5 py-1 rounded-full text-sm font-medium",
                  "bg-indigo-50 text-indigo-700 border border-indigo-200"
                )}>
                  {t(`shifts.shiftTypes.${shift.shiftType}`)}
                </div>
              </div>

              {/* Duration */}
              <div className="space-y-1.5">
                <h4 className="text-sm font-medium text-gray-500">{t('shifts.details.labels.duration')}</h4>
                <p className="text-base text-gray-900">{formatShiftTime(shift)}</p>
              </div>

              {/* Location */}
              {shift.location && (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium text-gray-500">{t('shifts.details.labels.location')}</h4>
                  <p className="text-base text-gray-900">{shift.location}</p>
                </div>
              )}

              {/* Notes */}
              {shift.notes && (
                <div className="space-y-1.5">
                  <h4 className="text-sm font-medium text-gray-500">{t('shifts.details.labels.notes')}</h4>
                  <p className="text-base text-gray-900">{shift.notes}</p>
                </div>
              )}
            </div>
          </div>

          <DialogFooter className="p-6 pt-0">
            <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
              <AlertDialogTrigger asChild>
                <Button
                  variant="destructive"
                  disabled={isDeleting}
                  className={cn(
                    "bg-gradient-to-r from-red-500 to-red-600",
                    "hover:from-red-600 hover:to-red-700",
                    "text-white shadow-md hover:shadow-lg",
                    "transition-all duration-200"
                  )}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  {isDeleting ? t('shifts.details.delete.deleting') : t('shifts.details.delete.button')}
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent className="bg-gradient-to-br from-white to-red-50/30 border border-red-100">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-xl font-semibold text-gray-900">
                    {t('shifts.details.delete.title')}
                  </AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-500">
                    {t('shifts.details.delete.description')}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 border border-gray-300">
                    {t('shifts.details.delete.cancel')}
                  </AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className={cn(
                      "bg-gradient-to-r from-red-500 to-red-600",
                      "hover:from-red-600 hover:to-red-700",
                      "text-white shadow-md hover:shadow-lg",
                      "transition-all duration-200"
                    )}
                  >
                    {isDeleting ? t('shifts.details.delete.deleting') : t('shifts.details.delete.confirm')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
