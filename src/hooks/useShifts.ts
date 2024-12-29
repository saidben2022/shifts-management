import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shift, ShiftInput } from '@/types/Shift';

const API_URL = 'http://localhost:5000/api';

export function useShifts() {
  const queryClient = useQueryClient();

  const { data: shifts = [], isLoading } = useQuery<Shift[]>({
    queryKey: ['shifts'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/shifts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch shifts');
      }
      return response.json();
    },
    staleTime: 30000,
    cacheTime: 3600000,
  });

  const addShiftMutation = useMutation({
    mutationFn: async (shiftData: ShiftInput) => {
      console.log('Sending shift data:', shiftData);
      const response = await fetch(`${API_URL}/shifts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(shiftData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error response:', errorData);
        throw new Error(errorData.message || 'Error creating shift');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    }
  });

  const deleteShiftMutation = useMutation({
    mutationFn: async (shiftId: number) => {
      const response = await fetch(`${API_URL}/shifts/${shiftId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error deleting shift');
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
    }
  });

  return {
    shifts,
    isLoading,
    addShift: addShiftMutation.mutateAsync,
    deleteShift: deleteShiftMutation.mutateAsync
  };
}
