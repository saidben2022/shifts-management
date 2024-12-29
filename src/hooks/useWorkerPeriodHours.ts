import { useState } from 'react';
import { useToast } from '../components/ui/use-toast';
import { api } from '../lib/api';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export interface WorkerPeriodHours {
  id: number;
  workerId: number;
  periodStart: string;
  periodEnd: string;
  maxHours: number;
}

interface SetWorkerPeriodHoursData {
  workerId: number;
  maxHours: number;
  periodStart: string;
  periodEnd: string;
}

export const getWorkerPeriodMaxHours = async (workerId: number, periodStart: string, periodEnd: string): Promise<number> => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No auth token found');
    }

    // Ensure dates are valid
    const startDate = new Date(periodStart);
    const endDate = new Date(periodEnd);

    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      console.error('Invalid dates:', { periodStart, periodEnd });
      return 0;
    }

    // Format dates to UTC to avoid timezone issues
    const formattedStart = startDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
    const formattedEnd = endDate.toISOString().split('T')[0] + 'T23:59:59.999Z';

    console.log('Fetching period hours:', { 
      workerId, 
      periodStart: formattedStart, 
      periodEnd: formattedEnd 
    });

    const response = await axios.get<{ maxHours: number }>(
      `${import.meta.env.VITE_API_URL}/worker-period-hours`,
      {
        params: {
          workerId,
          periodStart: formattedStart,
          periodEnd: formattedEnd
        },
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    console.log('Received response:', response.data);
    return response.data.maxHours;
  } catch (error) {
    console.error('Error getting worker period hours:', error);
    return 0;
  }
};

export const useWorkerPeriodHours = (workerId?: number, periodStart?: string, periodEnd?: string) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data, isLoading } = useQuery({
    queryKey: ['workerPeriodHours', workerId, periodStart, periodEnd],
    queryFn: async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No auth token found');
        }

        // If we have specific parameters, use them
        if (workerId && periodStart && periodEnd) {
          // Format dates to UTC
          const startDate = new Date(periodStart);
          const endDate = new Date(periodEnd);
          const formattedStart = startDate.toISOString().split('T')[0] + 'T00:00:00.000Z';
          const formattedEnd = endDate.toISOString().split('T')[0] + 'T23:59:59.999Z';

          const response = await api.get<WorkerPeriodHours[]>('/worker-period-hours', {
            params: {
              workerId,
              periodStart: formattedStart,
              periodEnd: formattedEnd
            }
          });
          return response.data;
        } else {
          // Get all worker period hours if no specific parameters
          const response = await api.get<WorkerPeriodHours[]>('/worker-period-hours');
          return response.data;
        }
      } catch (error) {
        console.error('Error fetching worker period hours:', error);
        return [];
      }
    },
    enabled: !!(workerId && periodStart && periodEnd) // Only run the query if we have all required parameters
  });

  const mutation = useMutation({
    mutationFn: async (data: SetWorkerPeriodHoursData) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No auth token found');
        }

        if (!data.periodStart || !data.periodEnd) {
          console.error('Invalid period dates:', { periodStart: data.periodStart, periodEnd: data.periodEnd });
          throw new Error('Invalid period dates');
        }

        // Format dates to ensure consistency and set time to start/end of day
        const startDate = new Date(data.periodStart);
        if (isNaN(startDate.getTime())) {
          console.error('Invalid start date:', data.periodStart);
          throw new Error('Invalid start date');
        }
        startDate.setHours(0, 0, 0, 0);
        const periodStart = startDate.toISOString();

        const endDate = new Date(data.periodEnd);
        if (isNaN(endDate.getTime())) {
          console.error('Invalid end date:', data.periodEnd);
          throw new Error('Invalid end date');
        }
        endDate.setHours(23, 59, 59, 999);
        const periodEnd = endDate.toISOString();

        console.log('Saving period hours with dates:', { periodStart, periodEnd });

        const requestData = {
          workerId: Number(data.workerId),
          maxHours: Number(data.maxHours),
          periodStart,
          periodEnd
        };

        const response = await axios.post<WorkerPeriodHours>(
          `${import.meta.env.VITE_API_URL}/worker-period-hours`,
          requestData,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        // Invalidate queries immediately
        await queryClient.invalidateQueries({ 
          queryKey: ['workerPeriodHours', data.workerId.toString(), periodStart, periodEnd] 
        });

        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.message || error.message;
          throw new Error(message);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Period hours updated successfully",
        variant: "success",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to set period hours",
        variant: "destructive",
      });
    }
  });

  const setWorkerPeriodHours = async (data: SetWorkerPeriodHoursData) => {
    try {
      await mutation.mutateAsync(data);
      queryClient.invalidateQueries({ queryKey: ['workerPeriodHours'] });
      toast({
        title: 'Success',
        description: 'Worker period hours updated successfully',
      });
    } catch (error) {
      console.error('Error setting worker period hours:', error);
      toast({
        title: 'Error',
        description: 'Failed to update worker period hours',
        variant: 'destructive',
      });
    }
  };

  return {
    data,
    isLoading,
    setWorkerPeriodHours,
    getWorkerPeriodMaxHours,
  };
};
