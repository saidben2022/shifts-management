import React, { useState } from 'react';
import { Worker } from '@/types/Worker';
import { Button } from './ui/button';
import { Plus, Pencil, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import WorkerForm, { WorkerFormData } from './WorkerForm';
import ContractForm, { ContractFormData } from './ContractForm';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useToast } from './ui/use-toast';
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
} from "./ui/alert-dialog";
import { cn } from '@/lib/utils';

interface WorkerDetailsProps {
  worker: Worker;
  onUpdate: () => Promise<void>;
}

export default function WorkerDetails({ worker, onUpdate }: WorkerDetailsProps) {
  const [isEditingWorker, setIsEditingWorker] = useState(false);
  const [isAddingContract, setIsAddingContract] = useState(false);
  const [isEditingContract, setIsEditingContract] = useState(false);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleDeleteContract = async (contract: Contract) => {
    try {
      setIsLoading(true);
      await api.delete(`/workers/${worker.id}/contract/${contract.id}`);
      // If we reach here, it means the delete was successful
      toast({
        title: "Success",
        description: "Contract deleted successfully",
        variant: "success",
      });
      setContractToDelete(null);
      await onUpdate();
    } catch (error: any) {
      console.error('Error deleting contract:', error);
      toast({
        title: "Error",
        description: error?.message || "Failed to delete contract",
        variant: "destructive",
      });
      // Even if we show an error, try to update as the contract might have been deleted
      await onUpdate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWorker = async (data: WorkerFormData) => {
    try {
      setIsLoading(true);
      await api.put(`/workers/${worker.id}`, data);
      toast({
        title: "Success",
        description: "Worker information updated successfully",
        variant: "success",
      });
      setIsEditingWorker(false);
      await onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update worker information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddContract = async (data: ContractFormData) => {
    try {
      setIsLoading(true);
      const response = await api.post(`/workers/${worker.id}/contracts`, data);
      if (response.data) {
        toast({
          title: "Success",
          description: "Contract added successfully",
          variant: "success",
        });
        setIsAddingContract(false);
        await onUpdate();
      } else {
        throw new Error(response.data?.message || 'Failed to add contract');
      }
    } catch (error: any) {
      console.error('Error adding contract:', error);
      toast({
        title: "Error",
        description: error?.response?.data?.message || error?.message || "Failed to add contract",
        variant: "destructive",
      });
      // Even if we show an error, try to update as the contract might have been added
      await onUpdate();
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateContract = async (data: ContractFormData) => {
    if (!selectedContract) return;
    
    try {
      setIsLoading(true);
      await api.put(`/workers/${worker.id}/contract/${selectedContract.id}`, data);
      toast({
        title: "Success",
        description: "Contract updated successfully",
        variant: "success",
      });
      setIsEditingContract(false);
      setSelectedContract(null);
      await onUpdate();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update contract",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-2xl font-semibold tracking-tight text-gray-900">Contracts</h3>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
            size="sm"
            onClick={() => setIsEditingWorker(true)}
          >
            <Pencil className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button
            className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            size="sm"
            onClick={() => setIsAddingContract(true)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Contract
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        <Card className="bg-white shadow-sm border border-indigo-100">
          <CardContent className="p-6">
            <div className="space-y-4">
              {worker.contracts && worker.contracts.length > 0 ? (
                worker.contracts.map((contract) => (
                  <div
                    key={contract.id}
                    className="bg-gradient-to-br from-white to-indigo-50/30 rounded-lg border border-indigo-100 p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="text-sm font-medium text-gray-900">
                          {contract.duration} Month Contract
                        </div>
                        <div className="text-sm text-gray-500">
                          {format(new Date(contract.startDate), 'PPP')} - {format(new Date(contract.endDate), 'PPP')}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                          onClick={() => {
                            setSelectedContract(contract);
                            setIsEditingContract(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                          onClick={() => {
                            setContractToDelete(contract);
                            setIsDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-gray-500">
                  No contracts found
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Edit Worker Dialog */}
      <Dialog open={isEditingWorker} onOpenChange={setIsEditingWorker}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white to-indigo-50/30 p-0 overflow-hidden border border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <DialogHeader className="text-white">
              <DialogTitle className="text-2xl font-bold">
                Edit Worker
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <WorkerForm
              worker={worker}
              onSubmit={handleUpdateWorker}
              isLoading={isLoading}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Contract Dialog */}
      <Dialog open={isAddingContract} onOpenChange={setIsAddingContract}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white to-indigo-50/30 p-0 overflow-hidden border border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <DialogHeader className="text-white">
              <DialogTitle className="text-2xl font-bold">
                New Contract
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            <ContractForm onSubmit={handleAddContract} isLoading={isLoading} />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Contract Dialog */}
      <Dialog open={isEditingContract} onOpenChange={setIsEditingContract}>
        <DialogContent className="sm:max-w-[425px] bg-gradient-to-br from-white to-indigo-50/30 p-0 overflow-hidden border border-indigo-100">
          <div className="bg-gradient-to-r from-indigo-500 to-purple-500 p-6">
            <DialogHeader className="text-white">
              <DialogTitle className="text-2xl font-bold">
                Edit Contract
              </DialogTitle>
            </DialogHeader>
          </div>
          <div className="p-6">
            {selectedContract && (
              <ContractForm
                contract={selectedContract}
                onSubmit={handleUpdateContract}
                isLoading={isLoading}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Contract Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Contract</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              className="border-gray-200"
              onClick={() => {
                setContractToDelete(null);
                setIsDeleteDialogOpen(false);
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => {
                if (contractToDelete) {
                  handleDeleteContract(contractToDelete);
                }
                setIsDeleteDialogOpen(false);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
