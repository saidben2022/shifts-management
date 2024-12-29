import React, { useEffect, useState } from 'react';
import { Worker } from '@/types/Worker';
import { api } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash, Mail, Phone, MapPin, Plus, User } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import WorkerForm, { WorkerFormData } from '@/components/WorkerForm';
import WorkerDetails from '@/components/WorkerDetails';
import { format, differenceInDays } from 'date-fns';
import { cn } from "@/lib/utils";
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { Spinner } from "@/components/ui/spinner";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function Workers() {
  const { isAuthenticated, checkAuthStatus } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAddingWorker, setIsAddingWorker] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<Worker | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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

  const { data: workers, error, isLoading, refetch } = useQuery({
    queryKey: ['workers'],
    queryFn: async () => {
      try {
        const response = await api.get('/workers');
        return response.data;
      } catch (error) {
        console.error('Error fetching workers:', error);
        throw error;
      }
    },
    enabled: isAuthenticated,
  });

  const filteredWorkers = workers?.filter(worker => {
    const fullName = `${worker.firstName} ${worker.lastName}`.toLowerCase();
    return fullName.includes(searchQuery.toLowerCase());
  });

  const handleAddWorker = async (workerData: WorkerFormData) => {
    try {
      const response = await api.post('/workers', workerData);
      if (response.data) {
        toast({
          title: "Success",
          description: "Worker added successfully",
          variant: "success",
        });
        setIsAddingWorker(false);
        await refetch();
      } else {
        throw new Error('No response data received');
      }
    } catch (error: any) {
      console.error('Error adding worker:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || "Failed to add worker",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Spinner size="lg" className="text-indigo-500" />
      </div>
    );
  }

  if (error) {
    return <div>Error loading workers</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center bg-white rounded-2xl p-6 shadow-lg border border-indigo-100">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Workers Management
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your workforce and contracts efficiently
            </p>
          </div>
          <Dialog open={isAddingWorker} onOpenChange={setIsAddingWorker}>
            <DialogTrigger asChild>
              <Button 
                className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg transition-all duration-200"
              >
                <Plus className="mr-2 h-5 w-5" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white to-indigo-50/30 p-0 overflow-hidden border border-indigo-100">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
                <DialogHeader className="text-white">
                  <DialogTitle className="text-2xl font-bold">
                    Add New Worker
                  </DialogTitle>
                  <DialogDescription className="text-indigo-100">
                    Fill in the worker's details below
                  </DialogDescription>
                </DialogHeader>
              </div>
              <div className="p-6">
                <WorkerForm onSubmit={handleAddWorker} />
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <div className="max-w-md">
              <Label className="text-white mb-2 block">Search Workers</Label>
              <Input
                type="text"
                placeholder="Search by name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white/10 border-white/20 text-white placeholder:text-white/60 focus:bg-white focus:text-gray-900"
              />
            </div>
          </div>

          {/* Table */}
          <div className="p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Worker ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contract Status</TableHead>
                  <TableHead>Contract Duration</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredWorkers?.map((worker: Worker) => {
                  const latestContract = worker.contracts?.sort((a, b) => 
                    new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                  )[0];

                  let contractStatus = null;
                  let statusColor = '';

                  if (latestContract) {
                    const today = new Date();
                    const endDate = new Date(latestContract.endDate);
                    const daysRemaining = differenceInDays(endDate, today);

                    if (daysRemaining < 0) {
                      contractStatus = "Inactive";
                      statusColor = "bg-red-100 text-red-700";
                    } else if (daysRemaining <= 30) {
                      contractStatus = `${daysRemaining} days remaining`;
                      statusColor = "bg-orange-100 text-orange-700";
                    } else {
                      contractStatus = "Active";
                      statusColor = "bg-green-100 text-green-700";
                    }
                  }

                  return (
                    <TableRow key={worker.id}>
                      <TableCell>{worker.workerId}</TableCell>
                      <TableCell>{`${worker.firstName} ${worker.lastName}`}</TableCell>
                      <TableCell>
                        {latestContract ? (
                          <span
                            className={cn(
                              "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                              statusColor
                            )}
                          >
                            {contractStatus}
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700">
                            No Contract
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {latestContract
                          ? `${latestContract.duration} months`
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {latestContract
                          ? format(new Date(latestContract.startDate), 'PP')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        {latestContract
                          ? format(new Date(latestContract.endDate), 'PP')
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <Button
                          onClick={() => setSelectedWorker(worker)}
                          className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-sm hover:shadow-md transition-all duration-200"
                          size="sm"
                        >
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <Dialog open={!!selectedWorker} onOpenChange={() => setSelectedWorker(null)}>
          <DialogContent className="max-w-4xl bg-gradient-to-br from-white to-indigo-50/30 p-0 overflow-hidden border border-indigo-100">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
              <DialogHeader className="text-white">
                <DialogTitle className="text-2xl font-bold">
                  Worker Details
                </DialogTitle>
                <DialogDescription className="text-indigo-100">
                  View and manage worker information
                </DialogDescription>
              </DialogHeader>
            </div>
            {selectedWorker && (
              <div className="p-6">
                <div className="bg-white rounded-xl p-6 shadow-sm border border-indigo-100">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Personal Information
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center text-sm text-gray-600">
                          <User className="mr-2 h-4 w-4" />
                          <span className="font-medium">{selectedWorker.firstName} {selectedWorker.lastName}</span>
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <span className="font-medium mr-2">Worker ID:</span>
                          {selectedWorker.workerId}
                        </div>
                        {selectedWorker.email && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Mail className="mr-2 h-4 w-4" />
                            {selectedWorker.email}
                          </div>
                        )}
                        {selectedWorker.phone && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Phone className="mr-2 h-4 w-4" />
                            {selectedWorker.phone}
                          </div>
                        )}
                        {selectedWorker.address && (
                          <div className="flex items-center text-sm text-gray-600">
                            <MapPin className="mr-2 h-4 w-4" />
                            {selectedWorker.address}
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4">
                        Contract Information
                      </h3>
                      <WorkerDetails 
                        worker={selectedWorker} 
                        onUpdate={async () => {
                          await refetch();
                          setSelectedWorker(null);
                        }} 
                      />
                    </div>
                  </div>
                  <div className="flex justify-end space-x-4 mt-6 pt-4 border-t">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedWorker(null)}
                      className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                    >
                      Close
                    </Button>
                    <Button
                      className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
                      onClick={() => {
                        setSelectedWorker(null);
                      }}
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
