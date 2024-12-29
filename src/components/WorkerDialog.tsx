import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "./ui/use-toast";
import { useWorkers } from '@/hooks/useWorkers';
import { format } from "date-fns";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface WorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WorkerDialog({ open, onOpenChange }: WorkerDialogProps) {
  const { toast } = useToast();
  const { addWorker } = useWorkers();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    workerId: '',
    contractStartDate: null as Date | null,
    contractDuration: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.workerId || 
        !formData.contractStartDate || !formData.contractDuration) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    try {
      await addWorker({
        ...formData,
        contractStartDate: format(formData.contractStartDate, 'yyyy-MM-dd'),
        contractDuration: parseInt(formData.contractDuration)
      });
      
      toast({
        title: "Success",
        description: "Worker added successfully",
        variant: "success",
      });
      
      // Reset form and close dialog
      setFormData({
        firstName: '',
        lastName: '',
        workerId: '',
        contractStartDate: null,
        contractDuration: ''
      });
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add worker",
        variant: "destructive",
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Worker</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="firstName">First Name</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              placeholder="John"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="lastName">Last Name</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              placeholder="Doe"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="workerId">Worker ID</Label>
            <Input
              id="workerId"
              name="workerId"
              value={formData.workerId}
              onChange={handleChange}
              placeholder="W001"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractStartDate">Contract Start Date</Label>
            <div className="relative">
              <DatePicker
                selected={formData.contractStartDate}
                onChange={(date) => setFormData(prev => ({ ...prev, contractStartDate: date }))}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                className={cn(
                  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
              <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-500" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="contractDuration">Contract Duration (months)</Label>
            <Input
              id="contractDuration"
              name="contractDuration"
              type="number"
              min="1"
              value={formData.contractDuration}
              onChange={handleChange}
              placeholder="12"
            />
          </div>
          <div className="flex justify-end space-x-4">
            <Button 
              type="button" 
              className="bg-gradient-to-r from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-600 border border-gray-300 shadow-sm transition-all duration-200 hover:text-gray-900 flex items-center gap-2"
              onClick={() => onOpenChange(false)}
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
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              Cancel
            </Button>
            <Button 
              type="submit"
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm transition-all duration-200 flex items-center gap-2"
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
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <polyline points="17 21 17 13 7 13 7 21" />
                <polyline points="7 3 7 8 15 8" />
              </svg>
              Save
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
