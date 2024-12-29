import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";

interface EditWorkerDialogProps {
  worker: Worker | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (worker: Worker) => Promise<void>;
}

export default function EditWorkerDialog({
  worker,
  open,
  onOpenChange,
  onSave,
}: EditWorkerDialogProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Worker | null>(null);

  useEffect(() => {
    if (worker) {
      setFormData(worker);
    }
  }, [worker]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      await onSave(formData);
    }
  };

  if (!formData) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t("workers.management.editWorker")}</DialogTitle>
          <DialogDescription>
            {t("workers.management.editDetails")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="firstName">{t("workers.form.firstName")}</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) =>
                  setFormData({ ...formData, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="lastName">{t("workers.form.lastName")}</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) =>
                  setFormData({ ...formData, lastName: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="workerId">{t("workers.form.workerId")}</Label>
              <Input
                id="workerId"
                value={formData.workerId}
                onChange={(e) =>
                  setFormData({ ...formData, workerId: e.target.value })
                }
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">{t("workers.form.email")}</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">{t("workers.form.phone")}</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">{t("workers.form.address")}</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {t("common.cancel")}
            </Button>
            <Button type="submit">{t("common.save")}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
