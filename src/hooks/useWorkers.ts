import { useQuery } from '@tanstack/react-query';
import { Worker } from '@/types/Shift';

const API_URL = 'http://localhost:5000/api';

export function useWorkers() {
  const { data: workers = [], isLoading } = useQuery<Worker[]>({
    queryKey: ['workers'],
    queryFn: async () => {
      const response = await fetch(`${API_URL}/workers`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch workers');
      }
      return response.json();
    }
  });

  return { workers, isLoading };
}
