import React from 'react';
import {
  Dialog as AlertDialog,
  DialogContent as AlertDialogContent,
  DialogDescription as AlertDialogDescription,
  DialogFooter as AlertDialogFooter,
  DialogHeader as AlertDialogHeader,
  DialogTitle as AlertDialogTitle,
  DialogCancel as AlertDialogCancel,
  DialogAction as AlertDialogAction,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTranslation } from 'react-i18next';

interface DeleteConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function DeleteConfirmationDialog({
  open,
  onOpenChange,
  onConfirm,
  isDeleting
}: DeleteConfirmationDialogProps) {
  const { t } = useTranslation();

  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{t('dialog.deleteConfirmation.title')}</AlertDialogTitle>
          <AlertDialogDescription>{t('dialog.deleteConfirmation.message')}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex justify-end space-x-2">
          <Button
            className="px-4 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 border border-gray-300 shadow-sm transition-all duration-200 hover:text-gray-900"
            onClick={() => onOpenChange(false)}
            disabled={isDeleting}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
            {t('common.cancel')}
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm transition-all duration-200 flex items-center gap-2"
          >
            {isDeleting ? t('common.deleting') : t('common.delete')}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteConfirmationDialog;
